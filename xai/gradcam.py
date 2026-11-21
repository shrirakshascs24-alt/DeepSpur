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
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from models.resnet import get_baseline_model


class FusionGradCAM:
    """Generate dual-branch Grad-CAM heatmaps for the ResNet50 + EfficientNet-B0 Fusion model."""

    def __init__(self, model):
        self.model = model
        self.r_acts = None
        self.r_grads = None
        self.e_acts = None
        self.e_grads = None
        self.hook_handles = []

        r_target = model.resnet_target_layer
        e_target = model.effnet_target_layer

        h1 = r_target.register_forward_hook(self._save_r_act)
        h2 = r_target.register_full_backward_hook(self._save_r_grad)
        h3 = e_target.register_forward_hook(self._save_e_act)
        h4 = e_target.register_full_backward_hook(self._save_e_grad)
        self.hook_handles = [h1, h2, h3, h4]

    def _save_r_act(self, module, inp, out):
        self.r_acts = out.detach()

    def _save_r_grad(self, module, gi, go):
        self.r_grads = go[0].detach()

    def _save_e_act(self, module, inp, out):
        self.e_acts = out.detach()

    def _save_e_grad(self, module, gi, go):
        self.e_grads = go[0].detach()

    def remove_hooks(self):
        for h in self.hook_handles:
            try:
                h.remove()
            except Exception:
                pass
        self.hook_handles = []

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.remove_hooks()

    def generate(self, image_tensor, class_index=None):
        try:
            self.model.eval()
            self.model.zero_grad(set_to_none=True)
            with torch.enable_grad():
                logits = self.model(image_tensor)

                if class_index is None:
                    class_index = int(logits.argmax(dim=1).item())

                score = logits[:, class_index].sum()
                score.backward(retain_graph=False)

            # ResNet branch CAM
            w_r = self.r_grads.mean(dim=(2, 3), keepdim=True)
            cam_r = F.relu((w_r * self.r_acts).sum(dim=1, keepdim=True))
            cam_r = F.interpolate(
                cam_r,
                size=image_tensor.shape[-2:],
                mode="bilinear",
                align_corners=False,
            )
            cam_r_min = cam_r.amin(dim=(2, 3), keepdim=True)
            cam_r_max = cam_r.amax(dim=(2, 3), keepdim=True)
            cam_r = (cam_r - cam_r_min) / (cam_r_max - cam_r_min).clamp_min(1e-8)

            # EfficientNet branch CAM
            w_e = self.e_grads.mean(dim=(2, 3), keepdim=True)
            cam_e = F.relu((w_e * self.e_acts).sum(dim=1, keepdim=True))
            cam_e = F.interpolate(
                cam_e,
                size=image_tensor.shape[-2:],
                mode="bilinear",
                align_corners=False,
            )
            cam_e_min = cam_e.amin(dim=(2, 3), keepdim=True)
            cam_e_max = cam_e.amax(dim=(2, 3), keepdim=True)
            cam_e = (cam_e - cam_e_min) / (cam_e_max - cam_e_min).clamp_min(1e-8)

            # Fused multi-backbone attribution
            fused_cam = 0.5 * cam_r + 0.5 * cam_e
            fused_min = fused_cam.amin(dim=(2, 3), keepdim=True)
            fused_max = fused_cam.amax(dim=(2, 3), keepdim=True)
            fused_cam = (fused_cam - fused_min) / (fused_max - fused_min).clamp_min(1e-8)

            probabilities = torch.softmax(logits.detach(), dim=1)
            return fused_cam[0, 0].cpu(), probabilities[0].detach().cpu()
        finally:
            self.remove_hooks()


class GradCAM:
    """Polymorphic Grad-CAM generator supporting ResNet-50 and ResNet50 + EfficientNet-B0 Fusion models."""

    def __init__(self, model):
        self.model = model
        from models.fusion import ResNet50EfficientNetFusion

        if isinstance(model, ResNet50EfficientNetFusion):
            self._delegate = FusionGradCAM(model)
        else:
            self._delegate = None
            self.activations = None
            self.gradients = None
            self.hook_handles = []

            # Last convolutional block of ResNet-50.
            target_layer = self.model.model.layer4[-1]
            h1 = target_layer.register_forward_hook(self._save_activations)
            h2 = target_layer.register_full_backward_hook(self._save_gradients)
            self.hook_handles = [h1, h2]

    def _save_activations(self, module, inputs, output):
        self.activations = output.detach()

    def _save_gradients(self, module, grad_input, grad_output):
        self.gradients = grad_output[0].detach()

    def remove_hooks(self):
        if self._delegate:
            self._delegate.remove_hooks()
        else:
            for h in self.hook_handles:
                try:
                    h.remove()
                except Exception:
                    pass
            self.hook_handles = []

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.remove_hooks()

    def generate(self, image_tensor, class_index=None):
        if self._delegate:
            return self._delegate.generate(image_tensor, class_index)

        try:
            self.model.eval()
            self.model.zero_grad(set_to_none=True)
            with torch.enable_grad():
                logits = self.model(image_tensor)

                if class_index is None:
                    class_index = int(logits.argmax(dim=1).item())

                score = logits[:, class_index].sum()
                score.backward(retain_graph=False)

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

            probabilities = torch.softmax(logits.detach(), dim=1)
            return cam[0, 0].cpu(), probabilities[0].detach().cpu()
        finally:
            self.remove_hooks()


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
