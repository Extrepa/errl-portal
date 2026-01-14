from pathlib import Path
import xml.etree.ElementTree as ET
import json

# --- config -----------------------------------------------------------------

BASE_SVG = Path("assets/NewSVGS/errl-body-face-eyes-mouth-with-limbs.svg")

POSE_PACK_NAME = "waving"  # e.g. "waving", "running", "pointing"
OUT_DIR = Path(f"assets/NewSVGS/poses-{POSE_PACK_NAME}")
OUT_DIR.mkdir(parents=True, exist_ok=True)

NS = {"svg": "http://www.w3.org/2000/svg"}
ET.register_namespace("", NS["svg"])

# rotation in degrees, tx/ty in SVG units (same coordinate system as viewBox)
WAVING_POSES = [
    {
        "id": "errl_pose_wave_front_01",
        "body":  {"rotate": -6,   "tx": 0,  "ty": -4},
        "arms": {
            "right": {"rotate": -65, "tx": 0,  "ty": 0},
            "left":  {"rotate":  20, "tx": 0,  "ty": 0},
        },
        "legs": {
            "right": {"tx": -3, "ty": 0},
            "left":  {"tx":  0, "ty": 0},
        },
    },
    {
        "id": "errl_pose_wave_front_02",
        "body":  {"rotate": -10,  "tx": 0,  "ty": -4},
        "arms": {
            "right": {"rotate": -85, "tx": 0,  "ty": 0},
            "left":  {"rotate":  35, "tx": 0,  "ty": 0},
        },
        "legs": {
            "right": {"tx": -4, "ty": -2},
            "left":  {"tx":  2, "ty":  1},
        },
    },
    {
        "id": "errl_pose_wave_two_hands_01",
        "body":  {"rotate": 0,    "tx": 0,  "ty": 0},
        "arms": {
            "right": {"rotate": -70, "tx": 0,  "ty": 0},
            "left":  {"rotate":  70, "tx": 0,  "ty": 0},
        },
        "legs": {
            "right": {"tx": 0, "ty": 0},
            "left":  {"tx": 0, "ty": 0},
        },
    },
    {
        "id": "errl_pose_wave_shy_01",
        "body":  {"rotate": 6,    "tx": 0,  "ty": 0},
        "arms": {
            "right": {"rotate": -40, "tx": 0,  "ty": 3},
            "left":  {"rotate":   5, "tx": 0,  "ty": 0},
        },
        "legs": {
            "right": {"tx": -1, "ty": 0},
            "left":  {"tx":  0, "ty": 1},
        },
    },
    {
        "id": "errl_pose_wave_side_left_01",
        "body":  {"rotate": -15, "tx": 0,  "ty": 0},
        "arms": {
            "right": {"rotate": -55, "tx": -2, "ty": 0},
            "left":  {"rotate":  15, "tx":  2, "ty": 0},
        },
        "legs": {
            "right": {"tx": -2, "ty": 0},
            "left":  {"tx":  1, "ty": 0},
        },
    },
    {
        "id": "errl_pose_wave_side_right_01",
        "body":  {"rotate": 15, "tx": 0,  "ty": 0},
        "arms": {
            "right": {"rotate": -15, "tx": -2, "ty": 0},
            "left":  {"rotate":  55, "tx":  2, "ty": 0},
        },
        "legs": {
            "right": {"tx": -1, "ty": 0},
            "left":  {"tx":  2, "ty": 0},
        },
    },
    {
        "id": "errl_pose_wave_walk_01",
        "body":  {"rotate": -5,  "tx": 0,  "ty": 0},
        "arms": {
            "right": {"rotate": -55, "tx": 0,  "ty": 0},
            "left":  {"rotate":  30, "tx": 0,  "ty": 0},
        },
        "legs": {
            "right": {"tx": -4, "ty": -3},
            "left":  {"tx":  2, "ty":  2},
        },
    },
    {
        "id": "errl_pose_wave_sit_01",
        "body":  {"rotate": 0,   "tx": 0,  "ty": 8},
        "arms": {
            "right": {"rotate": -50, "tx": 0,  "ty": 0},
            "left":  {"rotate":  10, "tx": 0,  "ty": 0},
        },
        "legs": {
            "right": {"tx": 0, "ty": 0},
            "left":  {"tx": 0, "ty": 0},
        },
    },
    {
        "id": "errl_pose_wave_overhead_01",
        "body":  {"rotate": -8,  "tx": 0,  "ty": 0},
        "arms": {
            "right": {"rotate": -110, "tx": 0, "ty": 0},
            "left":  {"rotate":   50, "tx": 0, "ty": 0},
        },
        "legs": {
            "right": {"tx": -2, "ty": 0},
            "left":  {"tx":  2, "ty": 0},
        },
    },
    {
        "id": "errl_pose_wave_tiny_01",
        "body":  {"rotate": -6,  "tx": 0,  "ty": -4},
        "arms": {
            "right": {"rotate": -65, "tx": 0,  "ty": 0},
            "left":  {"rotate":  20, "tx": 0,  "ty": 0},
        },
        "legs": {
            "right": {"tx": -3, "ty": 0},
            "left":  {"tx":  0, "ty": 0},
        },
        "scale": 0.6,
        "scale_center": (256, 256),
    },
]

# --- helpers --------------------------------------------------------------

def get_group(root, id_):
    for g in root.findall(".//svg:g", NS):
        if g.get("id") == id_:
            return g
    raise RuntimeError(f"Group with id='{id_}' not found")

def parse_pivot(el):
    pv = el.get("data-pivot")
    if not pv:
        raise RuntimeError(f"Element {el.get('id')} missing data-pivot")
    x_str, y_str = pv.split(",")
    return float(x_str), float(y_str)

def append_transform(el, extra):
    existing = el.get("transform")
    if existing:
        el.set("transform", f"{existing} {extra}")
    else:
        el.set("transform", extra)

def build_pose(pose):
    tree = ET.parse(BASE_SVG)
    root = tree.getroot()

    # metadata for Scene Builder
    root.set("data-pack", "errl_crew")
    root.set("data-cat", "char")
    root.set("data-pose", POSE_PACK_NAME)
    root.set("data-name", pose["id"])

    body   = get_group(root, "body")
    arm_r  = get_group(root, "arm_right")
    arm_l  = get_group(root, "arm_left")
    leg_r  = get_group(root, "leg_right")
    leg_l  = get_group(root, "leg_left")

    # BODY
    body_cfg = pose.get("body", {})
    if body_cfg:
        cx, cy = parse_pivot(body)
        rot = body_cfg.get("rotate", 0)
        tx = body_cfg.get("tx", 0)
        ty = body_cfg.get("ty", 0)
        if rot:
            append_transform(body, f"rotate({rot} {cx} {cy})")
        if tx or ty:
            append_transform(body, f"translate({tx} {ty})")

    # ARMS
    arms_cfg = pose.get("arms", {})
    if arms_cfg:
        rcfg = arms_cfg.get("right", {})
        if rcfg:
            cx, cy = parse_pivot(arm_r)
            rot = rcfg.get("rotate", 0)
            tx = rcfg.get("tx", 0)
            ty = rcfg.get("ty", 0)
            if rot:
                append_transform(arm_r, f"rotate({rot} {cx} {cy})")
            if tx or ty:
                append_transform(arm_r, f"translate({tx} {ty})")

        lcfg = arms_cfg.get("left", {})
        if lcfg:
            cx, cy = parse_pivot(arm_l)
            rot = lcfg.get("rotate", 0)
            tx = lcfg.get("tx", 0)
            ty = lcfg.get("ty", 0)
            if rot:
                append_transform(arm_l, f"rotate({rot} {cx} {cy})")
            if tx or ty:
                append_transform(arm_l, f"translate({tx} {ty})")

    # LEGS (translate-only)
    legs_cfg = pose.get("legs", {})
    if legs_cfg:
        rcfg = legs_cfg.get("right", {})
        lcfg = legs_cfg.get("left", {})
        if rcfg:
            tx = rcfg.get("tx", 0)
            ty = rcfg.get("ty", 0)
            if tx or ty:
                append_transform(leg_r, f"translate({tx} {ty})")
        if lcfg:
            tx = lcfg.get("tx", 0)
            ty = lcfg.get("ty", 0)
            if tx or ty:
                append_transform(leg_l, f"translate({tx} {ty})")

    # OPTIONAL: global scaling
    if "scale" in pose:
        scale = pose["scale"]
        sx, sy = pose.get("scale_center", (256, 256))
        wrapper = ET.Element("{http://www.w3.org/2000/svg}g")
        wrapper.set("transform", f"translate({sx} {sy}) scale({scale}) translate({-sx} {-sy})")

        children = list(root)
        for child in children:
            # keep <defs> at top
            if child.tag.endswith("defs"):
                continue
            root.remove(child)
            wrapper.append(child)
        root.append(wrapper)

    out_path = OUT_DIR / f"{pose['id']}.svg"
    tree.write(out_path, encoding="utf-8", xml_declaration=True)
    return out_path

def write_manifest(pose_paths):
    manifest = []
    for pose_id, path in pose_paths:
        manifest.append({
            "id": pose_id,
            "file": path.name,
            "pack": "errl_crew",
            "category": "char",
            "pose_set": POSE_PACK_NAME,
        })

    manifest_path = OUT_DIR / "manifest.json"
    with manifest_path.open("w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print("wrote manifest", manifest_path)

def main():
    pose_paths = []
    for pose in WAVING_POSES:
        out_path = build_pose(pose)
        print("wrote", out_path)
        pose_paths.append((pose["id"], out_path))
    write_manifest(pose_paths)

if __name__ == "__main__":
    main()