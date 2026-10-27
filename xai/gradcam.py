from pathlib import Path
import sys
import torch
import torch.nn.functional as F
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image
from torchvision import transforms
from torchvision.models import ResNet50_Weights

# Allow imports when run from the project root.
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from models.resnet import get_baseline_model


class GradCAM:
    """Generate Grad-CAM heatmaps for a ResNet-50 model."""

    def __init__(self, model):
        self.model = model
        self.activations = None
        self.gradients = None

        # Last convolutional block of ResNet-50.
        target_layer = self.model.model.layer4[-1]
        target_layer.register_forward_hook(self._save_activations)
        target_layer.register_full_backward_hook(self._save_gradients)

    def _save_activations(self, module, inputs, output):
        self.activations = output.detach()

    def _save_gradients(self, module, grad_input, grad_output):
        self.gradients = grad_output[0].detach()

    def generate(self, image_tensor, class_index=None):
        self.model.zero_grad(set_to_none=True)
        logits = self.model(image_tensor)

        if class_index is None:
            class_index = int(logits.argmax(dim=1).item())

        logits[:, class_index].sum().backward()

        weights = self.gradients.mean(dim=(2, 3), keepdim=True)
        cam = (weights * self.activations).sum(dim=1, keepdim=True)
        cam = F.relu(cam)

        cam = F.interpolate(
            cam,
            size=image_tensor.shape[-2:],
            mode="bilinear",
            align_corners=False,
        )

        cam_min = cam.amin(dim=(2, 3), keepdim=True)
        cam_max = cam.amax(dim=(2, 3), keepdim=True)
        cam = (cam - cam_min) / (cam_max - cam_min).clamp_min(1e-8)

        probabilities = torch.softmax(logits, dim=1)
        return cam[0, 0].cpu(), probabilities[0].detach().cpu()


def main():
    checkpoint_path = PROJECT_ROOT / "models" / "baseline_resnet50.pth"
    image_path = (
    PROJECT_ROOT
    / "data"
    / "waterbird_complete95_forest2water2"
    / "001.Black_footed_Albatross"
    / "Black_Footed_Albatross_0001_796111.jpg"
)
    output_path = PROJECT_ROOT / "results" / "gradcam.png"

    if not checkpoint_path.exists():
        raise FileNotFoundError(
            f"Checkpoint not found: {checkpoint_path}\n"
            "Train and save a model checkpoint before generating Grad-CAM."
        )

    if not image_path.exists():
        raise FileNotFoundError(
            f"Example image not found: {image_path}\n"
            "Update image_path to point to an actual dataset image."
        )

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = get_baseline_model(num_classes=2, pretrained=False)

    checkpoint = torch.load(checkpoint_path, map_location=device, weights_only=True)
    state_dict = checkpoint.get("model_state_dict", checkpoint)
    if any(key.startswith("conv1.") for key in state_dict):
        state_dict = {
            f"model.{key}": value
            for key, value in state_dict.items()
        }
    model.load_state_dict(state_dict)
    model.to(device).eval()

    preprocess = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=ResNet50_Weights.DEFAULT.transforms().mean,
            std=ResNet50_Weights.DEFAULT.transforms().std,
        ),
    ])

    image = Image.open(image_path).convert("RGB")
    input_tensor = preprocess(image).unsqueeze(0).to(device)

    gradcam = GradCAM(model)
    heatmap, probabilities = gradcam.generate(input_tensor)
    heatmap_np = heatmap.numpy()

    # Save a standalone heatmap; overlay is added in the next step.
    heatmap_image = Image.fromarray(
        (heatmap_np * 255).astype(np.uint8)
    ).resize((224, 224), Image.Resampling.BILINEAR)
    heatmap_resized = np.asarray(heatmap_image).astype(np.float32) / 255.0

    original = np.asarray(
        image.resize((224, 224))
    ).astype(np.float32) / 255.0

    heatmap_colored = plt.get_cmap("jet")(heatmap_resized)[..., :3]
    overlay = 0.5 * original + 0.5 * heatmap_colored
    overlay = np.clip(overlay, 0, 1)

    overlay_path = output_path.parent / "gradcam_overlay.png"
    plt.imsave(overlay_path, overlay)

    print("Grad-CAM heatmap saved to:", output_path)
    print("Grad-CAM overlay saved to:", overlay_path)
    print("Class probabilities:", probabilities.tolist())





if __name__ == "__main__":
    main()
