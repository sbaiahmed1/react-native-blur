export const SHEET_GAP = 12;
export const SHEET_INSET = 8;
export const SHEET_PADDING = 20;

/** Widest the backdrop sheet gets, so a desktop web window keeps a phone sized sheet. */
export const MAX_SHEET_WIDTH = 440;

/** Height of everything in the sheet besides the tiles: padding, header, note, labels and the bottom inset. */
export const SHEET_CHROME = 200;

const MIN_TILE_HEIGHT = 80;

/** Sheet width, its left edge and the three preview tiles for a window size. */
export function sheetLayout(windowWidth: number, windowHeight = Infinity) {
  const sheetWidth = Math.min(windowWidth - 2 * SHEET_INSET, MAX_SHEET_WIDTH);
  const tileWidth = (sheetWidth - 2 * SHEET_PADDING - 2 * SHEET_GAP) / 3;
  // A short window, such as a phone in landscape, shrinks the tiles so Done stays on screen.
  const fit = Math.max(MIN_TILE_HEIGHT, windowHeight - SHEET_CHROME);
  return {
    sheetWidth,
    left: (windowWidth - sheetWidth) / 2,
    tileWidth,
    tileHeight: Math.min(tileWidth * 1.7, fit),
  };
}
