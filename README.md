# Cépage — WSET Level 3 study tools

A small study toolkit for the WSET Level 3 Award in Wines: an aroma drill
and a grape characteristics chart, sharing one visual identity.

**Live demo:** add your GitHub Pages URL here once deployed.

## Pages

**Drill** (`index.html`) — drills the single skill the tasting exam rewards
most and intuition alone doesn't reliably cover: matching an isolated
aroma/structure descriptor to the grape variety it most strongly signals,
under the same kind of time pressure as the real Systematic Approach to
Tasting. After each answer, the diagnostic trigger word is highlighted
directly in the tasting note, with a short explanation of why it points to
that grape.

**Chart** (`chart.html`) — a bubble chart plotting grape varieties by body
(x-axis) and acidity (y-axis), with bubble size showing sweetness and color
showing fruit family. Toggle between white and red grapes; for reds, border
thickness adds tannin as a fourth variable. Built for a wide-overview,
visual study pass rather than the question-by-question drill.

## Why this exists

Experienced tasters often know wine holistically — by region, producer,
vintage — but the exam tests the opposite direction: an isolated keyword
("flinty," "white pepper," "tar and dried rose petal") mapped cold to one
most-likely grape, with no bottle or context to anchor the guess. The drill
isolates and trains exactly that pattern-matching skill; the chart gives
the same information a wide, comparative overview.

## Stack

No build step, no framework, no backend. Plain HTML/CSS/JS, served as
static files. Fonts (Source Serif 4, Inter), Tabler Icons, and Chart.js
load from CDN.

- `index.html` / `chart.html` — page shells
- `styles.css` — shared design system (tasting-note visual identity)
- `data.js` — aroma drill question bank (grape, descriptor, region,
  trigger words, explanation, distractor options)
- `app.js` — drill state machine (intro → quiz → results), no dependencies
- `grapes-data.js` — chart dataset (body, acidity, sweetness, tannin,
  fruit family per grape)
- `chart.js` — chart rendering logic (Chart.js bubble chart)

## Running locally

Just open `index.html` in a browser, or serve the folder with any static
server, e.g.:

```
python3 -m http.server 8000
```

## Deploying to GitHub Pages

1. Create a new GitHub repository and push this folder's contents to the
   `main` branch.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to "Deploy from a
   branch", branch `main`, folder `/ (root)`.
4. Save. GitHub gives you a permanent URL at
   `https://<your-username>.github.io/<repo-name>/` within a minute or two.

That URL never expires and costs nothing — share it with anyone, and it
doubles as a portfolio piece with real commit history behind it.

## Extending the question bank

Each entry in `data.js` follows this shape:

```js
{
  desc: "Tar, dried rose petal, high tannin and high acidity, pale garnet colour despite the structure.",
  answer: "Nebbiolo",
  region: "Piedmont — Barolo, Barbaresco",
  options: ["Nebbiolo", "Sangiovese", "Malbec", "Syrah / Shiraz"],
  triggers: ["Tar", "dried rose petal"],
  why: "Tar and dried rose petal together are close to a unique fingerprint for Nebbiolo..."
}
```

`options` must always include `answer` exactly once, plus three plausible
distractors. Each string in `triggers` must appear verbatim (exact
substring match) in `desc`, or highlighting silently won't apply to it.

## Extending the chart

Each entry in `grapes-data.js` (in `WHITES` or `REDS`) follows this shape:

```js
{ grape: "Nebbiolo", body: 0.2, acidity: 1.6, sweetness: 0, tannin: 1.8, fruitFamily: "red_fruit" }
```

`body` and `acidity` run roughly -2 (light/low) to +2 (full/high), centered
on 0 as medium. `sweetness` runs 0 (bone dry) to 5 (lusciously sweet) and
drives bubble size. `tannin` (reds only) runs 0–2 and drives border
thickness. `fruitFamily` must match a key in `FRUIT_FAMILY_LABELS` and
`FRUIT_FAMILY_COLORS` at the top of the file.

Calibration note: positions are drawn from WSET's standard descriptive
bands (light / medium- / medium / medium+ / pronounced), not a single
authoritative numeric source — there isn't one. Relative position between
grapes is more reliable than exact coordinates.

## Disclaimer

Not affiliated with or endorsed by WSET. Built independently as a study
aid by a WSET Level 3 candidate.

