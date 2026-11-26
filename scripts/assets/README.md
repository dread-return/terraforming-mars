# Asset scripts

One-off scripts used to make images in `assets/`. Not part of the build. They need Python 3 with numpy, Pillow and
opencv-python-headless.

- `giga_policies_grabcut.py` + `giga_policies_final.py`: cut the Giga Turmoil policy icons out of the Epic rulebook's
  round tokens (`assets/parties/giga/agendas/*-p[1-4].png`) into `assets/parties/giga/policies/`.
  ```
  cd assets/parties/giga/agendas
  python3 ../../../../scripts/assets/giga_policies_grabcut.py . /tmp/cut 12 45
  python3 ../../../../scripts/assets/giga_policies_final.py . /tmp/cut ../policies
  ```
  then crop each output to its content (the committed files are cropped, with a 2 px margin).
