# Removes the round token (rim, coloured disc, number tab) from Giga Turmoil policy icons with GrabCut:
# the rim, the tab and a ring just inside the rim are background, the middle is "probably foreground".
import sys, glob, os
import numpy as np
import cv2

src_dir, out_dir = sys.argv[1], sys.argv[2]
os.makedirs(out_dir, exist_ok=True)
TIGHT = float(sys.argv[3]) if len(sys.argv) > 3 else 12
LOOSE = float(sys.argv[4]) if len(sys.argv) > 4 else 70
# Tolerances tuned for tokens whose icons share colours with their disc.
OVERRIDES = {
    'unity-p1.png': (24, 45), 'unity-p3.png': (24, 45), 'unity-p4.png': (24, 45),
    'spome-p1.png': (22, 45), 'transhumanists-p1.png': (12, 22), 'greens-p3.png': (18, 45),
    'empower-p2.png': (18, 45), 'reds-p4.png': (18, 45),
}
DEFAULT = (TIGHT, LOOSE)
for path in sorted(glob.glob(os.path.join(src_dir, '*-p[1-4].png'))):
    TIGHT, LOOSE = OVERRIDES.get(os.path.basename(path), DEFAULT)
    rgba = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    scale = 3
    big = cv2.resize(rgba, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
    bgr = big[:, :, :3].copy()
    alpha = big[:, :, 3]
    h, w = alpha.shape
    # The token sits on a pale square: flood the pale corners to find the disc, then fit a circle to its left,
    # right and bottom edges (the number tab sticks out at the top).
    pale = ((bgr.min(axis=2) > 185) & ((bgr.max(axis=2).astype(int) - bgr.min(axis=2)) < 60)).astype(np.uint8)
    flood = pale.copy()
    ffmask = np.zeros((h + 2, w + 2), np.uint8)
    for seed in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        if pale[seed[1], seed[0]]:
            cv2.floodFill(flood, ffmask, seed, 2)
    disc = flood != 2
    ys, xs = np.nonzero(disc)
    r = (xs.max() - xs.min()) / 2
    cx = (xs.min() + xs.max()) / 2
    cy = ys.max() - r
    yy, xx = np.mgrid[0:h, 0:w]
    dist = np.hypot(xx - cx, yy - cy)
    mask = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
    mask[dist < r * 0.80] = cv2.GC_PR_FGD
    # Pixels very close to the disc's own colour at that radius are background; very different ones foreground.
    lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB).astype(np.float32)
    bands = np.clip((dist / r * 24).astype(int), 0, 30)
    inner = dist < r * 0.88
    for b in range(0, 20):
        m = (bands == b) & inner & (yy >= cy - r * 0.55)
        if m.sum() < 30:
            continue
        ref = np.median(lab[m], axis=0)
        d = np.sqrt(((lab - ref) ** 2).sum(axis=2))
        mask[m & (d < TIGHT)] = cv2.GC_BGD
        mask[m & (d > LOOSE)] = cv2.GC_FGD
    mask[dist > r * 0.80] = cv2.GC_BGD
    # the darker inner rim along the bottom
    mask[(dist > r * 0.74) & (yy > cy + r * 0.3)] = cv2.GC_BGD
    mask[yy < cy - r * 0.55] = cv2.GC_BGD
    bgd = np.zeros((1, 65), np.float64)
    fgd = np.zeros((1, 65), np.float64)
    cv2.grabCut(bgr, mask, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
    fg = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    # Drop specks, thin leftover arcs of the rim (wide, mostly empty bounding boxes) and bits of the number tab.
    n, lab, stats, _ = cv2.connectedComponentsWithStats(fg)
    for k in range(1, n):
        x0, y0, bw, bh, area = stats[k]
        fill = area / float(bw * bh)
        top = y0 + bh < cy - r * 0.42
        arc = fill < 0.28 and max(bw, bh) > 22 * scale
        if area < 60 * scale * scale / 4 or arc or top:
            fg[lab == k] = 0
    fg = cv2.GaussianBlur(fg, (0, 0), 1.2)
    out = big.copy()
    out[:, :, 3] = np.minimum(fg, alpha)
    out = cv2.resize(out, (rgba.shape[1], rgba.shape[0]), interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(out_dir, os.path.basename(path)), out)
