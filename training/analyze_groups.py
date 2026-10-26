import json, os

def analyze():
    json_path = "results/baseline_results.json"
    if not os.path.exists(json_path):
        print("results/baseline_results.json not found.")
        return

    with open(json_path, "r") as f:
        data = json.load(f)

    group_names = {
        (0, 0): "Group 0 (Landbird on Land)",
        (0, 1): "Group 1 (Landbird on Water)",
        (1, 0): "Group 2 (Waterbird on Land)",
        (1, 1): "Group 3 (Waterbird on Water)"
    }

    stats = {k: {"correct": 0, "total": 0} for k in group_names}

    for item in data.get("predictions", []):
        key = (item["true_label"], item["context"])
        if key in stats:
            stats[key]["total"] += 1
            if item["prediction"] == item["true_label"]:
                stats[key]["correct"] += 1

    print("=" * 55)
    print("WATERBIRDS SUBGROUP ACCURACY BREAKDOWN")
    print("=" * 55)

    accs = {}
    for key, name in group_names.items():
        c, t = stats[key]["correct"], stats[key]["total"]
        acc = (c / t * 100) if t > 0 else 0
        accs[name] = acc
        print(f"{name:<30} | {acc:>6.2f}% ({c}/{t})")

    print("-" * 55)
    print(f"Overall Accuracy            | {data.get('overall_accuracy', 0):>6.2f}%")
    print(f"Worst-Group Accuracy        | {min(accs.values()):>6.2f}%")
    print("=" * 55)

if __name__ == "__main__":
    analyze()