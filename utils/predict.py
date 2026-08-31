import torch

def predict(image_tensor, model, device="cpu"):
    """
    Inference utility for XAI detection and FastAPI backend.
    Takes a single image tensor (3, 224, 224) and returns class ID and confidence.
    """
    model.eval()
    model.to(device)
    
    if image_tensor.dim() == 3:
        image_tensor = image_tensor.unsqueeze(0)
        
    image_tensor = image_tensor.to(device)
    
    with torch.no_grad():
        logits = model(image_tensor)
        probabilities = torch.softmax(logits, dim=1)
        confidence, predicted_class = torch.max(probabilities, dim=1)
        
    return predicted_class.item(), confidence.item()