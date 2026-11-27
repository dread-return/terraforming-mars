# Per-token corrections, in the 120 px token's pixel coordinates (x right, y down).
SP = {'glow': 28, 'grow': 22, 'core': 30}
FIXES = {
    'spome-p1': SP, 'spome-p2': SP, 'spome-p3': SP, 'spome-p4': SP,
    # the number tab's underside
    'reds-p2': {'remove': [('rect', 36, 22, 74, 32)]},
    'unity-p2': {'remove': [('rect', 36, 22, 77, 32)]},
    'unity-p4': {'remove': [('rect', 38, 14, 75, 26)]},
    'greens-p4': {'remove': [('rect', 38, 14, 75, 26)]},
    'empower-p4': {'remove': [('rect', 38, 16, 75, 29)]},
    'bureaucrats-p4': {'remove': [('rect', 44, 22, 68, 37)], 'add_dark': [('circle', 50, 42.5, 2.5), ('circle', 50, 51, 2.5)]},
    # black colon dots on the dark grey disc
    'kelvinists-p1': {'add_dark': [('circle', 56.5, 55.5, 3), ('circle', 56.5, 68, 3)]},
}

for _k in range(1, 5):
    FIXES.setdefault(f'greens-p{_k}', {})['hole'] = 0  # the green icons' insides match the green disc


def _hex(cx, cy, r):
    import math
    pts = []
    for a in range(-90, 270, 60):
        pts += [cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a))]
    return ('poly', *pts)


FIXES['greens-p1']['add'] = [_hex(30.5, 61, 20), ('circle', 50, 50, 5.5)]
FIXES['greens-p2']['add'] = [('rect', 66, 48, 95, 77)]
FIXES['greens-p3']['add'] = [('circle', 50.5, 39, 9.8), ('circle', 50.5, 59, 9.5), ('circle', 50.5, 79.5, 9.5), ('rect', 74.5, 30, 93.5, 88.5)]
FIXES['greens-p4']['add'] = [('circle', 68, 61.5, 8.5), ('circle', 68.5, 83.5, 8.5)]

FIXES['populists-p1'] = {'add': [('circle', 31.5, 60.5, 19.5)]}
FIXES['mars_first-p3'] = {'add': [('circle', 50, 37, 8.5), ('circle', 44.5, 57, 9), ('circle', 32, 51, 7), ('rect', 17, 36, 44, 73)]}
FIXES['mars_first-p4'] = {'add': [('circle', 69, 58.5, 8.5), ('circle', 70, 84, 9), ('circle', 57, 77, 7), ('rect', 43, 61, 69, 96), ('rect', 63, 70, 77, 74)]}
FIXES['centrists-p1'] = {'add': [('rect', 31, 39, 89, 56), ('rect', 41, 58, 79, 76), ], 'add_dark': [('rect', 35, 70, 46, 77)], 'dark_l': 35}
FIXES['centrists-p2'] = {'add': [('rect', 45, 70, 76, 101)], 'add_dark': [('rect', 26, 79, 39, 92)]}
FIXES['empower-p2'] = {'add': [('rect', 32, 37, 79, 68), ('rect', 57, 77, 80, 101)], 'add_dark': [('rect', 32, 77, 53, 101), ('rect', 81, 47, 85, 60)]}
FIXES['empower-p4'].update({'add': [('circle', 68.5, 63.5, 7.8), ('circle', 69.5, 85, 8.3), ('rect', 43, 63, 70, 97)]})
FIXES['reds-p1'] = {'add': [('rect', 13, 46, 54, 74)]}
FIXES['scientists-p2'] = {'add_dark': [('rect', 96, 45, 102, 62)]}
