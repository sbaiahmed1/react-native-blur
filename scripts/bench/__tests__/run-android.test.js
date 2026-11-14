const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const SCRIPT = path.join(__dirname, '..', 'run-android.sh');
const RESULTS = path.join(__dirname, '..', '..', '..', 'benchmarks', 'results');
const FAKE_SHA = 'fake000';

const GFXINFO = [
  'Total frames rendered: 600',
  'Janky frames: 6 (1.00%)',
  '50th percentile: 9ms',
  '90th percentile: 14ms',
  '95th percentile: 18ms',
  '99th percentile: 34ms',
]
  .map((line) => `'${line}'`)
  .join(' ');

function stubBin({ debuggable }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-stub-'));
  const write = (name, body) =>
    fs.writeFileSync(path.join(dir, name), `#!/usr/bin/env bash\n${body}\n`, {
      mode: 0o755,
    });
  const flags = debuggable ? 'DEBUGGABLE HAS_CODE' : 'HAS_CODE';
  write(
    'adb',
    `case "$*" in
  get-state) echo device ;;
  "shell dumpsys package "*) echo "    flags=[ ${flags} ]" ;;
  "shell dumpsys gfxinfo "*" reset") ;;
  "shell dumpsys gfxinfo "*) printf '%s\\n' ${GFXINFO} ;;
esac`
  );
  write(
    'git',
    `case "$*" in
  *"describe --always --dirty"*) echo ${FAKE_SHA}-dirty ;;
  *"rev-parse --short HEAD"*) echo ${FAKE_SHA} ;;
esac`
  );
  write('sleep', 'exit 0');
  return dir;
}

function run(stubs) {
  return spawnSync('bash', [SCRIPT, 'blur-list', 'count=3'], {
    encoding: 'utf8',
    env: { ...process.env, PATH: `${stubs}:${process.env.PATH}` },
  });
}

afterEach(() => {
  for (const label of [FAKE_SHA, `${FAKE_SHA}-dirty`]) {
    fs.rmSync(path.join(RESULTS, label), { recursive: true, force: true });
  }
});

it('refuses a debuggable build and writes no result', () => {
  const result = run(stubBin({ debuggable: true }));
  expect(result.status).not.toBe(0);
  expect(result.stderr).toMatch(/debuggable/i);
  expect(fs.existsSync(path.join(RESULTS, FAKE_SHA))).toBe(false);
  expect(fs.existsSync(path.join(RESULTS, `${FAKE_SHA}-dirty`))).toBe(false);
});

it('labels results from an uncommitted tree as dirty', () => {
  const result = run(stubBin({ debuggable: false }));
  expect(result.status).toBe(0);
  expect(result.stdout.trim()).toBe(
    path.join(RESULTS, `${FAKE_SHA}-dirty`, 'blur-list-count-3.json')
  );
  const json = JSON.parse(fs.readFileSync(result.stdout.trim(), 'utf8'));
  expect(json).toMatchObject({ scene: 'blur-list', totalFrames: 600, p50: 9 });
});
