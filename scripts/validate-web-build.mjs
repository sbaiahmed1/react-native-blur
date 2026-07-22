#!/usr/bin/env node
/**
 * Validates the built entries after `bob build`.
 *
 * The built web graph must stay correct even under bundlers with no
 * platform-extension support (Metro resolves fully-specified .js imports
 * exactly and only platform-expands extensionless ones; plain webpack/Vite
 * know no platform extensions at all). So:
 *   - the web graph (lib/module/index.web.js), resolved the worst-case way
 *     (exact file, else specifier + '.js'), must resolve completely, never
 *     reach a codegen spec module (which calls codegenNativeComponent at load
 *     time — bob ships the raw .ts specs alongside the compiled output), and
 *     never depend on platform expansion to avoid one;
 *   - the native graph (lib/module/index.js), resolved the way consumers'
 *     Metro does (sourceExts also cover the shipped raw .ts/.tsx specs), must
 *     resolve completely and never reach a .web.js module.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const libModule = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'lib',
  'module'
);

const IMPORT_RE = /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]/g;
const SIDE_EFFECT_IMPORT_RE = /import\s*['"]([^'"]+)['"]/g;

function relativeSpecifiers(source) {
  const specs = new Set();
  for (const re of [IMPORT_RE, SIDE_EFFECT_IMPORT_RE]) {
    re.lastIndex = 0;
    for (const match of source.matchAll(re)) {
      if (match[1].startsWith('.')) specs.add(match[1]);
    }
  }
  return specs;
}

function walkGraph(entry, { requireUnambiguousWeb, extensions }) {
  const seen = new Set();
  const errors = [];
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    if (!existsSync(file)) {
      errors.push(`missing file: ${path.relative(libModule, file)}`);
      continue;
    }
    // Raw .ts/.tsx codegen specs are never parsed for imports — reaching one
    // is already reported by the caller's forbidden-file checks.
    if (!file.endsWith('.js')) continue;
    for (const spec of relativeSpecifiers(readFileSync(file, 'utf8'))) {
      const base = path.resolve(path.dirname(file), spec);
      const from = path.relative(libModule, file);
      const candidates = [base, ...extensions.map((ext) => `${base}${ext}`)];
      const resolved = candidates.find((candidate) => existsSync(candidate));
      if (resolved == null) {
        errors.push(`'${spec}' in ${from} does not resolve`);
        continue;
      }
      if (
        requireUnambiguousWeb &&
        !spec.endsWith('.web') &&
        existsSync(`${base}.web.js`)
      ) {
        errors.push(
          `'${spec}' in ${from} relies on platform expansion to reach its .web variant`
        );
      }
      queue.push(resolved);
    }
  }
  return { seen, errors };
}

const failures = [];

const web = walkGraph(path.join(libModule, 'index.web.js'), {
  requireUnambiguousWeb: true,
  // Worst-case (platform-unaware) bundler resolution.
  extensions: ['.js'],
});
failures.push(...web.errors.map((e) => `web graph: ${e}`));
for (const file of web.seen) {
  if (/NativeComponent\.(js|ts)$/.test(file)) {
    failures.push(
      `web graph reaches native codegen module: ${path.relative(libModule, file)}`
    );
  }
}

const native = walkGraph(path.join(libModule, 'index.js'), {
  requireUnambiguousWeb: false,
  // Consumers' Metro sourceExts also resolve the shipped raw specs.
  extensions: ['.js', '.ts', '.tsx'],
});
failures.push(...native.errors.map((e) => `native graph: ${e}`));
for (const file of native.seen) {
  if (/\.web\.js$/.test(file)) {
    failures.push(
      `native graph reaches web module: ${path.relative(libModule, file)}`
    );
  }
}

if (failures.length > 0) {
  console.error('validate-web-build failed:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(
  `validate-web-build ok: web graph ${web.seen.size} modules, native graph ${native.seen.size} modules`
);
