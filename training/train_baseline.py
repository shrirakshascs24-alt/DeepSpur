import os
import sys

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision.models import resnet50, ResNet50_Weights

# Allow importing dataset.py
sys.path.append(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "data",
        "waterbirds"
    )
)

from dataset import WaterbirdsDataset


# ---------------------------------------------------------
# Device
# ---------------------------------------------------------

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print("Using device:", device)


# ---------------------------------------------------------
# Datasets
# ---------------------------------------------------------

train_dataset = WaterbirdsDataset(
    json_file="train.json"
)

valid_dataset = WaterbirdsDataset(
    json_file="valid.json"
)


# ---------------------------------------------------------
# DataLoaders
# ---------------------------------------------------------

train_loader = DataLoader(
    train_dataset,
    batch_size=32,
    shuffle=True,
    num_workers=0
)

valid_loader = DataLoader(
    valid_dataset,
    batch_size=32,
    shuffle=False,
    num_workers=0
)


print("Training samples:", len(train_dataset))
print("Validation samples:", len(valid_dataset))


# ---------------------------------------------------------
# ResNet-50
# ---------------------------------------------------------

print("\nCreating ResNet-50...")

model = resnet50(
    weights=ResNet50_Weights.DEFAULT
)

# Replace final layer for binary classification
model.fc = nn.Linear(
    model.fc.in_features,
    2
)

model = model.to(device)


# ---------------------------------------------------------
# Loss and optimizer
# ---------------------------------------------------------

criterion = nn.CrossEntropyLoss()

optimizer = torch.optim.Adam(
    model.parameters(),
    lr=0.0001
)


# ---------------------------------------------------------
# Training
# ---------------------------------------------------------

epochs = 5

for epoch in range(epochs):

    model.train()

    running_loss = 0.0
    correct = 0
    total = 0

    for batch in train_loader:

        images = batch["image"].to(device)
        labels = batch["label"].to(device)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(outputs, labels)

        loss.backward()

        optimizer.step()

        running_loss += loss.item()

        predictions = outputs.argmax(dim=1)

        correct += (
            predictions == labels
        ).sum().item()

        total += labels.size(0)

    train_accuracy = 100 * correct / total

    # -----------------------------------------------------
    # Validation
    # -----------------------------------------------------

    model.eval()

    val_correct = 0
    val_total = 0

    with torch.no_grad():

        for batch in valid_loader:

            images = batch["image"].to(device)
            labels = batch["label"].to(device)

            outputs = model(images)

            predictions = outputs.argmax(dim=1)

            val_correct += (
                predictions == labels
            ).sum().item()

            val_total += labels.size(0)

    val_accuracy = 100 * val_correct / val_total

    print(
        f"Epoch [{epoch + 1}/{epochs}] "
        f"Loss: {running_loss / len(train_loader):.4f} "
        f"Train Acc: {train_accuracy:.2f}% "
        f"Val Acc: {val_accuracy:.2f}%"
    )


# ---------------------------------------------------------
# Save model
# ---------------------------------------------------------

os.makedirs("../models", exist_ok=True)

model_path = "../models/baseline_resnet50.pth"

torch.save(
    model.state_dict(),
    model_path
)

print("\nBaseline model saved!")
print("Location:", model_path)