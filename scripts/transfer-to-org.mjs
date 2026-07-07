#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const targetOrg = readOption('--target-org') || process.env.LLMWIKI_TARGET_ORG || 'knowledge-bridge-labs';
const repos = [
  'llmwiki-serve',
  'llmwiki-agent-bridge',
  'llmwiki-chat',
  'llmwiki-docs'
];

const apply = process.argv.includes('--apply');
const sourceOwnerArg = readOption('--source-owner');
const scriptDir = dirname(fileURLToPath(import.meta.url));
const docsRepo = resolve(scriptDir, '..');
const workspaceRoot = resolve(docsRepo, '..');

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

function runGh(args, options = {}) {
  return run('gh', args, options);
}

function runGit(args, options = {}) {
  return run('git', args, options);
}

function hasAuthScope(result, scope) {
  return `${result.stdout}\n${result.stderr}`.includes(scope);
}

function printCommand(args) {
  console.log(`gh ${args.map((arg) => (arg.includes(' ') ? JSON.stringify(arg) : arg)).join(' ')}`);
}

function printGitCommand(args) {
  console.log(`git ${args.map((arg) => (arg.includes(' ') ? JSON.stringify(arg) : arg)).join(' ')}`);
}

function parseGhJson(label, text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error(`${label}: could not parse GitHub JSON (${error.message})`);
    process.exit(3);
  }
}

function readOption(name) {
  const prefix = `${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));
  return value ? value.slice(prefix.length).trim() : '';
}

function inferSourceOwner() {
  const remote = runGit(['-C', docsRepo, 'remote', 'get-url', 'origin']);
  if (!remote.ok) {
    return '';
  }
  const url = remote.stdout.trim();
  const match = url.match(/github\.com[/:]([^/]+)\/llmwiki-docs(?:\.git)?$/);
  return match ? match[1] : '';
}

function parseGithubRemote(url) {
  const match = url.trim().match(/github\.com[/:]([^/]+)\/([^/\s]+?)(?:\.git)?$/);
  return match ? { owner: match[1], repo: match[2] } : null;
}

function requireGithubRemote(repo, localPath, owner, kind, args) {
  const remote = runGit(['-C', localPath, ...args]);
  const expected = `https://github.com/${owner}/${repo}.git`;
  if (!remote.ok) {
    console.error(`Cannot read ${kind} remote for ${repo}: ${remote.stderr || remote.stdout}`);
    process.exit(3);
  }
  const parsed = parseGithubRemote(remote.stdout);
  if (!parsed || parsed.owner !== owner || parsed.repo !== repo) {
    console.error(
      `Local checkout ${repo} ${kind} remote must point to github.com/${owner}/${repo} before transfer apply; got ${remote.stdout}.`
    );
    console.error(`Expected canonical URL: ${expected}`);
    process.exit(3);
  }
}

function requireCleanPushedMain(repo, localPath) {
  const branch = runGit(['-C', localPath, 'rev-parse', '--abbrev-ref', 'HEAD']);
  if (!branch.ok || branch.stdout !== 'main') {
    console.error(`Local checkout ${repo} must be on main before transfer; got ${branch.stdout || branch.stderr}.`);
    process.exit(3);
  }

  const status = runGit(['-C', localPath, 'status', '--porcelain=v1']);
  if (!status.ok) {
    console.error(`Cannot read local status for ${repo}: ${status.stderr || status.stdout}`);
    process.exit(3);
  }
  if (status.stdout) {
    console.error(`Local checkout ${repo} has uncommitted changes. Commit, stash, or revert them before transfer.`);
    process.exit(3);
  }

  const fetch = runGit(['-C', localPath, 'fetch', '--quiet', 'origin']);
  if (!fetch.ok) {
    console.error(`Cannot refresh origin for ${repo}: ${fetch.stderr || fetch.stdout}`);
    process.exit(3);
  }

  const upstream = runGit(['-C', localPath, 'rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  if (!upstream.ok) {
    console.error(`Local checkout ${repo} has no upstream branch. Push main and set upstream before transfer.`);
    process.exit(3);
  }

  const counts = runGit(['-C', localPath, 'rev-list', '--left-right', '--count', `${upstream.stdout}...HEAD`]);
  if (!counts.ok) {
    console.error(`Cannot compare ${repo} with upstream ${upstream.stdout}: ${counts.stderr || counts.stdout}`);
    process.exit(3);
  }
  const [behindText = '0', aheadText = '0'] = counts.stdout.split(/\s+/);
  const behind = Number.parseInt(behindText, 10);
  const ahead = Number.parseInt(aheadText, 10);
  if (behind || ahead) {
    console.error(
      `Local checkout ${repo} must match ${upstream.stdout} before transfer; behind=${behind}, ahead=${ahead}.`
    );
    process.exit(3);
  }
}

const auth = runGh(['auth', 'status']);
if (!auth.ok) {
  console.error(auth.stderr || auth.stdout || 'gh auth status failed');
  process.exit(auth.status || 1);
}
if (apply && !hasAuthScope(auth, 'admin:org')) {
  console.error('GitHub CLI auth is missing admin:org scope. Run: gh auth refresh -h github.com -s admin:org');
  process.exit(2);
}

const currentOwner = sourceOwnerArg || process.env.LLMWIKI_TRANSFER_SOURCE_OWNER || inferSourceOwner();
if (!currentOwner) {
  console.error(
    'Cannot infer source owner. Run from the llmwiki-docs clone or pass --source-owner=<owner>.'
  );
  process.exit(1);
}

const org = runGh(['api', `orgs/${targetOrg}`, '--silent']);
if (!org.ok) {
  const details = org.stderr || org.stdout || `exit ${org.status}`;
  console.error(
    [
      `Target organization ${targetOrg} is not accessible: ${details}`,
      'Create it in GitHub first, confirm the account has organization-owner permissions,',
      'and refresh GitHub CLI auth when organization setup APIs require it:',
      '  gh auth refresh -h github.com -s admin:org'
    ].join('\n')
  );
  process.exit(2);
}

const localPaths = new Map();
for (const repo of repos) {
  const localPath = resolve(workspaceRoot, repo);
  const insideWorkTree = runGit(['-C', localPath, 'rev-parse', '--is-inside-work-tree']);
  if (!insideWorkTree.ok || insideWorkTree.stdout !== 'true') {
    console.error(`Local checkout missing or invalid for ${repo}: ${localPath}`);
    process.exit(3);
  }
  const remote = runGit(['-C', localPath, 'remote', 'get-url', 'origin']);
  if (!remote.ok || !remote.stdout.includes(`/${repo}`)) {
    console.error(`Local checkout ${localPath} does not look like ${repo}: ${remote.stderr || remote.stdout}`);
    process.exit(3);
  }
  if (apply) {
    requireCleanPushedMain(repo, localPath);
    requireGithubRemote(repo, localPath, currentOwner, 'fetch', ['remote', 'get-url', 'origin']);
    requireGithubRemote(repo, localPath, currentOwner, 'push', ['remote', 'get-url', '--push', 'origin']);
  }
  localPaths.set(repo, localPath);
}

const remoteUpdates = [];

for (const repo of repos) {
  const source = `${currentOwner}/${repo}`;
  const target = `${targetOrg}/${repo}`;
  const viewSource = runGh(['repo', 'view', source, '--json', 'id,nameWithOwner,isPrivate,url']);
  const viewTarget = runGh(['repo', 'view', target, '--json', 'id,nameWithOwner,isPrivate,url']);
  if (currentOwner === targetOrg && !viewTarget.ok) {
    console.error(
      `Source owner is already ${targetOrg}, but ${target} is missing. Pass --source-owner=<old-owner> if transfer is still needed.`
    );
    process.exit(3);
  }
  if (!viewSource.ok && !viewTarget.ok) {
    console.error(
      `Cannot access source repository ${source} or target repository ${target}: ${
        viewSource.stderr || viewSource.stdout || viewTarget.stderr || viewTarget.stdout
      }`
    );
    process.exit(3);
  }
  let sourceRepo = null;
  let targetRepo = null;
  if (viewSource.ok) {
    sourceRepo = parseGhJson(`source repository ${source}`, viewSource.stdout);
    if (!sourceRepo.isPrivate) {
      console.error(
        `Source repository ${source} is public. Initial organization staging expects private repositories.`
      );
      process.exit(4);
    }
  }
  if (viewTarget.ok) {
    targetRepo = parseGhJson(`target repository ${target}`, viewTarget.stdout);
    if (!targetRepo.isPrivate) {
      console.error(
        `Target repository ${target} is public. Initial organization staging expects private repositories.`
      );
      process.exit(4);
    }
  }
  if (viewSource.ok && viewTarget.ok) {
    if (sourceRepo.id !== targetRepo.id) {
      console.error(
        `Target repository ${target} already exists and is distinct from ${source}. Resolve this name collision before transfer.`
      );
      process.exit(4);
    }
  }

  const transferArgs = [
    'api',
    '--method',
    'POST',
    `repos/${currentOwner}/${repo}/transfer`,
    '-f',
    `new_owner=${targetOrg}`
  ];
  if (viewTarget.ok) {
    console.log(`target already exists: ${target}`);
  } else {
    printCommand(transferArgs);
  }
  if (apply && !viewTarget.ok) {
    const transfer = runGh(transferArgs);
    if (!transfer.ok) {
      console.error(`Transfer failed for ${source}: ${transfer.stderr || transfer.stdout}`);
      process.exit(5);
    }
  }

  const localPath = localPaths.get(repo);
  const remoteCommand = ['-C', localPath, 'remote', 'set-url', 'origin', `https://github.com/${target}.git`];
  printGitCommand(remoteCommand);
  remoteUpdates.push({ repo, localPath, target, remoteCommand });
}

if (apply) {
  for (const { repo, localPath, target, remoteCommand } of remoteUpdates) {
    const viewTarget = runGh(['repo', 'view', target, '--json', 'nameWithOwner,isPrivate,url']);
    if (!viewTarget.ok) {
      console.error(`Cannot confirm transferred target ${target}: ${viewTarget.stderr || viewTarget.stdout}`);
      process.exit(6);
    }
    const targetRepo = parseGhJson(`transferred target ${target}`, viewTarget.stdout);
    if (!targetRepo.isPrivate) {
      console.error(`Transferred target ${target} is public; expected private initial staging repository.`);
      process.exit(6);
    }
    const remoteUpdate = runGit(remoteCommand);
    if (!remoteUpdate.ok) {
      console.error(`Remote fetch URL update failed for ${repo}: ${remoteUpdate.stderr || remoteUpdate.stdout}`);
      process.exit(7);
    }
    const pushUpdate = runGit([
      '-C',
      localPath,
      'remote',
      'set-url',
      '--push',
      'origin',
      `https://github.com/${target}.git`
    ]);
    if (!pushUpdate.ok) {
      console.error(`Remote push URL update failed for ${repo}: ${pushUpdate.stderr || pushUpdate.stdout}`);
      process.exit(7);
    }
  }
}

if (!apply) {
  console.log('\nDry run only. Rerun with --apply or npm run transfer:apply after confirming ownership.');
} else {
  console.log('\nTransfer requests submitted. Confirm final repository ownership and update local remotes.');
}
