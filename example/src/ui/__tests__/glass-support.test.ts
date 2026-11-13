import {
  chipFill,
  GLASS_FALLBACK_NOTICE,
  glassNotice,
  REDUCE_TRANSPARENCY_NOTICE,
} from '../glass-support';

describe('glassNotice', () => {
  it('says nothing when native glass renders', () => {
    expect(glassNotice(true, false)).toBeUndefined();
  });

  it('names the blur fallback where native glass is missing', () => {
    expect(glassNotice(false, false)).toBe(GLASS_FALLBACK_NOTICE);
  });

  it('names Reduce Transparency first, since it paints the fallback color on every version', () => {
    expect(glassNotice(true, true)).toBe(REDUCE_TRANSPARENCY_NOTICE);
    expect(glassNotice(false, true)).toBe(REDUCE_TRANSPARENCY_NOTICE);
  });
});

describe('chipFill', () => {
  it('leaves an unselected chip as plain glass', () => {
    for (const native of [true, false]) {
      for (const reduce of [true, false]) {
        expect(chipFill(false, native, reduce)).toBe('none');
      }
    }
  });

  it('lets native glass carry the accent tint', () => {
    expect(chipFill(true, true, false)).toBe('tint');
  });

  it('fills a selected chip solid where the tint is diluted or dropped', () => {
    expect(chipFill(true, false, false)).toBe('solid');
    expect(chipFill(true, false, true)).toBe('solid');
    expect(chipFill(true, true, true)).toBe('solid');
  });
});
