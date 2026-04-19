# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A minimalist, mobile-first flashcard web app for studying drugs from paramedic protocols. Static front end that renders flashcards from JSON data.

## Architecture

- Static site — no backend, no build step. Deployed to GitHub Pages via `.github/workflows/deploy.yml` on every push to `main`.
- `data/drugs.json` is the source of truth. Each entry is a drug with an array of `indications`; the app flattens drug × indication into individual flashcards (so one drug can produce multiple cards).
- Indication fields: `indication`, `adult_dose`, `peds_dose`, `route`, `contraindications[]`, `when_to_give`, `page_numbers[]`.
- Three files drive the UI: `index.html` (structure), `styles.css` (mobile-first, CSS flip via `backface-visibility`), `app.js` (fetch → flatten → render, tap/swipe/keyboard nav).
- Mobile-first: design and test at phone widths before scaling up. Use `100dvh` and safe-area insets to behave correctly in mobile browsers.

## Local dev

No build. Serve the directory over HTTP (fetch won't work from `file://`):
`python3 -m http.server 8000` then open `http://localhost:8000`.
