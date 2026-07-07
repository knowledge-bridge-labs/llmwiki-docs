#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { releaseRepos as repos } from './release-repos.mjs';

const targetOrg = readOption('--target-org') || process.env.LLMWIKI_TARGET_ORG || 'knowledge-bridge-labs';
const apply = process.argv.includes('--apply');
const publicLaunch = process.argv.includes('--public-launch');
const acceptPublicVisibility = process.argv.includes('--accept-public-visibility');
const confirmPrivateReportRoutes = process.argv.includes('--confirm-private-report-routes');
const scriptDir = dirname(fileURLToPath(import.meta.url));
const docsRepo = resolve(scriptDir, '..');
const workspaceRoot = resolve(docsRepo, '..');

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

function normalizeGitHubRemoteUrl(value) {
  const remote = value.trim();
  const ssh = remote.match(/^git@github\.com[:/]([^#?]+?)(?:\.git)?\/?$/i);
  if (ssh) return `github.com/${ssh[1].toLowerCase()}`;

  const https = remote.match(/^https:\/\/(?:[^/@]+@)?github\.com\/([^#?]+?)(?:\.git)?\/?$/i);
  if (https) return `github.com/${https[1].toLowerCase()}`;

  return remote.replace(/\.git\/?$/i, '').toLowerCase();
}

function remoteUrlMatches(actual, expected) {
  return normalizeGitHubRemoteUrl(actual) === normalizeGitHubRemoteUrl(expected);
}

function parseJson(label, text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error(`✕ ${label}: could not parse JSON (${error.message})`);
    return null;
  }
}

function localPath(repoName) {
  return resolve(workspaceRoot, repoName);
}

function commandLine(fullName) {
  return `gh repo edit ${fullName} --visibility public --accept-visibility-change-consequences`;
}

function assertLocalReady(repo) {
  const path = localPath(repo.name);
  if (!existsSync(path)) {
    console.error(`✕ ${repo.name} local checkout: missing ${path}`);
    return false;
  }

  const branch = run('git', ['-C', path, 'branch', '--show-current']);
  if (!branch.ok || branch.stdout !== 'main') {
    console.error(`✕ ${repo.name} branch: expected main, got ${branch.stdout || resultMessage(branch)}`);
    return false;
  }

  const status = run('git', ['-C', path, 'status', '--short']);
  if (!status.ok || status.stdout !== '') {
    console.error(`✕ ${repo.name} working tree: ${status.ok ? `dirty:\n${status.stdout}` : resultMessage(status)}`);
    return false;
  }

  const expectedRemote = `https://github.com/${targetOrg}/${repo.name}.git`;
  const fetchRemote = run('git', ['-C', path, 'remote', 'get-url', 'origin']);
  const pushRemote = run('git', ['-C', path, 'remote', 'get-url', '--push', 'origin']);
  if (!fetchRemote.ok || !remoteUrlMatches(fetchRemote.stdout, expectedRemote)) {
    console.error(`✕ ${repo.name} origin fetch: expected ${expectedRemote}, got ${fetchRemote.stdout || resultMessage(fetchRemote)}`);
    return false;
  }
  if (!pushRemote.ok || !remoteUrlMatches(pushRemote.stdout, expectedRemote)) {
    console.error(`✕ ${repo.name} origin push: expected ${expectedRemote}, got ${pushRemote.stdout || resultMessage(pushRemote)}`);
    return false;
  }

  const localHead = run('git', ['-C', path, 'rev-parse', 'HEAD']);
  const remoteHead = run('git', ['-C', path, 'ls-remote', 'origin', 'refs/heads/main']);
  const remoteSha = remoteHead.stdout.split(/\s+/)[0] ?? '';
  if (!localHead.ok || !remoteHead.ok || localHead.stdout !== remoteSha) {
    console.error(
      `✕ ${repo.name} pushed state: local HEAD ${localHead.stdout || resultMessage(localHead)} does not match origin/main ${remoteSha || resultMessage(remoteHead)}`
    );
    return false;
  }

  console.log(`✓ ${repo.name} local checkout: clean main at origin/main`);
  return true;
}

if (!publicLaunch) {
  console.error('Visibility changes require --public-launch so private staging cannot accidentally publish repositories.');
  process.exit(2);
}

if (apply && !acceptPublicVisibility) {
  console.error(
    [
      'Refusing to change repository visibility without --accept-public-visibility.',
      'GitHub will expose repository code, issues, pull requests, Actions history, and public metadata.',
      'Rerun only after the release owner approves the public launch.'
    ].join('\n')
  );
  process.exit(2);
}

if (apply && !confirmPrivateReportRoutes) {
  console.error(
    [
      'Refusing to change repository visibility without --confirm-private-report-routes.',
      'Confirm that monitored private security and conduct reporting routes exist before making repositories public.'
    ].join('\n')
  );
  process.exit(2);
}

const auth = run('gh', ['auth', 'status']);
if (!auth.ok) {
  console.error(resultMessage(auth));
  process.exit(auth.status || 1);
}

console.log(apply ? 'Public visibility apply' : 'Public visibility dry-run');
console.log(`Target organization: ${targetOrg}`);
console.log('');

let failed = false;

for (const repo of repos) {
  failed = !assertLocalReady(repo) || failed;
}

console.log('');

for (const repo of repos) {
  const fullName = `${targetOrg}/${repo.name}`;
  const view = run('gh', ['repo', 'view', fullName, '--json', 'nameWithOwner,isPrivate,url']);
  if (!view.ok) {
    failed = true;
    console.error(`✕ repo ${fullName}: ${resultMessage(view)}`);
    continue;
  }

  const metadata = parseJson(`repo ${fullName}`, view.stdout);
  if (!metadata) {
    failed = true;
    continue;
  }

  if (!metadata.isPrivate) {
    console.log(`✓ repo ${fullName}: already public`);
    continue;
  }

  console.log(commandLine(fullName));
  if (!apply) {
    console.log(`✓ repo ${fullName}: dry-run only`);
    continue;
  }

  const result = run('gh', [
    'repo',
    'edit',
    fullName,
    '--visibility',
    'public',
    '--accept-visibility-change-consequences'
  ]);
  if (result.ok) {
    console.log(`✓ repo ${fullName}: visibility changed to public`);
  } else {
    failed = true;
    console.error(`✕ repo ${fullName}: ${resultMessage(result)}`);
  }
}

console.log('');
console.log(
  apply
    ? 'Next: enable Pages, run pages:publish:dispatch, run branch-policy:apply, then run release:preflight:public-unpublished.'
    : 'Dry-run only. After launch-copy updates, owner approval, and private report route confirmation, run npm run visibility:public:apply.'
);

process.exit(failed ? 1 : 0);
