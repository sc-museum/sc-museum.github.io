# Room drawings

Concept drawings of the museum's rooms, in the style of the architect's renderings
(brick, dark timber beams, white walls with brick-red trim, wood floors,
green-marble cases), each with that room's own pictures hung on its walls. They
are drawn with three.js in headless Chrome; nothing to install but Chrome and Perl.

| File | What it is |
|---|---|
| `engine.js` | The scene kit: room shell, materials, lighting, picture frames, cases, visitors; renders a JPEG and works out where each picture lands in it. |
| `rooms.js`, `rooms2.js` | One design per room: its signage, which pictures hang where, and its centrepiece. |
| `run.sh` | `./run.sh hello-girls wired …` renders rooms to `out/<room>.jpg` and `out/<room>.json` (the picture hotspots). |
| `thumb.html` | Makes the 480-pixel thumbnails for the lobby gallery from `out/` into `thumbs/` (open with `--dump-dom`). |
| `integrate.pl` | From the repo root, `perl tools/renders/integrate.pl <out> <thumbs>` copies the drawings to `assets/renders/`, registers them in `data/images.json`, and writes the drawing, its hotspots, and the lobby's "Every room, drawn" gallery into the room files. Safe to run again. |

Then run `perl tools/build-index.pl` as for any other change. `out/` and `thumbs/` are working folders; do not commit them.

The Signal Story, Aviation Annex and Cyber Story use the architect's own renderings and are not drawn here.
