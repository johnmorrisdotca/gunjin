import type { AuthoritativeMatch, Coordinate, MatchResult, Piece, Player } from "../types.ts";

export type SetupPiece = Coordinate & { kind: string };
export type MoveResolution = {
  pieces: readonly Piece[];
  captured: readonly Piece[];
  movedPiece?: Piece;
  winner?: Player | null;
  reason?: MatchResult["reason"];
  pendingFlagClaimant?: Player;
  clearPendingFlag?: boolean;
};

export type ModeRules = {
  mode: AuthoritativeMatch["mode"];
  defaultWidth: number;
  defaultHeight: number;
  acceptsSize: (width: number, height: number) => boolean;
  roster: (player: Player, width: number, height: number) => readonly string[];
  validateSetup: (player: Player, placements: readonly SetupPiece[]) => boolean;
  legalDestinations: (match: AuthoritativeMatch, piece: Piece) => readonly Coordinate[];
  resolveMove: (
    match: AuthoritativeMatch,
    piece: Piece,
    destination: Coordinate,
  ) => MoveResolution;
};
