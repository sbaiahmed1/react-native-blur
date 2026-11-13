import { MAX_SHEET_WIDTH, sheetLayout } from '../sheet-layout';

it('keeps the phone layout: the sheet spans the window minus its inset', () => {
  const layout = sheetLayout(390);
  expect(layout.sheetWidth).toBe(374);
  expect(layout.left).toBe(8);
  expect(layout.tileWidth).toBeCloseTo(103.33, 2);
  expect(layout.tileHeight).toBeCloseTo(layout.tileWidth * 1.7, 5);
});

it('caps the sheet on a wide web window and centers it', () => {
  const layout = sheetLayout(1280);
  expect(layout.sheetWidth).toBe(MAX_SHEET_WIDTH);
  expect(layout.left).toBe((1280 - MAX_SHEET_WIDTH) / 2);
  expect(layout.tileHeight).toBeLessThan(260);
});

it('never grows the tiles past the cap, however wide the window', () => {
  expect(sheetLayout(3840).tileWidth).toBe(sheetLayout(1280).tileWidth);
});
