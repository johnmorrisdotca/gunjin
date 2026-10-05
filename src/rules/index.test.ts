import { describe, expect, it } from "vitest";
import { combatWinner } from "./salpakan.ts";
import { LUZHANQI_MINI_RULES } from "./luzhanqiMini.ts";
import { HIDDEN_HASAMI_RULES } from "./hiddenHasami.ts";
import { SALPAKAN_RULES } from "./salpakan.ts";
import type { AuthoritativeMatch, Piece } from "../types.ts";

function board(mode: AuthoritativeMatch["mode"], width: number, height: number, pieces: Piece[]): AuthoritativeMatch {
  return {
    mode, width, height, phase: "play", currentPlayer: 0, setupStep: 2, turn: 0,
    privateSetups: [[], []], pieces, positionCounts: {}, log: [],
  };
}

const piece = (id: string, owner: 0 | 1, kind: string, x: number, y: number): Piece => ({ id, owner, kind, x, y });

describe("hidden Hasami captures", () => {
  it("captures a contiguous bracketed run in each ray from the moved stone", () => {
    const pieces = [piece("m", 0, "guard", 2, 4), piece("left", 0, "guard", 0, 3), piece("b", 1, "guard", 1, 3), piece("right", 0, "guard", 4, 3), piece("c", 1, "leader", 2, 2), piece("e", 1, "guard", 2, 1), piece("top", 0, "guard", 2, 0)];
    const state = board("hidden-hasami", 7, 7, pieces);
    const resolution = HIDDEN_HASAMI_RULES.resolveMove(state, pieces[0]!, { x: 2, y: 3 });
    expect(resolution.captured.map(target => target.id).sort()).toEqual(["b", "c", "e"]);
    expect(resolution.winner).toBe(0);
    expect(resolution.reason).toBe("objective-captured");
  });
  it("does not treat edge contact as a bracket", () => {
    const pieces = [piece("a", 0, "guard", 0, 0), piece("b", 1, "guard", 1, 0)];
    const state = board("hidden-hasami", 7, 7, pieces);
    expect(HIDDEN_HASAMI_RULES.resolveMove(state, pieces[0]!, { x: 0, y: 1 }).captured).toHaveLength(0);
  });
});

describe("Luzhanqi Mini combat and setup", () => {
  it("keeps the four camps safe from attacks while allowing moves out", () => {
    const pieces = [piece("a", 0, "soldier", 1, 2), piece("b", 1, "flag", 1, 3)];
    const state = board("luzhanqi-mini", 7, 8, pieces);
    expect(LUZHANQI_MINI_RULES.legalDestinations(state, pieces[0]!)).not.toContainEqual({ x: 1, y: 3 });
  });
  it("lets only an engineer remove a mine, and removes the losing attacker otherwise", () => {
    const mine = piece("m", 1, "mine", 2, 2);
    const soldier = piece("s", 0, "soldier", 2, 1);
    const engineer = piece("e", 0, "engineer", 2, 1);
    const state = board("luzhanqi-mini", 7, 8, [mine, soldier]);
    expect(LUZHANQI_MINI_RULES.resolveMove(state, soldier, { x: 2, y: 2 }).pieces.map(p => p.id)).toEqual(["m"]);
    expect(LUZHANQI_MINI_RULES.resolveMove({ ...state, pieces: [mine, engineer] }, engineer, { x: 2, y: 2 }).pieces.map(p => p.id)).toEqual(["e"]);
  });
  it("moves a successful flag attacker into the captured headquarters", () => {
    const attacker = piece("a", 0, "soldier", 4, 3);
    const flag = piece("f", 1, "flag", 4, 4);
    const resolution = LUZHANQI_MINI_RULES.resolveMove(board("luzhanqi-mini", 7, 8, [attacker, flag]), attacker, { x: 4, y: 4 });
    expect(resolution.winner).toBe(0);
    expect(resolution.pieces).toContainEqual({ ...attacker, x: 4, y: 4 });
  });
  it("validates complete roster placement and flag headquarters", () => {
    const roster = LUZHANQI_MINI_RULES.roster(0, 7, 8);
    const placements = roster.map((kind, index) => ({ kind, x: index % 7, y: index < 7 ? 6 : 7 }));
    const flag = placements.find(p => p.kind === "flag")!;
    const engineer = placements.find(p => p.kind === "engineer" && p.y === 7 && p.x === 1)!;
    [flag.x, engineer.x] = [engineer.x, flag.x];
    expect(LUZHANQI_MINI_RULES.validateSetup(0, placements)).toBe(true);
    flag.x = 0;
    expect(LUZHANQI_MINI_RULES.validateSetup(0, placements)).toBe(false);
  });
});

describe("Salpakan rank outcomes", () => {
  it("checks all officer pairs and the private/spy/flag exceptions", () => {
    const roster = SALPAKAN_RULES.roster(0, 9, 8).filter(kind => !["private", "spy", "flag"].includes(kind));
    for (let a = 0; a < roster.length; a += 1) {
      for (let b = 0; b < roster.length; b += 1) {
        const expected = a === b ? "both" : a < b ? "attacker" : "defender";
        expect(combatWinner(roster[a]!, roster[b]!)).toBe(expected);
      }
    }
    expect(combatWinner("spy", "five-star")).toBe("attacker");
    expect(combatWinner("private", "spy")).toBe("attacker");
    expect(combatWinner("five-star", "flag")).toBe("attacker");
    expect(combatWinner("flag", "five-star")).toBe("defender");
    expect(combatWinner("spy", "spy")).toBe("both");
  });
  it("awards a held flag claim after the opponent's equal battle removes both pieces", () => {
    const attacker = piece("a", 1, "captain", 4, 3);
    const defender = piece("d", 0, "captain", 4, 4);
    const state = { ...board("salpakan", 9, 8, [attacker, defender]), pendingFlagClaimant: 0 as const };
    const resolution = SALPAKAN_RULES.resolveMove(state, attacker, { x: 4, y: 4 });
    expect(resolution.winner).toBe(0);
    expect(resolution.reason).toBe("flag-held");
    expect(resolution.captured.map(target => target.id).sort()).toEqual(["a", "d"]);
  });
  it("moves a winning flag attacker onto the captured flag square", () => {
    const attacker = piece("a", 1, "flag", 4, 3);
    const flag = piece("d", 0, "flag", 4, 4);
    const resolution = SALPAKAN_RULES.resolveMove(board("salpakan", 9, 8, [attacker, flag]), attacker, { x: 4, y: 4 });
    expect(resolution.winner).toBe(1);
    expect(resolution.pieces).toContainEqual({ ...attacker, x: 4, y: 4 });
  });
});
