import { describe, expect, it } from "vitest";
import * as gunjinShogiEntry from "./gunjin-shogi.ts";
import * as strategoLiteEntry from "./stratego-lite.ts";
import { acceptDraw, acknowledgePass, createMatch, declineDraw, offerDraw, playMove, resignMatch, rosterForSetup, submitSetup } from "./stratego-lite.ts";
import { decodePublicReplay, encodePublicReplay } from "./replay.ts";
import { decodeTrustedMatch, encodeTrustedMatch } from "./trusted.ts";
import { publicPosition, viewForPlayer } from "./views.ts";
import type { AuthoritativeMatch, GameMode, Player } from "./types.ts";

const range = (from: number, count: number) => Array.from({ length: count }, (_, at) => from + at);

/** Each side's setup as the cells (row-major) its roster is dealt into, in order: red takes the bottom rows, blue the top. */
const SETUP_CELLS: Record<GameMode, readonly [readonly number[], readonly number[]]> = {
  "hidden-hasami": [range(42, 7), range(0, 7)],
  "luzhanqi-mini": [[42, 43, 44, 45, 46, 47, 48, 49, 51, 52, 53, 54, 55, 50], [7, 8, 9, 10, 11, 12, 13, 0, 2, 3, 4, 5, 6, 1]],
  salpakan: [range(51, 21), range(0, 21)],
  "stratego-lite": [range(60, 40), range(0, 40)],
  "gunjin-shogi": [[...range(45, 30), 75], [...range(0, 30), 31]],
};

/** A match in play, for any mode: both sides arranged, and red to move. */
function playing(mode: GameMode, size?: { width: number; height: number }): AuthoritativeMatch {
  let match = createMatch(mode, size);
  const setup = (player: Player) =>
    rosterForSetup(match, player).map((kind, index) => {
      const cell = SETUP_CELLS[mode][player][index]!;
      return { kind, x: cell % match.width, y: Math.floor(cell / match.width) };
    });
  match = submitSetup(match, 0, setup(0), match.setupStep);
  match = acknowledgePass(match, 1, match.turn);
  match = submitSetup(match, 1, setup(1), match.setupStep);
  return acknowledgePass(match, 0, match.turn);
}

const MODES: readonly [GameMode, { width: number; height: number } | undefined][] = [
  ["hidden-hasami", { width: 7, height: 7 }],
  ["luzhanqi-mini", undefined],
  ["salpakan", undefined],
  ["stratego-lite", undefined],
  ["gunjin-shogi", undefined],
];

describe("the calls that end a match are exported where a host looks for them", () => {
  it("are on both generic entries, and are the same functions", () => {
    for (const entry of [strategoLiteEntry, gunjinShogiEntry]) {
      for (const name of ["offerDraw", "acceptDraw", "declineDraw", "resignMatch"] as const) {
        expect(typeof entry[name], name).toBe("function");
      }
    }
    expect(gunjinShogiEntry.resignMatch).toBe(strategoLiteEntry.resignMatch);
  });
});

describe("resigning", () => {
  it("ends a match of every mode in the other side's favour, and leaves the match it was given untouched", () => {
    for (const [mode, size] of MODES) {
      const match = playing(mode, size);
      const before = JSON.stringify(match);
      const ended = resignMatch(match, 0, match.turn);
      expect(ended.phase, mode).toBe("finished");
      expect(ended.result, mode).toEqual({ winner: 1, reason: "resigned" });
      expect(JSON.stringify(match), mode).toBe(before);
      expect(() => playMove(ended, 0, { from: { x: 0, y: 0 }, to: { x: 0, y: 1 }, expectedTurn: ended.turn }), mode).toThrow(RangeError);
      expect(() => resignMatch(ended, 0, ended.turn), mode).toThrow(RangeError);
    }
  });

  it("is the side to move's alone, and refuses a stale turn, a setup and a handoff", () => {
    const match = playing("stratego-lite");
    expect(() => resignMatch(match, 1, match.turn)).toThrow(RangeError);
    expect(() => resignMatch(match, 0, match.turn + 1)).toThrow(RangeError);
    expect(() => resignMatch(match, 0, match.turn - 1)).toThrow(RangeError);
    expect(() => resignMatch(createMatch("stratego-lite"), 0, 0)).toThrow(RangeError);
    const handoff = offerDraw(match, 0, match.turn);
    expect(handoff.phase).toBe("pass");
    expect(() => resignMatch(handoff, 1, handoff.turn)).toThrow(RangeError);
  });

  it("is public: the result names the side that resigned, in every view and in the replay, and no rank leaves with it", () => {
    const match = resignMatch(playing("gunjin-shogi"), 0, 0);
    expect(viewForPlayer(match, 1).result).toEqual({ winner: 1, reason: "resigned" });
    expect(publicPosition(match).result).toEqual({ winner: 1, reason: "resigned" });
    const replay = decodePublicReplay(encodePublicReplay(match));
    expect(replay?.result).toEqual({ winner: 1, reason: "resigned" });
    expect(encodePublicReplay(match)).not.toMatch(/"kind"|"general"|"mine"|"flag"/);
    expect(decodeTrustedMatch(encodeTrustedMatch(match))).toEqual(match);
  });
});

describe("offering, accepting and declining a draw", () => {
  it("is offered by the side to move, goes to the other side behind the cover, and is accepted on their turn", () => {
    for (const [mode, size] of MODES) {
      const match = playing(mode, size);
      const offered = offerDraw(match, 0, match.turn);
      expect(offered.phase, mode).toBe("pass");
      expect(offered.currentPlayer, mode).toBe(1);
      expect(offered.drawOffer, mode).toBe(0);
      expect(viewForPlayer(offered, 1).pieces, `${mode}: the board stays covered`).toBeNull();
      expect(() => acceptDraw(offered, 1, offered.turn), `${mode}: not before the device has arrived`).toThrow(RangeError);

      const arrived = acknowledgePass(offered, 1, offered.turn);
      expect(arrived.phase, mode).toBe("play");
      expect(viewForPlayer(arrived, 1).drawOffer, mode).toBe(0);
      const drawn = acceptDraw(arrived, 1, arrived.turn);
      expect(drawn.phase, mode).toBe("finished");
      expect(drawn.result, mode).toEqual({ winner: null, reason: "agreed-draw" });
      expect(drawn.drawOffer, mode).toBeUndefined();
      expect(arrived.phase, `${mode}: the match it was given is untouched`).toBe("play");
    }
  });

  it("cannot be accepted by the side that made it, by the wrong turn, or when nobody offered", () => {
    const match = playing("hidden-hasami", { width: 7, height: 7 });
    expect(() => acceptDraw(match, 0, match.turn)).toThrow(RangeError);
    const arrived = acknowledgePass(offerDraw(match, 0, match.turn), 1, match.turn);
    expect(() => acceptDraw(arrived, 0, arrived.turn)).toThrow(RangeError);
    expect(() => acceptDraw(arrived, 1, arrived.turn + 1)).toThrow(RangeError);
    expect(() => offerDraw(match, 1, match.turn)).toThrow(RangeError);
    expect(() => offerDraw(match, 0, match.turn + 1)).toThrow(RangeError);
  });

  it("is declined without a move: the offer is gone and the same side still has the move", () => {
    const match = playing("salpakan");
    const arrived = acknowledgePass(offerDraw(match, 0, match.turn), 1, match.turn);
    expect(() => declineDraw(arrived, 0, arrived.turn)).toThrow(RangeError);
    const declined = declineDraw(arrived, 1, arrived.turn);
    expect(declined.phase).toBe("play");
    expect(declined.currentPlayer).toBe(1);
    expect(declined.drawOffer).toBeUndefined();
    expect(viewForPlayer(declined, 1).drawOffer).toBeUndefined();
    expect(() => acceptDraw(declined, 1, declined.turn)).toThrow(RangeError);
    // Declining does not use up a turn: blue can still resign, and red may offer again after blue's next move.
    expect(resignMatch(declined, 1, declined.turn).result).toEqual({ winner: 0, reason: "resigned" });
  });

  it("is refused a second offer while the first waits for an answer, and moving is an answer", () => {
    const match = playing("hidden-hasami", { width: 7, height: 7 });
    const arrived = acknowledgePass(offerDraw(match, 0, match.turn), 1, match.turn);
    expect(() => offerDraw(arrived, 1, arrived.turn)).toThrow(RangeError);
    // Blue answers by moving instead: the offer lapses with the move.
    const moved = playMove(arrived, 1, { from: { x: 0, y: 0 }, to: { x: 0, y: 1 }, expectedTurn: arrived.turn });
    expect(moved.drawOffer).toBeUndefined();
  });

  it("keeps the repetition count while the offer is considered, and the trusted record keeps the offer", () => {
    const match = playing("hidden-hasami", { width: 7, height: 7 });
    const offered = offerDraw(match, 0, match.turn);
    expect(offered.positionCounts).toEqual(match.positionCounts);
    expect(decodeTrustedMatch(encodeTrustedMatch(offered))).toEqual(offered);
    expect(decodeTrustedMatch(encodeTrustedMatch({ ...offered, drawOffer: 2 as unknown as Player }))).toBeNull();
    expect(decodeTrustedMatch(encodeTrustedMatch({ ...offered, passPurpose: "nonsense" as never }))).toBeNull();
  });

  it("ends a match that is in the replay as an agreed draw with no winner", () => {
    const match = playing("luzhanqi-mini");
    const drawn = acceptDraw(acknowledgePass(offerDraw(match, 0, match.turn), 1, match.turn), 1, match.turn);
    expect(decodePublicReplay(encodePublicReplay(drawn))?.result).toEqual({ winner: null, reason: "agreed-draw" });
  });
});
