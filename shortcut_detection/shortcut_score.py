
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RESULTS = ROOT / "results" / "p3_perturbation"


def read_csv(filename):
    with open(RESULTS / filename, newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


groups = read_csv("subgroup_summary.csv")
rows = read_csv("per_image_results.csv")

matched_names = {"landbird_on_land", "waterbird_on_water"}
mismatched_names = {"landbird_on_water", "waterbird_on_land"}


def weighted_accuracy(names):
    selected = [g for g in groups if g["subgroup"] in names]
    total = sum(int(g["n"]) for g in selected)
    correct = sum(
        int(g["n"]) * float(g["original_accuracy"])
        for g in selected
    )
    return correct / total if total else 0.0


matched_acc = weighted_accuracy(matched_names)
mismatched_acc = weighted_accuracy(mismatched_names)
accuracy_gap = matched_acc - mismatched_acc

flip_rate = (
    sum(
        str(r["prediction_changed"]).strip().lower() in {"true", "1"}
        for r in rows
    ) / len(rows)
    if rows else 0.0
)

mean_abs_probability_change = (
    sum(abs(float(r["true_class_probability_change"])) for r in rows)
    / len(rows)
    if rows else 0.0
)

score = 100 * (
    0.5 * max(0.0, min(1.0, accuracy_gap))
    + 0.5 * flip_rate
)

result = {
    "images_processed": len(rows),
    "matched_background_accuracy": matched_acc,
    "mismatched_background_accuracy": mismatched_acc,
    "matched_minus_mismatched_accuracy_gap": accuracy_gap,
    "prediction_flip_rate_after_blur": flip_rate,
    "mean_absolute_true_class_probability_change":
        mean_abs_probability_change,
    "heuristic_shortcut_dependence_score_0_to_100": score,
    "note": (
        "Exploratory heuristic, not a validated metric. "
        "Blur-mask imperfections mean this does not prove causal "
        "background dependence."
    ),
}

output = RESULTS / "shortcut_score.json"
output.write_text(json.dumps(result, indent=2), encoding="utf-8")

print(json.dumps(result, indent=2))
print(f"\nSaved: {output}")
