#!/usr/bin/env node
// Checks that spm-headers/ReactNativeBlur-Swift.h, the hand-written header used by
// SwiftPM builds, declares every helper selector the Objective-C++ sources call and
// every @objc method the Swift helpers expose. spm-support/SwiftHeaderPin.swift only
// pins what it lists, so a new helper method used from a .mm file can go missing from
// the header unnoticed until a SwiftPM build fails.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const header = readFileSync(
  join(root, 'spm-headers/ReactNativeBlur-Swift.h'),
  'utf8'
);

// Selectors declared per @interface in the header.
const declared = new Map();
for (const [, cls, body] of header.matchAll(
  /@interface\s+(\w+)[^\n]*\n([\s\S]*?)@end/g
)) {
  const selectors = new Set();
  for (const [, decl] of body.matchAll(/^[+-]\s*\([^)]*\)\s*([^;]+);/gm)) {
    selectors.add(selectorOfObjcDecl(decl));
  }
  declared.set(cls, selectors);
}

function selectorOfObjcDecl(decl) {
  // "updateX:(T *)view withY:(U)y" -> "updateX:withY:"; "getContentView" -> "getContentView"
  const labels = [
    ...decl.replace(/\([^)]*\)/g, ' ').matchAll(/(\w+)\s*:/g),
  ].map((m) => m[1]);
  return labels.length ? labels.map((l) => `${l}:`).join('') : decl.trim();
}

const helperClasses = [...declared.keys()].filter((c) => c.endsWith('Helper'));
const problems = [];

// 1. Every helper message sent from ios/*.mm must be declared.
const iosDir = join(root, 'ios');
for (const file of readdirSync(iosDir).filter((f) => f.endsWith('.mm'))) {
  const src = readFileSync(join(iosDir, file), 'utf8');
  for (const cls of helperClasses) {
    for (const match of src.matchAll(new RegExp(`\\[${cls}\\s+`, 'g'))) {
      const selector = selectorOfMessage(src, match.index + match[0].length);
      if (!declared.get(cls).has(selector)) {
        const line = src.slice(0, match.index).split('\n').length;
        problems.push(
          `ios/${file}:${line} calls +[${cls} ${selector}], which the header does not declare`
        );
      }
    }
  }
}

function selectorOfMessage(src, start) {
  // Walk the message body at bracket depth 0, collecting "label:" parts.
  let depth = 0;
  let body = '';
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (c === '[' || c === '(' || c === '{') depth++;
    else if (c === ')' || c === '}') depth--;
    else if (c === ']') {
      if (depth === 0) break;
      depth--;
    }
    body += depth === 0 ? c : ' ';
  }
  const labels = [...body.matchAll(/(\w+)\s*:/g)].map((m) => `${m[1]}:`);
  return labels.length ? labels.join('') : body.trim();
}

// 2. Every @objc static func on a Swift helper must be declared.
const helpersDir = join(root, 'ios/Helpers');
for (const file of readdirSync(helpersDir).filter((f) =>
  f.endsWith('.swift')
)) {
  const src = readFileSync(join(helpersDir, file), 'utf8');
  const cls = src.match(/class\s+(\w+Helper)\b/)?.[1];
  if (!cls) continue;
  if (!declared.has(cls)) {
    problems.push(
      `ios/Helpers/${file}: class ${cls} has no @interface in the header`
    );
    continue;
  }
  for (const [, name, params] of src.matchAll(
    /@objc\s+(?:public\s+)?static\s+func\s+(\w+)\s*\(([^)]*)\)/g
  )) {
    const selector = selectorOfSwiftFunc(name, params);
    if (!declared.get(cls).has(selector)) {
      problems.push(
        `ios/Helpers/${file}: ${cls}.${name} (${selector}) is not declared in the header`
      );
    }
  }
}

function selectorOfSwiftFunc(name, params) {
  const labels = params
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => p.split(/\s+/)[0].replace(/:$/, ''));
  if (!labels.length) return name;
  return labels
    .map((label, i) => (i === 0 ? `${name}:` : `${label}:`))
    .join('');
}

if (problems.length) {
  console.error('spm-headers/ReactNativeBlur-Swift.h is out of sync:\n');
  for (const p of problems) console.error(`  - ${p}`);
  console.error(
    '\nAdd the declarations to the header and the calls to spm-support/SwiftHeaderPin.swift.'
  );
  process.exit(1);
}
console.log(
  `SwiftPM header OK (${helperClasses.length} helper classes checked).`
);
