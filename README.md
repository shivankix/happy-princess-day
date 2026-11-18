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
- **The soundtrack** — the full recordings of *Diamonds* (Rihanna), *Paparazzi*
  (Lady Gaga) and *Undress Rehearsal* (Timeflies), played straight into the page
  by a YouTube IFrame player with our own controls: play/pause, next/previous, a
  seek bar, a running clock and an equaliser. The player is a 200px album sleeve
  (these uploads are audio, so it is cover art, not a video), with a record
  spinning behind it. Songs roll into each other and the hero button starts track
  one. The video ids live in the `TRACKS` array in `Music.tsx`.
- **Crown Catch** — a 30-second canvas mini game: catch crowns (10), gems (25)
  and hearts (5), build a streak multiplier, keep your best score.
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

## Where things live

| File | What it is |
| --- | --- |
| `src/App.tsx` | Unlock gate, page shell, header, footer, section order |
| `src/princess/LockScreen.tsx` | The pink keypad and the unlock message |
| `src/princess/Backdrop.tsx` | Petal drift, confetti canvas and cursor trail (`confetti()` helper) |
| `src/princess/ui.tsx` | Theme bits: `Section`, `Crown`, `Heart`, `Bow`, `Flourish`, aura store, `useLocalStorage` |
| `src/princess/Hero.tsx` | Hero + the scrolling ticker |
| `src/princess/Letter.tsx` | Envelope, letter and the three small notes |
| `src/princess/Notes.tsx` | Note wall, composer and the floating dock button |
| `src/princess/notesStore.ts` | Shared note store: persistence, tab sync, add/remove |
| `src/princess/Gallery.tsx` | Photo album and lightbox (`import.meta.glob` over `src/photos`) |
| `src/princess/Music.tsx` | The three songs and the in-page YouTube player |
| `src/princess/Game.tsx` | Crown Catch |
| `src/princess/Quiz.tsx` | The quiz |
| `src/photos/` | Drop album pictures here — see the README inside |
| `src/styles.css` | Colours, fonts, keyframes and utilities |

Everything is client-side; the Worker (`src/worker/index.ts`) still fronts the
static assets for the Cloudflare build. Copy, songs and letter text are all
plain strings in the files above. Notes are shared across windows on one
device — syncing across devices would need a small server and a deployment.
