#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { releaseRepos as repos } from './release-repos.mjs';

const targetOrg = readOption('--target-org') || process.env.LLMWIKI_TARGET_ORG || 'knowledge-bridge-labs';
const docsUrl = `https://${targetOrg}.github.io/llmwiki-docs/`;
const teams = [
  { slug: 'maintainers', name: 'Maintainers', privacy: 'closed' },
  { slug: 'security', name: 'Security', privacy: 'closed' },
  { slug: 'conduct', name: 'Conduct', privacy: 'closed' }
];

const apply = process.argv.includes('--apply');
const enablePages = process.argv.includes('--enable-pages');
const publicLaunch = process.argv.includes('--public-launch');

function readOption(name) {
  const prefix = `${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));
  return value ? value.slice(prefix.length).trim() : '';
}

function runGh(args) {
  const result = spawnSync('gh', args, {
    encoding: 'utf8'
  });
  return {
    ok: result.status === 0,
    status: result.status ?? 1,
    stdout: result.stdout?.trim() ?? '',
    stderr: result.stderr?.trim() || result.error?.message || ''
  };
}

function commandLine(args) {
  return `gh ${args.map((arg) => (arg.includes(' ') ? JSON.stringify(arg) : arg)).join(' ')}`;
}

function hasAuthScope(result, scope) {
  return `${result.stdout}\n${result.stderr}`.includes(scope);
}

function parseGhJson(label, text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error(`✕ ${label}: could not parse GitHub JSON (${error.message})`);
    return null;
  }
}

function runOrPrint(label, args, { optional = false } = {}) {
  console.log(commandLine(args));
  if (!apply) {
    return true;
  }
  const result = runGh(args);
  if (result.ok) {
    console.log(`✓ ${label}`);
    return true;
  }
  const message = result.stderr || result.stdout || `exit ${result.status}`;
  if (optional) {
    console.log(`! ${label}: ${message}`);
    return true;
  }
  console.error(`✕ ${label}: ${message}`);
  return false;
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

if (apply) {
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
}

let failed = false;

for (const team of teams) {
  const existingTeam = runGh(['api', `orgs/${targetOrg}/teams/${team.slug}`, '--silent']);
  if (existingTeam.ok) {
    console.log(`team already exists: ${team.slug}`);
    continue;
  }
  const createTeam = [
    'api',
    '--method',
    'POST',
    `orgs/${targetOrg}/teams`,
    '-f',
    `name=${team.name}`,
    '-f',
    `privacy=${team.privacy}`
  ];
  failed = !runOrPrint(`team ${team.slug}`, createTeam) || failed;
}

for (const repo of repos) {
  const fullName = `${targetOrg}/${repo.name}`;
  const repoView = runGh(['repo', 'view', fullName, '--json', 'nameWithOwner,isPrivate']);
  if (repoView.ok) {
    const metadata = parseGhJson(`repo visibility ${fullName}`, repoView.stdout);
    if (!metadata) {
      failed = true;
      continue;
    }
    if (!metadata.isPrivate && !publicLaunch) {
      console.error(
        `✕ repo visibility ${fullName}: expected private repository during initial organization staging; pass --public-launch only after approving public visibility`
      );
      failed = true;
      continue;
    }
  } else if (apply) {
    console.error(`✕ repo visibility ${fullName}: ${repoView.stderr || repoView.stdout}`);
    failed = true;
    continue;
  }

  failed =
    !runOrPrint(`repo settings ${fullName}`, [
      'repo',
      'edit',
      fullName,
      '--description',
      repo.description,
      '--homepage',
      docsUrl,
      '--enable-issues',
      '--delete-branch-on-merge'
    ]) || failed;

  failed =
    !runOrPrint(`maintainers access ${fullName}`, [
      'api',
      '--method',
      'PUT',
      `orgs/${targetOrg}/teams/maintainers/repos/${targetOrg}/${repo.name}`,
      '-f',
      'permission=maintain'
    ]) || failed;

  runOrPrint(`vulnerability alerts ${fullName}`, [
    'api',
    '--method',
    'PUT',
    `repos/${targetOrg}/${repo.name}/vulnerability-alerts`
  ], { optional: true });

  runOrPrint(`private vulnerability reporting ${fullName}`, [
    'api',
    '--method',
    'PUT',
    `repos/${targetOrg}/${repo.name}/private-vulnerability-reporting`
  ], { optional: true });
}

if (!enablePages) {
  console.log(
    'Pages site creation skipped. Rerun with --enable-pages only after the release owner approves Pages/public-launch setup.'
  );
} else if (!publicLaunch) {
  console.error('✕ docs Pages site: pass --public-launch with --enable-pages after approving public visibility.');
  failed = true;
} else {
  let pagesBlocked = false;
  const docsRepo = runGh(['repo', 'view', `${targetOrg}/llmwiki-docs`, '--json', 'isPrivate']);
  if (docsRepo.ok) {
    const metadata = parseGhJson(`repo visibility ${targetOrg}/llmwiki-docs`, docsRepo.stdout);
    if (metadata?.isPrivate) {
      const message = 'docs Pages site: llmwiki-docs is still private; make it public before enabling public-launch Pages.';
      if (apply) {
        console.error(`✕ ${message}`);
        failed = true;
      } else {
        console.log(`! ${message}`);
      }
      pagesBlocked = true;
    }
  } else if (apply) {
    console.error(`✕ docs Pages site: ${docsRepo.stderr || docsRepo.stdout || `exit ${docsRepo.status}`}`);
    failed = true;
    pagesBlocked = true;
  }

  if (!pagesBlocked) {
    const existingPages = runGh(['api', `repos/${targetOrg}/llmwiki-docs/pages`, '--silent']);
    if (existingPages.ok) {
      console.log('Pages site already exists: llmwiki-docs');
    } else {
      runOrPrint(
        'docs Pages site',
        ['api', '--method', 'POST', `repos/${targetOrg}/llmwiki-docs/pages`, '-f', 'build_type=workflow'],
        { optional: true }
      );
    }
  }
}

console.log(
  '\nBranch protection is handled by scripts/configure-branch-policy.mjs after public visibility is approved. Private repo support depends on the account plan.'
);
console.log('This helper enables delete-branch-on-merge; it does not delete existing branches.');
console.log('Run npm run transfer:verify after applying settings.');

process.exit(failed ? 1 : 0);
