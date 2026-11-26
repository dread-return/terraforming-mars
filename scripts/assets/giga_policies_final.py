# Final pass for the flattened Giga Turmoil policy icons: takes the GrabCut cut-outs (flatten3.py), erases what's
# left of the number tab, and for the tokens whose icons share their disc's colour uses hand-measured shapes instead.
import sys, os, glob
import numpy as np
from PIL import Image, ImageDraw

src_dir, cut_dir, out_dir = sys.argv[1:4]
os.makedirs(out_dir, exist_ok=True)
S = 4  # draw shapes at 4x for smooth edges

# Shapes in the 120 px token's coordinates. rect/circle/hex keep everything inside; dark keeps only dark pixels
# (text and colon dots) inside the rectangle.
SHAPES = {
    'transhumanists-p1': [('circle', 61, 65, 20)],
    'unity-p1': [('rect', 19, 42, 52, 75), ('dark', 57, 48, 65, 69), ('rect', 72, 42, 105, 75)],
    'unity-p3': [('circle', 40, 54, 20), ('circle', 83, 54, 20)],
    'transhumanists-p2': [('rrect', 14, 37, 84, 67, 9), ('dark', 88, 43, 97, 63), ('rrect', 40, 71, 74, 105, 5)],
    'mars_first-p2': [('rect', 14, 41, 40, 69), ('dark', 43, 34, 71, 49), ('rect', 48, 36, 65, 46), ('dark', 71, 42, 101, 55), ('red', 70, 55, 102, 68), ('hex', 55, 87, 18.5)],
    'bureaucrats-p4': [('rect', 19, 29, 43, 64), ('rect', 69, 29, 94, 64), ('dark', 48, 39, 67, 53), ('rect', 44, 68, 69, 96)],
    'unity-p4': [('rect', 24, 28, 53, 50), ('red', 57, 33, 95, 50), ('rect', 44, 62, 70, 96), ('circle', 69.5, 61, 8), ('circle', 70, 81, 9), ('circle', 77, 57, 4.5)],
    'spome-p1': [('hex', 30.5, 53, 18), ('dark', 55, 48, 64, 71), ('rect', 68, 39, 99, 80)],
    'greens-p3': [('rect', 18, 37, 43, 88), ('circle', 51, 40, 10), ('circle', 51, 59, 10), ('circle', 51, 80, 10), ('dark', 62, 48, 70, 69), ('rect', 74, 30, 94, 89)],
    'reds-p4': [('hex', 24, 42.5, 15.5), ('circle', 58, 44, 15.5), ('rect', 80, 23, 90, 62), ('dark', 94, 34, 102, 52), ('rect', 34, 65, 76, 90)],
    'empower-p1': [('rect', 12, 50, 37, 75), ('dark', 38, 58, 47, 68), ('rect', 47, 49, 74, 76), ('dark', 76, 58, 85, 68), ('rect', 86, 50, 110, 75)],
    'empower-p2': [('rect', 31, 37, 81, 70), ('dark', 82, 46, 90, 63), ('dark', 33, 77, 52, 102), ('rect', 55, 76, 80, 101)],
}

def shape_mask(name, rgb):
    img = Image.new('L', (120 * S, 120 * S), 0)
    d = ImageDraw.Draw(img)
    dark = np.zeros((120, 120), bool)
    lum = rgb.mean(axis=2)
    for shape in SHAPES[name]:
        kind = shape[0]
        if kind == 'rect':
            _, x0, y0, x1, y1 = shape
            d.rectangle([x0 * S, y0 * S, x1 * S, y1 * S], fill=255)
        elif kind == 'rrect':
            _, x0, y0, x1, y1, rad = shape
            d.rounded_rectangle([x0 * S, y0 * S, x1 * S, y1 * S], radius=rad * S, fill=255)
        elif kind == 'circle':
            _, cx, cy, r = shape
            d.ellipse([(cx - r) * S, (cy - r) * S, (cx + r) * S, (cy + r) * S], fill=255)
        elif kind == 'hex':
            _, cx, cy, r = shape
            pts = [((cx + r * np.cos(np.radians(a))) * S, (cy + r * np.sin(np.radians(a))) * S) for a in range(-90, 270, 60)]
            d.polygon(pts, fill=255)
        elif kind == 'red':
            _, x0, y0, x1, y1 = shape
            box = np.zeros((120, 120), bool)
            box[int(y0):int(y1) + 1, int(x0):int(x1) + 1] = True
            r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
            dark |= box & (r > 170) & (g < 120) & (r - b > 70)
        elif kind == 'dark':
            _, x0, y0, x1, y1 = shape
            box = np.zeros((120, 120), bool)
            box[int(y0):int(y1) + 1, int(x0):int(x1) + 1] = True
            dark |= box & (lum < 70)
    m = np.array(img.resize((120, 120), Image.LANCZOS)).astype(float)
    m = np.maximum(m, dark * 255.0)
    return m

for path in sorted(glob.glob(os.path.join(src_dir, '*-p[1-4].png'))):
    name = os.path.basename(path)[:-4]
    orig = np.array(Image.open(path).convert('RGBA')).astype(float)
    if name in SHAPES:
        alpha = shape_mask(name, orig[:, :, :3])
    else:
        cut = np.array(Image.open(os.path.join(cut_dir, name + '.png')).convert('RGBA')).astype(float)
        alpha = cut[:, :, 3]
        alpha[:33, 38:83] = 0  # the number tab
        alpha[:29, 33:88] = 0
    out = orig.copy()
    out[:, :, 3] = np.minimum(alpha, orig[:, :, 3])
    Image.fromarray(out.astype('uint8')).save(os.path.join(out_dir, name + '.png'))
