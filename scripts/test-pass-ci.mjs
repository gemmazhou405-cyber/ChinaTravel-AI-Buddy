// Check the offline membership gate without dispatching CI or contacting providers.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const workflow = readFileSync(new URL('../.github/workflows/free-itinerary-review.yml', import.meta.url), 'utf8');
const scripts = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).scripts;
const paths = workflow.split('    paths:\n')[1]?.split('\npermissions:')[0] || '';
for (const path of [
  '.github/workflows/free-itinerary-review.yml',
  'functions/_shared/**', 'functions/api/claim.js', 'functions/api/recover.js',
  'functions/api/pass.js', 'functions/api/devices/**', 'functions/api/buddy/**',
  'functions/api/leads/trip.js', 'functions/api/gumroad/webhook.js',
  'src/App.tsx', 'src/hooks/usePass.ts', 'src/components/PassDashboard.tsx',
  'src/components/ClaimModal.tsx', 'src/lib/membership.ts', 'src/lib/deviceId.ts',
  'scripts/test-pass-*.mjs', 'scripts/test-paid-chat-quota.mjs', '.env.example',
]) assert.ok(paths.includes(`- '${path}'`), `${path} must trigger the membership gate`);

const gate = workflow.split('      - name: Run membership and access regressions\n')[1]?.split('\n      - ')[0] || '';
for (const command of [
  'npm run test:pass-ci', 'npm run test:pass-p0', 'npm run test:pass-entitlements',
  'npm run test:pass-dashboard', 'npm run test:pass-firestore -- --self-test',
  'npm run test:buddy', 'npm run test:free-chat-quota', 'npm run test:paid-chat-quota',
]) {
  assert.ok(gate.split('\n').some((line) => line.trim() === command), `${command} must run in CI`);
  assert.ok(scripts[command.split(' ')[2]], `${command} must have an npm script`);
}
assert.match(gate, /shell: bash/);
assert.match(gate, /set -euo pipefail/);
assert.match(gate, /NODE_PATH: \$\{\{ runner\.temp \}\}\/chinaease-browser-tests\/node_modules/);
assert.match(gate, /PLAYWRIGHT_BROWSERS_PATH: \$\{\{ runner\.temp \}\}\/chinaease-browsers/);
assert.match(workflow, /playwright@1\.62\.1/);
assert.doesNotMatch(workflow, /continue-on-error|\|\|\s*true|secrets\./, 'membership regressions must fail the job and need no credentials');
assert.doesNotMatch(workflow, /test:pass-firestore[^\n]*--run\b/, 'CI must not write to real Firestore');
assert.doesNotMatch(gate, /^\s+if:/m, 'the membership gate must not be conditionally skipped');

// Exercise the actual run block with npm replaced by a shell function. No package,
// browser or cloud command executes; a failing test must stop every later test.
const run = gate.split('        run: |\n')[1]?.trimEnd().split('\n').map((line) => line.replace(/^ {10}/, '')).join('\n') || '';
const lines = run.split('\n').filter(Boolean);
assert.ok(lines.every((line) => line === 'set -euo pipefail' || /^npm run test:[a-z0-9-]+(?: -- --self-test)?$/.test(line)), 'the simulated gate only permits offline npm test commands');
const commands = lines.filter((line) => line.startsWith('npm ')).map((line) => line.slice(4));
for (let index = 0; index < commands.length; index++) {
  const result = spawnSync('/bin/bash', ['-c', `npm() { printf '%s\\n' "$*"; if [ "$*" = "$FAIL_STEP" ]; then return 17; fi; };\n${run}`], {
    encoding: 'utf8', env: { PATH: process.env.PATH, FAIL_STEP: commands[index] },
  });
  assert.equal(result.status, 17, `${commands[index]} must fail the CI shell`);
  assert.deepEqual(result.stdout.trim().split('\n'), commands.slice(0, index + 1), 'no later test may run after a failure');
}
console.log('PASS: membership paths trigger offline regressions; failures are fatal; isolated browser tooling is explicit; no cloud credentials or Firestore run.');
