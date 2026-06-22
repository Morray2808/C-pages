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

**Theory** (`theory.html`) — a mixed multiple-choice quiz across the whole
WSET Level 3 Unit 1 syllabus: viticulture, winemaking, the world's wine
regions, sparkling, fortified, and wine-and-the-consumer. Weighted like the
real exam (regions heaviest). Two lengths: a 20-question short set or a
50-question "exam length" run mirroring Unit 1's multiple-choice count.
Every answer explains itself, and the results screen tallies which
categories cost you points so you can see your weak spots at a glance.

**Chart** (`chart.html`) — a bubble chart plotting grape varieties by body
(x-axis) and acidity (y-axis), with bubble size showing sweetness and color
showing fruit family. Toggle between white and red grapes; for reds, border
thickness adds tannin as a fourth variable. Built for a wide-overview,
visual study pass rather than the question-by-question drill.

**Leaderboard** (`leaderboard.html`) — best score per taster over the last
24 hours, highest percentage first. Optional: the drill works fully without
it. Requires a free Supabase project (see setup below). Scores roll off
after 24 hours so the board resets daily.

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

- `index.html` / `theory.html` / `chart.html` / `leaderboard.html` — page shells
- `styles.css` — shared design system (tasting-note visual identity)
- `data.js` — aroma drill question bank (grape, descriptor, region,
  trigger words, explanation, distractor options)
- `app.js` — drill state machine (intro → quiz → results), no dependencies
- `theory-data.js` — theory question bank (question, options, answer,
  category, explanation), ~70 questions across all Unit 1 topics
- `theory.js` — theory quiz logic (category-tagged, weak-spot tally)
- `grapes-data.js` — chart dataset (body, acidity, sweetness, tannin,
  fruit family per grape)
- `chart.js` — chart rendering logic (Chart.js bubble chart)
- `supabase-config.js` — leaderboard credentials + read/write helpers
- `leaderboard.js` — leaderboard page rendering
- `supabase-setup.sql` — one-time database setup to run in Supabase

## Setting up the leaderboard (optional)

The drill and chart work with no backend at all. The leaderboard needs a
free [Supabase](https://supabase.com) project — a hosted Postgres database
the browser talks to directly. GitHub Pages keeps hosting the site
unchanged; only the leaderboard page calls out to Supabase.

1. Create a free account at supabase.com and start a new project (pick any
   region near your players; the free tier is plenty for friends and family).
2. Once the project is ready, open **SQL Editor → New query**, paste the
   entire contents of `supabase-setup.sql`, and click **Run**. This creates
   the `scores` table and the security policies.
3. Go to **Project Settings → API**. Copy two values:
   - **Project URL**
   - **Project API keys → `anon` `public`**
4. Open `supabase-config.js` and paste them into `SUPABASE_URL` and
   `SUPABASE_ANON_KEY`, replacing the placeholders.
5. Commit and push. The leaderboard goes live on your GitHub Pages URL.

### Is exposing the anon key safe?

Yes — the `anon` public key is designed to live in client-side code. It is
only safe because Row Level Security is enabled (step 2) with policies that
allow nothing beyond reading and inserting rows on the `scores` table. The
key cannot read other tables, cannot update or delete scores, and the
insert policy enforces sanity bounds server-side. For a family game this is
the correct, standard setup. It is not tamper-proof against a determined
person editing requests — appropriate for a leaderboard among friends, not
for anything where the score actually matters.

### Privacy note

The leaderboard shows whatever name each player types, visible to anyone
with the URL. Fine among family; if you make the site public as a portfolio
piece, consider asking players for first names or initials only.

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

## Extending the theory bank

Each entry in `theory-data.js` follows this shape:

```js
{
  q: "Barolo and Barbaresco, in Piedmont, are made from:",
  options: ["Sangiovese", "Nebbiolo", "Corvina", "Primitivo"],
  answer: "Nebbiolo",
  category: "italy",
  why: "Piedmont's two most prestigious reds are Nebbiolo..."
}
```

`options` must include `answer` exactly once plus three distractors, with no
duplicate options. `category` must match a key in `THEORY_CATEGORY_LABELS`
at the bottom of the file. Add as many as you like — the quiz draws a random
subset each run, so a bigger bank just means more variety. To add a whole
new category, add it to `THEORY_CATEGORY_LABELS` and tag questions with it;
the weak-spot tally and category labels pick it up automatically.

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

