import { describe, expect, it } from "vitest";
import { combatWinner } from "./salpakan.ts";
import { LUZHANQI_MINI_RULES } from "./luzhanqiMini.ts";
import { HIDDEN_HASAMI_RULES } from "./hiddenHasami.ts";
import { SALPAKAN_RULES } from "./salpakan.ts";
import { GUNJIN_SHOGI_RULES, gunjinCombat } from "./gunjinShogi.ts";
import { STRATEGO_LITE_RULES, strategoCombat } from "./strategoLite.ts";
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

describe("Hidden capture-flag rules", () => {
  it("checks every ranked combat pair plus special flag, bomb, miner, and spy cases", () => {
    const ranked = ["marshal", "general", "colonel", "major", "captain", "lieutenant", "sergeant", "miner", "scout", "spy"];
    for (let attack = 0; attack < ranked.length; attack += 1) {
      for (let defend = 0; defend < ranked.length; defend += 1) {
        const a = ranked[attack]!;
        const d = ranked[defend]!;
        const exceptionalSpyAttack = (a === "spy" && d === "marshal") || (a === "marshal" && d === "spy");
        const expected = exceptionalSpyAttack ? "attacker" : attack === defend ? "both" : attack < defend ? "attacker" : "defender";
        expect(strategoCombat(a, d)).toBe(expected);
      }
    }
    expect(strategoCombat("spy", "marshal")).toBe("attacker");
    expect(strategoCombat("marshal", "spy")).toBe("attacker");
    expect(strategoCombat("miner", "bomb")).toBe("attacker");
    expect(strategoCombat("scout", "bomb")).toBe("defender");
    expect(strategoCombat("scout", "flag")).toBe("attacker");
  });

  it("preserves ranks in player views but records only ranks revealed by a battle", () => {
    const attacker = piece("a", 0, "scout", 4, 4);
    const defender = piece("d", 1, "marshal", 4, 5);
    const state = board("stratego-lite", 10, 10, [attacker, defender]);
    const result = STRATEGO_LITE_RULES.resolveMove(state, attacker, { x: 4, y: 5 });
    expect(result.revealed).toEqual([{ owner: 0, kind: "scout" }, { owner: 1, kind: "marshal" }]);
    expect(result.pieces.map(item => item.id)).toEqual(["d"]);
    expect(STRATEGO_LITE_RULES.legalDestinations(state, piece("flag", 0, "flag", 0, 6))).toEqual([]);
  });

  it("validates the complete 40-piece setup and keeps lakes impassable", () => {
    const roster = STRATEGO_LITE_RULES.roster(0, 10, 10);
    expect(roster).toHaveLength(40);
    const setup = roster.map((kind, index) => ({ kind, x: index % 10, y: 6 + Math.floor(index / 10) }));
    expect(STRATEGO_LITE_RULES.validateSetup(0, setup)).toBe(true);
    const scout = piece("s", 0, "scout", 1, 4);
    expect(STRATEGO_LITE_RULES.legalDestinations(board("stratego-lite", 10, 10, [scout]), scout)).not.toContainEqual({ x: 4, y: 4 });
  });
});

describe("Gunjin Shogi club-rule adaptation", () => {
  it("checks the full combat matrix and documented special-piece exceptions", () => {
    const ranks = ["general", "lieutenant-general", "major-general", "colonel", "lieutenant-colonel", "major", "captain", "lieutenant", "second-lieutenant", "cavalry"];
    for (let attack = 0; attack < ranks.length; attack += 1) {
      for (let defend = 0; defend < ranks.length; defend += 1) {
        const expected = attack === defend ? "both" : attack < defend ? "attacker" : "defender";
        expect(gunjinCombat(ranks[attack]!, ranks[defend]!)).toBe(expected);
      }
    }
    const ranksAndSpecials = [...ranks, "aircraft", "tank", "engineer", "spy", "mine", "flag"];
    for (const attacker of ranksAndSpecials) {
      for (const defender of ranksAndSpecials) {
        expect(() => gunjinCombat(attacker, defender)).not.toThrow();
      }
    }
    expect(gunjinCombat("spy", "general")).toBe("attacker");
    expect(gunjinCombat("spy", "lieutenant-general")).toBe("attacker");
    expect(gunjinCombat("engineer", "mine")).toBe("attacker");
    expect(gunjinCombat("engineer", "tank")).toBe("attacker");
    expect(gunjinCombat("flag", "general")).toBe("both");
    expect(gunjinCombat("aircraft", "mine")).toBe("attacker");
    expect(gunjinCombat("general", "mine")).toBe("defender");
    expect(gunjinCombat("mine", "aircraft")).toBe("defender");
    for (const attacker of ranksAndSpecials) expect(gunjinCombat(attacker, "flag"), `${attacker} takes the flag`).toBe("attacker");
  });

  it("wins the game for the piece that captures the flag", () => {
    for (const kind of ["general", "cavalry", "spy", "tank", "engineer", "aircraft", "flag"]) {
      const attacker = piece("a", 0, kind, 4, 4);
      const flag = piece("f", 1, "flag", 4, 5);
      const result = GUNJIN_SHOGI_RULES.resolveMove(board("gunjin-shogi", 9, 9, [attacker, flag]), attacker, { x: 4, y: 5 });
      expect(result.winner, kind).toBe(0);
      expect(result.reason, kind).toBe("flag-won");
      expect(result.captured.map(item => item.id), kind).toEqual(["f"]);
      expect(result.pieces.find(item => item.id === "a"), kind).toMatchObject({ x: 4, y: 5 });
    }
    const second = piece("p", 1, "major", 2, 2);
    const flag = piece("g", 0, "flag", 2, 3);
    expect(GUNJIN_SHOGI_RULES.resolveMove(board("gunjin-shogi", 9, 9, [second, flag]), second, { x: 2, y: 3 }).winner).toBe(1);
  });

  it("removes a flag that attacks another piece with it, and wins nothing", () => {
    const flag = piece("o", 0, "flag", 6, 6);
    const resolution = GUNJIN_SHOGI_RULES.resolveMove(board("gunjin-shogi", 9, 9, [flag, piece("m", 1, "captain", 6, 7)]), flag, { x: 6, y: 7 });
    expect(resolution.winner).toBeUndefined();
    expect(resolution.pieces).toHaveLength(0);
  });

  it("lets an aircraft remove a mine, and keeps mines off the files either side of the middle in the front rank", () => {
    const aircraft = piece("a", 0, "aircraft", 4, 4);
    const mine = piece("m", 1, "mine", 2, 1);
    const result = GUNJIN_SHOGI_RULES.resolveMove(board("gunjin-shogi", 9, 9, [aircraft, mine]), aircraft, { x: 2, y: 1 });
    expect(result.captured.map(item => item.id)).toEqual(["m"]);
    expect(result.winner).toBeUndefined();
    const placed = GUNJIN_SHOGI_RULES.roster(0, 9, 9).map((kind, index) => ({ kind, x: index % 9, y: 5 + Math.floor(index / 9) }));
    const withMineAt = (x: number, y: number) => {
      const mineAt = placed.find(item => item.kind === "mine")!;
      const target = placed.find(item => item.x === x && item.y === y)!;
      return placed.map(item => (item === mineAt ? { ...item, kind: target.kind } : item === target ? { ...item, kind: "mine" } : item));
    };
    expect(GUNJIN_SHOGI_RULES.validateSetup(0, withMineAt(3, 5))).toBe(false);
    expect(GUNJIN_SHOGI_RULES.validateSetup(0, withMineAt(5, 5))).toBe(false);
    expect(GUNJIN_SHOGI_RULES.validateSetup(0, withMineAt(4, 5))).toBe(true);
    expect(GUNJIN_SHOGI_RULES.validateSetup(0, withMineAt(3, 6))).toBe(true);
    const south = GUNJIN_SHOGI_RULES.roster(1, 9, 9).map((kind, index) => ({ kind, x: index % 9, y: Math.floor(index / 9) }));
    const southMine = south.find(item => item.kind === "mine")!;
    const frontSquare = south.find(item => item.x === 3 && item.y === 3)!;
    expect(GUNJIN_SHOGI_RULES.validateSetup(1, south.map(item => (item === southMine ? { ...item, kind: frontSquare.kind } : item === frontSquare ? { ...item, kind: "mine" } : item)))).toBe(false);
  });

  it("validates all 31 pieces in the four setup ranks and confines public history", () => {
    const roster = GUNJIN_SHOGI_RULES.roster(0, 9, 9);
    expect(roster).toHaveLength(31);
    const setup = roster.map((kind, index) => ({ kind, x: index % 9, y: 5 + Math.floor(index / 9) }));
    expect(GUNJIN_SHOGI_RULES.validateSetup(0, setup)).toBe(true);
    const pieces = [piece("s", 0, "spy", 3, 7), piece("e", 1, "general", 3, 8)];
    const result = GUNJIN_SHOGI_RULES.resolveMove(board("gunjin-shogi", 9, 9, pieces), pieces[0]!, { x: 3, y: 8 });
    expect(result.revealed).toBeUndefined();
    expect(result.captured.map(item => item.kind)).toEqual(["general"]);
  });
});
