#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const NUM = '(\\d+(?:\\.\\d+)?)';

// The first match wins, so the process-wide summary beats any later block.
const PATTERNS = {
  totalFrames: new RegExp(`^Total frames rendered:\\s*${NUM}`),
  janky: new RegExp(`^Janky frames:\\s*${NUM}\\s*\\(${NUM}%\\)`),
  p50: new RegExp(`^50th percentile:\\s*${NUM}ms`),
  p90: new RegExp(`^90th percentile:\\s*${NUM}ms`),
  p95: new RegExp(`^95th percentile:\\s*${NUM}ms`),
  p99: new RegExp(`^99th percentile:\\s*${NUM}ms`),
};

function findFirst(lines, pattern) {
  for (const line of lines) {
    const match = pattern.exec(line);
    if (match) return match;
  }
  return null;
}

function parseGfxinfo(text) {
  const lines = String(text)
    .split('\n')
    .map((line) => line.trim());
  const value = (key) => {
    const match = findFirst(lines, PATTERNS[key]);
    return match ? Number(match[1]) : null;
  };
  const janky = findFirst(lines, PATTERNS.janky);
  return {
    totalFrames: value('totalFrames'),
    jankyFrames: janky ? Number(janky[1]) : null,
    jankyPct: janky ? Number(janky[2]) : null,
    p50: value('p50'),
    p90: value('p90'),
    p95: value('p95'),
    p99: value('p99'),
  };
}

function cell(value) {
  return value === null || value === undefined ? 'n/a' : String(value);
}

function formatTable(rows) {
  const lines = [
    '| Scene | Frames | Janky % | p50 ms | p90 ms | p99 ms |',
    '| --- | --- | --- | --- | --- | --- |',
  ];
  for (const row of rows) {
    const cells = [
      row.scene,
      row.totalFrames,
      row.jankyPct,
      row.p50,
      row.p90,
      row.p99,
    ].map(cell);
    lines.push(`| ${cells.join(' | ')} |`);
  }
  return lines.join('\n');
}

function readTableRows(dir) {
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => {
      const result = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
      const scene = result.query
        ? `${result.scene} ${result.query}`
        : result.scene;
      return { ...result, scene };
    });
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args[0] === '--table') {
    if (!args[1]) {
      console.error('usage: parse-gfxinfo.js --table <dir>');
      process.exit(1);
    }
    console.log(formatTable(readTableRows(args[1])));
  } else {
    console.log(JSON.stringify(parseGfxinfo(fs.readFileSync(0, 'utf8'))));
  }
}

module.exports = { parseGfxinfo, formatTable };
