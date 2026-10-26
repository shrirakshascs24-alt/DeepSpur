
import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader

def train_baseline(
    model: nn.Module,
    train_loader: DataLoader,
    val_loader: DataLoader,
    epochs: int = 5,
    lr: float = 1e-4,
    save_dir: str = "checkpoints"
):
    os.makedirs(save_dir, exist_ok=True)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)
    best_val_acc = 0.0

    print(f"Starting baseline training on device: {device}")

    for epoch in range(epochs):
        # Training Phase
        model.train()
        running_loss, correct, total = 0.0, 0, 0
        
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)
            
        train_loss = running_loss / total if total > 0 else 0.0
        train_acc = correct / total if total > 0 else 0.0

        # Validation Phase
        model.eval()
        val_loss, val_correct, val_total = 0.0, 0, 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                
                val_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                val_correct += (preds == labels).sum().item()
                val_total += labels.size(0)

        val_loss = val_loss / val_total if val_total > 0 else 0.0
        val_acc = val_correct / val_total if val_total > 0 else 0.0

        print(f"Epoch [{epoch+1}/{epochs}] | Train Loss: {train_loss:.4f} Acc: {train_acc:.4f} | Val Loss: {val_loss:.4f} Acc: {val_acc:.4f}")

        # Save Checkpoints
        checkpoint_path = os.path.join(save_dir, f"baseline_epoch_{epoch+1}.pth")
        torch.save(model.state_dict(), checkpoint_path)

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_path = os.path.join(save_dir, "baseline_best.pth")
            torch.save(model.state_dict(), best_path)
            print(f"Saved new best model checkpoint (Val Acc: {val_acc:.4f}) -> {best_path}")

import sys
import yaml
from pathlib import Path

# Add project root directory to Python path
sys.path.append(str(Path(__file__).resolve().parent.parent))

import torch
import torch.nn as nn
import torch.optim as optim
from models.resnet import get_baseline_model
from data.mock_loader import get_mock_dataloaders
from training.evaluate import evaluate_groups
from utils.logger import get_logger

logger = get_logger("TrainingModule")

def load_config():
    # Resolves config.yaml relative to project root
    config_path = Path(__file__).resolve().parent.parent / "config.yaml"
    with open(config_path, "r") as f:
        return yaml.safe_load(f)

def train_epoch(model, dataloader, criterion, optimizer, device):
    model.train()
    running_loss, correct, total = 0.0, 0, 0
    
    for batch in dataloader:
        if len(batch) == 3:
            images, labels, _ = batch
        else:
            images, labels = batch
            
        images, labels = images.to(device), labels.to(device)
        
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item() * images.size(0)
        _, preds = torch.max(outputs, 1)
        correct += torch.sum(preds == labels.data)
        total += labels.size(0)
        
    return running_loss / total, (correct.double() / total).item()

def run_pipeline():
    cfg = load_config()
    device = torch.device("cuda" if torch.cuda.is_available() else cfg["training"]["device"])
    logger.info(f"Execution initialized on target device: {device}")
    
    torch.manual_seed(cfg["project"]["seed"])
    
    train_loader, val_loader = get_mock_dataloaders(
        batch_size=cfg["data"]["batch_size"], 
        num_samples=cfg["data"]["num_samples"]
    )
    
    model = get_baseline_model(num_classes=cfg["data"]["num_classes"]).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=cfg["training"]["lr"])
    
    best_wga = 0.0
    
    for epoch in range(cfg["training"]["epochs"]):
        loss, acc = train_epoch(model, train_loader, criterion, optimizer, device)
        overall_acc, wga, group_accs = evaluate_groups(model, val_loader, device=device)
        
        logger.info(
            f"Epoch [{epoch+1}/{cfg['training']['epochs']}] - "
            f"Loss: {loss:.4f} | Train Acc: {acc:.4f} | "
            f"Val Overall Acc: {overall_acc:.4f} | Val WGA: {wga:.4f}"
        )
        
        # Save checkpoint based on Worst-Group Accuracy
        if wga >= best_wga:
            best_wga = wga
            checkpoint_dir = Path(cfg["model"]["weights_dir"])
            checkpoint_dir.mkdir(parents=True, exist_ok=True)
            checkpoint_path = checkpoint_dir / "baseline_resnet50.pth"
            
            torch.save({
                'epoch': epoch + 1,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'best_wga': best_wga,
                'group_accs': group_accs
            }, checkpoint_path)
            logger.info(f"--> Saved best model checkpoint to {checkpoint_path} (WGA: {best_wga:.4f})")

if __name__ == "__main__":
    run_pipeline()

