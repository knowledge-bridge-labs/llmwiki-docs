#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const targetOrg = readOption('--target-org') || process.env.LLMWIKI_TARGET_ORG || 'knowledge-bridge-labs';
const apply = process.argv.includes('--apply');
const acceptPublicLaunch = process.argv.includes('--accept-public-launch');
const confirmPublicLaunch = readOption('--confirm-public-launch');
const confirmPrivateReportRoutes = process.argv.includes('--confirm-private-report-routes');

function readOption(name) {
  const prefix = `${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));
  return value ? value.slice(prefix.length).trim() : '';
}

function commandLine(command, args) {
  return `${command} ${args.map((arg) => (/[ "'&|<>]/.test(arg) ? JSON.stringify(arg) : arg)).join(' ')}`;
}

function spawnTarget(command, args) {
  if (process.platform === 'win32' && command === 'npm') {
    return ['cmd.exe', ['/d', '/s', '/c', ['npm', ...args].map((arg) => (/[ "&|<>^]/.test(arg) ? `"${arg.replaceAll('"', '\\"')}"` : arg)).join(' ')]];
  }
  return [command, args];
}

function runStep(label, command, args) {
  console.log('');
  console.log(`## ${label}`);
  console.log(commandLine(command, args));
  const [executable, executableArgs] = spawnTarget(command, args);
  const result = spawnSync(executable, executableArgs, { stdio: 'inherit' });
  if (result.status !== 0) {
    console.error(`\n✕ ${label} failed`);
    process.exit(result.status ?? 1);
  }
}

function runOutput(command, args) {
  const [executable, executableArgs] = spawnTarget(command, args);
  const result = spawnSync(executable, executableArgs, { encoding: 'utf8' });
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

function assertPagesConfigured() {
  const result = runOutput('gh', [
    'api',
    `repos/${targetOrg}/llmwiki-docs/pages`,
    '--jq',
    '{build_type:.build_type,status:.status,html_url:.html_url}'
  ]);
  if (!result.ok) {
    console.error(`✕ Pages metadata: ${resultMessage(result)}`);
    process.exit(result.status || 1);
  }
  let metadata;
  try {
    metadata = JSON.parse(result.stdout);
  } catch (error) {
    console.error(`✕ Pages metadata: could not parse JSON (${error.message})`);
    process.exit(1);
  }
  if (metadata.build_type !== 'workflow') {
    console.error(`✕ Pages metadata: expected build_type workflow, got ${metadata.build_type || '(empty)'}`);
    process.exit(1);
  }
  console.log(`✓ Pages metadata: ${result.stdout}`);
}

function nodeStep(scriptName, args) {
  return ['node', [`scripts/${scriptName}`, ...args, `--target-org=${targetOrg}`]];
}

function printApplySequence() {
  console.log('');
  console.log('Apply command after release-owner approval:');
  console.log(
    `  npm run public:launch:apply -- --accept-public-launch --confirm-public-launch=${targetOrg} --confirm-private-report-routes`
  );
  console.log('');
  console.log(
    'It makes repositories public, enables Pages, waits for deployment, applies branch protection, and runs public-unpublished verification.'
  );
}

if (apply && !acceptPublicLaunch) {
  console.error(
    [
      'Refusing to run public launch apply without --accept-public-launch.',
      'This operation makes repositories public, enables Pages, waits for deployment,',
      'applies branch protection, and runs public-unpublished verification.'
    ].join('\n')
  );
  process.exit(2);
}

if (apply && confirmPublicLaunch !== targetOrg) {
  console.error(
    [
      `Refusing to run public launch apply without --confirm-public-launch=${targetOrg}.`,
      'The confirmation must match the target organization exactly.'
    ].join('\n')
  );
  process.exit(2);
}

if (apply && !confirmPrivateReportRoutes) {
  console.error(
    [
      'Refusing to run public launch apply without --confirm-private-report-routes.',
      'Confirm that monitored private security and conduct reporting routes exist before making repositories public.'
    ].join('\n')
  );
  process.exit(2);
}

console.log(apply ? 'Public launch apply' : 'Public launch dry-run');
console.log(`Target organization: ${targetOrg}`);

runStep('Docs build check', 'npm', ['run', 'check']);

const launchCopy = nodeStep('verify-public-preview.mjs', [
  '--strict',
  '--expect-unpublished',
  '--expect-public-repos',
  '--only-launch-copy'
]);
runStep('Launch copy check', launchCopy[0], launchCopy[1]);

const privateTransferVerify = nodeStep('verify-org-transfer.mjs', []);
runStep('Private transfer verification', privateTransferVerify[0], privateTransferVerify[1]);

const privateStaging = nodeStep('verify-public-preview.mjs', [
  '--strict',
  '--expect-unpublished',
  '--expect-private-repos',
  '--expect-pages-missing'
]);
runStep('Private staging preflight', privateStaging[0], privateStaging[1]);

if (!apply) {
  const visibilityDryRun = nodeStep('configure-visibility.mjs', ['--public-launch']);
  runStep('Public visibility dry-run', visibilityDryRun[0], visibilityDryRun[1]);

  const pagesDryRun = nodeStep('configure-org.mjs', ['--public-launch', '--enable-pages']);
  runStep('Pages setup dry-run', pagesDryRun[0], pagesDryRun[1]);

  const pagesWaitDryRun = nodeStep('wait-pages.mjs', ['--dry-run']);
  runStep('Pages publish wait dry-run', pagesWaitDryRun[0], pagesWaitDryRun[1]);

  const branchPolicyDryRun = nodeStep('configure-branch-policy.mjs', ['--public-launch']);
  runStep('Branch policy dry-run', branchPolicyDryRun[0], branchPolicyDryRun[1]);

  printApplySequence();
  process.exit(0);
}

const visibilityApply = nodeStep('configure-visibility.mjs', [
  '--apply',
  '--public-launch',
  '--accept-public-visibility',
  '--confirm-private-report-routes'
]);
runStep('Public visibility apply', visibilityApply[0], visibilityApply[1]);

const pagesApply = nodeStep('configure-org.mjs', ['--apply', '--public-launch', '--enable-pages']);
runStep('Pages setup apply', pagesApply[0], pagesApply[1]);
assertPagesConfigured();

const pagesDispatch = nodeStep('wait-pages.mjs', ['--dispatch']);
runStep('Pages publish dispatch and wait', pagesDispatch[0], pagesDispatch[1]);

const branchPolicyApply = nodeStep('configure-branch-policy.mjs', ['--apply', '--public-launch']);
runStep('Branch policy apply', branchPolicyApply[0], branchPolicyApply[1]);

const transferVerifyPublic = nodeStep('verify-org-transfer.mjs', ['--public-launch', '--require-pages']);
runStep('Public transfer verification', transferVerifyPublic[0], transferVerifyPublic[1]);

const publicPreflight = nodeStep('verify-public-preview.mjs', [
  '--strict',
  '--expect-unpublished',
  '--expect-public-repos',
  '--require-pages'
]);
runStep('Public unpublished preflight', publicPreflight[0], publicPreflight[1]);

console.log('');
console.log('Public unpublished launch gates passed.');
