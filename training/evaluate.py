import sys
sys.path.append(".")

import os
import json
import time
from pathlib import Path
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms, models

from data.waterbirds.dataset import WaterbirdsDataset

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
torch.set_num_threads(min(8, os.cpu_count() or 4))

eval_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

GROUP_DEFINITIONS = {
    0: {"name": "Landbird on Land", "y": 0, "c": 0, "type": "Majority"},
    1: {"name": "Landbird on Water", "y": 0, "c": 1, "type": "Minority (Conflict)"},
    2: {"name": "Waterbird on Land", "y": 1, "c": 0, "type": "Weakest Minority (Conflict)"},
    3: {"name": "Waterbird on Water", "y": 1, "c": 1, "type": "Majority"}
}


def predict(image: Image.Image, model: torch.nn.Module) -> dict:
    """
    Inference interface returning predicted class, exact softmax confidence, and class probabilities.
    Guarantees deterministic preprocessing and evaluation mode without random transforms.
    """
    model.eval()
    model.to(device)
    
    img_tensor = eval_transform(image).unsqueeze(0).to(device)
    
    with torch.no_grad():
        outputs = model(img_tensor)
        probs = F.softmax(outputs, dim=1)
        confidence, prediction = torch.max(probs, 1)
        
    return {
        "prediction": int(prediction.item()),
        "confidence": float(confidence.item()),
        "probabilities": {
            "Landbird": float(probs[0, 0].item()),
            "Waterbird": float(probs[0, 1].item())
        }
    }


def load_model_checkpoint(checkpoint_path: str) -> nn.Module:
    """Loads ResNet-50 binary classifier checkpoint."""
    model = models.resnet50(weights=None)
    model.fc = nn.Linear(model.fc.in_features, 2)
    
    ckpt = torch.load(checkpoint_path, map_location=device, weights_only=True)
    if isinstance(ckpt, dict) and "model_state_dict" in ckpt:
        sd = ckpt["model_state_dict"]
    elif isinstance(ckpt, dict) and "state_dict" in ckpt:
        sd = ckpt["state_dict"]
    else:
        sd = ckpt
        
    clean_sd = {k.replace("module.", "").replace("model.", ""): v for k, v in sd.items()}
    model.load_state_dict(clean_sd, strict=True)
    model.to(device)
    model.eval()
    return model


class FastJsonDataset(Dataset):
    def __init__(self, json_path, image_root):
        self.image_root = Path(image_root)
        self.items = []
        with open(json_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    row = json.loads(line)
                    y = int(row["y"])
                    c = int(row["c"])
                    g = y * 2 + c
                    self.items.append((str(self.image_root / row["x"]), y, c, g))

    def __len__(self):
        return len(self.items)

    def __getitem__(self, idx):
        path, y, c, g = self.items[idx]
        img = Image.open(path).convert("RGB")
        return eval_transform(img), y, c, g


def evaluate_split_detailed(model: nn.Module, json_path: str, image_root: str, batch_size: int = 64):
    """
    Evaluates a model across all 4 Waterbirds groups, returning per-group accuracies,
    worst-group accuracy (WGA), and overall accuracy.
    """
    dataset = FastJsonDataset(json_path, image_root)
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=False)

    model.eval()
    model.to(device)

    group_correct = {0: 0, 1: 0, 2: 0, 3: 0}
    group_total = {0: 0, 1: 0, 2: 0, 3: 0}
    total_correct = 0
    total = 0

    t0 = time.time()
    with torch.no_grad():
        for imgs, ys, cs, gs in loader:
            imgs = imgs.to(device)
            ys = ys.to(device)

            outputs = model(imgs)
            preds = outputs.argmax(dim=1)

            for pred, true_y, g in zip(preds, ys, gs):
                is_correct = int(pred.item() == true_y.item())
                g_idx = g.item()
                group_correct[g_idx] += is_correct
                group_total[g_idx] += 1
                total_correct += is_correct
                total += 1

    elapsed = time.time() - t0
    accs = {g: (group_correct[g] / group_total[g] * 100) if group_total[g] > 0 else 0.0 for g in range(4)}
    wga = min(accs.values())
    wga_group = [g for g in range(4) if accs[g] == wga][0]
    overall = (total_correct / total * 100) if total > 0 else 0.0

    return {
        "overall_accuracy": round(overall, 2),
        "worst_group_accuracy": round(wga, 2),
        "worst_group_id": wga_group,
        "worst_group_name": GROUP_DEFINITIONS[wga_group]["name"],
        "groups": {
            g: {
                "name": GROUP_DEFINITIONS[g]["name"],
                "type": GROUP_DEFINITIONS[g]["type"],
                "y": GROUP_DEFINITIONS[g]["y"],
                "c": GROUP_DEFINITIONS[g]["c"],
                "accuracy": round(accs[g], 2),
                "correct": group_correct[g],
                "total": group_total[g]
            }
            for g in range(4)
        },
        "total_samples": total,
        "elapsed_seconds": round(elapsed, 2)
    }


def compare_models(
    models_dict: dict,
    json_path: str = "data/waterbirds/test.json",
    image_root: str = "data/waterbird_complete95_forest2water2",
    split_name: str = "Test Set"
):
    """
    Rigorously evaluates and compares multiple checkpoints side-by-side.
    """
    print("=" * 105, flush=True)
    print(f"DEEPSPUR EMPIRICAL ROBUSTNESS AUDIT: MODEL COMPARISON ({split_name.upper()})", flush=True)
    print("=" * 105, flush=True)

    results = {}
    for model_name, ckpt_path in models_dict.items():
        if not Path(ckpt_path).exists():
            print(f"Skipping {model_name}: checkpoint {ckpt_path} not found.", flush=True)
            continue
        print(f"Evaluating {model_name} [{ckpt_path}]...", flush=True)
        model = load_model_checkpoint(ckpt_path)
        metrics = evaluate_split_detailed(model, json_path, image_root)
        results[model_name] = metrics
        print(f"  -> Overall: {metrics['overall_accuracy']}%, WGA: {metrics['worst_group_accuracy']}% ({metrics['worst_group_name']}) in {metrics['elapsed_seconds']}s", flush=True)

    # Print Comparative Table
    print("\n" + "=" * 105, flush=True)
    header = f"{'Metric / Subgroup':<38} | " + " | ".join(f"{name:^18}" for name in results.keys())
    print(header, flush=True)
    print("-" * 105, flush=True)

    # 1. Overall Accuracy
    row_overall = f"{'Overall Accuracy':<38} | " + " | ".join(f"{res['overall_accuracy']:>16.2f}%" for res in results.values())
    print(row_overall, flush=True)

    # 2. Worst-Group Accuracy
    row_wga = f"{'Worst-Group Accuracy (WGA)':<38} | " + " | ".join(f"{res['worst_group_accuracy']:>16.2f}%" for res in results.values())
    print(row_wga, flush=True)

    # 3. Individual Groups
    for g in range(4):
        g_name = f"Group {g}: {GROUP_DEFINITIONS[g]['name']}"
        counts_str = f"(N={list(results.values())[0]['groups'][g]['total']})"
        label = f"{g_name} {counts_str}"
        row_g = f"{label:<38} | " + " | ".join(f"{res['groups'][g]['accuracy']:>16.2f}%" for res in results.values())
        print(row_g, flush=True)

    # 4. Spurious Disparity Gap (Majority Group 0 minus Worst Group 2)
    def calc_gap(r):
        maj = r['groups'][0]['accuracy']
        worst = r['worst_group_accuracy']
        return round(maj - worst, 2)

    row_gap = f"{'Disparity Gap (Majority - WGA)':<38} | " + " | ".join(f"{calc_gap(res):>16.2f}%" for res in results.values())
    print(row_gap, flush=True)
    print("=" * 105 + "\n", flush=True)

    return results


def evaluate_test_set(model: torch.nn.Module, test_loader, output_file: str = "results/baseline_results.json"):
    """Legacy backward-compatible evaluation function."""
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    model.eval()
    model.to(device)
    
    results = []
    correct = 0
    total = 0

    with torch.no_grad():
        for i, batch in enumerate(test_loader):
            images = batch["image"].to(device)
            labels = batch["label"].to(device)
            contexts = batch["context"].to(device)
            
            outputs = model(images)
            probs = F.softmax(outputs, dim=1)
            confidences, predictions = torch.max(probs, 1)
            
            for pred, conf, label, ctx in zip(predictions, confidences, labels, contexts):
                is_correct = (pred == label).item()
                if is_correct:
                    correct += 1
                total += 1

                results.append({
                    "true_label": int(label.item()),
                    "prediction": int(pred.item()),
                    "confidence": float(conf.item()),
                    "context": int(ctx.item())
                })

    overall_acc = (correct / total) * 100 if total > 0 else 0
    print(f"\nEvaluation Complete!")
    print(f"Overall Test Accuracy: {overall_acc:.2f}% ({correct}/{total})")

    with open(output_file, "w") as f:
        json.dump({"overall_accuracy": overall_acc, "predictions": results}, f, indent=2)
        
    print(f"Saved evaluation predictions to {output_file}")


if __name__ == "__main__":
    models_to_audit = {
        "Baseline (ERM)": "models/baseline_resnet50.pth",
        "Current Corrected": "models/corrected_resnet50.pth",
        "Improved v2 (DRO)": "models/corrected_resnet50_v2.pth"
    }

    # Run on validation partition
    val_results = compare_models(
        models_to_audit,
        json_path="data/waterbirds/valid.json",
        image_root="data/waterbird_complete95_forest2water2",
        split_name="Validation Split"
    )

    # Run on test partition if v2 checkpoint exists
    if Path("models/corrected_resnet50_v2.pth").exists():
        test_results = compare_models(
            models_to_audit,
            json_path="data/waterbirds/test.json",
            image_root="data/waterbird_complete95_forest2water2",
            split_name="Test Split"
        )
        
        # Save structured results
        out_json = Path("results/model_comparison_results.json")
        out_json.parent.mkdir(parents=True, exist_ok=True)
        with open(out_json, "w", encoding="utf-8") as f:
            json.dump({
                "validation": val_results,
                "test": test_results
            }, f, indent=2)
        print(f"Saved complete comparative evaluation matrix to {out_json}")
