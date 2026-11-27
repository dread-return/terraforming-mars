"""Cuts the Giga Turmoil policy icons out of their round tokens, in two steps.

1. Regions: a rough area around each icon. Found automatically (pixels that differ from the disc's colour at the
   same radius, grown a few pixels), then corrected per token in fixes.py (add / remove shapes). Everything outside
   the regions is bare disc, so the rim and the number tab can't leak in.
2. Inside the regions, the bare disc is rebuilt from its surroundings (inpainting), every pixel that differs from it
   is icon (strong differences seed, weaker connected ones grow), enclosed gaps that aren't disc-coloured are filled,
   and edge pixels get soft alpha by unmixing them into icon colour + disc colour (no disc-coloured halo).

usage: cut.py SRC_DIR OUT_DIR [REVIEW_DIR] [names or parties...]
"""
import glob
import json
import os
import sys

import cv2
import numpy as np
from scipy import ndimage
from scipy.spatial import cKDTree

from fixes import FIXES

HERE = os.path.dirname(os.path.abspath(__file__))
CIRCLES = json.load(open(os.path.join(HERE, 'circles.json')))
SRC, OUT = sys.argv[1], sys.argv[2]
REVIEW = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] != '-' else None
ONLY = set(sys.argv[4:])
os.makedirs(OUT, exist_ok=True)
if REVIEW:
    os.makedirs(REVIEW, exist_ok=True)

SEED = 30.0      # region step: a component must reach this difference somewhere
CAND = 14.0      # region step: candidate difference from the radial profile
GROWR = 3        # px the regions are grown by
CORE = 22.0      # cut step: surely icon
GROW = 10.0      # cut step: icon if connected to a core
EDGE = 2.0       # px of soft edge


def lab(rgb):
    return cv2.cvtColor((np.clip(rgb, 0, 255) / 255.0).astype(np.float32), cv2.COLOR_RGB2LAB)


def shape(kind, args, h, w):
    yy, xx = np.mgrid[0:h, 0:w]
    if kind == 'rect':
        x0, y0, x1, y1 = args
        return (xx >= x0) & (xx <= x1) & (yy >= y0) & (yy <= y1)
    if kind == 'circle':
        cx, cy, rr = args
        return np.hypot(xx - cx, yy - cy) <= rr
    if kind == 'poly':
        m = np.zeros((h, w), np.uint8)
        cv2.fillPoly(m, [np.round(np.array(args, np.float64).reshape(-1, 2)).astype(np.int32)], 1)
        return m.astype(bool)
    raise ValueError(kind)


def process(path):
    name = os.path.basename(path)[:-4]
    fix = FIXES.get(name, {})
    bgra = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    rgb = cv2.cvtColor(bgra, cv2.COLOR_BGRA2RGB).astype(np.float32)
    h, w = rgb.shape[:2]
    cx, cy, r = CIRCLES[name]
    yy, xx = np.mgrid[0:h, 0:w]
    dist = np.hypot(xx - cx, yy - cy)
    L = lab(rgb)

    # ---- 1. regions
    tab = (np.abs(xx - cx) < 0.40 * r) & (yy < cy - 0.66 * r)
    inside = (dist < fix.get('limit', 0.93) * r) & ~tab
    ring = (dist < r) & ~tab
    bins = np.round(dist * 2).astype(int)
    prof = np.zeros((bins.max() + 1, 3), np.float32)
    for b in np.unique(bins[ring]):
        prof[b] = np.median(L[ring & (bins == b)], axis=0)
    D0 = np.sqrt(((L - prof[bins]) ** 2).sum(axis=2))
    cand = (D0 > fix.get('cand', CAND)) & inside
    tabzone = (np.abs(xx - cx) < 0.48 * r) & (yy < cy - 0.52 * r)
    lab_c, n = ndimage.label(cand, structure=np.ones((3, 3)))
    seeds = np.zeros(h * w, bool)
    kept = np.zeros((h, w), bool)
    for k in range(1, n + 1):
        m = lab_c == k
        if D0[m].max() < SEED:
            continue
        # thin arcs along the rim: mostly near the edge
        outer = (dist[m] > 0.80 * r).mean()
        if outer > 0.6 and not fix.get('keep_outer'):
            continue
        # the lower part of the number tab
        if tabzone[m].mean() > 0.5 and not fix.get('keep_top'):
            continue
        kept |= m
    region = ndimage.binary_dilation(kept, iterations=GROWR)
    region = ndimage.binary_fill_holes(region)
    for kind, *args in fix.get('region_add', []):
        region |= shape(kind, args, h, w)
    for kind, *args in fix.get('region_remove', []):
        region &= ~shape(kind, args, h, w)
    region &= dist < 0.97 * r

    # ---- 2. cut inside the regions
    # the bare disc under the regions: for each pixel there, the median colour of the 40 nearest bare-disc pixels
    # (robust to the disc's dashed rings and the tab's shadow). The tab and the rim don't count as bare disc.
    known = ~ndimage.binary_dilation(region, iterations=1) & ~tabzone & (dist < fix.get('known_r', 0.90) * r) \
        & (D0 < CAND)
    ky, kx = np.nonzero(known)
    tree = cKDTree(np.c_[ky, kx])
    bare = rgb.copy()
    uy, ux = np.nonzero(region | ndimage.binary_dilation(region, iterations=3))
    _, nn = tree.query(np.c_[uy, ux], k=40)
    bare[uy, ux] = np.median(rgb[ky[nn], kx[nn]], axis=1)
    D = np.sqrt(((L - lab(bare)) ** 2).sum(axis=2))
    D[~region] = 0
    # the icons' soft drop shadows: same hue as the disc, a little darker. Not part of the icon.
    Lb = lab(bare)
    dL = Lb[..., 0] - L[..., 0]
    dab = np.sqrt(((L[..., 1:] - Lb[..., 1:]) ** 2).sum(axis=2))
    shadow = (dL > 0) & (dL < fix.get('shadow', 26)) & (dab < 7 + 0.35 * dL)
    D[shadow] = 0
    # a lighter glow of the disc's own colour around icons (SPOME). Off by default: on grey discs white icons
    # would match it.
    glow = fix.get('glow', 0)
    if glow:
        D[(dL < 0) & (dL > -glow) & (dab < fix.get('glow_ab', 9))] = 0
    if REVIEW:
        cv2.imwrite(os.path.join(REVIEW, name + '-D.png'), np.clip(D * 5, 0, 255).astype(np.uint8))
        cv2.imwrite(os.path.join(REVIEW, name + '-bare.png'), cv2.cvtColor(np.clip(bare, 0, 255).astype(np.uint8), cv2.COLOR_RGB2BGR))
    core = D > fix.get('core', CORE)
    grow = D > fix.get('grow', GROW)
    lab_g, _ = ndimage.label(grow, structure=np.ones((3, 3)))
    ids = np.unique(lab_g[core])
    keep = np.isin(lab_g, ids[ids > 0])
    # enclosed gaps: filled, unless small and bare-disc coloured (letter counters, the loops of an infinity sign).
    # Icons whose art matches the disc (an orange planet on an orange disc) are filled this way too.
    closed = ndimage.binary_closing(keep, structure=np.ones((3, 3)), iterations=fix.get('close', 1))
    filled = ndimage.binary_fill_holes(closed | keep)
    holes, nh = ndimage.label(filled & ~keep)
    for k in range(1, nh + 1):
        m = holes == k
        if m.sum() > fix.get('see_through_max', 30) or D[m].mean() >= fix.get('hole', 6.0):
            keep |= m
    # never the number tab, and nothing in the rim band unless the token's fixes allow it
    tabcut = (np.abs(xx - cx) < 0.45 * r) & (yy < cy - fix.get('tab_cut', 0.58) * r)
    keep &= ~tabcut & (dist < fix.get('max_r', 0.88) * r)
    comp, nc = ndimage.label(keep, structure=np.ones((3, 3)))
    for k in range(1, nc + 1):
        m = comp == k
        if (dist[m] > 0.76 * r).mean() > 0.55 or m.sum() < fix.get('min_size', 4):
            keep &= ~m
            continue
        # the underside of the number tab: a crescent just under it
        my, mx = np.nonzero(m)
        if my.mean() < cy - fix.get('tab_comp', 0.40) * r and abs(mx.mean() - cx) < 0.45 * r and not fix.get('keep_top'):
            keep &= ~m
    for kind, *args in fix.get('add', []):
        m = shape(kind, args, h, w) & (dist < 0.95 * r)
        keep |= m
        region |= ndimage.binary_dilation(m, iterations=2)
    for kind, *args in fix.get('add_dark', []):
        m = shape(kind, args, h, w) & (L[..., 0] < fix.get('dark_l', 22))
        keep |= m
        region |= ndimage.binary_dilation(m, iterations=2)
    for kind, *args in fix.get('remove', []):
        keep &= ~shape(kind, args, h, w)

    # the outermost kept pixels that are just the disc's colour (specks of a coloured disc clinging to the icons)
    chroma_b = np.sqrt((Lb[..., 1:] ** 2).sum(axis=2))
    for _ in range(fix.get('peel', 0)):
        rim = keep & ~ndimage.binary_erosion(keep, structure=np.ones((3, 3)))
        speck = rim & (chroma_b > 12) & (dab < 10) & (np.abs(dL) < 30)
        keep &= ~speck
    comp, nc = ndimage.label(keep, structure=np.ones((3, 3)))
    sizes = ndimage.sum(keep, comp, range(1, nc + 1))
    for k, sz in enumerate(sizes, 1):
        if sz < fix.get('min_size', 4):
            keep[comp == k] = False

    # soft edges. The icon's outermost pixels are a mix of its outline and the disc, and so are the pixels just
    # outside it: unmix each into "the icon colour next to it" (from the icon's interior) and the bare disc.
    inner = ndimage.binary_erosion(keep, structure=np.ones((3, 3)), iterations=2)
    if not inner.any():
        inner = keep
    dt_in, (iy, ix) = ndimage.distance_transform_edt(~inner, return_indices=True)
    F = rgb[iy, ix]
    CB = rgb - bare
    FB = F - bare
    denom = (FB ** 2).sum(axis=2)
    a = np.where(denom > 1, (CB * FB).sum(axis=2) / np.maximum(denom, 1), 1)
    a = np.clip(a, 0, 1)
    resid = np.sqrt(((rgb - (bare + a[..., None] * FB)) ** 2).sum(axis=2))
    band = (keep & ~inner) | (~keep & (ndimage.distance_transform_edt(~keep) <= EDGE))
    # pixels that aren't a mix of those two colours are their own icon colour (thin lines, highlights): solid
    solid = keep & ((resid > fix.get('resid', 40)) | (dt_in > 3) | (denom < 400))
    a[keep & (a > 0.5)] = np.maximum(a[keep & (a > 0.5)], 0.0)
    a[a < fix.get('min_alpha', 0.3)] = 0
    a[~band] = 0
    a[inner | solid] = 1
    a[~region] = 0
    for kind, *args in fix.get('remove', []):
        a[shape(kind, args, h, w)] = 0
    out_rgb = rgb.copy()
    mixed = (a > 0) & (a < 1)
    rec = bare + CB / np.maximum(a, 0.05)[..., None]
    rec = np.where((a > 0.6)[..., None], rec, F)
    out_rgb[mixed] = np.clip(rec[mixed], 0, 255)
    out = np.dstack([out_rgb, a * 255]).astype(np.uint8)
    cv2.imwrite(os.path.join(OUT, name + '.png'), cv2.cvtColor(out, cv2.COLOR_RGBA2BGRA))

    if REVIEW:
        # original at 4x with the region outlined
        S = 4
        big = cv2.resize(cv2.cvtColor(bgra, cv2.COLOR_BGRA2BGR), None, fx=S, fy=S, interpolation=cv2.INTER_NEAREST)
        cnts, _ = cv2.findContours(cv2.resize(region.astype(np.uint8), None, fx=S, fy=S, interpolation=cv2.INTER_NEAREST),
                                   cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        cv2.drawContours(big, cnts, -1, (255, 255, 0), 1)
        for v in range(0, 120, 10):
            col = (0, 0, 255) if v % 50 == 0 else (200, 200, 255)
            cv2.line(big, (v * S, 0), (v * S, 4), col, 1)
            cv2.line(big, (0, v * S), (4, v * S), col, 1)
            cv2.putText(big, str(v), (v * S + 1, 12), cv2.FONT_HERSHEY_PLAIN, 0.6, col, 1) if v % 20 == 0 else None
            cv2.putText(big, str(v), (6, v * S + 4), cv2.FONT_HERSHEY_PLAIN, 0.6, col, 1) if v % 20 == 0 and v else None
        cv2.imwrite(os.path.join(REVIEW, name + '-region.png'), big)


for p in sorted(glob.glob(os.path.join(SRC, '*-p[1-4].png'))):
    n = os.path.basename(p)[:-4]
    if ONLY and n not in ONLY and n.split('-')[0] not in ONLY:
        continue
    process(p)
