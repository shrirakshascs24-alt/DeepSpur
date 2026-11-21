"""
DeepSpur - ResNet50 + EfficientNet-B0 Feature Fusion Model
==========================================================
Architecture:
- Branch 1: ResNet-50 feature extractor (2,048-dim output from adaptive average pooling)
- Branch 2: EfficientNet-B0 feature extractor (1,280-dim output from adaptive average pooling)
- Fusion: Feature-level concatenation -> 3,328-dim multimodal/multi-backbone representation
- Head: 2-layer MLP classification head with Dropout and BatchNorm for Waterbirds (2 classes: Landbird, Waterbird)

Designed to keep full compatibility with:
- Standard PyTorch forward pass: (B, 3, 224, 224) -> (B, 2)
- Feature extraction hooks: accessible resnet and effnet submodules
- Grad-CAM attribution: target layers exposed for both branches
"""

from pathlib import Path
from typing import Optional, Tuple, Dict, Any

import torch
import torch.nn as nn
from torchvision.models import (
    resnet50,
    ResNet50_Weights,
    efficientnet_b0,
    EfficientNet_B0_Weights,
)

PROJECT_ROOT = Path(__file__).resolve().parents[1]


class ResNet50EfficientNetFusion(nn.Module):
    """
    Two-stream feature fusion architecture concatenating ResNet-50 and EfficientNet-B0 representations.
    """

    def __init__(
        self,
        num_classes: int = 2,
        pretrained: bool = True,
        resnet_checkpoint: Optional[str] = None,
        freeze_backbones: bool = False,
        head_hidden_dim: int = 512,
        dropout_rate: float = 0.3,
    ):
        super().__init__()
        self.num_classes = num_classes
        self.head_hidden_dim = head_hidden_dim
        self.dropout_rate = dropout_rate

        # -------------------------------------------------------------
        # Branch 1: ResNet-50 Feature Extractor
        # -------------------------------------------------------------
        resnet_weights = ResNet50_Weights.DEFAULT if (pretrained and resnet_checkpoint is None) else None
        self.resnet = resnet50(weights=resnet_weights)

        # Optionally load custom ResNet weights (e.g. baseline checkpoint)
        if resnet_checkpoint:
            ckpt_path = Path(resnet_checkpoint)
            if ckpt_path.exists():
                sd = torch.load(ckpt_path, map_location="cpu", weights_only=True)
                if isinstance(sd, dict):
                    sd = sd.get("model_state_dict", sd.get("state_dict", sd))
                clean_sd = {k.replace("module.", "").replace("model.", ""): v for k, v in sd.items()}
                # Load backbone weights, ignoring mismatched classifier heads if any
                missing, unexpected = self.resnet.load_state_dict(clean_sd, strict=False)
                print(f"[Fusion] Loaded ResNet-50 weights from {ckpt_path.name} (missing keys: {len(missing)})")

        self.resnet_dim = self.resnet.fc.in_features  # 2048
        # Replace classification head with Identity to extract pooled features
        self.resnet.fc = nn.Identity()

        # -------------------------------------------------------------
        # Branch 2: EfficientNet-B0 Feature Extractor
        # -------------------------------------------------------------
        effnet_weights = EfficientNet_B0_Weights.DEFAULT if pretrained else None
        self.effnet = efficientnet_b0(weights=effnet_weights)
        self.effnet_dim = self.effnet.classifier[1].in_features  # 1280
        # Replace classifier with Identity to extract pooled features
        self.effnet.classifier = nn.Identity()

        # -------------------------------------------------------------
        # Fusion & Classification Head
        # -------------------------------------------------------------
        self.fused_dim = self.resnet_dim + self.effnet_dim  # 3328

        if head_hidden_dim and head_hidden_dim > 0:
            self.classifier = nn.Sequential(
                nn.Dropout(p=dropout_rate),
                nn.Linear(self.fused_dim, head_hidden_dim),
                nn.BatchNorm1d(head_hidden_dim),
                nn.ReLU(inplace=True),
                nn.Dropout(p=dropout_rate * 0.7),
                nn.Linear(head_hidden_dim, num_classes),
            )
        else:
            self.classifier = nn.Sequential(
                nn.Dropout(p=dropout_rate),
                nn.Linear(self.fused_dim, num_classes)
            )

        if freeze_backbones:
            self.freeze_backbones()

    def freeze_backbones(self, freeze_resnet: bool = True, freeze_effnet: bool = True):
        """Freezes backbones so only the fusion classifier head trains."""
        if freeze_resnet:
            for p in self.resnet.parameters():
                p.requires_grad = False
        if freeze_effnet:
            for p in self.effnet.parameters():
                p.requires_grad = False

    def unfreeze_top_layers(self):
        """Unfreezes layer4 of ResNet and features[7..8] of EfficientNet for fine-tuning."""
        for p in self.resnet.layer4.parameters():
            p.requires_grad = True
        for p in self.effnet.features[7:].parameters():
            p.requires_grad = True

    @property
    def resnet_target_layer(self) -> nn.Module:
        """Target layer for ResNet-50 Grad-CAM feature attribution."""
        return self.resnet.layer4[-1]

    @property
    def effnet_target_layer(self) -> nn.Module:
        """Target layer for EfficientNet-B0 Grad-CAM feature attribution."""
        return self.effnet.features[-1]

    def extract_features(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """
        Extracts separate and concatenated feature vectors.
        Returns:
            (f_resnet [B, 2048], f_effnet [B, 1280], f_fused [B, 3328])
        """
        f_resnet = self.resnet(x)
        f_effnet = self.effnet(x)
        f_fused = torch.cat([f_resnet, f_effnet], dim=1)
        return f_resnet, f_effnet, f_fused

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Standard end-to-end forward pass: (B, 3, 224, 224) -> (B, num_classes)."""
        _, _, f_fused = self.extract_features(x)
        return self.classifier(f_fused)

    def forward_from_features(self, f_fused: torch.Tensor) -> torch.Tensor:
        """Forward pass directly from precomputed 3328-dim fused feature vectors."""
        return self.classifier(f_fused)

    def get_parameter_summary(self) -> Dict[str, Any]:
        """Returns parameter counts of the individual components and complete model."""
        total_params = sum(p.numel() for p in self.parameters())
        trainable_params = sum(p.numel() for p in self.parameters() if p.requires_grad)
        resnet_params = sum(p.numel() for p in self.resnet.parameters())
        effnet_params = sum(p.numel() for p in self.effnet.parameters())
        classifier_params = sum(p.numel() for p in self.classifier.parameters())

        return {
            "total_parameters": total_params,
            "trainable_parameters": trainable_params,
            "resnet50_parameters": resnet_params,
            "efficientnet_b0_parameters": effnet_params,
            "classifier_head_parameters": classifier_params,
            "resnet_feature_dim": self.resnet_dim,
            "effnet_feature_dim": self.effnet_dim,
            "fused_feature_dim": self.fused_dim,
            "num_classes": self.num_classes,
        }


def get_fusion_model(
    num_classes: int = 2,
    pretrained: bool = True,
    resnet_checkpoint: Optional[str] = None,
    freeze_backbones: bool = False,
    head_hidden_dim: int = 512,
    dropout_rate: float = 0.3,
) -> ResNet50EfficientNetFusion:
    """Factory function for creating the ResNet50 + EfficientNet-B0 fusion model."""
    return ResNet50EfficientNetFusion(
        num_classes=num_classes,
        pretrained=pretrained,
        resnet_checkpoint=resnet_checkpoint,
        freeze_backbones=freeze_backbones,
        head_hidden_dim=head_hidden_dim,
        dropout_rate=dropout_rate,
    )


if __name__ == "__main__":
    print("Testing ResNet50EfficientNetFusion initialization...")
    model = get_fusion_model(pretrained=False)
    summary = model.get_parameter_summary()
    print("Parameter Summary:")
    for k, v in summary.items():
        print(f"  {k}: {v:,}" if isinstance(v, int) else f"  {k}: {v}")

    dummy = torch.randn(2, 3, 224, 224)
    out = model(dummy)
    print("Forward pass successful. Output shape:", out.shape)
