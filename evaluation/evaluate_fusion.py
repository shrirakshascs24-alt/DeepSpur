"""
DeepSpur - Fusion Model Evaluation Pipeline
===========================================
Independent evaluation script for ResNet50 + EfficientNet-B0 Feature Fusion Model.
Evaluates the model on the full Waterbirds test split (5,794 images).

Outputs:
- Overall accuracy
- Per-group accuracy across all 4 subgroups (0: Land/Land, 1: Land/Water, 2: Water/Land, 3: Water/Water)
- Worst-Group Accuracy (WGA) and disparity gap
- Precision, Recall, and F1-score (per-class and macro-average)
- Model parameter count breakdown
- Checkpoint file size on disk
- Benchmark inference latency (ms per image) and throughput (images/sec)
- Comparison table vs existing Baseline and Corrected ResNet-50 checkpoints
"""

import os
import sys
import json
import time
import csv
from pathlib import Path
from typing import Dict, Any, List, Tuple

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from models.fusion import ResNet50EfficientNetFusion, get_fusion_model

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
torch.set_num_threads(min(8, os.cpu_count() or 4))

TEST_JSON = PROJECT_ROOT / "data" / "waterbirds" / "test.json"
IMAGE_ROOT = PROJECT_ROOT / "data" / "waterbird_complete95_forest2water2"
CHECKPOINT_PATH = PROJECT_ROOT / "models" / "fusion_resnet50_effnetb0.pth"
RESULTS_FUSION_DIR = PROJECT_ROOT / "results" / "fusion"

GROUP_NAMES = {
    0: "Landbird on Land (y=0, c=0)",
    1: "Landbird on Water (y=0, c=1) [Minority]",
    2: "Waterbird on Land (y=1, c=0) [Worst Minority]",
    3: "Waterbird on Water (y=1, c=1)",
}

GROUP_SHORT_NAMES = {
    0: "Land / Land",
    1: "Land / Water",
    2: "Water / Land",
    3: "Water / Water",
}

CLASS_NAMES = {0: "Landbird", 1: "Waterbird"}

EVAL_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


class WaterbirdsTestDataset(Dataset):
    """Waterbirds Test Split loader matching exact evaluation protocol."""

    def __init__(self, json_path: Path, image_root: Path, transform=None):
        self.image_root = Path(image_root)
        self.transform = transform
        self.samples = []
        self.group_counts = {0: 0, 1: 0, 2: 0, 3: 0}

        with open(json_path, "r", encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                row = json.loads(line)
                y = int(row["y"])
                c = int(row["c"])
                g = y * 2 + c
                self.samples.append({
                    "path": str(self.image_root / row["x"]),
                    "rel_path": row["x"],
                    "y": y,
                    "c": c,
                    "group": g,
                })
                self.group_counts[g] += 1

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int):
        item = self.samples[idx]
        img = Image.open(item["path"]).convert("RGB")
        if self.transform:
            img = self.transform(img)
        return img, item["y"], item["group"], item["c"]


def load_fusion_checkpoint(checkpoint_path: Path) -> Tuple[ResNet50EfficientNetFusion, Dict[str, Any]]:
    """Loads trained weights into the fusion model strictly."""
    if not checkpoint_path.exists():
        raise FileNotFoundError(f"Fusion checkpoint not found at: {checkpoint_path}")

    ckpt = torch.load(checkpoint_path, map_location=device, weights_only=False)
    if isinstance(ckpt, dict) and "model_state_dict" in ckpt:
        sd = ckpt["model_state_dict"]
        metadata = {k: v for k, v in ckpt.items() if k != "model_state_dict"}
    else:
        sd = ckpt
        metadata = {}

    hidden_dim = metadata.get("head_hidden_dim", 512)
    model = get_fusion_model(num_classes=2, pretrained=False, head_hidden_dim=hidden_dim)
    model.load_state_dict(sd, strict=True)
    model.to(device).eval()
    return model, metadata


def benchmark_inference_latency(model: nn.Module, n_warmup: int = 10, n_iter: int = 50) -> Dict[str, float]:
    """Measures single-image and batch inference latency under inference_mode."""
    model.eval()
    dummy_single = torch.randn(1, 3, 224, 224).to(device)
    dummy_batch = torch.randn(32, 3, 224, 224).to(device)

    # Warmup
    with torch.inference_mode():
        for _ in range(n_warmup):
            _ = model(dummy_single)
            _ = model(dummy_batch)

    # Single-sample latency
    times_single = []
    with torch.inference_mode():
        for _ in range(n_iter):
            t0 = time.perf_counter()
            _ = model(dummy_single)
            t1 = time.perf_counter()
            times_single.append((t1 - t0) * 1000)

    # Batched throughput
    times_batch = []
    with torch.inference_mode():
        for _ in range(n_iter // 2):
            t0 = time.perf_counter()
            _ = model(dummy_batch)
            t1 = time.perf_counter()
            times_batch.append((t1 - t0) * 1000)

    mean_single_ms = float(np.mean(times_single))
    std_single_ms = float(np.std(times_single))
    mean_batch_ms = float(np.mean(times_batch))
    throughput_fps = float(32.0 / (mean_batch_ms / 1000.0))

    return {
        "single_image_latency_ms": round(mean_single_ms, 2),
        "single_image_latency_std_ms": round(std_single_ms, 2),
        "batch_32_latency_ms": round(mean_batch_ms, 2),
        "throughput_images_per_sec": round(throughput_fps, 1),
    }


def evaluate_fusion_model(
    checkpoint_path: Path = CHECKPOINT_PATH,
    batch_size: int = 64,
) -> Dict[str, Any]:
    """Comprehensive test split evaluation of the ResNet50 + EfficientNet-B0 fusion model."""
    RESULTS_FUSION_DIR.mkdir(parents=True, exist_ok=True)

    print("=" * 70, flush=True)
    print("DEEPSPUR: RESNET50 + EFFICIENTNET-B0 FUSION MODEL EVALUATION", flush=True)
    print(f"Loading checkpoint: {checkpoint_path}", flush=True)
    print("=" * 70, flush=True)

    model, ckpt_meta = load_fusion_checkpoint(checkpoint_path)
    param_summary = model.get_parameter_summary()

    ckpt_bytes = checkpoint_path.stat().st_size
    ckpt_mb = ckpt_bytes / (1024 * 1024)

    test_ds = WaterbirdsTestDataset(TEST_JSON, IMAGE_ROOT, transform=EVAL_TRANSFORM)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False, num_workers=0)
    print(f"Loaded test split: {len(test_ds):,} samples across 4 subgroups: {test_ds.group_counts}", flush=True)

    # Run inference
    t0 = time.time()
    all_preds = []
    all_targets = []
    all_groups = []
    all_probs = []

    print("Running full test split inference...", flush=True)
    with torch.inference_mode():
        for batch_idx, (imgs, ys, gs, _) in enumerate(test_loader):
            imgs = imgs.to(device)
            logits = model(imgs)
            probs = torch.softmax(logits, dim=1).cpu().numpy()
            preds = logits.argmax(dim=1).cpu().numpy()

            all_preds.extend(preds)
            all_targets.extend(ys.numpy())
            all_groups.extend(gs.numpy())
            all_probs.extend(probs)

            if (batch_idx + 1) % 20 == 0 or (batch_idx + 1) == len(test_loader):
                processed = min((batch_idx + 1) * batch_size, len(test_ds))
                pct = processed / len(test_ds) * 100
                print(f"  Processed {processed}/{len(test_ds)} images ({pct:.1f}%)", flush=True)

    eval_duration = time.time() - t0
    all_preds = np.array(all_preds)
    all_targets = np.array(all_targets)
    all_groups = np.array(all_groups)

    # 1. Overall Accuracy
    total_samples = len(all_targets)
    overall_correct = int((all_preds == all_targets).sum())
    overall_accuracy = (overall_correct / total_samples) * 100

    # 2. Subgroup Accuracies & Worst-Group Accuracy
    subgroup_metrics = {}
    group_acc_list = []
    for g in range(4):
        mask = (all_groups == g)
        n_g = int(mask.sum())
        correct_g = int((all_preds[mask] == all_targets[mask]).sum())
        acc_g = (correct_g / max(n_g, 1)) * 100
        subgroup_metrics[g] = {
            "group_id": g,
            "group_name": GROUP_NAMES[g],
            "group_short_name": GROUP_SHORT_NAMES[g],
            "n_samples": n_g,
            "n_correct": correct_g,
            "accuracy": round(acc_g, 2),
        }
        group_acc_list.append(acc_g)

    worst_group_acc = min(group_acc_list)
    worst_group_id = int(np.argmin(group_acc_list))
    best_group_acc = max(group_acc_list)
    disparity_gap = best_group_acc - worst_group_acc

    # 3. Precision, Recall, and F1-Score
    # Binary classification: 0 = Landbird, 1 = Waterbird
    # Confusion Matrix:
    tp = int(((all_preds == 1) & (all_targets == 1)).sum())  # Correct Waterbird
    fp = int(((all_preds == 1) & (all_targets == 0)).sum())  # Landbird predicted as Waterbird
    tn = int(((all_preds == 0) & (all_targets == 0)).sum())  # Correct Landbird
    fn = int(((all_preds == 0) & (all_targets == 1)).sum())  # Waterbird predicted as Landbird

    # Landbird (Class 0) metrics
    p0 = tn / max(tn + fn, 1)
    r0 = tn / max(tn + fp, 1)
    f1_0 = 2 * p0 * r0 / max(p0 + r0, 1e-8)

    # Waterbird (Class 1) metrics
    p1 = tp / max(tp + fp, 1)
    r1 = tp / max(tp + fn, 1)
    f1_1 = 2 * p1 * r1 / max(p1 + r1, 1e-8)

    # Macro averages
    macro_precision = (p0 + p1) / 2.0 * 100
    macro_recall = (r0 + r1) / 2.0 * 100
    macro_f1 = (f1_0 + f1_1) / 2.0 * 100

    # 4. Latency benchmark
    print("Measuring inference latency profile...", flush=True)
    latency_profile = benchmark_inference_latency(model)

    # 5. Compile full evaluation report
    evaluation_report = {
        "model_name": "ResNet50 + EfficientNet-B0 Feature Fusion",
        "architecture": {
            "backbone_1": "ResNet-50 (2,048 features)",
            "backbone_2": "EfficientNet-B0 (1,280 features)",
            "fusion_type": "Feature Concatenation (3,328 features)",
            "head": "2-Layer MLP (3328 -> 512 -> 2) with BatchNorm and Dropout",
        },
        "model_parameters": {
            "total_parameters": param_summary["total_parameters"],
            "trainable_parameters": param_summary["trainable_parameters"],
            "resnet50_parameters": param_summary["resnet50_parameters"],
            "efficientnet_b0_parameters": param_summary["efficientnet_b0_parameters"],
            "classifier_head_parameters": param_summary["classifier_head_parameters"],
        },
        "checkpoint": {
            "path": str(checkpoint_path),
            "size_bytes": ckpt_bytes,
            "size_mb": round(ckpt_mb, 2),
            "best_val_wga": ckpt_meta.get("best_val_wga", None),
            "best_val_acc": ckpt_meta.get("best_val_acc", None),
            "training_epoch": ckpt_meta.get("epoch", None),
        },
        "inference_benchmarks": latency_profile,
        "test_split_metrics": {
            "total_samples": total_samples,
            "overall_accuracy": round(overall_accuracy, 2),
            "worst_group_accuracy": round(worst_group_acc, 2),
            "worst_group_id": worst_group_id,
            "worst_group_name": GROUP_NAMES[worst_group_id],
            "disparity_gap": round(disparity_gap, 2),
            "subgroups": subgroup_metrics,
            "classification_metrics": {
                "macro_precision": round(macro_precision, 2),
                "macro_recall": round(macro_recall, 2),
                "macro_f1": round(macro_f1, 2),
                "class_0_landbird": {
                    "precision": round(p0 * 100, 2),
                    "recall": round(r0 * 100, 2),
                    "f1_score": round(f1_0 * 100, 2),
                    "support": int((all_targets == 0).sum()),
                },
                "class_1_waterbird": {
                    "precision": round(p1 * 100, 2),
                    "recall": round(r1 * 100, 2),
                    "f1_score": round(f1_1 * 100, 2),
                    "support": int((all_targets == 1).sum()),
                },
                "confusion_matrix": {
                    "true_landbird_pred_landbird (TN)": tn,
                    "true_landbird_pred_waterbird (FP)": fp,
                    "true_waterbird_pred_waterbird (TP)": tp,
                    "true_waterbird_pred_landbird (FN)": fn,
                },
            },
        },
        "eval_time_seconds": round(eval_duration, 2),
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
    }

    # Print clean summary
    print("\n" + "=" * 70)
    print("EVALUATION RESULTS: RESNET50 + EFFICIENTNET-B0 FEATURE FUSION")
    print("=" * 70)
    print(f"Total Test Samples: {total_samples:,}")
    print(f"Overall Accuracy:   {overall_accuracy:.2f}% ({overall_correct}/{total_samples})")
    print(f"Worst-Group Acc:    {worst_group_acc:.2f}% [{GROUP_NAMES[worst_group_id]}]")
    print(f"Subgroup Disparity: {disparity_gap:.2f}% pts")
    print("-" * 70)
    print("Subgroup Accuracies:")
    for g in range(4):
        sm = subgroup_metrics[g]
        print(f"  Group {g} ({sm['group_short_name']}): {sm['accuracy']:.2f}% ({sm['n_correct']}/{sm['n_samples']})")
    print("-" * 70)
    print("Classification Metrics:")
    print(f"  Macro Precision: {macro_precision:.2f}%")
    print(f"  Macro Recall:    {macro_recall:.2f}%")
    print(f"  Macro F1-Score:  {macro_f1:.2f}%")
    print(f"  Landbird F1:     {f1_0*100:.2f}% | Waterbird F1: {f1_1*100:.2f}%")
    print("-" * 70)
    print("Model Characteristics:")
    print(f"  Total Parameters:    {param_summary['total_parameters']:,} (ResNet: {param_summary['resnet50_parameters']:,}, EffNet: {param_summary['efficientnet_b0_parameters']:,}, Head: {param_summary['classifier_head_parameters']:,})")
    print(f"  Checkpoint Size:     {ckpt_mb:.2f} MB ({ckpt_bytes:,} bytes)")
    print(f"  Inference Latency:   {latency_profile['single_image_latency_ms']:.2f} ms/sample | Throughput: {latency_profile['throughput_images_per_sec']:.1f} fps")
    print("=" * 70 + "\n", flush=True)

    # 6. Save results to JSON
    json_path = RESULTS_FUSION_DIR / "test_metrics.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(evaluation_report, f, indent=2)
    print(f"[+] Saved evaluation report to: {json_path.name}")

    # 7. Comparison Table CSV
    comparison_rows = [
        {
            "model": "Baseline ResNet-50",
            "architecture": "ResNet-50",
            "params_millions": 23.51,
            "overall_accuracy_pct": 85.64,
            "worst_group_accuracy_pct": 63.55,
            "worst_group_id": "Group 1 or 2",
            "macro_f1_pct": 84.10,
            "checkpoint_size_mb": 90.0,
        },
        {
            "model": "Corrected ResNet-50",
            "architecture": "ResNet-50 (Group Fine-Tuned)",
            "params_millions": 23.51,
            "overall_accuracy_pct": 89.33,
            "worst_group_accuracy_pct": 64.80,
            "worst_group_id": "Group 2 (Water / Land)",
            "macro_f1_pct": 88.50,
            "checkpoint_size_mb": 90.0,
        },
        {
            "model": "Fusion (ResNet50 + EfficientNet-B0)",
            "architecture": "ResNet50 + EfficientNet-B0 Fusion (MLP Head)",
            "params_millions": round(param_summary["total_parameters"] / 1e6, 2),
            "overall_accuracy_pct": round(overall_accuracy, 2),
            "worst_group_accuracy_pct": round(worst_group_acc, 2),
            "worst_group_id": f"Group {worst_group_id} ({GROUP_SHORT_NAMES[worst_group_id]})",
            "macro_f1_pct": round(macro_f1, 2),
            "checkpoint_size_mb": round(ckpt_mb, 2),
        },
    ]

    csv_path = RESULTS_FUSION_DIR / "model_comparison.csv"
    with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=list(comparison_rows[0].keys()))
        writer.writeheader()
        writer.writerows(comparison_rows)
    print(f"[+] Saved model comparison table to: {csv_path.name}")

    return evaluation_report


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Evaluate ResNet50 + EfficientNet-B0 Fusion Model")
    parser.add_argument("--checkpoint", type=str, default=str(CHECKPOINT_PATH), help="Path to fusion model checkpoint")
    parser.add_argument("--batch-size", type=int, default=64, help="Batch size for test evaluation")
    args = parser.parse_args()

    evaluate_fusion_model(checkpoint_path=Path(args.checkpoint), batch_size=args.batch_size)
