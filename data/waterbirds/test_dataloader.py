import torch
from torch.utils.data import DataLoader

from dataset import WaterbirdsDataset


print("Loading training dataset...")

dataset = WaterbirdsDataset(
    json_file="train.json"
)

loader = DataLoader(
    dataset,
    batch_size=16,
    shuffle=True,
    num_workers=0
)

print("Dataset size:", len(dataset))

images, labels, contexts = None, None, None

for batch in loader:
    images = batch["image"]
    labels = batch["label"]
    contexts = batch["context"]
    break

print("\nBatch information:")
print("Images:", images.shape)
print("Labels:", labels.shape)
print("Contexts:", contexts.shape)

print("\nDataLoader test successful!")