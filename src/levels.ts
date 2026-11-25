import type { Drops, PaintId } from "./colors";

export interface Level {
  /** Name of the color to make. */
  target: string;
  /** Paints the player gets this level. */
  paints: PaintId[];
  /** Drops that make the target; the target color is computed from this. */
  recipe: Drops;
}

const ALL: PaintId[] = ["red", "yellow", "blue", "black", "white"];

export const LEVELS: Level[] = [
  { target: "Orange", paints: ["red", "yellow"], recipe: { red: 1, yellow: 1 } },
  { target: "Green", paints: ["yellow", "blue"], recipe: { yellow: 1, blue: 1 } },
  { target: "Purple", paints: ["red", "blue"], recipe: { red: 1, blue: 1 } },
  { target: "Pink", paints: ["red", "white"], recipe: { red: 1, white: 1 } },
  { target: "Sky Blue", paints: ["blue", "white", "yellow"], recipe: { blue: 1, white: 2 } },
  { target: "Lime", paints: ["yellow", "blue", "red"], recipe: { yellow: 2, blue: 1 } },
  { target: "Red-Orange", paints: ["red", "yellow", "blue"], recipe: { red: 2, yellow: 1 } },
  { target: "Magenta", paints: ["red", "blue", "yellow"], recipe: { red: 2, blue: 1 } },
  { target: "Brown", paints: ["red", "yellow", "black", "white"], recipe: { red: 1, yellow: 1, black: 1 } },
  { target: "Peach", paints: ["red", "yellow", "blue", "white"], recipe: { red: 1, yellow: 1, white: 2 } },
  { target: "Lavender", paints: ["red", "blue", "yellow", "white"], recipe: { red: 1, blue: 1, white: 2 } },
  { target: "Teal", paints: ["yellow", "blue", "white", "red"], recipe: { yellow: 1, blue: 2, white: 1 } },
  { target: "Olive", paints: ALL, recipe: { yellow: 2, blue: 1, black: 1 } },
  { target: "Gray", paints: ALL, recipe: { black: 1, white: 2 } },
  { target: "Navy", paints: ALL, recipe: { blue: 2, black: 1 } },
  { target: "Gold", paints: ALL, recipe: { yellow: 3, red: 1 } },
];

export const recipeSize = (level: Level) =>
  Object.values(level.recipe).reduce((a, b) => a + (b ?? 0), 0);
