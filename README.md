# Pattern Trace

Interactive **Astro** website to learn design patterns through **demos + animated diagrams + code**.

This project’s goal is to make each pattern easy to understand by providing a dedicated page with:

- a short explanation (what it solves and when to use it),
- a small demo with controls (buttons/toggles) plus output/logs,
- a `<canvas>` diagram that animates the “flow” (calls/messages),
- and a highlighted code section.

Currently it includes patterns like **Adapter**, **Bridge**, **Factory Method**, and **Observer**.

Spanish version: see [`README.es.md`](./README.es.md).

## Project structure

- `src/pages/` — Site routes (home and the patterns index).
- `src/layouts/BaseLayout.astro` — Base layout (HTML structure and global styles).
- `src/components/` — Shared components (demo shell, code section, etc.).
- `src/patterns/` — Per-pattern implementation (page, meta, components, and JS/TS logic).
  - Each pattern usually contains:
    - `*Page.astro` (pattern page)
    - `*-logic.js` (demo logic + canvas animations)
    - `components/` (pattern UI)
    - `meta.ts` (metadata used to build lists/navigation)
- `public/vendor/` — Static third-party assets (e.g. Prism “lite” for syntax highlighting).

## Requirements

- Node.js (a modern version recommended)
- pnpm (the repo declares `pnpm@10.28.2` in `package.json`)

## Run locally

```zsh
pnpm install
pnpm dev
```

The `dev` script starts Astro on port `4321`.

## Build / preview

```zsh
pnpm build
pnpm preview
```

## Notes

- Syntax highlighting uses assets in `public/vendor/`.
- Each pattern’s animations are orchestrated in its corresponding `*-logic.js` file.
