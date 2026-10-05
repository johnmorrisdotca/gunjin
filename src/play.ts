import {
  acceptDraw,
  acknowledgePass,
  legalMovesForCurrentPlayer,
  offerDraw,
  playMove,
  resignMatch,
  rosterForSetup,
  submitSetup,
  declineDraw,
} from "./index-core.ts";
import { drawGunjinBoard } from "./draw.ts";
import { GUNJIN_STYLE } from "./style.ts";
import { playerName, roleName, words } from "./strings.ts";
import { viewForPlayer, publicPosition } from "./views.ts";
import { encodePublicReplay } from "./replay.ts";
import { isCamp, isHeadquarters } from "./rules/luzhanqiMini.ts";
import type { AuthoritativeMatch, Coordinate, Player, PublicPosition } from "./types.ts";
import type { SetupPiece } from "./rules/types.ts";
import type { Language, Material, PieceStyle } from "./strings.ts";

/** Locale, materials, and safe public callbacks for a mounted hotseat player. */
export type MountOptions = {
  language?: Language;
  material?: Material;
  pieceStyle?: PieceStyle;
  onChange?: (position: PublicPosition) => void;
  onFinish?: (result: { winner: Player | null; reason: string }) => void;
};

/** Public controls returned by {@link mountGunjin}; no authoritative state is exposed. */
export type GunjinMount = {
  view: () => ReturnType<typeof viewForPlayer>;
  replay: () => string;
  set: (options: MountOptions) => void;
  destroy: () => void;
};

/** Mounts a hotseat player. Only redacted views and replay data leave this handle. */
export function mountGunjin(
  host: HTMLElement,
  initial: AuthoritativeMatch,
  initialOptions: MountOptions = {},
): GunjinMount {
  const document = host.ownerDocument;
  let match = initial;
  let options = { ...initialOptions };
  let draft: SetupPiece[] = [];
  let selected: Coordinate | null = null;
  let message = "";
  let destroyed = false;

  const root = document.createElement("div");
  const style = document.createElement("style");
  const status = document.createElement("p");
  const board = document.createElement("div");
  const tools = document.createElement("div");
  root.className = "gj-root";
  status.className = "gj-status";
  status.setAttribute("role", "status");
  board.className = "gj-board";
  tools.className = "gj-tools";
  style.textContent = GUNJIN_STYLE;
  root.append(style, status, board, tools);
  host.append(root);

  const language = () => options.language ?? "en";
  const copyView = () => viewForPlayer(match, match.currentPlayer);
  const emitChange = () => options.onChange?.(publicPosition(match));
  const button = (label: string, action: () => void, primary = false) => {
    const control = document.createElement("button");
    control.type = "button";
    control.textContent = label;
    if (primary) control.className = "gj-primary";
    control.addEventListener("click", action);
    tools.append(control);
  };

  const update = () => {
    if (destroyed) return;
    const w = words(language());
    const view = copyView();
    tools.replaceChildren();
    board.replaceChildren();

    if (match.phase === "pass") {
      status.textContent = message || w.pass;
      board.className = "gj-pass";
      const title = document.createElement("h2");
      title.textContent = playerName(language(), match.currentPlayer);
      const instruction = document.createElement("p");
      instruction.textContent = w.pass;
      const confirm = document.createElement("button");
      confirm.type = "button";
      confirm.className = "gj-primary";
      confirm.textContent = w.passButton;
      confirm.addEventListener("click", () => {
        try {
          match = acknowledgePass(match, match.currentPlayer, match.turn);
          draft = [];
          selected = null;
          message = "";
          emitChange();
          update();
        } catch {
          message = w.stale;
          update();
        }
      });
      board.append(title, instruction, confirm);
      return;
    }

    if (match.phase === "setup") {
      renderSetup(view);
      return;
    }

    renderPlay(view);
  };

  const renderSetup = (view: ReturnType<typeof viewForPlayer>) => {
    const w = words(language());
    status.textContent = message || w.setup;
    board.className = "gj-board";
    board.style.aspectRatio = `${match.width}/${match.height}`;
    board.style.setProperty("--gj-width", String(match.width));
    board.style.setProperty("--gj-height", String(match.height));
    board.innerHTML = drawGunjinBoard(view, {
      language: language(),
      material: options.material,
      pieceStyle: options.pieceStyle,
      draft,
    });
    const cells = makeCellButtons(view, []);
    cells.querySelectorAll<HTMLButtonElement>("button").forEach(button => {
      button.addEventListener("click", () => placeSetupAt(Number(button.dataset.cell)));
    });
    board.append(cells);

    const roster = rosterForSetup(match, match.currentPlayer);
    const setupCount = document.createElement("p");
    setupCount.className = "gj-setup-count";
    const currentRole = roster[draft.length];
    setupCount.textContent = currentRole
      ? `${roleName(language(), currentRole)} · ${draft.length + 1} / ${roster.length}`
      : `${draft.length} / ${roster.length}`;
    tools.append(setupCount);
    button(w.undoSetup, () => {
      draft = draft.slice(0, -1);
      message = "";
      update();
    }, false);
    button(w.submitSetup, submitCurrentSetup, true);
  };

  const placeSetupAt = (cell: number) => {
    const x = cell % match.width;
    const y = Math.floor(cell / match.width);
    const existing = draft.findIndex(piece => piece.x === x && piece.y === y);
    if (existing >= 0) {
      draft = draft.filter((_, index) => index !== existing);
      message = "";
      update();
      return;
    }
    const roster = rosterForSetup(match, match.currentPlayer);
    const kind = roster[draft.length];
    if (!kind || !allowedSetupCell(match, kind, { x, y })) return;
    draft = [...draft, { kind, x, y }];
    message = "";
    update();
  };

  const submitCurrentSetup = () => {
    try {
      match = submitSetup(match, match.currentPlayer, draft, match.setupStep);
      draft = [];
      message = "";
      emitChange();
      update();
    } catch {
      message = words(language()).invalidSetup;
      update();
    }
  };

  const renderPlay = (view: ReturnType<typeof viewForPlayer>) => {
    const w = words(language());
    status.textContent = match.result
      ? resultText(match.result.winner, match.result.reason)
      : message || (match.mode === "stratego-lite" ? w.captureFlagTurn : w.turn);
    board.className = "gj-board";
    board.style.aspectRatio = `${match.width}/${match.height}`;
    board.style.setProperty("--gj-width", String(match.width));
    board.style.setProperty("--gj-height", String(match.height));

    const destinations = selected
      ? legalMovesForCurrentPlayer(match, match.currentPlayer)
        .filter(move => sameCoordinate(move.from, selected!))
        .map(move => move.to)
      : [];
    board.innerHTML = drawGunjinBoard(view, {
      language: language(),
      material: options.material,
      pieceStyle: options.pieceStyle,
      selected,
      targets: destinations,
    });
    const cells = makeCellButtons(view, destinations);
    cells.querySelectorAll<HTMLButtonElement>("button").forEach(button => {
      button.addEventListener("click", () => chooseCell(Number(button.dataset.cell)));
    });
    board.append(cells);

    if (match.mode === "stratego-lite") {
      const battles = view.publicLog.filter(event => event.revealed?.length === 2).slice(-8);
      if (battles.length > 0) {
        const history = document.createElement("section");
        history.className = "gj-battle-history";
        history.setAttribute("aria-label", w.battleHistory);
        const heading = document.createElement("h2");
        heading.textContent = w.battleHistory;
        const list = document.createElement("ol");
        for (const event of battles) {
          const [attacker, defender] = event.revealed!;
          const item = document.createElement("li");
          item.textContent = `${w.battle} ${event.turn}: ${playerName(language(), attacker!.owner)} ${roleName(language(), attacker!.kind)} · ${playerName(language(), defender!.owner)} ${roleName(language(), defender!.kind)}`;
          list.append(item);
        }
        history.append(heading, list);
        root.insertBefore(history, tools);
      }
    }

    if (match.result) {
      button(w.newMatch, () => document.defaultView?.location.reload(), true);
      button(w.saveReplay, downloadReplay);
      return;
    }
    if (match.drawOffer !== undefined && match.drawOffer !== match.currentPlayer) {
      button(w.acceptDraw, acceptCurrentDraw);
      button(w.declineDraw, declineCurrentDraw);
    } else {
      button(w.offerDraw, offerCurrentDraw);
    }
    button(w.resign, resignCurrentGame);
    button(w.saveReplay, downloadReplay);
  };

  const downloadReplay = () => {
    const blob = new Blob([encodePublicReplay(match)], { type: "application/json" });
    const url = document.defaultView?.URL.createObjectURL(blob);
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = `gunjin-public-replay-${match.turn}.json`;
    link.click();
    document.defaultView?.URL.revokeObjectURL(url);
  };

  const chooseCell = (cell: number) => {
    if (match.phase !== "play") return;
    const coordinate = { x: cell % match.width, y: Math.floor(cell / match.width) };
    const moves = legalMovesForCurrentPlayer(match, match.currentPlayer);
    const isDestination = selected && moves.some(move =>
      sameCoordinate(move.from, selected!) && sameCoordinate(move.to, coordinate),
    );
    if (isDestination && selected) {
      try {
        const previous = match.result;
        match = playMove(match, match.currentPlayer, {
          from: selected,
          to: coordinate,
          expectedTurn: match.turn,
        });
        selected = null;
        message = "";
        emitChange();
        if (!previous && match.result) options.onFinish?.({ ...match.result });
      } catch {
        message = words(language()).stale;
      }
      update();
      return;
    }

    const ownPiece = match.pieces.find(piece =>
      piece.owner === match.currentPlayer && sameCoordinate(piece, coordinate),
    );
    selected = ownPiece ? coordinate : null;
    message = selected ? words(language()).selectTarget : words(language()).selectPiece;
    update();
  };

  const offerCurrentDraw = () => runTurnAction(offerDraw);
  const acceptCurrentDraw = () => runTurnAction(acceptDraw);
  const declineCurrentDraw = () => runTurnAction(declineDraw);
  const resignCurrentGame = () => runTurnAction(resignMatch);
  const runTurnAction = (
    action: (state: AuthoritativeMatch, player: Player, turn: number) => AuthoritativeMatch,
  ) => {
    try {
      match = action(match, match.currentPlayer, match.turn);
      emitChange();
      if (match.result) options.onFinish?.({ ...match.result });
      update();
    } catch {
      message = words(language()).stale;
      update();
    }
  };

  const makeCellButtons = (
    view: ReturnType<typeof viewForPlayer>,
    targets: readonly Coordinate[],
  ) => {
    const grid = document.createElement("div");
    grid.className = "gj-cells";
    grid.setAttribute("role", "group");
    grid.setAttribute("aria-label", words(language()).board);
    for (let cell = 0; cell < match.width * match.height; cell += 1) {
      const x = cell % match.width;
      const y = Math.floor(cell / match.width);
      const piece = view.pieces?.find(item => item.x === x && item.y === y);
      const label = piece?.kind
        ? `${playerName(language(), piece.owner)} ${roleName(language(), piece.kind)}`
        : piece?.hidden
          ? words(language()).opponent
          : "";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gj-cell";
      button.tabIndex = cell === 0 ? 0 : -1;
      button.dataset.cell = String(cell);
      button.setAttribute("aria-label", label || `${x + 1}, ${y + 1}`);
      button.setAttribute("aria-description", targets.some(target => target.x === x && target.y === y) ? words(language()).selectTarget : "");
      button.setAttribute("aria-keyshortcuts", "ArrowUp ArrowDown ArrowLeft ArrowRight Enter Space");
      button.addEventListener("keydown", event => {
        const moves: Record<string, Coordinate> = {
          ArrowUp: { x, y: y - 1 },
          ArrowDown: { x, y: y + 1 },
          ArrowLeft: { x: x - 1, y },
          ArrowRight: { x: x + 1, y },
        };
        const next = moves[event.key];
        if (!next || next.x < 0 || next.x >= match.width || next.y < 0 || next.y >= match.height) return;
        event.preventDefault();
        const index = next.y * match.width + next.x;
        const nextButton = grid.querySelector<HTMLButtonElement>(`button[data-cell="${index}"]`);
        if (nextButton) {
          grid.querySelectorAll<HTMLButtonElement>("button").forEach(cellButton => { cellButton.tabIndex = -1; });
          nextButton.tabIndex = 0;
          nextButton.focus();
        }
      });
      grid.append(button);
    }
    return grid;
  };

  const allowedSetupCell = (
    state: AuthoritativeMatch,
    kind: string,
    cell: Coordinate,
  ): boolean => {
    if (state.mode === "hidden-hasami") {
      return cell.y === (state.currentPlayer === 0 ? state.height - 1 : 0);
    }
    if (state.mode === "salpakan") {
      return state.currentPlayer === 0 ? cell.y >= 5 : cell.y <= 2;
    }
    if (state.mode === "gunjin-shogi") {
      const homeRows = state.currentPlayer === 0 ? [5, 6, 7, 8] : [0, 1, 2, 3];
      return homeRows.includes(cell.y) && !(kind === "mine" && ["3:5", "5:5", "3:3", "5:3"].includes(`${cell.x}:${cell.y}`));
    }
    if (state.mode === "stratego-lite") {
      const homeRows = state.currentPlayer === 0 ? [6, 7, 8, 9] : [0, 1, 2, 3];
      return homeRows.includes(cell.y);
    }
    const homeRow = state.currentPlayer === 0 ? 7 : 0;
    const frontRow = state.currentPlayer === 0 ? 6 : 1;
    if (isCamp(cell) || (cell.y !== homeRow && cell.y !== frontRow)) return false;
    if (kind === "mine" && cell.y !== homeRow) return false;
    if (kind === "bomb" && cell.y === frontRow) return false;
    if (kind === "flag" && !isHeadquarters(cell)) return false;
    return true;
  };

  const resultText = (winner: Player | null, reason: string): string => {
    const w = words(language());
    if (winner === null) return `${w.draw}. ${w.finishAgreed}`;
    const description: Record<string, string> = {
      "objective-captured": w.finishObjective,
      "capture-threshold": w.finishThreshold,
      blocked: w.finishBlocked,
      "flag-won": w.finishFlagWon,
      "flag-held": w.finishFlagHeld,
      repetition: w.finishRepetition,
      resigned: w.finishResigned,
      "agreed-draw": w.finishAgreed,
    };
    return `${playerName(language(), winner)} ${w.winner}. ${description[reason] ?? ""}`;
  };

  update();
  return {
    view: copyView,
    replay: () => encodePublicReplay(match),
    set: next => {
      options = { ...options, ...next };
      update();
    },
    destroy: () => {
      destroyed = true;
      root.remove();
    },
  };
}

function sameCoordinate(a: Coordinate, b: Coordinate): boolean {
  return a.x === b.x && a.y === b.y;
}
