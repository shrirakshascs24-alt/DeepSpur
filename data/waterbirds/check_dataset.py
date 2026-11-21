import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATASET_DIR = PROJECT_ROOT / "data" / "waterbird_complete95_forest2water2"
JSON_DIR = PROJECT_ROOT / "data" / "waterbirds"

for split in ["train", "valid", "test"]:
    json_file = JSON_DIR / f"{split}.json"

    with open(json_file, "r", encoding="utf-8") as f:
        data = [json.loads(line) for line in f if line.strip()]

    found = 0
    missing = 0

    for item in data:
        image_path = DATASET_DIR / item["x"]

        if image_path.exists():
            found += 1
        else:
            missing += 1
            if missing <= 5:
                print("Missing:", image_path)

    print(f"\n{split.upper()}")
    print("Total:", len(data))
    print("Found:", found)
    print("Missing:", missing)
