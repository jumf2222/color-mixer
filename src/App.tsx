import { createMemo, createSignal, For, onSettled } from "solid-js";
import { countDrops, css, deltaE, mix, PAINTS, rybToRgb, type PaintId } from "./colors";
import { LEVELS, recipeSize, type Level } from "./levels";
import { firstUnbeaten, loadProgress, saveProgress, type Progress } from "./progress";

/** ΔE below this counts as a match. */
const WIN_DISTANCE = 3;

export default function App() {
  const initialProgress = loadProgress();
  const [progress, setProgress] = createSignal<Progress>(initialProgress);
  const [levelIdx, setLevelIdx] = createSignal(firstUnbeaten(initialProgress));
  const [history, setHistory] = createSignal<PaintId[]>([]); // paints in the order dropped
  const [won, setWon] = createSignal(false);
  const [showWin, setShowWin] = createSignal(false);
  const [stars, setStars] = createSignal(0);
  const [hintStep, setHintStep] = createSignal(0);

  const level = createMemo(() => LEVELS[levelIdx()]);
  const targetRgb = createMemo(() => mix(level().recipe)!);
  const drops = createMemo(() => countDrops(history()));
  const mixRgb = createMemo(() => mix(drops()));
  const matchPct = createMemo(() => {
    const rgb = mixRgb();
    return rgb ? Math.max(0, Math.round(100 - deltaE(rgb, targetRgb()) * 1.5)) : 0;
  });
  const maxUnlocked = createMemo(() => firstUnbeaten(progress()));
  const hintText = createMemo(() => {
    const recipe = level().recipe;
    const ids = Object.keys(recipe) as PaintId[];
    if (hintStep() === 0) return "";
    if (hintStep() === 1) return "Uses: " + ids.map((id) => PAINTS[id].name).join(" + ");
    return "Recipe: " + ids.map((id) => `${recipe[id]} ${PAINTS[id].name}`).join(" + ");
  });

  let bowlEl: HTMLDivElement | undefined;
  function splash() {
    if (!bowlEl) return;
    bowlEl.classList.remove("splash");
    void bowlEl.offsetWidth; // restart the animation
    bowlEl.classList.add("splash");
  }

  function loadLevel(i: number) {
    setLevelIdx(i);
    setHistory([]);
    setWon(false);
    setShowWin(false);
    setHintStep(0);
  }

  // In Solid 2.0, reads lag writes until the next flush, so handlers
  // compute from local values instead of re-reading signals they just set.
  function addDrop(id: PaintId) {
    if (won()) return;
    const next = [...history(), id];
    setHistory(next);
    splash();
    const L = level();
    if (deltaE(mix(countDrops(next))!, mix(L.recipe)!) < WIN_DISTANCE) win(next.length, L);
  }

  function win(used: number, L: Level) {
    const ideal = recipeSize(L);
    let s = used <= ideal ? 3 : used <= ideal * 2 ? 2 : 1;
    if (hintStep() > 0) s = Math.min(s, 2);
    const idx = levelIdx();
    const p = { ...progress(), [idx]: Math.max(progress()[idx] ?? 0, s) };
    setProgress(p);
    saveProgress(p);
    setStars(s);
    setWon(true);
    setTimeout(() => setShowWin(true), 450);
  }

  const undo = () => {
    if (!won()) setHistory((h) => h.slice(0, -1));
  };
  const clearBowl = () => {
    if (!won()) setHistory([]);
  };
  const nextLevel = () => loadLevel(levelIdx() === LEVELS.length - 1 ? 0 : levelIdx() + 1);

  onSettled(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const levelNums = LEVELS.map((_, i) => i);

  return (
    <>
      <div class="game">
        <header>
          <h1>🎨 Color Mixer</h1>
          <div class="level-tag">
            Level {levelIdx() + 1} of {LEVELS.length}
          </div>
        </header>

        <div class="levels">
          <For each={levelNums}>
            {(i) => (
              <button
                class={["lvl-btn", { done: !!progress()[i], current: i === levelIdx() }]}
                disabled={i > maxUnlocked()}
                title={progress()[i] ? "★".repeat(progress()[i]) : ""}
                onClick={() => loadLevel(i)}
              >
                {i + 1}
              </button>
            )}
          </For>
        </div>

        <div class="stage">
          <div class="card">
            <h2>Make this</h2>
            <div class="swatch" style={{ "background-color": css(targetRgb()) }} />
            <div class="target-name">{level().target}</div>
          </div>
          <div class="card">
            <h2>Your mix</h2>
            <div
              ref={(el) => (bowlEl = el)}
              class={["swatch", "bowl", { empty: !mixRgb() }]}
              style={{ "background-color": mixRgb() ? css(mixRgb()!) : undefined }}
            />
            <div class="drops-info">
              {history().length
                ? `${history().length} drop${history().length === 1 ? "" : "s"}`
                : "Tap a paint to add a drop"}
            </div>
          </div>
          <div class="meter">
            <div class="meter-row">
              <span>Match</span>
              <strong>{matchPct()}%</strong>
            </div>
            <div class="bar">
              <div
                style={{
                  width: `${matchPct()}%`,
                  background:
                    matchPct() >= 95 ? "var(--good)" : matchPct() >= 75 ? "#e0a422" : "var(--accent)",
                }}
              />
            </div>
          </div>
        </div>

        <div class="paints">
          <For each={level().paints}>
            {(id) => (
              <button class="paint" onClick={() => addDrop(id)}>
                <div class="pot" style={{ background: css(rybToRgb(PAINTS[id].ryb)) }}>
                  <div class={["count", { show: !!drops()[id] }]}>{String(drops()[id] ?? 0)}</div>
                </div>
                <span>{PAINTS[id].name}</span>
              </button>
            )}
          </For>
        </div>

        <div class="controls">
          <button class="btn" disabled={!history().length} onClick={undo}>
            ↶ Undo
          </button>
          <button class="btn" disabled={!history().length} onClick={clearBowl}>
            Empty bowl
          </button>
          <button class="btn" onClick={() => setHintStep((s) => Math.min(s + 1, 2))}>
            💡 Hint
          </button>
        </div>
        <div class="hint">{hintText()}</div>
      </div>

      <div class={["overlay", { show: showWin() }]}>
        <div class="modal">
          <h3>{stars() === 3 ? "Perfect match!" : "You made it!"}</h3>
          <div class="stars">
            <For each={[1, 2, 3]}>{(s) => <span class={{ off: s > stars() }}>★</span>}</For>
          </div>
          <p>
            {level().target} in {history().length} drop{history().length === 1 ? "" : "s"}
            {stars() === 3
              ? ""
              : history().length > recipeSize(level())
                ? ` — can you do it in ${recipeSize(level())}?`
                : " — try it without a hint for 3 stars"}
          </p>
          <button class="btn primary" onClick={nextLevel}>
            {levelIdx() === LEVELS.length - 1 ? "Play again" : "Next level →"}
          </button>
        </div>
      </div>
    </>
  );
}
