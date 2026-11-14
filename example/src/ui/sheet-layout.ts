export const SHEET_GAP = 12;
export const SHEET_INSET = 8;
export const SHEET_PADDING = 20;

/** Widest the backdrop sheet gets, so a desktop web window keeps a phone sized sheet. */
export const MAX_SHEET_WIDTH = 440;

/** Sheet width, its left edge and the three preview tiles for a window width. */
export function sheetLayout(windowWidth: number) {
  const sheetWidth = Math.min(windowWidth - 2 * SHEET_INSET, MAX_SHEET_WIDTH);
  const tileWidth = (sheetWidth - 2 * SHEET_PADDING - 2 * SHEET_GAP) / 3;
  return {
    sheetWidth,
    left: (windowWidth - sheetWidth) / 2,
    tileWidth,
    tileHeight: tileWidth * 1.7,
  };
}
