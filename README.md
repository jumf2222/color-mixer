# Color Mixer

A color-mixing puzzle game. Each level gives you a set of paints and a target color — drop paints into the bowl until your mix matches.

- 16 levels, from primary mixes (red + yellow = orange) to tints, shades, and exact ratios
- Paint-like (RYB) mixing, so yellow + blue makes green
- Stars for using the fewest drops, two-step hints, undo, saved progress

Built with [SolidJS 2.0](https://www.solidjs.com/), TypeScript, and [Vite](https://vite.dev/).

## Getting started

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev       # start the dev server
npm run build     # typecheck + production build into dist/
npm run preview   # serve the production build
```

## Project layout

```
src/
  App.tsx        game UI and state
  colors.ts      paint definitions and RYB color mixing
  levels.ts      level list
  progress.ts    saved stars (localStorage)
  styles.css
  index.tsx      entry point
```

## Adding levels

Add an entry to `LEVELS` in `src/levels.ts`:

```js
{ target: "Sky Blue", paints: ["blue", "white", "yellow"], recipe: { blue: 1, white: 2 } }
```

The target color is computed from the recipe, so every level is solvable.
