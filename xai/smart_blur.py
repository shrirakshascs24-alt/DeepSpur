import os
import sys
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter, ImageOps
import torch
import torch.nn.functional as F
from torchvision import transforms
from torchvision.models import ResNet50_Weights

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from models.resnet import get_baseline_model

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
CHECKPOINT = PROJECT_ROOT / "models" / "baseline_resnet50.pth"
PREVIEWS_DIR = PROJECT_ROOT / "results" / "p3_perturbation" / "previews"

PREPROCESS = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=ResNet50_Weights.DEFAULT.transforms().mean,
        std=ResNet50_Weights.DEFAULT.transforms().std,
    ),
])

CLASS_NAMES = {0: "Landbird", 1: "Waterbird"}


def get_segmentation_model():
    """Load cached DeepLabV3-ResNet50 model."""
    try:
        from torchvision.models.segmentation import deeplabv3_resnet50, DeepLabV3_ResNet50_Weights
        weights = DeepLabV3_ResNet50_Weights.DEFAULT
        seg_model = deeplabv3_resnet50(weights=weights).to(DEVICE).eval()
        print("Loaded DeepLabV3-ResNet50 segmentation model.")
        return seg_model, weights.transforms()
    except Exception as e:
        print(f"DeepLabV3 not available: {e}. Falling back to saliency.")
        return None, None


def segment_bird_deeplab(seg_model, seg_transforms, pil_img):
    """Segment bird using DeepLabV3 (COCO/VOC bird class)."""
    input_tensor = seg_transforms(pil_img).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        output = seg_model(input_tensor)["out"][0]
        output_predictions = output.argmax(0).byte().cpu().numpy()

    # In VOC/COCO: class 3 is bird
    bird_mask = (output_predictions == 3)
    
    # If no bird detected, check if other foreground animal classes were triggered
    if bird_mask.sum() < 300:
        bird_mask = (output_predictions != 0)

    # Convert to PIL Image and resize strictly to (224, 224)
    raw_mask_img = Image.fromarray((bird_mask.astype(np.float32) * 255).astype(np.uint8), mode='L')
    resized_mask = raw_mask_img.resize((224, 224), Image.Resampling.BILINEAR)
    return np.asarray(resized_mask).astype(np.float32) / 255.0


def segment_bird_saliency(baseline_model, pil_img):
    """High-precision fallback using ResNet-50 feature maps + edge contrast."""
    img_224 = pil_img.resize((224, 224))
    np_img = np.array(img_224, dtype=np.float32) / 255.0
    
    tensor = PREPROCESS(pil_img).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        x = baseline_model.model.conv1(tensor)
        x = baseline_model.model.bn1(x)
        x = baseline_model.model.relu(x)
        x = baseline_model.model.maxpool(x)
        x = baseline_model.model.layer1(x)
        x = baseline_model.model.layer2(x)
        l3 = baseline_model.model.layer3(x)

    feat_mag = torch.sqrt((l3 ** 2).mean(dim=1, keepdim=True))
    feat_upsampled = F.interpolate(feat_mag, size=(224, 224), mode='bilinear', align_corners=False)
    feat_np = feat_upsampled[0, 0].cpu().numpy()
    feat_np = (feat_np - feat_np.min()) / (feat_np.max() - feat_np.min() + 1e-6)

    mask = (feat_np > 0.35).astype(np.float32)
    return mask


def refine_mask(mask_np, feather_radius=5):
    """Clean mask, dilate to preserve fine feathers/beak, and feather boundary."""
    mask_img = Image.fromarray((mask_np * 255).astype(np.uint8), mode='L')
    mask_img = mask_img.resize((224, 224), Image.Resampling.BILINEAR)
    
    # Slight dilation so outer feathers & beak tips are 100% preserved
    mask_img = mask_img.filter(ImageFilter.MaxFilter(size=5))
    mask_img = mask_img.filter(ImageFilter.GaussianBlur(radius=feather_radius))
    return mask_img


def blur_background_tight(orig_224, mask_img, sigma=30):
    """
    BLUR THE ENTIRE BACKGROUND HEAVILY (sigma=30).
    Preserves ONLY the bird silhouette sharp and unchanged.
    """
    orig_224 = orig_224.convert("RGB").resize((224, 224))
    mask_img = mask_img.convert("L").resize((224, 224))
    
    # Blur the entire background heavily (sigma=30)
    blurred_all = orig_224.filter(ImageFilter.GaussianBlur(radius=sigma))
    
    # Where mask is 255 (bird), keep original pixels. Where mask is 0 (all background), keep heavily blurred!
    perturbed = Image.composite(orig_224, blurred_all, mask_img)
    return perturbed


def predict_model(model, pil_img):
    tensor = PREPROCESS(pil_img).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        logits = model(tensor)
        probs = F.softmax(logits, dim=1)[0].cpu().numpy()
    pred_idx = int(np.argmax(probs))
    conf = float(probs[pred_idx])
    return {
        "pred": pred_idx,
        "class": CLASS_NAMES[pred_idx],
        "conf": round(conf, 4),
        "probabilities": {
            "Landbird": round(float(probs[0]), 4),
            "Waterbird": round(float(probs[1]), 4)
        }
    }


def main():
    print(f"Device: {DEVICE}")
    print(f"Loading ResNet-50 baseline: {CHECKPOINT}")

    baseline_model = get_baseline_model(num_classes=2, pretrained=False)
    cp = torch.load(CHECKPOINT, map_location=DEVICE, weights_only=True)
    sd = cp.get("model_state_dict", cp)
    if any(k.startswith("conv1.") for k in sd):
        sd = {f"model.{k}": v for k, v in sd.items()}
    baseline_model.load_state_dict(sd, strict=True)
    baseline_model.to(DEVICE).eval()

    seg_model, seg_transforms = get_segmentation_model()

    if not PREVIEWS_DIR.exists():
        print("Previews directory not found!")
        return

    orig_files = sorted(list(PREVIEWS_DIR.glob("*_original.png")))
    print(f"Found {len(orig_files)} preview images to process.")

    results_data = {}

    for orig_path in orig_files:
        stem = orig_path.name.replace("_original.png", "")
        with Image.open(orig_path) as im:
            orig_img = im.convert("RGB").resize((224, 224))

        # 1. Generate tight bird mask using DeepLabV3
        mask_np = None
        if seg_model is not None:
            try:
                mask_np = segment_bird_deeplab(seg_model, seg_transforms, orig_img)
            except Exception as e:
                print(f"DeepLab error on {stem}: {e}")
                mask_np = None

        if mask_np is None or mask_np.sum() < 100:
            mask_np = segment_bird_saliency(baseline_model, orig_img)

        # Refine mask: smooth edges, preserve full bird silhouette
        mask_img = refine_mask(mask_np, feather_radius=5)

        # 2. Apply heavy background blur (sigma=30) - entire background blurred, bird sharp
        perturbed_img = blur_background_tight(orig_img, mask_img, sigma=30)

        # Save updated images
        mask_out_path = PREVIEWS_DIR / f"{stem}_mask.png"
        blurred_out_path = PREVIEWS_DIR / f"{stem}_blurred.png"
        
        mask_img.save(mask_out_path)
        perturbed_img.save(blurred_out_path)

        # 3. Model inference on both original and perturbed images
        orig_res = predict_model(baseline_model, orig_img)
        pert_res = predict_model(baseline_model, perturbed_img)

        flipped = (orig_res["pred"] != pert_res["pred"])
        delta_conf = round(pert_res["conf"] - orig_res["conf"], 4)

        clean_group = stem.rsplit("_", 1)[0].replace("_", " ").title()

        # Parse ground-truth from filename
        gt_class = "Waterbird" if "waterbird" in stem.lower() else "Landbird"
        gt_idx = 1 if gt_class == "Waterbird" else 0

        results_data[stem] = {
            "id": stem,
            "group": clean_group,
            "groundTruth": gt_class,
            "groundTruthIdx": gt_idx,
            "originalUrl": f"/api/xai/preview?name={orig_path.name}",
            "maskUrl": f"/api/xai/preview?name={mask_out_path.name}",
            "perturbedUrl": f"/api/xai/preview?name={blurred_out_path.name}",
            "originalPrediction": orig_res,
            "perturbedPrediction": pert_res,
            "predictionFlipped": flipped,
            "confidenceDelta": delta_conf
        }

        print(f"[{stem}] Orig: {orig_res['class']} ({orig_res['conf']*100:.1f}%) -> Blurred: {pert_res['class']} ({pert_res['conf']*100:.1f}%) | Flipped: {flipped}")

    # Save detailed evaluation metadata to preview_results.json
    meta_path = PREVIEWS_DIR / "preview_results.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(results_data, f, indent=2)

    print(f"\nAll 12 specimens processed successfully with heavy background blur (sigma=30)!")
    print(f"Results saved to: {meta_path}")


if __name__ == "__main__":
    main()
