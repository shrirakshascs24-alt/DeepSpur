import os
import sys
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision.models import resnet50

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


# -----------------------------
# Device
# -----------------------------

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print("Using device:", device)


# -----------------------------
# Load test dataset
# -----------------------------

test_dataset = WaterbirdsDataset(
    json_file="test.json"
)

test_loader = DataLoader(
    test_dataset,
    batch_size=32,
    shuffle=False,
    num_workers=0
)

print("Test samples:", len(test_dataset))


# -----------------------------
# Create ResNet-50
# -----------------------------

model = resnet50(weights=None)

model.fc = nn.Linear(
    model.fc.in_features,
    2
)


# -----------------------------
# Load trained baseline
# -----------------------------

model_path = os.path.join(
    os.path.dirname(__file__),
    "..",
    "models",
    "baseline_resnet50.pth"
)

model.load_state_dict(
    torch.load(
        model_path,
        map_location=device
    )
)

model = model.to(device)
model.eval()

print("Baseline model loaded successfully.")


# -----------------------------
# Evaluate
# -----------------------------

correct = 0
total = 0

group_correct = {}
group_total = {}

with torch.no_grad():

    for batch in test_loader:

        images = batch["image"].to(device)
        labels = batch["label"].to(device)
        contexts = batch["context"].to(device)

        outputs = model(images)

        predictions = outputs.argmax(dim=1)

        correct += (
            predictions == labels
        ).sum().item()

        total += labels.size(0)

        # Group = label + context
        for label, context, prediction in zip(
            labels,
            contexts,
            predictions
        ):

            group = (
                int(label.item()),
                int(context.item())
            )

            if group not in group_total:
                group_total[group] = 0
                group_correct[group] = 0

            group_total[group] += 1

            if prediction.item() == label.item():
                group_correct[group] += 1


# -----------------------------
# Results
# -----------------------------

overall_accuracy = 100 * correct / total

print("\n========== BASELINE RESULTS ==========")

print(
    f"Overall Accuracy: {overall_accuracy:.2f}%"
)

group_accuracies = []

for group in sorted(group_total.keys()):

    accuracy = (
        100
        * group_correct[group]
        / group_total[group]
    )

    group_accuracies.append(accuracy)

    print(
        f"Group {group} Accuracy: {accuracy:.2f}% "
        f"({group_correct[group]}/{group_total[group]})"
    )

worst_group_accuracy = min(group_accuracies)

print(
    f"\nWorst Group Accuracy: "
    f"{worst_group_accuracy:.2f}%"
)

print("======================================")