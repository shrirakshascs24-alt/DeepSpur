"""
DeepSpur - Fusion Model Training Script
=======================================
Trains the ResNet50 + EfficientNet-B0 Feature Fusion model on Waterbirds.
Independent training experiment without modifying existing checkpoints or results.

Key Features:
- Preserves existing Waterbirds JSONL metadata splits (train/valid/test)
- Standard ImageNet preprocessing (224x224, normalized)
- Supports both standard Empirical Risk Minimization (ERM) and Group-Balanced sampling
- Evaluates validation accuracy, all 4 group accuracies, and worst-group accuracy (WGA) at each epoch
- Selects and saves the best model checkpoint to models/fusion_resnet50_effnetb0.pth
- Records full training loss/accuracy trajectories to results/fusion/training_history.json
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
from typing import Dict, List, Any, Tuple

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler
from torchvision import transforms
from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from models.fusion import ResNet50EfficientNetFusion, get_fusion_model

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
torch.set_num_threads(min(8, os.cpu_count() or 4))

TRAIN_JSON = PROJECT_ROOT / "data" / "waterbirds" / "train.json"
VALID_JSON = PROJECT_ROOT / "data" / "waterbirds" / "valid.json"
TEST_JSON = PROJECT_ROOT / "data" / "waterbirds" / "test.json"
IMAGE_ROOT = PROJECT_ROOT / "data" / "waterbird_complete95_forest2water2"

MODELS_DIR = PROJECT_ROOT / "models"
RESULTS_FUSION_DIR = PROJECT_ROOT / "results" / "fusion"
DEFAULT_CHECKPOINT_PATH = MODELS_DIR / "fusion_resnet50_effnetb0.pth"

GROUP_NAMES = {
    0: "Landbird on Land (y=0, c=0)",
    1: "Landbird on Water (y=0, c=1)",
    2: "Waterbird on Land (y=1, c=0)",
    3: "Waterbird on Water (y=1, c=1)",
}

# Standard ImageNet Evaluation Preprocessing (224x224)
EVAL_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# Training transform with standard data augmentation
TRAIN_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


class WaterbirdsDataset(Dataset):
    """Waterbirds dataset reading exact project JSON annotations."""

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

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int, int, int]:
        item = self.samples[idx]
        img = Image.open(item["path"]).convert("RGB")
        if self.transform:
            img = self.transform(img)
        return img, item["y"], item["group"], item["c"]

    def get_group_weights_for_sampling(self) -> torch.Tensor:
        """Returns per-sample weights inversely proportional to subgroup size."""
        weights = [1.0 / self.group_counts[s["group"]] for s in self.samples]
        return torch.as_tensor(weights, dtype=torch.double)


def extract_dataset_features(
    model: ResNet50EfficientNetFusion,
    loader: DataLoader,
    split_name: str = "train",
) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor]:
    """
    Extracts concatenated ResNet50 (2048) + EfficientNet-B0 (1280) features.
    Extracting invariant representations enables exhaustive hyperparameter tuning and
    multi-epoch optimization in seconds while preserving exact mathematical equivalency.
    """
    print(f"[{split_name.upper()}] Extracting fusion features ({len(loader.dataset)} samples)...", flush=True)
    t0 = time.time()
    model.eval()

    fused_list = []
    labels_list = []
    groups_list = []
    contexts_list = []

    with torch.inference_mode():
        for batch_idx, (imgs, ys, gs, cs) in enumerate(loader):
            imgs = imgs.to(device)
            f_resnet = model.resnet(imgs)
            f_effnet = model.effnet(imgs)
            f_fused = torch.cat([f_resnet, f_effnet], dim=1).cpu()

            fused_list.append(f_fused)
            labels_list.append(ys)
            groups_list.append(gs)
            contexts_list.append(cs)

            if (batch_idx + 1) % 20 == 0 or (batch_idx + 1) == len(loader):
                pct = (batch_idx + 1) / len(loader) * 100
                print(f"  Progress: {batch_idx + 1}/{len(loader)} batches ({pct:.1f}%)", flush=True)

    all_fused = torch.cat(fused_list, dim=0)
    all_labels = torch.cat(labels_list, dim=0)
    all_groups = torch.cat(groups_list, dim=0)
    all_contexts = torch.cat(contexts_list, dim=0)

    elapsed = time.time() - t0
    print(f"[+] {split_name.upper()} features extracted: shape {list(all_fused.shape)} in {elapsed:.1f}s", flush=True)
    return all_fused, all_labels, all_groups, all_contexts


def evaluate_features(
    classifier: nn.Module,
    fused_features: torch.Tensor,
    labels: torch.Tensor,
    groups: torch.Tensor,
    batch_size: int = 128,
) -> Dict[str, Any]:
    """Evaluates the classifier head over feature representations."""
    classifier.eval()
    total = len(labels)
    total_correct = 0
    g_correct = {0: 0, 1: 0, 2: 0, 3: 0}
    g_total = {0: 0, 1: 0, 2: 0, 3: 0}

    with torch.no_grad():
        for i in range(0, total, batch_size):
            feat_b = fused_features[i : i + batch_size].to(device)
            y_b = labels[i : i + batch_size].to(device)
            g_b = groups[i : i + batch_size]

            logits = classifier(feat_b)
            preds = logits.argmax(dim=1)

            for p, y, g in zip(preds, y_b, g_b):
                correct = int(p.item() == y.item())
                total_correct += correct
                g_correct[g.item()] += correct
                g_total[g.item()] += 1

    group_accs = {
        g: (g_correct[g] / max(g_total[g], 1)) * 100 for g in range(4)
    }
    wga = min(group_accs.values())
    wga_group = [g for g in range(4) if group_accs[g] == wga][0]
    overall_acc = (total_correct / total) * 100

    return {
        "overall_accuracy": round(overall_acc, 2),
        "worst_group_accuracy": round(wga, 2),
        "worst_group_id": wga_group,
        "worst_group_name": GROUP_NAMES[wga_group],
        "group_accuracies": {g: round(group_accs[g], 2) for g in range(4)},
        "group_counts": g_total,
    }


def train_fusion(
    epochs: int = 15,
    batch_size: int = 64,
    lr: float = 5e-4,
    weight_decay: float = 1e-4,
    sampler_type: str = "group_balanced",
    head_hidden_dim: int = 512,
    dropout_rate: float = 0.3,
    checkpoint_path: Path = DEFAULT_CHECKPOINT_PATH,
    resnet_checkpoint: str = None,
) -> Dict[str, Any]:
    """
    Main training execution function for ResNet50 + EfficientNet-B0 Fusion model.
    """
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    RESULTS_FUSION_DIR.mkdir(parents=True, exist_ok=True)

    print("=" * 70, flush=True)
    print("DEEPSPUR: RESNET50 + EFFICIENTNET-B0 FEATURE FUSION TRAINING", flush=True)
    print(f"Device: {device} | Threads: {torch.get_num_threads()}", flush=True)
    print(f"Epochs: {epochs} | Batch Size: {batch_size} | Learning Rate: {lr}", flush=True)
    print(f"Sampling Strategy: {sampler_type}", flush=True)
    print(f"Target Checkpoint: {checkpoint_path}", flush=True)
    print("=" * 70, flush=True)

    # 1. Initialize full fusion model
    fusion_model = get_fusion_model(
        num_classes=2,
        pretrained=True,
        resnet_checkpoint=resnet_checkpoint,
        freeze_backbones=True,
        head_hidden_dim=head_hidden_dim,
        dropout_rate=dropout_rate,
    ).to(device)

    param_summary = fusion_model.get_parameter_summary()
    print("\nModel Parameter Structure:")
    for k, v in param_summary.items():
        print(f"  {k}: {v:,}" if isinstance(v, int) else f"  {k}: {v}", flush=True)

    # 2. Datasets
    print("\nLoading Waterbirds splits...", flush=True)
    train_ds = WaterbirdsDataset(TRAIN_JSON, IMAGE_ROOT, transform=TRAIN_TRANSFORM)
    val_ds = WaterbirdsDataset(VALID_JSON, IMAGE_ROOT, transform=EVAL_TRANSFORM)

    print(f"Train split: {len(train_ds)} samples | Subgroup counts: {train_ds.group_counts}")
    print(f"Valid split: {len(val_ds)} samples | Subgroup counts: {val_ds.group_counts}")

    # 3. Extract invariant backbone features once
    extract_batch_size = 64
    train_extract_loader = DataLoader(train_ds, batch_size=extract_batch_size, shuffle=False, num_workers=0)
    val_extract_loader = DataLoader(val_ds, batch_size=extract_batch_size, shuffle=False, num_workers=0)

    train_fused, train_labels, train_groups, _ = extract_dataset_features(fusion_model, train_extract_loader, "train")
    val_fused, val_labels, val_groups, _ = extract_dataset_features(fusion_model, val_extract_loader, "valid")

    # 4. Feature Tensor Dataset & Sampler
    class FeatureDataset(Dataset):
        def __init__(self, features, labels, groups):
            self.features = features
            self.labels = labels
            self.groups = groups

        def __len__(self):
            return len(self.labels)

        def __getitem__(self, idx):
            return self.features[idx], self.labels[idx], self.groups[idx]

    feat_train_ds = FeatureDataset(train_fused, train_labels, train_groups)

    if sampler_type == "group_balanced":
        # Group-balanced sampling: inverse-frequency weights per subgroup
        weights = train_ds.get_group_weights_for_sampling()
        sampler = WeightedRandomSampler(weights=weights, num_samples=len(train_ds), replacement=True)
        train_loader = DataLoader(feat_train_ds, batch_size=batch_size, sampler=sampler)
        print("[+] Configured Group-Balanced WeightedRandomSampler for training.")
    else:
        train_loader = DataLoader(feat_train_ds, batch_size=batch_size, shuffle=True)
        print("[+] Configured Standard ERM DataLoader for training.")

    # 5. Classifier optimization
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(
        fusion_model.classifier.parameters(),
        lr=lr,
        weight_decay=weight_decay,
    )
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs, eta_min=1e-5)

    best_val_wga = -1.0
    best_val_acc = -1.0
    best_epoch = 0
    best_state_dict = None
    history = []

    print("\nStarting Training Execution...", flush=True)
    t_start = time.time()

    for epoch in range(1, epochs + 1):
        fusion_model.classifier.train()
        running_loss = 0.0
        correct_train = 0
        total_train = 0

        for feats, labels, _ in train_loader:
            feats = feats.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()
            outputs = fusion_model.classifier(feats)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * labels.size(0)
            preds = outputs.argmax(dim=1)
            correct_train += (preds == labels).sum().item()
            total_train += labels.size(0)

        scheduler.step()

        epoch_loss = running_loss / total_train
        epoch_train_acc = (correct_train / total_train) * 100

        # Evaluate on validation split
        val_metrics = evaluate_features(fusion_model.classifier, val_fused, val_labels, val_groups)
        val_acc = val_metrics["overall_accuracy"]
        val_wga = val_metrics["worst_group_accuracy"]
        val_g_accs = val_metrics["group_accuracies"]

        # Track history
        epoch_record = {
            "epoch": epoch,
            "train_loss": round(epoch_loss, 4),
            "train_acc": round(epoch_train_acc, 2),
            "val_acc": val_acc,
            "val_wga": val_wga,
            "val_wga_group": val_metrics["worst_group_id"],
            "val_group_accuracies": val_g_accs,
            "lr": round(optimizer.param_groups[0]["lr"], 6),
        }
        history.append(epoch_record)

        # Selection criterion: Highest Worst-Group Accuracy on validation set (with overall acc as tie-breaker)
        is_best = False
        if val_wga > best_val_wga or (val_wga == best_val_wga and val_acc > best_val_acc):
            best_val_wga = val_wga
            best_val_acc = val_acc
            best_epoch = epoch
            best_state_dict = {k: v.cpu().clone() for k, v in fusion_model.state_dict().items()}
            is_best = True

        print(
            f"Epoch {epoch:02d}/{epochs:02d} | "
            f"Train Loss: {epoch_loss:.4f} | Train Acc: {epoch_train_acc:.2f}% | "
            f"Val Acc: {val_acc:.2f}% | Val WGA: {val_wga:.2f}% [G{val_metrics['worst_group_id']}]"
            f"{' (★ BEST)' if is_best else ''}",
            flush=True,
        )

    total_training_time = time.time() - t_start
    print(f"\n[+] Training completed in {total_training_time:.1f}s.")
    print(f"[+] Best Validation Checkpoint at Epoch {best_epoch}: Val WGA = {best_val_wga:.2f}%, Val Acc = {best_val_acc:.2f}%")

    # 6. Save the best complete end-to-end model checkpoint
    if best_state_dict is not None:
        fusion_model.load_state_dict(best_state_dict)

    torch.save({
        "epoch": best_epoch,
        "model_state_dict": fusion_model.state_dict(),
        "architecture": "ResNet50_EfficientNetB0_Fusion",
        "num_classes": 2,
        "fused_feature_dim": 3328,
        "head_hidden_dim": head_hidden_dim,
        "best_val_wga": best_val_wga,
        "best_val_acc": best_val_acc,
        "sampler_type": sampler_type,
        "parameter_summary": param_summary,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
    }, checkpoint_path)

    ckpt_size_bytes = checkpoint_path.stat().st_size
    ckpt_size_mb = ckpt_size_bytes / (1024 * 1024)
    print(f"[+] Saved complete fusion model checkpoint to: {checkpoint_path}")
    print(f"[+] Checkpoint file size: {ckpt_size_bytes:,} bytes ({ckpt_size_mb:.2f} MB)")

    # 7. Save training history
    history_file = RESULTS_FUSION_DIR / "training_history.json"
    with open(history_file, "w", encoding="utf-8") as f:
        json.dump({
            "model_name": "ResNet50_EfficientNetB0_Fusion",
            "checkpoint_path": str(checkpoint_path.name),
            "configuration": {
                "epochs": epochs,
                "batch_size": batch_size,
                "learning_rate": lr,
                "weight_decay": weight_decay,
                "sampler_type": sampler_type,
                "head_hidden_dim": head_hidden_dim,
                "dropout_rate": dropout_rate,
            },
            "best_epoch": best_epoch,
            "best_val_wga": best_val_wga,
            "best_val_acc": best_val_acc,
            "total_training_seconds": round(total_training_time, 2),
            "history": history,
        }, f, indent=2)
    print(f"[+] Saved training history to: {history_file.name}")

    return {
        "best_epoch": best_epoch,
        "best_val_wga": best_val_wga,
        "best_val_acc": best_val_acc,
        "checkpoint_path": str(checkpoint_path),
        "checkpoint_size_mb": round(ckpt_size_mb, 2),
        "total_training_time": round(total_training_time, 2),
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train ResNet50 + EfficientNet-B0 Fusion on Waterbirds")
    parser.add_argument("--epochs", type=int, default=15, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=64, help="Batch size")
    parser.add_argument("--lr", type=float, default=5e-4, help="Learning rate")
    parser.add_argument("--weight-decay", type=float, default=1e-4, help="Weight decay")
    parser.add_argument("--sampler", type=str, default="group_balanced", choices=["group_balanced", "standard"], help="Sampler type")
    parser.add_argument("--checkpoint", type=str, default=str(DEFAULT_CHECKPOINT_PATH), help="Output checkpoint path")
    parser.add_argument("--resnet-ckpt", type=str, default=None, help="Optional initial ResNet-50 checkpoint")
    args = parser.parse_args()

    train_fusion(
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        weight_decay=args.weight_decay,
        sampler_type=args.sampler,
        checkpoint_path=Path(args.checkpoint),
        resnet_checkpoint=args.resnet_ckpt,
    )
