from pathlib import Path

BAD = "motionless"
GOOD = "div"

root = Path(__file__).resolve().parents[1] / "src"
for path in root.rglob("*.tsx"):
    text = path.read_text(encoding="utf-8")
    if BAD in text:
        path.write_text(text.replace(BAD, GOOD), encoding="utf-8")
        print("fixed", path.relative_to(root.parent))
