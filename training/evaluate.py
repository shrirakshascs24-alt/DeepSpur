import sys
from pathlib import Path

# Add project root directory to Python path
sys.path.append(str(Path(__file__).resolve().parent.parent))

import torch

def evaluate_groups(model, dataloader, device="cpu"):
    """
    Evaluates baseline model across individual group IDs (G0-G3) to compute
    Average Accuracy and Worst-Group Accuracy (WGA).
    """
    model.eval()
    model.to(device)
    
    group_correct = {}
    group_total = {}
    
    with torch.no_grad():
        for batch in dataloader:
            if len(batch) == 3:
                images, labels, group_ids = batch
            else:
                images, labels = batch
                group_ids = torch.zeros_like(labels)
                
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)
            
            for pred, label, g_id in zip(preds, labels, group_ids):
                g_item = g_id.item()
                if g_item not in group_correct:
                    group_correct[g_item] = 0
                    group_total[g_item] = 0
                    
                group_total[g_item] += 1
                if pred == label:
                    group_correct[g_item] += 1
                    
    group_accuracies = {g: group_correct[g] / group_total[g] for g in group_total}
    worst_group_acc = min(group_accuracies.values()) if group_accuracies else 0.0
    overall_acc = sum(group_correct.values()) / sum(group_total.values()) if group_total else 0.0
    
    return overall_acc, worst_group_acc, group_accuracies

if __name__ == "__main__":
    print("Evaluation module loaded successfully.")