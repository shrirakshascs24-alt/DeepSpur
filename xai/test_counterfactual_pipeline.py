import sys
from pathlib import Path
import torch
from torchvision import models, transforms
from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Device:", device)

# 1. Test Baseline Model Checkpoint
base_path = PROJECT_ROOT / "models" / "baseline_resnet50.pth"
corr_path = PROJECT_ROOT / "models" / "corrected_resnet50.pth"

def load_m(p):
    m = models.resnet50(weights=None)
    m.fc = torch.nn.Linear(m.fc.in_features, 2)
    ckpt = torch.load(p, map_location=device, weights_only=True)
    if isinstance(ckpt, dict) and "model_state_dict" in ckpt:
        sd = ckpt["model_state_dict"]
    elif isinstance(ckpt, dict) and "state_dict" in ckpt:
        sd = ckpt["state_dict"]
    else:
        sd = ckpt
    # Clean keys
    clean_sd = {}
    for k, v in sd.items():
        clean_k = k.replace("module.", "").replace("model.", "")
        clean_sd[clean_k] = v
    m.load_state_dict(clean_sd, strict=True)
    m.to(device).eval()
    return m

base_model = load_m(base_path)
print("Baseline model loaded successfully!")

corr_model = load_m(corr_path)
print("Corrected model loaded successfully!")

# Test evaluation on a sample image
sample_img = PROJECT_ROOT / "results" / "p3_perturbation" / "previews" / "landbird_on_land_2_original.png"
if sample_img.exists():
    im = Image.open(sample_img).convert("RGB").resize((224, 224))
    tf = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    inp = tf(im).unsqueeze(0).to(device)
    with torch.no_grad():
        b_out = torch.softmax(base_model(inp), dim=1)[0].cpu().numpy()
        c_out = torch.softmax(corr_model(inp), dim=1)[0].cpu().numpy()
    print("Baseline probs (0=Land, 1=Water):", b_out)
    print("Corrected probs (0=Land, 1=Water):", c_out)
