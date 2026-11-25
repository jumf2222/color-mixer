# Color Mixer

A color-mixing puzzle game. Each level gives you a set of paints and a target color — drop paints into the bowl until your mix matches.

- 16 levels, from primary mixes (red + yellow = orange) to tints, shades, and exact ratios
- Paint-like (RYB) mixing, so yellow + blue makes green
- Stars for using the fewest drops, two-step hints, undo, saved progress

Built with [SolidJS 2.0](https://www.solidjs.com/) using `@solidjs/html` tagged templates — no build step.

## Play

Open `index.html` in a browser (Solid loads from a CDN).

## Adding levels

Add an entry to `LEVELS` in `index.html`:

```js
{ target: "Sky Blue", paints: ["blue", "white", "yellow"], recipe: { blue: 1, white: 2 } }
```

The target color is computed from the recipe, so every level is solvable.
