# P3: Explainable AI and Shortcut Detection — Waterbirds

## 1. Objective

Investigate whether the baseline ResNet50 model's classification performance is associated with background context, using Grad-CAM visualizations, subgroup accuracy analysis, and a background-blur perturbation experiment.

## 2. Experimental setup

- **Dataset:** Waterbirds
- **Model:** Baseline ResNet50
- **Checkpoint:** `models/baseline_resnet50.pth`
- **Test images processed:** 5,794
- **Processing errors:** 0
- **Intervention:** Preserve an approximate foreground region and blur the remaining image.
- **Classes:** Landbird (0), Waterbird (1)

## 3. Subgroup results

| Subgroup | Images | Original accuracy | Accuracy after blur |
|---|---:|---:|---:|
| Landbird on land | 2,255 | 99.42% | 99.25% |
| Landbird on water | 2,255 | 75.34% | 76.85% |
| Waterbird on land | 642 | 63.55% | 67.29% |
| Waterbird on water | 642 | 95.48% | 94.86% |

The weighted baseline accuracy was approximately **98.55%** for matched-background groups and **72.73%** for mismatched-background groups, a difference of **25.82 percentage points**.

## 4. Perturbation and shortcut score

- Prediction flip rate after blurring: **4.14%**
- Mean absolute change in true-class probability: **0.0430**
- Exploratory shortcut-dependence score: **14.98/100**

The score combines the matched-versus-mismatched accuracy gap and the prediction flip rate using a custom heuristic. It is not a validated scientific metric and should not be interpreted as a calibrated probability or definitive measure of shortcut learning.

Blurring slightly improved accuracy in both mismatched-background groups. Therefore, this intervention does not independently establish that background information caused the baseline's errors.

## 5. Interpretation

The baseline shows a substantial performance gap between matched and mismatched background groups. In particular, waterbirds on land have much lower accuracy than waterbirds on water. This is consistent with a possible background-related shortcut or a broader distribution shift between the subgroups.

The blur experiment changed 4.14% of predictions, with small overall average changes in true-class confidence. Its mixed subgroup effects indicate that blurring does not uniformly improve performance.

The foreground mask is approximate and may preserve background objects or blur parts of the bird. Consequently, the perturbation findings should be treated as exploratory evidence rather than causal proof.

## 6. P3 deliverables

- Grad-CAM visualizations and overlay.
- Full-test-set background-blur perturbation results.
- Four-subgroup performance comparison.
- Per-image results and subgroup summary CSV files.
- Exploratory shortcut-dependence score in JSON format.

## 7. Handoff to P4

P4 can use the subgroup accuracy gap as a motivation to evaluate corrective training. Compare the baseline and corrected models on the same test subgroups, especially landbirds on water and waterbirds on land. Report overall accuracy, per-group accuracy, and the matched-versus-mismatched accuracy gap.

**Conclusion:** The baseline exhibits a substantial matched-versus-mismatched background performance gap. This motivates further shortcut mitigation and evaluation, while the current blur intervention remains inconclusive about causal background dependence.
