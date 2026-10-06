import { describe, expect, it } from "vitest";
import { drawGunjinBoard } from "./draw.ts";
import { createMatch } from "./match.ts";
import { STRATEGO_LITE_RULES } from "./rules/strategoLite.ts";
import { boardFeatures, viewForPlayer } from "./views.ts";
import type { AuthoritativeMatch, GameMode } from "./types.ts";

const PLAYING: Record<GameMode, [number, number]> = {
  "hidden-hasami": [7, 7], "luzhanqi-mini": [7, 8], salpakan: [9, 8], "stratego-lite": [10, 10], "gunjin-shogi": [9, 9],
};

/** A match in play, with the pieces given, on the board the mode is played on. */
function playingWith(mode: GameMode, pieces: AuthoritativeMatch["pieces"]): AuthoritativeMatch {
  const [width, height] = PLAYING[mode];
  return { ...createMatch(mode, { width, height }), phase: "play", setupStep: 2, pieces };
}

describe("Hidden Capture Flag's lakes", () => {
  it("are two 2x2 lakes at files 2-3 and 6-7, ranks 4-5, and only in this mode", () => {
    const lakes = boardFeatures("stratego-lite", 10, 10).lakes;
    expect(lakes).toHaveLength(8);
    expect(new Set(lakes.map(({ x, y }) => `${x}:${y}`))).toEqual(new Set(["2:4", "3:4", "2:5", "3:5", "6:4", "7:4", "6:5", "7:5"]));
    for (const mode of ["hidden-hasami", "luzhanqi-mini", "salpakan", "gunjin-shogi"] as const) {
      const [width, height] = PLAYING[mode];
      expect(boardFeatures(mode, width, height).lakes, mode).toEqual([]);
    }
  });

  it("are exactly the squares no piece can enter, so the picture cannot say one thing and the rules another", () => {
    const drawn = new Set(boardFeatures("stratego-lite", 10, 10).lakes.map(({ x, y }) => `${x}:${y}`));
    for (let y = 0; y < 10; y += 1) {
      for (let x = 0; x < 10; x += 1) {
        const lake = drawn.has(`${x}:${y}`);
        const into = { id: "m", owner: 0 as const, kind: "marshal", x: x === 9 ? 8 : x + 1, y };
        const moves = STRATEGO_LITE_RULES.legalDestinations(playingWith("stratego-lite", [into]), into);
        expect(moves.some(move => move.x === x && move.y === y), `${x}:${y}`).toBe(!lake);
      }
    }
  });

  it("are drawn once each as water, in light and in dark, with a name for a screen reader, in both languages", () => {
    const view = viewForPlayer(playingWith("stratego-lite", []), 0);
    const seen = new Set<string>();
    for (const material of ["ivory", "wood", "slate"] as const) {
      const svg = drawGunjinBoard(view, { material });
      expect(svg.match(/data-lake="true"/g), material).toHaveLength(2);
      expect(svg.match(/aria-label="Lake"/g), material).toHaveLength(2);
      seen.add(/data-lake="true"[^>]*><rect[^>]*fill="(#[0-9a-f]{6})"/.exec(svg)![1]!);
    }
    expect(seen.size, "each material has its own water").toBe(3);
    expect(drawGunjinBoard(view, { language: "ja" }).match(/aria-label="湖"/g)).toHaveLength(2);
  });

  it("are not drawn on a board that has none, and are drawn the same with or without a piece beside them", () => {
    for (const mode of ["hidden-hasami", "luzhanqi-mini", "salpakan", "gunjin-shogi"] as const) {
      expect(drawGunjinBoard(viewForPlayer(playingWith(mode, []), 0)), mode).not.toContain("data-lake");
    }
    const beside = { id: "b", owner: 0 as const, kind: "scout", x: 1, y: 4 };
    const svg = drawGunjinBoard(viewForPlayer(playingWith("stratego-lite", [beside]), 0));
    expect(svg.match(/data-lake="true"/g)).toHaveLength(2);
    expect(svg).toContain('data-kind="scout"');
  });
});
