import os
import json
import torch
import torch.nn.functional as F
from PIL import Image
from torchvision import transforms

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
    with torch.no_grad():
        for i, (images, labels) in enumerate(test_loader):
            images = images.to(device)
            outputs = model(images)
            probs = F.softmax(outputs, dim=1)
            confidences, predictions = torch.max(probs, 1)
            
            for pred, conf, label in zip(predictions, confidences, labels):
                results.append({
                    "true_label": int(label.item()),
                    "prediction": int(pred.item()),
                    "confidence": float(conf.item())
                })

    with open(output_file, "w") as f:
        json.dump(results, f, indent=2)
        
    print(f"Saved evaluation predictions to {output_file}")