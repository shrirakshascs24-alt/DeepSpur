
import argparse
import json
from pathlib import Path

import numpy as np
import pandas as pd
import torch
from PIL import Image
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
from torch import nn
from torch.utils.data import Dataset, DataLoader
from torchvision import models, transforms


# Adapted to the team's P1 JSONL metadata
IMAGE_KEYS = ["x", "img_filename", "image_path", "img_path", "filename", "path"]
LABEL_KEYS = ["y", "label", "bird_label", "target"]
PLACE_KEYS = ["c", "place", "background", "background_label", "place_label"]


def get_value(row, keys):
    for key in keys:
        if key in row and row[key] is not None:
            return row[key]
    raise KeyError(
        f"None of these fields found: {keys}. Row keys: {list(row)}"
    )


class EvalDataset(Dataset):
    def __init__(self, jsonl, image_root):
        self.root = Path(image_root)

        self.rows = [
            json.loads(x)
            for x in Path(jsonl).read_text(encoding="utf-8").splitlines()
            if x.strip()
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
            raise RuntimeError(f"No rows found in {jsonl}")

        for field, keys in [
            ("image", IMAGE_KEYS),
            ("label", LABEL_KEYS),
            ("place", PLACE_KEYS)
        ]:
            if get_value(self.rows[0], keys) is None:
                raise KeyError(f"Missing metadata field: {field}")

    def __len__(self):
        return len(self.rows)

    def __getitem__(self, i):
        r = self.rows[i]

        path = Path(str(get_value(r, IMAGE_KEYS)))

        if not path.is_absolute():
            path = self.root / path

        if not path.exists():
            raise FileNotFoundError(f"Image not found: {path}")

        x = self.tf(Image.open(path).convert("RGB"))

        y = int(get_value(r, LABEL_KEYS))
        place = int(get_value(r, PLACE_KEYS))

        group = y * 2 + place

        return x, y, group


def load_model(checkpoint, device):
    model = models.resnet50(weights=None)
    model.fc = nn.Linear(model.fc.in_features, 2)

    ckpt = torch.load(checkpoint, map_location=device)

    if isinstance(ckpt, dict) and "model_state_dict" in ckpt:
        ckpt = ckpt["model_state_dict"]
    elif isinstance(ckpt, dict) and "state_dict" in ckpt:
        ckpt = ckpt["state_dict"]

    ckpt = {
        k.replace("module.", "", 1): v
        for k, v in ckpt.items()
    }

    model.load_state_dict(ckpt, strict=True)
    model.to(device).eval()

    return model


@torch.no_grad()
def main():
    p = argparse.ArgumentParser()

    p.add_argument("--checkpoint", required=True)
    p.add_argument("--json", default="data/waterbirds/test.json")
    p.add_argument(
        "--image-root",
        default="data/waterbird_complete95_forest2water2"
    )
    p.add_argument(
        "--output",
        default="results/comparison/metrics.csv"
    )
    p.add_argument("--batch-size", type=int, default=32)

    args = p.parse_args()

    device = torch.device(
        "cuda" if torch.cuda.is_available() else "cpu"
    )

    ds = EvalDataset(args.json, args.image_root)

    loader = DataLoader(
        ds,
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=0
    )

    model = load_model(args.checkpoint, device)

    ys, preds, groups = [], [], []

    for x, y, g in loader:
        logits = model(x.to(device))
        pred = logits.argmax(1).cpu().numpy()

        ys.extend(y.numpy().tolist())
        preds.extend(pred.tolist())
        groups.extend(g.numpy().tolist())

    acc = accuracy_score(ys, preds)

    precision, recall, f1, _ = precision_recall_fscore_support(
        ys,
        preds,
        average="binary",
        zero_division=0
    )

    rows = [
        {"metric": "overall_accuracy", "value": acc},
        {"metric": "precision_binary", "value": precision},
        {"metric": "recall_binary", "value": recall},
        {"metric": "f1_binary", "value": f1}
    ]

    group_accs = []

    for group_id in range(4):
        idx = [
            i for i, g in enumerate(groups)
            if g == group_id
        ]

        if not idx:
            group_accuracy = float("nan")
        else:
            group_accuracy = np.mean([
                ys[i] == preds[i] for i in idx
            ])

        group_accs.append(group_accuracy)

        rows.append({
            "metric": f"group_{group_id}_accuracy",
            "value": group_accuracy
        })

    rows.append({
        "metric": "worst_group_accuracy",
        "value": np.nanmin(group_accs)
    })

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    results_df = pd.DataFrame(rows)
    results_df.to_csv(output_path, index=False)

    print(results_df.to_string(index=False))
    print("Saved:", output_path)


if __name__ == "__main__":
    main()
