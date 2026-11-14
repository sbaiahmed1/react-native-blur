import { toSnippet } from '../snippet';

it('prints only non-default props', () => {
  expect(
    toSnippet(
      'BlurView',
      { blurType: 'dark', blurAmount: 10, overlayColor: undefined },
      { blurType: 'xlight', blurAmount: 10 }
    )
  ).toBe('<BlurView blurType="dark" />');
});

it('prints numbers and booleans in braces', () => {
  expect(
    toSnippet(
      'LiquidGlassView',
      { glassOpacity: 0.8, isInteractive: false },
      { glassOpacity: 1, isInteractive: true }
    )
  ).toBe('<LiquidGlassView glassOpacity={0.8} isInteractive={false} />');
});

it('prints a bare tag when everything is default', () => {
  expect(toSnippet('BlurView', { blurAmount: 10 }, { blurAmount: 10 })).toBe(
    '<BlurView />'
  );
});
