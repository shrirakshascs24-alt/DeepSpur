import torch
import torch.nn as nn
from torchvision.models import resnet50, ResNet50_Weights

class BaselineResNet50(nn.Module):
    def __init__(self, num_classes: int = 2, pretrained: bool = True):
        super(BaselineResNet50, self).__init__()
        weights = ResNet50_Weights.DEFAULT if pretrained else None
        self.model = resnet50(weights=weights)
        
        # Replace final classification head
        in_features = self.model.fc.in_features
        self.model.fc = nn.Linear(in_features, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.model(x)

def get_baseline_model(num_classes: int = 2, pretrained: bool = True) -> nn.Module:
    return BaselineResNet50(num_classes=num_classes, pretrained=pretrained)