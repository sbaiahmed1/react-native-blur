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

function stubBin({
  debuggable,
  alive = true,
  gfxinfoFails = false,
  gfxinfo = GFXINFO,
}) {
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
  "shell dumpsys gfxinfo "*) ${gfxinfoFails ? 'exit 1' : `printf '%s\\n' ${gfxinfo}`} ;;
  "shell pidof "*) ${alive ? 'echo 4242' : 'exit 1'} ;;
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

function run(stubs, args = ['blur-list', 'count=3']) {
  return spawnSync('bash', [SCRIPT, ...args], {
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

function labelFiles() {
  const dir = path.join(RESULTS, `${FAKE_SHA}-dirty`);
  return fs.existsSync(dir) ? fs.readdirSync(dir) : [];
}

it('fails and writes no result when the app is gone after the window', () => {
  const result = run(stubBin({ debuggable: false, alive: false }));
  expect(result.status).not.toBe(0);
  expect(result.stderr).toMatch(/not running/i);
  expect(labelFiles()).toEqual([]);
});

it('leaves no partial file when a step fails', () => {
  const result = run(stubBin({ debuggable: false, gfxinfoFails: true }));
  expect(result.status).not.toBe(0);
  expect(labelFiles()).toEqual([]);
});

it('fails and writes no result when the dump has no frame summary', () => {
  const result = run(
    stubBin({
      debuggable: false,
      gfxinfo: `'No process found for: com.sbaiahmed1.reactnativeblurexampleapp'`,
    })
  );
  expect(result.status).not.toBe(0);
  expect(result.stderr).toMatch(/no frame summary/i);
  expect(labelFiles()).toEqual([]);
});

it('warns when the label folder already holds results', () => {
  const dir = path.join(RESULTS, FAKE_SHA);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'old.json'),
    JSON.stringify({ scene: 'old', totalFrames: 1 })
  );
  const stubs = stubBin({ debuggable: false });
  const result = spawnSync(
    'bash',
    [path.join(__dirname, '..', 'run-all-android.sh'), FAKE_SHA],
    {
      encoding: 'utf8',
      env: { ...process.env, PATH: `${stubs}:${process.env.PATH}` },
    }
  );
  expect(result.status).toBe(0);
  expect(result.stderr).toMatch(/already holds/i);
});
