import json
import os

DATASET_DIR = "waterbird_complete95_forest2water2"

for split in ["train", "valid", "test"]:
    json_file = f"{split}.json"

    data = []

    with open(json_file, "r") as f:
        for line in f:
            line = line.strip()

            if line:
                data.append(json.loads(line))

    total = len(data)
    found = 0
    missing = 0

    for item in data:
        image_path = os.path.join(DATASET_DIR, item["x"])

        if os.path.exists(image_path):
            found += 1
        else:
            missing += 1

            if missing <= 5:
                print("Missing:", image_path)

    print(f"\n{split.upper()}")
    print("Total:", total)
    print("Found:", found)
    print("Missing:", missing)