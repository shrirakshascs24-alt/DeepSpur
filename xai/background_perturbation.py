
import sys
import json
import csv
import argparse
from pathlib import Path
from collections import defaultdict

import numpy as np
import torch
from PIL import Image, ImageFilter, ImageDraw
from torchvision import transforms
from torchvision.models import ResNet50_Weights

try:
    import cv2
except ImportError:
    cv2 = None

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from models.resnet import get_baseline_model


DATASET_DIR = PROJECT_ROOT / "data" / "waterbird_complete95_forest2water2"
TEST_JSON = PROJECT_ROOT / "data" / "waterbirds" / "test.json"
CHECKPOINT = PROJECT_ROOT / "models" / "baseline_resnet50.pth"
RESULTS_DIR = PROJECT_ROOT / "results" / "p3_perturbation"

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
CLASS_NAMES = {0: "landbird", 1: "waterbird"}

PREPROCESS = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=ResNet50_Weights.DEFAULT.transforms().mean,
        std=ResNet50_Weights.DEFAULT.transforms().std,
    ),
])


def load_model():
    if not CHECKPOINT.is_file():
        raise FileNotFoundError(f"Checkpoint not found: {CHECKPOINT}")

    model = get_baseline_model(num_classes=2, pretrained=False)
    checkpoint = torch.load(
        CHECKPOINT, map_location=DEVICE, weights_only=True
    )
    state_dict = checkpoint.get("model_state_dict", checkpoint)

    # Training saved plain ResNet-50 keys; the wrapper uses model.* keys.
    if any(key.startswith("conv1.") for key in state_dict):
        state_dict = {f"model.{key}": value for key, value in state_dict.items()}

    model.load_state_dict(state_dict, strict=True)
    model.to(DEVICE).eval()
    return model


def load_test_groups():
    if not TEST_JSON.is_file():
        raise FileNotFoundError(f"Test metadata not found: {TEST_JSON}")

    groups = defaultdict(list)

    with TEST_JSON.open("r", encoding="utf-8") as f:
        for line_number, line in enumerate(f, start=1):
            if not line.strip():
                continue

            row = json.loads(line)
            y, c = int(row["y"]), int(row["c"])
            relative_path = row["x"]

            if y not in (0, 1) or c not in (0, 1):
                raise ValueError(f"Unexpected labels on line {line_number}")

            image_path = DATASET_DIR / relative_path
            if not image_path.is_file():
                raise FileNotFoundError(
                    f"Image listed in test.json is missing: {image_path}"
                )

            groups[(y, c)].append({
                "path": image_path,
                "relative_path": relative_path,
                "y": y,
                "c": c,
            })

    return groups


def blur_background(image, sigma=30, feather_radius=5):
    """
    Apply strong Gaussian blur (sigma=30) across the ENTIRE background
    while preserving ONLY the avian silhouette sharp and unchanged.
    Uses DeepLabV3 segmentation (cached) to isolate the bird from background.
    """
    orig_rgb = image.convert("RGB")
    width, height = orig_rgb.size

    try:
        from torchvision.models.segmentation import deeplabv3_resnet50, DeepLabV3_ResNet50_Weights
        weights = DeepLabV3_ResNet50_Weights.DEFAULT
        seg_model = deeplabv3_resnet50(weights=weights).to(DEVICE).eval()
        t = weights.transforms()
        input_t = t(orig_rgb).unsqueeze(0).to(DEVICE)
        with torch.no_grad():
            out = seg_model(input_t)["out"][0]
            preds = out.argmax(0).byte().cpu().numpy()
        bird_mask = (preds == 3)
        if bird_mask.sum() < 250:
            bird_mask = (preds != 0)
        raw_mask = Image.fromarray((bird_mask.astype(np.float32) * 255).astype(np.uint8), mode='L')
        mask_img = raw_mask.resize((width, height), Image.Resampling.BILINEAR)
        mask_img = mask_img.filter(ImageFilter.MaxFilter(size=5))
        feathered_mask = mask_img.filter(ImageFilter.GaussianBlur(radius=feather_radius))
    except Exception:
        # Fallback to center-biased mask if seg fails
        mask = Image.new("L", (width, height), 0)
        draw = ImageDraw.Draw(mask)
        cx, cy = width // 2, height // 2
        rx, ry = int(width * 0.22), int(height * 0.28)
        draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=255)
        feathered_mask = mask.filter(ImageFilter.GaussianBlur(radius=feather_radius))

    blurred_background = orig_rgb.filter(ImageFilter.GaussianBlur(radius=sigma))
    perturbed_img = Image.composite(orig_rgb, blurred_background, feathered_mask)
    mask_np = np.asarray(feathered_mask).astype(np.float32) / 255.0

    return perturbed_img, mask_np


def predict(model, image):
    tensor = PREPROCESS(image.convert("RGB")).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        probs = torch.softmax(model(tensor), dim=1)[0].cpu().numpy()

    return int(np.argmax(probs)), probs


def subgroup_name(y, c):
    bird = CLASS_NAMES[y]
    background = "water" if c == 1 else "land"
    return f"{bird}_on_{background}"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--max-per-group", type=int, default=50,
        help="Number of test images per subgroup; use 0 for all images."
    )
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    if args.max_per_group < 0:
        parser.error("--max-per-group must be 0 or greater")

    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    previews_dir = RESULTS_DIR / "previews"
    previews_dir.mkdir(parents=True, exist_ok=True)

    groups = load_test_groups()
    rng = np.random.default_rng(args.seed)

    print("Device:", DEVICE)
    print("Loading checkpoint:", CHECKPOINT)

    model = load_model()
    all_rows = []
    errors = []

    for (y, c) in sorted(groups):
        samples = groups[(y, c)]
        order = rng.permutation(len(samples))

        if args.max_per_group:
            order = order[:args.max_per_group]

        selected = [samples[int(i)] for i in order]
        name = subgroup_name(y, c)
        print(f"\n{name}: processing {len(selected)} of {len(samples)}")

        for index, item in enumerate(selected, start=1):
            try:
                with Image.open(item["path"]) as im:
                    original = im.convert("RGB")

                perturbed, foreground_mask = blur_background(original)

                original_pred, original_probs = predict(model, original)
                altered_pred, altered_probs = predict(model, perturbed)

                row = {
                    "image": item["relative_path"],
                    "subgroup": name,
                    "true_bird_label": y,
                    "true_background_label": c,
                    "true_class": CLASS_NAMES[y],
                    "background": "water" if c == 1 else "land",
                    "original_prediction": CLASS_NAMES[original_pred],
                    "original_correct": int(original_pred == y),
                    "original_landbird_probability": float(original_probs[0]),
                    "original_waterbird_probability": float(original_probs[1]),
                    "perturbed_prediction": CLASS_NAMES[altered_pred],
                    "perturbed_correct": int(altered_pred == y),
                    "perturbed_landbird_probability": float(altered_probs[0]),
                    "perturbed_waterbird_probability": float(altered_probs[1]),
                    "original_true_class_probability": float(original_probs[y]),
                    "perturbed_true_class_probability": float(altered_probs[y]),
                    "true_class_probability_change": float(
                        altered_probs[y] - original_probs[y]
                    ),
                    "prediction_changed": int(original_pred != altered_pred),
                    "mask_foreground_fraction": float(foreground_mask.mean()),
                }
                all_rows.append(row)

                # Save three example comparisons per subgroup.
                if index <= 3:
                    stem = f"{name}_{index}"
                    original.resize((224, 224)).save(
                        previews_dir / f"{stem}_original.png"
                    )
                    perturbed.save(previews_dir / f"{stem}_blurred.png")
                    Image.fromarray(
                        (foreground_mask * 255).astype(np.uint8)
                    ).save(previews_dir / f"{stem}_mask.png")

            except Exception as exc:
                errors.append({
                    "image": item["relative_path"],
                    "subgroup": name,
                    "error": repr(exc),
                })
                print(f"  ERROR on {item['relative_path']}: {exc}")

    per_image_csv = RESULTS_DIR / "per_image_results.csv"
    if all_rows:
        with per_image_csv.open(
            "w", newline="", encoding="utf-8-sig"
        ) as f:
            writer = csv.DictWriter(f, fieldnames=list(all_rows[0].keys()))
            writer.writeheader()
            writer.writerows(all_rows)

    summary = []
    for name in sorted({r["subgroup"] for r in all_rows}):
        rows = [r for r in all_rows if r["subgroup"] == name]
        n = len(rows)
        summary.append({
            "subgroup": name,
            "n": n,
            "original_accuracy": float(np.mean(
                [r["original_correct"] for r in rows]
            )),
            "perturbed_accuracy": float(np.mean(
                [r["perturbed_correct"] for r in rows]
            )),
            "accuracy_change": float(np.mean(
                [r["perturbed_correct"] for r in rows]
            ) - np.mean([r["original_correct"] for r in rows])),
            "prediction_flip_rate": float(np.mean(
                [r["prediction_changed"] for r in rows]
            )),
            "mean_true_class_probability_original": float(np.mean(
                [r["original_true_class_probability"] for r in rows]
            )),
            "mean_true_class_probability_perturbed": float(np.mean(
                [r["perturbed_true_class_probability"] for r in rows]
            )),
            "mean_true_class_probability_change": float(np.mean(
                [r["true_class_probability_change"] for r in rows]
            )),
            "mean_mask_foreground_fraction": float(np.mean(
                [r["mask_foreground_fraction"] for r in rows]
            )),
        })

    summary_csv = RESULTS_DIR / "subgroup_summary.csv"
    if summary:
        with summary_csv.open(
            "w", newline="", encoding="utf-8-sig"
        ) as f:
            writer = csv.DictWriter(f, fieldnames=list(summary[0].keys()))
            writer.writeheader()
            writer.writerows(summary)

    report = {
        "experiment": "Waterbirds background-blur pilot",
        "checkpoint": str(CHECKPOINT),
        "test_metadata": str(TEST_JSON),
        "device": str(DEVICE),
        "max_per_group": args.max_per_group,
        "seed": args.seed,
        "processed_images": len(all_rows),
        "errors_count": len(errors),
        "class_mapping": CLASS_NAMES,
        "background_mapping": {"0": "land", "1": "water"},
        "intervention": (
            "Approximate central-ellipse foreground preserved; remaining image blurred. Mask may include background objects or remove bird   regions.; remaining image blurred. "
            "Masks may include background objects or remove bird regions."
        ),
        "subgroups": summary,
        "errors": errors,
    }

    with (RESULTS_DIR / "summary.json").open(
        "w", encoding="utf-8"
    ) as f:
        json.dump(report, f, indent=2)

    print("\n========== P3 PILOT SUMMARY ==========")
    for item in summary:
        print(
            f"{item['subgroup']}: n={item['n']}, "
            f"original_acc={item['original_accuracy']:.3f}, "
            f"perturbed_acc={item['perturbed_accuracy']:.3f}, "
            f"flip_rate={item['prediction_flip_rate']:.3f}, "
            f"mean_true_prob_change="
            f"{item['mean_true_class_probability_change']:+.3f}"
        )

    print("\nProcessed:", len(all_rows))
    print("Errors:", len(errors))
    print("Per-image CSV:", per_image_csv)
    print("Subgroup summary:", summary_csv)
    print("Full summary:", RESULTS_DIR / "summary.json")
    print("Example images and masks:", previews_dir)


if __name__ == "__main__":
    main()
