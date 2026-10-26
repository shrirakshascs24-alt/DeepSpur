import sys
sys.path.append(".")

import os
import json
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
from torch.utils.data import DataLoader
from torchvision import transforms, models

from data.waterbirds.dataset import WaterbirdsDataset

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

eval_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def predict(image: Image.Image, model: torch.nn.Module) -> dict:
    """
    Inference interface returning predicted class and softmax confidence.
    """
    model.eval()
    model.to(device)
    
    img_tensor = eval_transform(image).unsqueeze(0).to(device)
    
    with torch.no_grad():
        outputs = model(img_tensor)
        probs = F.softmax(outputs, dim=1)
        confidence, prediction = torch.max(probs, 1)
        
    return {
        "prediction": int(prediction.item()),
        "confidence": float(confidence.item())
    }

def evaluate_test_set(model: torch.nn.Module, test_loader, output_file: str = "results/baseline_results.json"):
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    model.eval()
    model.to(device)
    
    results = []
    correct = 0
    total = 0

    with torch.no_grad():
        for i, batch in enumerate(test_loader):
            images = batch["image"].to(device)
            labels = batch["label"].to(device)
            contexts = batch["context"].to(device)
            
            outputs = model(images)
            probs = F.softmax(outputs, dim=1)
            confidences, predictions = torch.max(probs, 1)
            
            for pred, conf, label, ctx in zip(predictions, confidences, labels, contexts):
                is_correct = (pred == label).item()
                if is_correct:
                    correct += 1
                total += 1

                results.append({
                    "true_label": int(label.item()),
                    "prediction": int(pred.item()),
                    "confidence": float(conf.item()),
                    "context": int(ctx.item())
                })

    overall_acc = (correct / total) * 100 if total > 0 else 0
    print(f"\nEvaluation Complete!")
    print(f"Overall Test Accuracy: {overall_acc:.2f}% ({correct}/{total})")

    with open(output_file, "w") as f:
        json.dump({"overall_accuracy": overall_acc, "predictions": results}, f, indent=2)
        
    print(f"Saved evaluation predictions to {output_file}")

if __name__ == "__main__":
    print("Starting ResNet-50 Baseline Evaluation...")
    
    # 1. Initialize ResNet-50 baseline model
    model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, 2)  # Binary classification: Waterbird vs Landbird
    
    # Load custom weights if available
    weights_path = "models/baseline_resnet50.pth"
    if os.path.exists(weights_path):
        model.load_state_dict(torch.load(weights_path, map_location=device))
        print(f"Loaded trained weights from {weights_path}")
    else:
        print("Running baseline evaluation with standard ResNet-50 architecture...")

    # 2. Initialize test set loader
    # Passing "test.json" because dataset.py internally prepends data/waterbirds/
    json_path = "test.json"
    image_root = os.path.abspath(os.path.join("data", "waterbirds", "waterbird_complete95_forest2water2"))
    
    test_dataset = WaterbirdsDataset(json_file=json_path, image_root=image_root, transform=eval_transform)
    test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)

    # 3. Execute evaluation
    evaluate_test_set(model, test_loader)
