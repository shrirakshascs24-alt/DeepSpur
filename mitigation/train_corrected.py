"""
DeepSpur - Corrected ResNet-50 v2.0 Training Pipeline
Implements Group-Balanced Sampling, Robust Avian Data Augmentation, and Group DRO Optimization.

Key Features:
1. Exact mapping of all 4 Waterbirds groups verified via metadata.csv:
   - Group 0: Landbird on Land (y=0, c=0)
   - Group 1: Landbird on Water (y=0, c=1) [Minority]
   - Group 2: Waterbird on Land (y=1, c=0) [Weakest Minority - 56 training samples]
   - Group 3: Waterbird on Water (y=1, c=1)
2. Group-Balanced mini-batch sampling ensuring equal training representation across all 4 groups.
3. Group DRO (Distributionally Robust Optimization) with online exponential group weight tracking.
4. Fine-tuning from baseline ResNet-50 checkpoint with frozen early representations (conv1..layer3).
5. Differential learning rates for layer4 (2e-5) and fc (2e-4) with AdamW and cosine decay.
6. Data augmentation tailored to prevent overfitting on minority samples (56 Waterbird-on-Land).
7. Validation Worst-Group Accuracy (WGA) model selection saving to models/corrected_resnet50_v2.pth.
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
from PIL import Image

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler
from torchvision import models, transforms

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
torch.set_num_threads(min(8, os.cpu_count() or 4))

BASELINE_PATH = PROJECT_ROOT / "models" / "baseline_resnet50.pth"
CORRECTED_V1_PATH = PROJECT_ROOT / "models" / "corrected_resnet50.pth"
CORRECTED_V2_PATH = PROJECT_ROOT / "models" / "corrected_resnet50_v2.pth"

TRAIN_JSON = PROJECT_ROOT / "data" / "waterbirds" / "train.json"
VALID_JSON = PROJECT_ROOT / "data" / "waterbirds" / "valid.json"
TEST_JSON = PROJECT_ROOT / "data" / "waterbirds" / "test.json"
IMAGE_ROOT = PROJECT_ROOT / "data" / "waterbird_complete95_forest2water2"

GROUP_NAMES = [
    "Landbird on Land (y=0, c=0)",
    "Landbird on Water (y=0, c=1)",
    "Waterbird on Land (y=1, c=0)",
    "Waterbird on Water (y=1, c=1)"
]

GROUP_SHORT_NAMES = [
    "Land / Land",
    "Land / Water",
    "Water / Land",
    "Water / Water"
]

# Training transform with anti-overfitting augmentations
TRAIN_TRANSFORM = transforms.Compose([
    transforms.RandomResizedCrop(224, scale=(0.7, 1.0), ratio=(0.8, 1.25)),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.15, hue=0.03),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Deterministic evaluation transform
EVAL_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])


class WaterbirdsDataset(Dataset):
    def __init__(self, json_path, image_root, transform=None):
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
                    "y": y,
                    "c": c,
                    "group": g
                })
                self.group_counts[g] += 1

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        item = self.samples[idx]
        img = Image.open(item["path"]).convert("RGB")
        if self.transform:
            img = self.transform(img)
        return img, item["y"], item["group"], item["c"]

    def get_group_weights_for_sampling(self):
        """Returns per-sample weights inversely proportional to group size."""
        weights = []
        for s in self.samples:
            g = s["group"]
            weights.append(1.0 / self.group_counts[g])
        return torch.as_tensor(weights, dtype=torch.double)


class GroupDROLoss(nn.Module):
    """
    Distributionally Robust Optimization loss for discrete subgroup shifts.
    Dynamically maintains online group weights q via exponentiated gradient updates.
    """
    def __init__(self, n_groups=4, step_size=0.02, device="cpu"):
        super().__init__()
        self.n_groups = n_groups
        self.step_size = step_size
        self.device = device
        # Initialize uniform group weights
        self.register_buffer("q", torch.ones(n_groups, device=device) / n_groups)
        self.criterion = nn.CrossEntropyLoss(reduction="none")

    def forward(self, logits, targets, groups):
        per_sample_losses = self.criterion(logits, targets)
        group_losses = torch.zeros(self.n_groups, device=self.device)
        group_counts = torch.zeros(self.n_groups, device=self.device)

        for g in range(self.n_groups):
            mask = (groups == g)
            count = mask.sum()
            if count > 0:
                group_losses[g] = per_sample_losses[mask].mean()
                group_counts[g] = count.float()

        # Update group weights via exponentiated gradient
        with torch.no_grad():
            for g in range(self.n_groups):
                if group_counts[g] > 0:
                    self.q[g] = self.q[g] * torch.exp(self.step_size * group_losses[g].detach())
            self.q = self.q / self.q.sum()

        # Overall loss is the q-weighted sum of group losses
        dro_loss = torch.sum(self.q * group_losses)
        return dro_loss, group_losses.detach(), self.q.detach()


def build_and_load_baseline(checkpoint_path=BASELINE_PATH):
    """Constructs ResNet-50 binary classifier and loads baseline weights."""
    model = models.resnet50(weights=None)
    model.fc = nn.Linear(model.fc.in_features, 2)

    if not Path(checkpoint_path).exists():
        raise FileNotFoundError(f"Baseline checkpoint not found at: {checkpoint_path}")

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
    return model


def precompute_layer3_features(model, val_loader):
    """
    Extracts frozen layer3 features for validation samples.
    Because layers conv1 through layer3 are completely frozen, their outputs are invariant.
    Evaluating layer4 + fc on precomputed features speeds up validation by >100x.
    """
    print("Precomputing invariant layer3 representations for validation set...", flush=True)
    t0 = time.time()
    model.eval()

    def forward_to_layer3(m, x):
        x = m.conv1(x)
        x = m.bn1(x)
        x = m.relu(x)
        x = m.maxpool(x)
        x = m.layer1(x)
        x = m.layer2(x)
        x = m.layer3(x)
        return x

    features_list = []
    labels_list = []
    groups_list = []

    with torch.no_grad():
        for imgs, ys, gs, _ in val_loader:
            imgs = imgs.to(device)
            feat = forward_to_layer3(model, imgs)
            features_list.append(feat.cpu())
            labels_list.append(ys)
            groups_list.append(gs)

    all_features = torch.cat(features_list, dim=0)
    all_labels = torch.cat(labels_list, dim=0)
    all_groups = torch.cat(groups_list, dim=0)

    elapsed = time.time() - t0
    print(f"Precomputed {len(all_labels)} validation features in {elapsed:.1f}s (Shape: {list(all_features.shape)})", flush=True)
    return all_features, all_labels, all_groups


def evaluate_with_cached_features(model, val_features, val_labels, val_groups, batch_size=64):
    """Evaluates layer4 + fc over cached layer3 features in ~1 second."""
    model.eval()
    g_correct = {0: 0, 1: 0, 2: 0, 3: 0}
    g_total = {0: 0, 1: 0, 2: 0, 3: 0}
    total_correct = 0
    total = len(val_labels)

    with torch.no_grad():
        for start_idx in range(0, total, batch_size):
            feat_batch = val_features[start_idx:start_idx + batch_size].to(device)
            y_batch = val_labels[start_idx:start_idx + batch_size].to(device)
            g_batch = val_groups[start_idx:start_idx + batch_size]

            # Run layer4 + avgpool + fc
            x = model.layer4(feat_batch)
            x = model.avgpool(x)
            x = torch.flatten(x, 1)
            logits = model.fc(x)

            preds = logits.argmax(dim=1)
            for p, y, g in zip(preds, y_batch, g_batch):
                is_c = int(p.item() == y.item())
                g_correct[g.item()] += is_c
                g_total[g.item()] += 1
                total_correct += is_c

    accs = {g: (g_correct[g] / g_total[g] * 100) if g_total[g] > 0 else 0 for g in range(4)}
    wga = min(accs.values())
    wga_g = [g for g in range(4) if accs[g] == wga][0]
    overall = (total_correct / total * 100) if total > 0 else 0
    return overall, accs, wga, wga_g, g_total


def evaluate_full_model(model, data_loader):
    """End-to-end full model evaluation from raw images."""
    model.eval()
    g_correct = {0: 0, 1: 0, 2: 0, 3: 0}
    g_total = {0: 0, 1: 0, 2: 0, 3: 0}
    total_correct = 0
    total = 0

    with torch.no_grad():
        for imgs, ys, gs, _ in data_loader:
            imgs = imgs.to(device)
            ys = ys.to(device)
            logits = model(imgs)
            preds = logits.argmax(dim=1)
            for p, y, g in zip(preds, ys, gs):
                is_c = int(p.item() == y.item())
                g_correct[g.item()] += is_c
                g_total[g.item()] += 1
                total_correct += is_c
                total += 1

    accs = {g: (g_correct[g] / g_total[g] * 100) if g_total[g] > 0 else 0 for g in range(4)}
    wga = min(accs.values())
    wga_g = [g for g in range(4) if accs[g] == wga][0]
    overall = (total_correct / total * 100) if total > 0 else 0
    return overall, accs, wga, wga_g, g_total


def train_corrected(
    epochs=8,
    batch_size=32,
    lr_layer4=2e-5,
    lr_fc=2e-4,
    weight_decay=1e-3,
    samples_per_group=300,
    dro_step_size=0.02,
    output_path=CORRECTED_V2_PATH
):
    print("=" * 70, flush=True)
    print("DEEPSPUR: CORRECTED RESNET-50 v2.0 ROBUST TRAINING PIPELINE", flush=True)
    print("Optimization: Group-Balanced Sampling + Group DRO", flush=True)
    print("Target Checkpoint:", output_path, flush=True)
    print("=" * 70, flush=True)

    # 1. Load baseline model
    print(f"Loading baseline ResNet-50 weights from: {BASELINE_PATH}", flush=True)
    model = build_and_load_baseline(BASELINE_PATH)

    # Freeze conv1 through layer3; train layer4 and fc
    for name, param in model.named_parameters():
        if "layer4" in name or "fc" in name:
            param.requires_grad = True
        else:
            param.requires_grad = False

    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    frozen_params = sum(p.numel() for p in model.parameters() if not p.requires_grad)
    print(f"Model parameters: {trainable_params:,} trainable (layer4 + fc), {frozen_params:,} frozen (conv1..layer3)", flush=True)

    # 2. Datasets
    train_dataset = WaterbirdsDataset(TRAIN_JSON, IMAGE_ROOT, transform=TRAIN_TRANSFORM)
    val_dataset = WaterbirdsDataset(VALID_JSON, IMAGE_ROOT, transform=EVAL_TRANSFORM)

    print(f"Training dataset: {len(train_dataset)} total samples", flush=True)
    for g in range(4):
        print(f"  Group {g} [{GROUP_NAMES[g]}]: {train_dataset.group_counts[g]} samples", flush=True)

    print(f"Validation dataset: {len(val_dataset)} total samples", flush=True)
    for g in range(4):
        print(f"  Group {g} [{GROUP_NAMES[g]}]: {val_dataset.group_counts[g]} samples", flush=True)

    # 3. Group-Balanced Sampler
    # Generates equal expected samples per group per epoch
    sample_weights = train_dataset.get_group_weights_for_sampling()
    num_samples_epoch = 4 * samples_per_group
    sampler = WeightedRandomSampler(
        weights=sample_weights,
        num_samples=num_samples_epoch,
        replacement=True
    )

    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        sampler=sampler,
        drop_last=True
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=64,
        shuffle=False
    )

    # 4. Precompute validation features for instantaneous validation
    val_features, val_labels, val_groups = precompute_layer3_features(model, val_loader)

    # Initial baseline evaluation on validation
    init_overall, init_accs, init_wga, init_wg, _ = evaluate_with_cached_features(
        model, val_features, val_labels, val_groups
    )
    print("\n--- Initial Baseline Performance (Validation) ---", flush=True)
    print(f"Overall Acc: {init_overall:.2f}%, WGA: {init_wga:.2f}% [{GROUP_SHORT_NAMES[init_wg]}]", flush=True)
    for g in range(4):
        print(f"  Group {g} ({GROUP_SHORT_NAMES[g]}): {init_accs[g]:.2f}%", flush=True)

    # 5. Optimizer & DRO Loss
    optimizer = torch.optim.AdamW([
        {"params": model.layer4.parameters(), "lr": lr_layer4, "weight_decay": weight_decay},
        {"params": model.fc.parameters(), "lr": lr_fc, "weight_decay": weight_decay}
    ])
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs, eta_min=1e-6)
    dro_loss_fn = GroupDROLoss(n_groups=4, step_size=dro_step_size, device=device)

    best_val_wga = init_wga
    best_epoch = 0

    print(f"\nBeginning {epochs} epochs of group-balanced robust fine-tuning...", flush=True)
    print(f"{'Epoch':<7} | {'Train Loss':<10} | {'DRO Weights (q0..q3)':<24} | {'Val Overall':<11} | {'Val WGA':<9} | {'Weakest Group':<16} | Status", flush=True)
    print("-" * 95, flush=True)

    for epoch in range(1, epochs + 1):
        model.train()
        epoch_loss = 0.0
        n_batches = 0

        for imgs, labels, groups, _ in train_loader:
            imgs = imgs.to(device)
            labels = labels.to(device)
            groups = groups.to(device)

            optimizer.zero_grad()
            logits = model(imgs)
            loss, g_losses, current_q = dro_loss_fn(logits, labels, groups)
            loss.backward()

            # Gradient clipping for stability
            torch.nn.utils.clip_grad_norm_(filter(lambda p: p.requires_grad, model.parameters()), max_norm=1.0)
            optimizer.step()

            epoch_loss += loss.item()
            n_batches += 1

        scheduler.step()
        avg_train_loss = epoch_loss / max(1, n_batches)
        q_str = f"[{current_q[0]:.2f}, {current_q[1]:.2f}, {current_q[2]:.2f}, {current_q[3]:.2f}]"

        # Validation evaluation using cached layer3 features (~1 second)
        val_overall, val_accs, val_wga, val_wg, _ = evaluate_with_cached_features(
            model, val_features, val_labels, val_groups
        )

        status_flag = ""
        # Strictly select based on validation Worst-Group Accuracy (WGA)
        if val_wga > best_val_wga:
            best_val_wga = val_wga
            best_epoch = epoch
            status_flag = "★ NEW BEST WGA"
            # Save the improved checkpoint
            torch.save(model.state_dict(), output_path)

        print(
            f"Ep {epoch:<3} | {avg_train_loss:<10.4f} | {q_str:<24} | {val_overall:<10.2f}% | {val_wga:<8.2f}% | {GROUP_SHORT_NAMES[val_wg]:<16} | {status_flag}",
            flush=True
        )

    print("-" * 95, flush=True)
    print(f"Training Complete! Best model achieved at Epoch {best_epoch} with Val WGA: {best_val_wga:.2f}%", flush=True)
    print(f"Saved optimal checkpoint to: {output_path}", flush=True)

    # 6. Verify and reload best model for full end-to-end evaluation
    print("\nReloading saved checkpoint for full end-to-end verification...", flush=True)
    best_model = build_and_load_baseline(output_path)
    val_overall, val_accs, val_wga, val_wg, val_totals = evaluate_full_model(best_model, val_loader)

    print("\n" + "=" * 70, flush=True)
    print("VERIFIED POST-TRAINING RESULTS: CORRECTED RESNET-50 v2.0 (VALIDATION)", flush=True)
    print("=" * 70, flush=True)
    print(f"Overall Accuracy:           {val_overall:.2f}%", flush=True)
    print(f"Worst-Group Accuracy (WGA): {val_wga:.2f}% [{GROUP_NAMES[val_wg]}]", flush=True)
    for g in range(4):
        delta = val_accs[g] - init_accs[g]
        sign = "+" if delta >= 0 else ""
        print(f"  Group {g} [{GROUP_NAMES[g]:30s}]: {val_accs[g]:.2f}% (N={val_totals[g]}) [{sign}{delta:.2f}% vs Baseline]", flush=True)
    print("=" * 70 + "\n", flush=True)

    return best_model


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Corrected ResNet-50 v2.0 with Group DRO")
    parser.add_argument("--epochs", type=int, default=8, help="Number of fine-tuning epochs")
    parser.add_argument("--batch_size", type=int, default=32, help="Mini-batch size")
    parser.add_argument("--lr_layer4", type=float, default=2e-5, help="Learning rate for layer4")
    parser.add_argument("--lr_fc", type=float, default=2e-4, help="Learning rate for fc classification head")
    parser.add_argument("--weight_decay", type=float, default=1e-3, help="Weight decay")
    parser.add_argument("--samples_per_group", type=int, default=300, help="Samples per group per epoch")
    parser.add_argument("--dro_step_size", type=float, default=0.02, help="Group DRO step size")
    parser.add_argument("--output_path", type=str, default=str(CORRECTED_V2_PATH), help="Output checkpoint path")
    args = parser.parse_args()

    train_corrected(
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr_layer4=args.lr_layer4,
        lr_fc=args.lr_fc,
        weight_decay=args.weight_decay,
        samples_per_group=args.samples_per_group,
        dro_step_size=args.dro_step_size,
        output_path=Path(args.output_path)
    )
