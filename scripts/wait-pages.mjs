#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const targetOrg = readOption('--target-org') || process.env.LLMWIKI_TARGET_ORG || 'knowledge-bridge-labs';
const docsRepo = `${targetOrg}/llmwiki-docs`;
const docsUrl = `https://${targetOrg}.github.io/llmwiki-docs/`;
const dispatch = process.argv.includes('--dispatch');
const dryRun = process.argv.includes('--dry-run');
const attempts = Number(readOption('--attempts') || 24);
const delayMs = Number(readOption('--delay-ms') || 5000);

function readOption(name) {
  const prefix = `${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));
  return value ? value.slice(prefix.length).trim() : '';
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    ...options
  });
  return {
    ok: result.status === 0,
    status: result.status ?? 1,
    stdout: result.stdout?.trim() ?? '',
    stderr: result.stderr?.trim() || result.error?.message || ''
  };
}

function resultMessage(result) {
  return result.stderr || result.stdout || `exit ${result.status}`;
}

function parseJson(label, text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label}: could not parse JSON (${error.message})`);
  }
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function commandLine(command, args) {
  return `${command} ${args.map((arg) => (arg.includes(' ') ? JSON.stringify(arg) : arg)).join(' ')}`;
}

function latestPagesRun({ expectedHeadSha = '', createdAfter = '' } = {}) {
  const result = run('gh', [
    'run',
    'list',
    '-R',
    docsRepo,
    '-w',
    'pages.yml',
    '-b',
    'main',
    '-L',
    '10',
    '--json',
    'databaseId,status,conclusion,headSha,displayTitle,createdAt'
  ]);
  if (!result.ok) {
    throw new Error(`pages workflow lookup failed: ${resultMessage(result)}`);
  }
  const runs = parseJson('pages workflow list', result.stdout);
  return runs.find((runInfo) => {
    if (expectedHeadSha && runInfo.headSha !== expectedHeadSha) return false;
    if (createdAfter && Date.parse(runInfo.createdAt) < Date.parse(createdAfter)) return false;
    return true;
  }) ?? null;
}

function waitForHttpOk() {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const result = run('curl', ['-sS', '-I', docsUrl]);
    if (result.ok && /^HTTP\/\S+\s+2\d\d/m.test(result.stdout)) {
      console.log(`✓ docs Pages URL: ${docsUrl}`);
      return true;
    }
    console.log(`! docs Pages URL attempt ${attempt}/${attempts}: ${resultMessage(result)}`);
    if (attempt < attempts) sleep(delayMs);
  }
  return false;
}

console.log(dryRun ? 'Pages publish wait dry-run' : 'Pages publish wait');
console.log(`Docs repository: ${docsRepo}`);
console.log(`Docs URL: ${docsUrl}`);
console.log('');

const auth = run('gh', ['auth', 'status']);
if (!auth.ok) {
  console.error(resultMessage(auth));
  process.exit(auth.status || 1);
}

const ref = run('gh', ['api', `repos/${docsRepo}/git/ref/heads/main`, '--jq', '.object.sha']);
if (!ref.ok) {
  console.error(`✕ docs main ref: ${resultMessage(ref)}`);
  process.exit(ref.status || 1);
}
const expectedHeadSha = ref.stdout;
let dispatchStartedAt = '';

if (dispatch) {
  const args = ['workflow', 'run', 'pages.yml', '-R', docsRepo, '--ref', 'main'];
  console.log(commandLine('gh', args));
  if (!dryRun) {
    dispatchStartedAt = new Date(Date.now() - 5000).toISOString();
    const result = run('gh', args);
    if (!result.ok) {
      console.error(`✕ dispatch Pages workflow: ${resultMessage(result)}`);
      process.exit(result.status || 1);
    }
  }
}

const listArgs = [
  'run',
  'list',
  '-R',
  docsRepo,
  '-w',
  'pages.yml',
  '-b',
  'main',
  '-L',
  '10',
  '--json',
  'databaseId,status,conclusion,headSha,displayTitle,createdAt'
];
console.log(commandLine('gh', listArgs));
console.log(`Expected Pages head SHA: ${expectedHeadSha}`);
if (dispatchStartedAt) {
  console.log(`Expected Pages run created after: ${dispatchStartedAt}`);
}

if (dryRun) {
  console.log(commandLine('curl', ['-sS', '-I', docsUrl]));
  console.log('Dry-run only. Use npm run pages:publish:wait after public visibility and Pages setup.');
  process.exit(0);
}

let runInfo = null;
for (let attempt = 1; attempt <= attempts; attempt += 1) {
  runInfo = latestPagesRun({ expectedHeadSha, createdAfter: dispatchStartedAt });
  if (runInfo) break;
  console.log(`! pages workflow run attempt ${attempt}/${attempts}: none found for expected main SHA`);
  if (attempt < attempts) sleep(delayMs);
}

if (!runInfo) {
  console.error('✕ pages workflow run: none found for expected main SHA');
  process.exit(1);
}

console.log(`gh run watch ${runInfo.databaseId} -R ${docsRepo} --exit-status`);
const watched = run('gh', ['run', 'watch', String(runInfo.databaseId), '-R', docsRepo, '--exit-status'], {
  stdio: 'inherit'
});
if (!watched.ok) {
  process.exit(watched.status || 1);
}

if (!waitForHttpOk()) {
  console.error(`✕ docs Pages URL did not become reachable: ${docsUrl}`);
  process.exit(1);
}
