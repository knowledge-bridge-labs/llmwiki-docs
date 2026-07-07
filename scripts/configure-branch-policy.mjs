#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { releaseRepos as repos } from './release-repos.mjs';

const targetOrg = readOption('--target-org') || process.env.LLMWIKI_TARGET_ORG || 'knowledge-bridge-labs';
const apply = process.argv.includes('--apply');
const publicLaunch = process.argv.includes('--public-launch');
const allowPrivatePlan = process.argv.includes('--allow-private-plan');

function readOption(name) {
  const prefix = `${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));
  return value ? value.slice(prefix.length).trim() : '';
}

function runGh(args, options = {}) {
  const result = spawnSync('gh', args, {
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

function parseGhJson(label, text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error(`✕ ${label}: could not parse GitHub JSON (${error.message})`);
    return null;
  }
}

function commandLine(repo) {
  return `gh api --method PUT repos/${targetOrg}/${repo.name}/branches/main/protection --input -`;
}

function checksFor(repo) {
  return publicLaunch ? repo.requiredChecks.public : repo.requiredChecks.private;
}

function branchProtectionPayload(repo) {
  return {
    required_status_checks: {
      strict: true,
      contexts: checksFor(repo)
    },
    enforce_admins: true,
    required_pull_request_reviews: {
      dismissal_restrictions: {},
      dismiss_stale_reviews: true,
      require_code_owner_reviews: true,
      required_approving_review_count: 1,
      require_last_push_approval: true,
      bypass_pull_request_allowances: {}
    },
    restrictions: null,
    required_linear_history: false,
    allow_force_pushes: false,
    allow_deletions: false,
    required_conversation_resolution: true,
    lock_branch: false,
    allow_fork_syncing: false
  };
}

function printUsageProblem() {
  console.error(
    [
      'Branch policy configuration requires an explicit launch posture.',
      '',
      'Use public-launch mode for the default OSS path:',
      '  npm run branch-policy:dry-run',
      '  npm run branch-policy:apply',
      '',
      'Private repository branch protection requires a GitHub plan that supports it.',
      'Use --allow-private-plan only when the organization owner has confirmed that plan support.'
    ].join('\n')
  );
}

if (!publicLaunch && !allowPrivatePlan) {
  printUsageProblem();
  process.exit(2);
}

const auth = runGh(['auth', 'status']);
if (!auth.ok) {
  console.error(auth.stderr || auth.stdout || 'gh auth status failed');
  process.exit(auth.status || 1);
}

console.log(apply ? 'Branch policy apply' : 'Branch policy dry-run');
console.log(`Target organization: ${targetOrg}`);
console.log(`Required checks profile: ${publicLaunch ? 'public launch' : 'private plan'}`);
console.log('');

let failed = false;

for (const repo of repos) {
  const fullName = `${targetOrg}/${repo.name}`;
  const repoView = runGh(['repo', 'view', fullName, '--json', 'nameWithOwner,isPrivate,defaultBranchRef']);
  if (!repoView.ok) {
    failed = true;
    console.error(`✕ repo ${fullName}: ${repoView.stderr || repoView.stdout || `exit ${repoView.status}`}`);
    continue;
  }

  const metadata = parseGhJson(`repo ${fullName}`, repoView.stdout);
  if (!metadata) {
    failed = true;
    continue;
  }

  if (metadata.defaultBranchRef?.name !== 'main') {
    failed = true;
    console.error(`✕ repo ${fullName}: expected default branch main, got ${metadata.defaultBranchRef?.name || '(empty)'}`);
    continue;
  }

  if (metadata.isPrivate && publicLaunch && !allowPrivatePlan) {
    const message =
      'repository is still private; make it public before applying public-launch branch protection, or pass --allow-private-plan only on a plan that supports private branch protection';
    if (apply) {
      failed = true;
      console.error(`✕ repo ${fullName}: ${message}`);
      continue;
    }
    console.log(`! repo ${fullName}: ${message}`);
  }

  const payload = branchProtectionPayload(repo);
  console.log(commandLine(repo));
  console.log(JSON.stringify(payload, null, 2));

  if (!apply) {
    console.log(`✓ branch policy ${fullName}: dry-run only`);
    console.log('');
    continue;
  }

  const result = runGh(
    [
      'api',
      '--method',
      'PUT',
      `repos/${targetOrg}/${repo.name}/branches/main/protection`,
      '--input',
      '-',
      '--silent'
    ],
    {
      input: `${JSON.stringify(payload)}\n`
    }
  );

  if (result.ok) {
    console.log(`✓ branch policy ${fullName}: applied`);
  } else {
    failed = true;
    console.error(`✕ branch policy ${fullName}: ${result.stderr || result.stdout || `exit ${result.status}`}`);
  }
  console.log('');
}

console.log(
  apply
    ? 'Run npm run transfer:verify:public and npm run release:preflight:public-unpublished after applying public branch policy.'
    : 'Dry-run only. Review the payloads, then run npm run branch-policy:apply after public visibility is approved.'
);

process.exit(failed ? 1 : 0);
