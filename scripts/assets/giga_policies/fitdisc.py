"""Fits each token's outer disc edge: Hough circle, then refined by least squares on the strongest edge along rays."""
import glob
import json
import os

import cv2
import numpy as np
A = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'assets', 'parties', 'giga', 'agendas')
res = {}
for f in sorted(glob.glob(f'{A}/*-p[1-4].png')):
    n = os.path.basename(f)[:-4]
    bgr = cv2.imread(f)
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32)
    S = 4
    big = cv2.resize(g, None, fx=S, fy=S, interpolation=cv2.INTER_CUBIC)
    c = cv2.HoughCircles(cv2.GaussianBlur(big, (0, 0), 2).astype(np.uint8), cv2.HOUGH_GRADIENT, dp=1, minDist=400,
                         param1=80, param2=20, minRadius=180, maxRadius=235)[0][0]
    x, y, R = c
    sm = cv2.GaussianBlur(big, (0, 0), 1.5)
    pts = []
    for ang in np.radians(np.arange(0, 360, 3)):
        # skip the number tab at the top (screen angles: 90 deg is up)
        deg = np.degrees(ang)
        if 55 < deg < 125:
            continue
        rs = np.arange(0.88 * R, 1.10 * R, 0.5)
        px = x + rs * np.cos(ang); py = y - rs * np.sin(ang)
        ok = (px >= 1) & (px < big.shape[1] - 2) & (py >= 1) & (py < big.shape[0] - 2)
        if ok.sum() < 10:
            continue
        v = cv2.remap(sm, px[ok].astype(np.float32).reshape(1, -1), py[ok].astype(np.float32).reshape(1, -1), cv2.INTER_LINEAR)[0]
        d = np.diff(v)  # going outward: dark disc -> pale background = rising brightness
        k = int(np.argmax(d))
        if d[k] < 6:
            continue
        rr = rs[ok][k]
        pts.append((x + rr * np.cos(ang), y - rr * np.sin(ang)))
    P = np.array(pts)
    for _ in range(3):
        A_ = np.c_[2 * P[:, 0], 2 * P[:, 1], np.ones(len(P))]
        b = (P ** 2).sum(1)
        cx, cy, k = np.linalg.lstsq(A_, b, rcond=None)[0]
        r = np.sqrt(k + cx ** 2 + cy ** 2)
        e = np.abs(np.hypot(P[:, 0] - cx, P[:, 1] - cy) - r)
        P = P[e < max(2.5 * np.median(e), 2)]
    res[n] = [float(cx / S), float(cy / S), float(r / S)]
json.dump(res, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'circles.json'), 'w'), indent=0)
print(len(res))
