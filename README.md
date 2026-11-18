# Happy Princess Day

One page, built for Princess Day (18 November). White linen, rose petals and
handwriting, behind a pink four-digit lock:

- **The lock screen** — a note for her, a pink keypad and four boxes. The code is
  `2267` (hint: the phone password). Everything else only appears once it is in.
- **Hero** — a crown you can tap for confetti, a live date/time pill, staggered
  type and drifting ornaments.
- **A letter** — a wax seal to break; the letter unfolds, plus three small
  "open when…" notes.
- **The note wall** — a shared, live pin board. Notes are saved in
  `localStorage` and pushed to every other open window through a
  `BroadcastChannel`; the floating pink button opens the composer from anywhere
  on the page. It starts empty, on purpose.
- **The album** — every image dropped into `src/photos/` appears automatically
  (polaroid frames, filename captions, lightbox with arrow-key navigation).
- **The soundtrack** — full recordings of *Diamonds*, *Paparazzi*, and *Undress
  Rehearsal*, played through a YouTube IFrame player with custom controls.
- **Crown Catch** — a 30-second canvas mini game: catch crowns, gems and hearts.
- **Which princess era are you in?** — a four-question quiz with four results.
- **Aura points** — a running counter in the header that goes up as you
  interact. Silly on purpose.

## Run it

```sh
bun install
bun run dev        # http://localhost:5305
bun run build      # dist/client + the Worker
bun run typecheck
```

Everything is client-side; the Worker (`src/worker/index.ts`) fronts the static
assets for the Cloudflare build. Notes sync across windows on one device.
