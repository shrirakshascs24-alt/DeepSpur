import torch
import torch.nn as nn
from torchvision.models import resnet50, ResNet50_Weights

def get_baseline_model(num_classes=2):
    # Load PyTorch's default pretrained ImageNet weights
    model = resnet50(weights=ResNet50_Weights.DEFAULT)
    
    # Replace final layer for binary classification (Landbird vs Waterbird)
    in_features = model.fc.in_features
    model.fc = nn.Linear(in_features, num_classes)
    
    return model

if __name__ == "__main__":
    # Test script execution with dummy image tensor
    model = get_baseline_model()
    fake_image = torch.randn(1, 3, 224, 224)
    output = model(fake_image)
    print("DeepSpur ResNet-50 initialized successfully!")
    print("Output tensor shape:", output.shape)  # Expected: [1, 2]