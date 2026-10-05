import { describe, expect, it } from "vitest";
import { acknowledgePass, createMatch, offerDraw, playMove, submitSetup } from "./match.ts";
import { publicPositionKey } from "./rules/board.ts";
import { viewForPlayer, publicPosition } from "./views.ts";
import { drawGunjinBoard } from "./draw.ts";
import { decodePublicReplay, encodePublicReplay } from "./replay.ts";

describe("match handoff and public information", () => {
  it("hides both board and private setup during handoff, then redacts enemy ranks", () => {
    let match = createMatch("hidden-hasami", { width: 7, height: 7 });
    const setup = (leaderX: number) => [
      { kind: "leader", x: leaderX, y: 6 },
      ...Array.from({ length: 6 }, (_, index) => ({ kind: "guard", x: (leaderX + index + 1) % 7, y: 6 })),
    ];
    match = submitSetup(match, 0, setup(0), match.setupStep);
    expect(viewForPlayer(match, 0).pieces).toBeNull();
    expect(viewForPlayer(match, 1).ownSetup).toBeNull();
    match = acknowledgePass(match, 1, match.turn);
    match = submitSetup(match, 1, setup(1).map(cell => ({ ...cell, y: 0 })), match.setupStep);
    match = acknowledgePass(match, 0, match.turn);

    const bluePiece = match.pieces.find(piece => piece.owner === 1)!;
    const view = viewForPlayer(match, 0);
    const visibleEnemy = view.pieces!.find(piece => piece.owner === 1)!;
    expect(visibleEnemy).toEqual({ owner: 1, x: bluePiece.x, y: bluePiece.y, kind: null, hidden: true });
    expect("kind" in visibleEnemy ? visibleEnemy.kind : undefined).toBeNull();
    expect("id" in visibleEnemy).toBe(false);
    expect(JSON.stringify(publicPosition(match))).not.toContain(bluePiece.id);
    expect(drawGunjinBoard(view)).not.toContain(`data-piece="${bluePiece.id}"`);
    expect(decodePublicReplay(encodePublicReplay(match))).not.toBeNull();
  });

  it("rejects stale moves and counts the player-to-move as part of a public position", () => {
    const match = createMatch("hidden-hasami", { width: 7, height: 7 });
    expect(() => playMove(match, 0, { from: { x: 0, y: 0 }, to: { x: 0, y: 1 }, expectedTurn: 0 })).toThrow();
    const a = { ...match, pieces: [], currentPlayer: 0 as const };
    const b = { ...match, pieces: [], currentPlayer: 1 as const };
    expect(publicPositionKey(a)).not.toBe(publicPositionKey(b));
  });

  it("retains repetition history while the players consider a draw", () => {
    const match = {
      ...createMatch("hidden-hasami", { width: 7, height: 7 }),
      phase: "play" as const,
      currentPlayer: 0 as const,
      positionCounts: { "known-position": 2 },
    };
    const offered = offerDraw(match, 0, match.turn);
    const acknowledged = acknowledgePass(offered, 1, match.turn);
    expect(acknowledged.positionCounts).toEqual({ "known-position": 2 });
  });
});
