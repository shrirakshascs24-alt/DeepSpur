import os
import json
from PIL import Image

import torch
from torch.utils.data import Dataset
from torchvision import transforms


class WaterbirdsDataset(Dataset):
    def __init__(self, json_file, image_root=None, transform=None):
        """
        Waterbirds Dataset

        json_file:
            Path to train.json / valid.json / test.json

        image_root:
            Path to waterbird_complete95_forest2water2 folder

        transform:
            torchvision image transformations
        """

        # Location of this dataset.py file
        self.base_dir = os.path.dirname(os.path.abspath(__file__))

        # Default image directory
        if image_root is None:
            image_root = os.path.join(
                self.base_dir,
                "waterbird_complete95_forest2water2"
            )

        self.image_root = image_root

        # Convert relative JSON path to absolute path
        if not os.path.isabs(json_file):
            json_file = os.path.join(self.base_dir, json_file)

        self.json_file = json_file

        # Image transformations
        if transform is None:
            self.transform = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225]
                )
            ])
        else:
            self.transform = transform

        # Read JSON Lines file
        self.samples = []

        with open(self.json_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()

                if not line:
                    continue

                item = json.loads(line)

                self.samples.append({
                    "image": item["x"],
                    "label": int(item["y"]),
                    "context": int(item["c"])
                })

        print(f"Loaded {len(self.samples)} samples from {os.path.basename(self.json_file)}")

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, index):

        sample = self.samples[index]

        # Image path from JSON
        relative_image_path = sample["image"]

        # Construct actual image path
        image_path = os.path.join(
            self.image_root,
            relative_image_path
        )

        # Check whether image exists
        if not os.path.exists(image_path):
            raise FileNotFoundError(
                f"Image not found:\n{image_path}"
            )

        # Open image
        image = Image.open(image_path).convert("RGB")

        # Apply transformations
        if self.transform:
            image = self.transform(image)

        # Bird label
        label = torch.tensor(
            sample["label"],
            dtype=torch.long
        )

        # Background/context label
        context = torch.tensor(
            sample["context"],
            dtype=torch.long
        )

        return {
            "image": image,
            "label": label,
            "context": context,
            "path": relative_image_path
        }


# ---------------------------------------------------------
# Simple test
# ---------------------------------------------------------

if __name__ == "__main__":

    print("\nTesting WaterbirdsDataset...\n")

    dataset = WaterbirdsDataset(
        json_file="train.json"
    )

    print("Dataset size:", len(dataset))

    # Load first sample
    sample = dataset[0]

    print("\nFirst sample:")
    print("Image tensor shape:", sample["image"].shape)
    print("Label:", sample["label"].item())
    print("Context:", sample["context"].item())
    print("Image path:", sample["path"])

    print("\nDataset test successful!")