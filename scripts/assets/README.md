# Asset scripts

One-off scripts used to make images in `assets/`. Not part of the build. They need Python 3 with numpy, scipy,
Pillow and opencv-python-headless.

## Giga Turmoil policy icons (`giga_policies/`)

Cuts the 48 policy icons out of the Epic rulebook's round tokens (`assets/parties/giga/agendas/*-p[1-4].png`) into
`assets/parties/giga/policies/`.

```
cd scripts/assets/giga_policies
python3 fitdisc.py            # finds each token's disc (writes circles.json; already committed)
python3 cut.py ../../../assets/parties/giga/agendas /tmp/policies /tmp/review
cp /tmp/policies/*.png ../../../assets/parties/giga/policies/
cd ../../.. && python3 scripts/assets/trim_policies.py
```

`cut.py` finds a rough area around each icon, rebuilds the bare disc under it from the nearest bare-disc pixels,
keeps whatever differs from it, fills icons whose art matches the disc colour, and unmixes the edge pixels so no
disc-coloured fringe is left. `fixes.py` holds per-token corrections (shapes to add or remove, in the 120 px token's
coordinates) for icons the automatic pass can't separate from their disc. `/tmp/review` gets each token with its
area outlined, for checking.

`trim_policies.py` trims empty edges from the icons to a 2 px margin (run it after replacing them).
