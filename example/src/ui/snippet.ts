type PropValue = string | number | boolean | undefined;

/** JSX for `component` with only the props that differ from `defaults`, in key order. */
export function toSnippet(
  component: string,
  props: Record<string, PropValue>,
  defaults: Record<string, PropValue>
): string {
  const attrs = Object.keys(props)
    .filter((key) => props[key] !== undefined && props[key] !== defaults[key])
    .map((key) => {
      const value = props[key];
      return typeof value === 'string'
        ? `${key}="${value}"`
        : `${key}={${value}}`;
    });
  return attrs.length
    ? `<${component} ${attrs.join(' ')} />`
    : `<${component} />`;
}
