const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..', '..');

it('runs every scene the example registers', () => {
  const registry = fs.readFileSync(
    path.join(ROOT, 'example', 'src', 'benchmark', 'scenes.ts'),
    'utf8'
  );
  const script = fs.readFileSync(
    path.join(ROOT, 'scripts', 'bench', 'run-all-android.sh'),
    'utf8'
  );
  const registered = [...registry.matchAll(/id: '([^']+)',/g)].map((m) => m[1]);
  const runs = script.match(/RUNS=\(([\s\S]*?)\n\)/)[1];
  const listed = [...runs.matchAll(/"([\w-]+)/g)].map((m) => m[1]);
  expect(new Set(listed)).toEqual(new Set(registered));
});
