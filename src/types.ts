/** The player whose private side is red. */
export type Player = 0 | 1;
export type GameMode = "hidden-hasami" | "luzhanqi-mini" | "salpakan";
export type Coordinate = { x: number; y: number };

/** Authoritative role-bearing piece. Keep this type and full match state on a trusted host. */
export type Piece = Coordinate & {
  id: string;
  owner: Player;
  kind: string;
};

export type MatchPhase = "setup" | "pass" | "play" | "finished";
export type PassPurpose = "setup" | "play" | "draw";
export type MatchResult = {
  winner: Player | null;
  reason: "objective-captured" | "capture-threshold" | "blocked" | "flag-won" | "flag-held" | "resigned" | "agreed-draw" | "repetition";
};

export type PublicEvent = {
  turn: number;
  player: Player;
  from?: Coordinate;
  to?: Coordinate;
  capturedCells: readonly Coordinate[];
  capturedCount: number;
  outcome?: MatchResult;
};

/** Full role-bearing state. This is for trusted referees or a private host process only. */
export type AuthoritativeMatch = {
  mode: GameMode;
  width: number;
  height: number;
  phase: MatchPhase;
  currentPlayer: Player;
  passPurpose?: PassPurpose;
  setupStep: number;
  turn: number;
  privateSetups: readonly [readonly Piece[], readonly Piece[]];
  pieces: readonly Piece[];
  pendingFlagClaimant?: Player;
  drawOffer?: Player;
  positionCounts: Readonly<Record<string, number>>;
  log: readonly PublicEvent[];
  result?: MatchResult;
};

/** Move requests are public, deterministic and rejected if their turn is stale. */
export type MoveAction = {
  from: Coordinate;
  to: Coordinate;
  expectedTurn: number;
};

/** Player-facing piece. Opponent `kind` is always null and opponent IDs are omitted. */
export type ViewedPiece = Coordinate & {
  owner: Player;
  kind: string | null;
  hidden: boolean;
  id?: string;
};

export type PlayerView = {
  mode: GameMode;
  phase: MatchPhase;
  viewer: Player;
  currentPlayer: Player;
  width: number;
  height: number;
  pieces: readonly ViewedPiece[] | null;
  turn: number;
  setupStep: number;
  ownSetup: readonly Piece[] | null;
  publicLog: readonly PublicEvent[];
  result?: MatchResult;
  drawOffer?: Player;
};

export type PublicPosition = {
  mode: GameMode;
  phase: MatchPhase;
  width: number;
  height: number;
  pieces: readonly Omit<ViewedPiece, "kind" | "id">[] | null;
  turn: number;
  result?: MatchResult;
};

/** A shareable public record. It contains no piece roles, IDs, or setup layouts. */
export type PublicReplay = {
  version: 1;
  mode: GameMode;
  width: number;
  height: number;
  events: readonly PublicEvent[];
  result?: MatchResult;
};

export type SetupSize = { width?: number; height?: number };
