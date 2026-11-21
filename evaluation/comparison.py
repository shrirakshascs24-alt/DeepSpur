
import argparse
import json
from pathlib import Path

import numpy as np
import pandas as pd
import torch
from PIL import Image
from torch import nn
from torch.utils.data import Dataset, DataLoader
from torchvision import models, transforms


# Adapted to the team's P1 JSONL metadata
IMAGE_KEYS = ["x", "img_filename", "image_path", "img_path", "filename", "path"]
LABEL_KEYS = ["y", "label", "bird_label", "target"]
PLACE_KEYS = ["c", "place", "background", "background_label", "place_label"]


def value(row, keys):
    for key in keys:
        if row.get(key) is not None:
            return row[key]

    raise KeyError(
        f"Missing one of {keys}; row keys: {list(row)}"
    )


class TestSet(Dataset):
    def __init__(self, json_path, root):
        self.root = Path(root)

        self.rows = [
            json.loads(s)
            for s in Path(json_path).read_text(encoding="utf-8").splitlines()
            if s.strip()
        ]

        self.tf = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                [0.485, 0.456, 0.406],
                [0.229, 0.224, 0.225]
            )
        ])

        if not self.rows:
            raise RuntimeError(f"No rows found in {json_path}")

    def __len__(self):
        return len(self.rows)

    def __getitem__(self, i):
        r = self.rows[i]

        p = Path(str(value(r, IMAGE_KEYS)))

        if not p.is_absolute():
            p = self.root / p

        if not p.exists():
            raise FileNotFoundError(f"Image not found: {p}")

        x = self.tf(Image.open(p).convert("RGB"))

        y = int(value(r, LABEL_KEYS))
        place = int(value(r, PLACE_KEYS))

        return x, y, y * 2 + place


def make_model(path, device):
    model = models.resnet50(weights=None)
    model.fc = nn.Linear(model.fc.in_features, 2)

    ckpt = torch.load(path, map_location=device)

    if isinstance(ckpt, dict) and "model_state_dict" in ckpt:
        ckpt = ckpt["model_state_dict"]
    elif isinstance(ckpt, dict) and "state_dict" in ckpt:
        ckpt = ckpt["state_dict"]

    ckpt = {
        k.replace("module.", "", 1): v
        for k, v in ckpt.items()
    }

    model.load_state_dict(ckpt, strict=True)

    return model.to(device).eval()


@torch.no_grad()
def evaluate(model, loader, device):
    labels, preds, groups = [], [], []

    for x, y, g in loader:
        logits = model(x.to(device))

        labels.extend(y.numpy().tolist())
        preds.extend(logits.argmax(1).cpu().numpy().tolist())
        groups.extend(g.numpy().tolist())

    result = {
        "overall_accuracy": float(
            np.mean(np.array(labels) == np.array(preds))
        )
    }

    group_values = []

    for g in range(4):
        ids = [
            i for i, item in enumerate(groups)
            if item == g
        ]

        a = (
            float(np.mean([
                labels[i] == preds[i] for i in ids
            ]))
            if ids else float("nan")
        )

        result[f"group_{g}_accuracy"] = a
        group_values.append(a)

    result["worst_group_accuracy"] = (
        float(np.nanmin(group_values))
        if not np.all(np.isnan(group_values))
        else float("nan")
    )

    return result


def main():
    p = argparse.ArgumentParser()

    p.add_argument(
        "--baseline",
        default="models/baseline_resnet50.pth"
    )
    p.add_argument(
        "--corrected",
        default="models/corrected_resnet50.pth"
    )
    p.add_argument(
        "--test-json",
        default="data/waterbirds/test.json"
    )
    p.add_argument(
        "--image-root",
        default="data/waterbird_complete95_forest2water2"
    )
    p.add_argument(
        "--output",
        default="results/comparison/model_comparison.csv"
    )
    p.add_argument("--batch-size", type=int, default=32)

    args = p.parse_args()

    device = torch.device(
        "cuda" if torch.cuda.is_available() else "cpu"
    )

    ds = TestSet(args.test_json, args.image_root)

    loader = DataLoader(
        ds,
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=0
    )

    rows = []

    for name, path in [
        ("baseline", args.baseline),
        ("corrected", args.corrected)
    ]:
        model = make_model(path, device)
        metrics = evaluate(model, loader, device)

        rows.append({
            "model": name,
            **metrics
        })

        print(name, metrics)

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)

    pd.DataFrame(rows).to_csv(out, index=False)

    print("Saved:", out)


if __name__ == "__main__":
    main()
