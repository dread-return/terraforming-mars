"""Trims the empty edges of the Giga Turmoil policy icons (assets/parties/giga/policies), leaving a 2 px margin.

Run from the repository root after replacing the icons: python scripts/assets/trim_policies.py
Needs Pillow (pip install pillow).
"""
import glob
import os

from PIL import Image

FOLDER = os.path.join('assets', 'parties', 'giga', 'policies')
MARGIN = 2

for path in sorted(glob.glob(os.path.join(FOLDER, '*.png'))):
    im = Image.open(path).convert('RGBA')
    box = im.split()[3].point(lambda v: 255 if v > 24 else 0).getbbox()
    if box is None:
        print('empty, skipped:', path)
        continue
    x0, y0, x1, y1 = box
    trimmed = im.crop((max(0, x0 - MARGIN), max(0, y0 - MARGIN), min(im.width, x1 + MARGIN), min(im.height, y1 + MARGIN)))
    if trimmed.size != im.size:
        trimmed.save(path)
        print('trimmed', os.path.basename(path), im.size, '->', trimmed.size)
