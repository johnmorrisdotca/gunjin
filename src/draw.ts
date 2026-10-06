import { boardFeatures } from "./views.ts";
import { roleName, words } from "./strings.ts";
import type { Coordinate, PlayerView } from "./types.ts";
import type { Language, Material, PieceStyle } from "./strings.ts";
import type { SetupPiece } from "./rules/types.ts";

/** Visual settings and temporary selection marks for the role-redacted SVG renderer. */
export type DrawOptions = {
  language?: Language;
  material?: Material;
  pieceStyle?: PieceStyle;
  selected?: Coordinate | null;
  targets?: readonly Coordinate[];
  draft?: readonly SetupPiece[];
};

/** Draws only a redacted player view. Enemy identities never enter this renderer. */
export function drawGunjinBoard(view: PlayerView, options: DrawOptions = {}): string {
  const cellSize = 52;
  const language = options.language ?? "en";
  const palette = {
    ivory: { paper: "#f7f3e9", grid: "#d0c8b8", ink: "#273029", frame: "#a98954", water: "#a9cde0", shore: "#4f819c", wave: "#eef6fa" },
    wood: { paper: "#e5cda6", grid: "#bca582", ink: "#493e2f", frame: "#766040", water: "#8fb7c8", shore: "#3f6c80", wave: "#e6f1f5" },
    slate: { paper: "#262a27", grid: "#454a44", ink: "#ece8dc", frame: "#82877f", water: "#1f4257", shore: "#6aa3bf", wave: "#7fb4cf" },
  }[options.material ?? "ivory"];
  const featureSet = boardFeatures(view.mode, view.width, view.height);
  const markedPieces = (view.pieces ?? []).map(piece => ({
    x: piece.x,
    y: piece.y,
    owner: piece.owner,
    kind: piece.kind,
    id: piece.id,
  }));
  for (const piece of options.draft ?? []) {
    markedPieces.push({
      x: piece.x,
      y: piece.y,
      owner: view.viewer,
      kind: piece.kind,
      id: `draft-${markedPieces.length}`,
    });
  }
  const pieceAt = new Map(markedPieces.map(piece => [`${piece.x}:${piece.y}`, piece]));

  const cells = Array.from({ length: view.width * view.height }, (_, index) => {
    const x = index % view.width;
    const y = Math.floor(index / view.width);
    const coordinate = { x, y };
    const piece = pieceAt.get(`${x}:${y}`);
    const selected = sameCoordinate(options.selected, coordinate);
    const target = options.targets?.some(cell => sameCoordinate(cell, coordinate)) ?? false;
    const camp = featureSet.camps.some(cell => sameCoordinate(cell, coordinate));
    const headquarters = featureSet.headquarters.some(cell => sameCoordinate(cell, coordinate));
    const ownerColor = piece?.owner === 0 ? "#9b3932" : "#315d83";
    const base = `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="${camp ? "#c8d6bc" : headquarters ? "#e4d6ad" : palette.paper}" stroke="${palette.grid}"/>`;
    const marker = target
      ? `<rect x="${x * cellSize + 3}" y="${y * cellSize + 3}" width="${cellSize - 6}" height="${cellSize - 6}" rx="5" fill="#72a982" fill-opacity=".35" stroke="#34704b" stroke-width="2"/>`
      : selected
        ? `<rect x="${x * cellSize + 3}" y="${y * cellSize + 3}" width="${cellSize - 6}" height="${cellSize - 6}" rx="5" fill="#e2bc4b" fill-opacity=".42" stroke="#98762a" stroke-width="2"/>`
        : "";
    const featureText = camp
      ? `<text x="${x * cellSize + 26}" y="${y * cellSize + 48}" text-anchor="middle" fill="#465c40" font-size="8">${words(language).camp}</text>`
      : headquarters
        ? `<text x="${x * cellSize + 26}" y="${y * cellSize + 48}" text-anchor="middle" fill="#6b5c36" font-size="8">HQ</text>`
        : "";
    const pieceSvg = piece
      ? drawPiece(piece, ownerColor, cellSize, language, options.pieceStyle ?? "ink")
      : "";
    return `<g>${base}${marker}${featureText}${pieceSvg}</g>`;
  }).join("");

  const lakes = lakeRegions(featureSet.lakes).map(region => drawLake(region, cellSize, palette, words(language).lake)).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${view.width * cellSize + 4} ${view.height * cellSize + 4}" role="img" aria-label="${words(language).title}" style="display:block;width:100%;height:auto;background:${palette.paper}">${cells}${lakes}<rect width="${view.width * cellSize}" height="${view.height * cellSize}" fill="none" stroke="${palette.frame}" stroke-width="2"/></svg>`;
}

/** Groups lake squares that touch along a side, so that each lake is drawn once as one piece of water. */
function lakeRegions(lakes: readonly Coordinate[]): Coordinate[][] {
  const remaining = new Map(lakes.map(cell => [`${cell.x}:${cell.y}`, cell]));
  const regions: Coordinate[][] = [];
  for (const [key, start] of remaining) {
    if (!remaining.has(key)) continue;
    const region: Coordinate[] = [];
    const queue = [start];
    remaining.delete(key);
    while (queue.length > 0) {
      const cell = queue.pop()!;
      region.push(cell);
      for (const next of [{ x: cell.x + 1, y: cell.y }, { x: cell.x - 1, y: cell.y }, { x: cell.x, y: cell.y + 1 }, { x: cell.x, y: cell.y - 1 }]) {
        const nextKey = `${next.x}:${next.y}`;
        const found = remaining.get(nextKey);
        if (found) {
          remaining.delete(nextKey);
          queue.push(found);
        }
      }
    }
    regions.push(region);
  }
  return regions;
}

/** One lake: water with a shore line, and two ripples in each square. No piece may enter or cross it. */
function drawLake(
  region: readonly Coordinate[],
  cellSize: number,
  palette: { water: string; shore: string; wave: string },
  label: string,
): string {
  const left = Math.min(...region.map(cell => cell.x));
  const top = Math.min(...region.map(cell => cell.y));
  const right = Math.max(...region.map(cell => cell.x)) + 1;
  const bottom = Math.max(...region.map(cell => cell.y)) + 1;
  const ripples = region.map(cell => {
    const x = cell.x * cellSize;
    const y = cell.y * cellSize;
    return `<path d="M${x + 9} ${y + 20}q4.25-5 8.5 0t8.5 0t8.5 0t8.5 0M${x + 9} ${y + 34}q4.25-5 8.5 0t8.5 0t8.5 0t8.5 0" fill="none" stroke="${palette.wave}" stroke-width="2" stroke-linecap="round"/>`;
  }).join("");
  return `<g data-lake="true" aria-label="${escapeAttribute(label)}"><rect x="${left * cellSize + 2}" y="${top * cellSize + 2}" width="${(right - left) * cellSize - 4}" height="${(bottom - top) * cellSize - 4}" rx="10" fill="${palette.water}" stroke="${palette.shore}" stroke-width="2"/>${ripples}</g>`;
}

function drawPiece(
  piece: { x: number; y: number; owner: 0 | 1; kind: string | null; id?: string },
  color: string,
  cellSize: number,
  language: Language,
  style: PieceStyle,
): string {
  const centerX = piece.x * cellSize + cellSize / 2;
  const centerY = piece.y * cellSize + cellSize / 2;
  const hidden = piece.kind === null;
  const tile = style === "tiles";
  const radius = tile ? 17 : 18;
  const shape = tile
    ? `<rect x="${centerX - radius}" y="${centerY - radius}" width="${radius * 2}" height="${radius * 2}" rx="5" fill="${color}" stroke="#fff" stroke-width="1.5"/>`
    : `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="${color}" stroke="#fff" stroke-width="1.5"/>`;
  const label = hidden ? "●" : escapeText(roleGlyph(piece.kind!, language));
  const colorText = hidden ? "#fff" : "#fff";
  const kindAttr = hidden ? "" : `data-kind="${escapeAttribute(piece.kind!)}"`;
  const idAttr = !hidden && piece.id ? `data-piece="${escapeAttribute(piece.id)}"` : "";
  const aria = hidden ? words(language).opponent : roleName(language, piece.kind!);
  return `<g data-owner="${piece.owner}" data-hidden="${hidden}" ${kindAttr} ${idAttr} aria-label="${escapeAttribute(aria)}">${shape}<text x="${centerX}" y="${centerY + 5}" text-anchor="middle" fill="${colorText}" font-size="${hidden ? 18 : 12}" font-family="system-ui,sans-serif" font-weight="700">${label}</text></g>`;
}

function roleGlyph(kind: string, language: Language): string {
  const glyphs: Record<string, string> = {
    leader: "L", guard: "G", commander: "C", officer: "O", soldier: "S",
    engineer: "E", bomb: "B", mine: "M", flag: "F", private: "P", spy: "?",
    "five-star": "5★", "four-star": "4★", "three-star": "3★",
    "two-star": "2★", "one-star": "1★", colonel: "Co", "lieutenant-colonel": "LtC",
    major: "Maj", captain: "Cap", "first-lieutenant": "1L", "second-lieutenant": "2L",
    sergeant: "Sgt",
    marshal: "Ma", general: "Ge", miner: "Mi",
    lieutenant: "Lt", "lieutenant-general": "LGen", "major-general": "MGen",
    aircraft: "Air", tank: "T", cavalry: "Cav",
  };
  if (language === "ja") return glyphs[kind] ?? "駒";
  return glyphs[kind] ?? roleName(language, kind).slice(0, 2);
}

function sameCoordinate(a: Coordinate | null | undefined, b: Coordinate): boolean {
  return a?.x === b.x && a.y === b.y;
}

function escapeAttribute(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeText(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
