
import argparse
import json
import os
import random
from pathlib import Path

import numpy as np
import torch
from PIL import Image, ImageFilter
from torch import nn
from torch.utils.data import Dataset, DataLoader
from torchvision import models, transforms


def seed_everything(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def first_present(row, keys):
    for key in keys:
        if key in row and row[key] is not None:
            return row[key]
    return None


class WaterbirdsJsonl(Dataset):
    """Adapted to the team's P1 JSONL metadata."""

    FIELD_CANDIDATES = {
        "image": ["x", "img_filename", "image_path", "img_path", "filename", "path"],
        "label": ["y", "label", "bird_label", "target"],
        "place": ["c", "place", "background", "background_label", "place_label"],
        "split": ["split"],
    }

    def __init__(self, jsonl_path, image_root, train=False, blur_prob=0.5):
        self.jsonl_path = Path(jsonl_path)
        self.image_root = Path(image_root)
        self.train = train
        self.blur_prob = blur_prob
        self.rows = []

        with self.jsonl_path.open("r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    self.rows.append(json.loads(line))

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

        if not self.rows:
            raise RuntimeError(f"No rows found in {jsonl_path}")

        missing = []
        for field, keys in self.FIELD_CANDIDATES.items():
            if field == "split":
                continue
            if first_present(self.rows[0], keys) is None:
                missing.append(f"{field}: tried {keys}")

        if missing:
            raise KeyError(
                "Could not map metadata fields. Inspect one JSONL row and edit "
                "FIELD_CANDIDATES. Missing: " + "; ".join(missing) +
                f". First row keys: {list(self.rows[0].keys())}"
            )

    def __len__(self):
        return len(self.rows)

    def __getitem__(self, idx):
        row = self.rows[idx]
        rel_path = str(first_present(row, self.FIELD_CANDIDATES["image"]))
        image_path = Path(rel_path)

        if not image_path.is_absolute():
            image_path = self.image_root / image_path

        if not image_path.exists():
            raise FileNotFoundError(f"Image not found: {image_path}")

        image = Image.open(image_path).convert("RGB")

        if self.train and random.random() < self.blur_prob:
            image = image.filter(ImageFilter.GaussianBlur(radius=5))

        x = self.transform(image)
        y = int(first_present(row, self.FIELD_CANDIDATES["label"]))
        place = int(first_present(row, self.FIELD_CANDIDATES["place"]))
        group = y * 2 + place

        return x, y, group


def build_model(num_classes=2):
    model = models.resnet50(weights=None)
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    return model


def load_checkpoint(model, checkpoint_path, device):
    checkpoint = torch.load(checkpoint_path, map_location=device)

    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        state = checkpoint["model_state_dict"]
    elif isinstance(checkpoint, dict) and "state_dict" in checkpoint:
        state = checkpoint["state_dict"]
    else:
        state = checkpoint

    state = {k.replace("module.", "", 1): v for k, v in state.items()}
    model.load_state_dict(state, strict=True)
    return model


def train(args):
    seed_everything(args.seed)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print("Device:", device)

    train_ds = WaterbirdsJsonl(
        args.train_json, args.image_root,
        train=True, blur_prob=args.blur_prob
    )
    valid_ds = WaterbirdsJsonl(
        args.valid_json, args.image_root, train=False
    )

    train_loader = DataLoader(
        train_ds, batch_size=args.batch_size,
        shuffle=True, num_workers=args.workers
    )
    valid_loader = DataLoader(
        valid_ds, batch_size=args.batch_size,
        shuffle=False, num_workers=args.workers
    )

    model = build_model()
    model = load_checkpoint(model, args.baseline, device)
    model.to(device)

    optimizer = torch.optim.Adam(
        model.parameters(), lr=args.learning_rate, weight_decay=1e-4
    )
    criterion = nn.CrossEntropyLoss()
    best_val = -1.0

    os.makedirs(os.path.dirname(args.output) or ".", exist_ok=True)

    for epoch in range(args.epochs):
        model.train()
        running_loss, correct, total = 0.0, 0, 0

        for images, labels, _groups in train_loader:
            images, labels = images.to(device), labels.to(device)

            optimizer.zero_grad()
            logits = model(images)
            loss = criterion(logits, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * labels.size(0)
            correct += (logits.argmax(1) == labels).sum().item()
            total += labels.size(0)

        train_loss = running_loss / max(total, 1)
        train_acc = correct / max(total, 1)
        val_acc = evaluate_accuracy(model, valid_loader, device)

        print(
            f"Epoch {epoch+1}/{args.epochs} | "
            f"train_loss={train_loss:.4f} | train_acc={train_acc:.4f} | "
            f"valid_acc={val_acc:.4f}"
        )

        if val_acc > best_val:
            best_val = val_acc
            torch.save(model.state_dict(), args.output)
            print("Saved best checkpoint:", args.output)

    print("Training complete. Best validation accuracy:", best_val)


@torch.no_grad()
def evaluate_accuracy(model, loader, device):
    model.eval()
    correct, total = 0, 0

    for images, labels, _groups in loader:
        images, labels = images.to(device), labels.to(device)
        predictions = model(images).argmax(1)
        correct += (predictions == labels).sum().item()
        total += labels.size(0)

    return correct / max(total, 1)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--train-json", default="data/waterbirds/train.json")
    p.add_argument("--valid-json", default="data/waterbirds/valid.json")
    p.add_argument(
        "--image-root",
        default="data/waterbird_complete95_forest2water2"
    )
    p.add_argument("--baseline", default="models/baseline_resnet50.pth")
    p.add_argument("--output", default="models/corrected_resnet50.pth")
    p.add_argument("--epochs", type=int, default=3)
    p.add_argument("--batch-size", type=int, default=32)
    p.add_argument("--learning-rate", type=float, default=1e-5)
    p.add_argument("--blur-prob", type=float, default=0.5)
    p.add_argument("--workers", type=int, default=0)
    p.add_argument("--seed", type=int, default=42)

    args = p.parse_args()
    train(args)


if __name__ == "__main__":
    main()
