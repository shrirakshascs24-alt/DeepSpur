import torch
from torch.utils.data import DataLoader, TensorDataset

def get_mock_dataloaders(batch_size=16, num_samples=128):
    """
    Generates dummy dataloaders mimicking Person 1's dataset structure
    (image, label, group_id) for immediate pipeline verification.
    """
    # Fake RGB images of shape (3, 224, 224)
    images = torch.randn(num_samples, 3, 224, 224)
    # Binary labels (0 or 1)
    labels = torch.randint(0, 2, (num_samples,))
    # 4 distinct groups (0, 1, 2, 3) to test Worst-Group Accuracy
    group_ids = torch.randint(0, 4, (num_samples,))
    
    dataset = TensorDataset(images, labels, group_ids)
    
    train_loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(dataset, batch_size=batch_size, shuffle=False)
    
    return train_loader, val_loader

if __name__ == "__main__":
    train_loader, val_loader = get_mock_dataloaders()
    imgs, lbls, g_ids = next(iter(train_loader))
    print(f"Mock Data Ready -> Images: {imgs.shape}, Labels: {lbls.shape}, Groups: {g_ids.shape}")