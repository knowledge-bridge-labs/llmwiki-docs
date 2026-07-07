#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { releaseRepos as repos } from './release-repos.mjs';

const targetOrg = readOption('--target-org') || process.env.LLMWIKI_TARGET_ORG || 'knowledge-bridge-labs';
const docsUrl = `https://${targetOrg}.github.io/llmwiki-docs/`;
const staleNeedles = [
  ['context', '-forge', '-labs'].join(''),
  ['Context', ' Forge'].join(''),
  ['context', 'forge'].join(''),
  ['github', '.com/llmwiki'].join(''),
  ['@', 'llmwiki'].join(''),
  ['llmwiki', '.org'].join(''),
  ['llmwiki', '.dev'].join('')
];
const stalePattern = staleNeedles.map(escapeRegex).join('|');
const ownerLinkPattern = 'github\\.com/[^[:space:]\'")]+/llmwiki-[^[:space:]\'")]+';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const docsRepo = resolve(scriptDir, '..');
const workspaceRoot = resolve(docsRepo, '..');
const publicLaunch = process.argv.includes('--public-launch');
const requirePages = process.argv.includes('--require-pages') || publicLaunch;
const strictBranchPolicy = publicLaunch || process.argv.includes('--strict-branch-policy');

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

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function printStatus(label, result, successText = 'ok') {
  if (result.ok) {
    console.log(`✓ ${label}: ${successText}`);
    return true;
  }
  console.log(`✕ ${label}: ${result.stderr || result.stdout || `exit ${result.status}`}`);
  return false;
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

function checkRemoteUrl(repoName, localPath, fullName, kind, args) {
  const remote = run('git', ['-C', localPath, ...args]);
  const expectedRemote = `https://github.com/${fullName}.git`;
  if (remote.ok && remoteUrlMatches(remote.stdout, expectedRemote)) {
    console.log(`✓ ${kind} remote ${repoName}: ${remote.stdout}`);
  } else {
    failed = true;
    console.log(`✕ ${kind} remote ${repoName}: expected ${expectedRemote}, got ${remote.stdout || remote.stderr}`);
  }
}

function ownerLinkOwners(line) {
  return [...line.matchAll(/github\.com\/([^/\s'")]+)\/llmwiki-[^\s'")]+/g)].map((match) => match[1]);
}

function isExpectedOwner(owner) {
  return (
    owner === targetOrg ||
    owner === '<owner>' ||
    owner === '<target-org>' ||
    owner.includes('targetOrg') ||
    owner.includes('$')
  );
}

function ownerLinkLineTargetsExpectedOwners(line) {
  const owners = ownerLinkOwners(line);
  return owners.length > 0 && owners.every(isExpectedOwner);
}

function printWarning(label, details) {
  console.log(`! ${label}: ${details}`);
}

function printOptionalStatus(label, result, successText = 'ok') {
  if (result.ok) {
    console.log(`✓ ${label}: ${successText}`);
  } else {
    printWarning(label, result.stderr || result.stdout || `exit ${result.status}`);
  }
}

function printLaunchPolicyProblem(label, details) {
  if (strictBranchPolicy) {
    failed = true;
    console.log(`✕ ${label}: ${details}`);
  } else {
    printWarning(label, details);
  }
}

function parseJson(label, text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    failed = true;
    console.log(`✕ ${label}: could not parse JSON (${error.message})`);
    return null;
  }
}

function requiredStatusCheckContextsFromProtection(protection) {
  const checks = protection.required_status_checks ?? {};
  return [
    ...(Array.isArray(checks.contexts) ? checks.contexts : []),
    ...(Array.isArray(checks.checks) ? checks.checks.map((check) => check.context) : [])
  ].filter(Boolean);
}

function missingRequiredChecks(requiredChecks, actualChecks) {
  return requiredChecks.filter((required) => !actualChecks.includes(required));
}

function emptyBranchPolicyFacts() {
  return {
    requiresPr: false,
    requiresCodeOwnerReview: false,
    requiredApprovingReviewCount: 0,
    blocksForcePush: false,
    blocksDeletion: false,
    requiresConversationResolution: false,
    strictStatusChecks: false,
    requiredCheckContexts: new Set()
  };
}

function mergeBranchPolicyFacts(left, right) {
  const merged = emptyBranchPolicyFacts();
  merged.requiresPr = left.requiresPr || right.requiresPr;
  merged.requiresCodeOwnerReview = left.requiresCodeOwnerReview || right.requiresCodeOwnerReview;
  merged.requiredApprovingReviewCount = Math.max(
    left.requiredApprovingReviewCount,
    right.requiredApprovingReviewCount
  );
  merged.blocksForcePush = left.blocksForcePush || right.blocksForcePush;
  merged.blocksDeletion = left.blocksDeletion || right.blocksDeletion;
  merged.requiresConversationResolution =
    left.requiresConversationResolution || right.requiresConversationResolution;
  merged.strictStatusChecks = left.strictStatusChecks || right.strictStatusChecks;
  merged.requiredCheckContexts = new Set([...left.requiredCheckContexts, ...right.requiredCheckContexts]);
  return merged;
}

function branchProtectionFacts(protection) {
  const facts = emptyBranchPolicyFacts();
  const reviews = protection.required_pull_request_reviews;
  if (reviews) {
    facts.requiresPr = true;
    facts.requiresCodeOwnerReview = Boolean(reviews.require_code_owner_reviews);
    facts.requiredApprovingReviewCount = reviews.required_approving_review_count ?? 0;
  }
  facts.blocksForcePush = protection.allow_force_pushes?.enabled === false;
  facts.blocksDeletion = protection.allow_deletions?.enabled === false;
  facts.requiresConversationResolution = protection.required_conversation_resolution?.enabled === true;
  facts.strictStatusChecks = protection.required_status_checks?.strict === true;
  facts.requiredCheckContexts = new Set(requiredStatusCheckContextsFromProtection(protection));
  return facts;
}

function branchRulesFacts(rules) {
  const facts = emptyBranchPolicyFacts();
  const appliedRules = Array.isArray(rules) ? rules : Array.isArray(rules?.rules) ? rules.rules : [];
  for (const rule of appliedRules) {
    const parameters = rule.parameters ?? {};
    if (rule.type === 'pull_request') {
      facts.requiresPr = true;
      facts.requiresCodeOwnerReview = Boolean(parameters.require_code_owner_review);
      facts.requiredApprovingReviewCount = Math.max(
        facts.requiredApprovingReviewCount,
        parameters.required_approving_review_count ?? 0
      );
      facts.requiresConversationResolution =
        facts.requiresConversationResolution ||
        Boolean(
          parameters.required_review_thread_resolution ??
            parameters.require_review_thread_resolution ??
            parameters.required_conversation_resolution
        );
    }
    if (rule.type === 'deletion') {
      facts.blocksDeletion = true;
    }
    if (rule.type === 'non_fast_forward') {
      facts.blocksForcePush = true;
    }
    if (rule.type === 'required_status_checks') {
      facts.strictStatusChecks = Boolean(parameters.strict_required_status_checks_policy);
      for (const check of parameters.required_status_checks ?? []) {
        if (check.context) facts.requiredCheckContexts.add(check.context);
      }
    }
  }
  return facts;
}

function branchPolicyProblems(facts, requiredChecks, requireStrictStatusChecks) {
  const problems = [];
  if (!facts.requiresPr) problems.push('missing required pull request reviews');
  if (facts.requiredApprovingReviewCount < 1) problems.push('requires fewer than one approving review');
  if (!facts.requiresCodeOwnerReview) problems.push('code owner review is not required');
  if (!facts.requiresConversationResolution) problems.push('conversation resolution is not required');
  if (!facts.blocksForcePush) problems.push('force pushes are not blocked');
  if (!facts.blocksDeletion) problems.push('branch deletion is not blocked');
  const actualChecks = [...facts.requiredCheckContexts];
  if (actualChecks.length === 0) {
    problems.push('missing required status checks');
  }
  const missingChecks = missingRequiredChecks(requiredChecks, actualChecks);
  if (missingChecks.length > 0) {
    problems.push(`missing required status checks: ${missingChecks.join(', ')}`);
  }
  if (requireStrictStatusChecks && !facts.strictStatusChecks) {
    problems.push('required status checks are not strict');
  }
  return problems;
}

function expectedRequiredChecks(repo) {
  return publicLaunch ? repo.requiredChecks?.public ?? [] : repo.requiredChecks?.private ?? [];
}

let failed = false;

const org = run('gh', ['api', `orgs/${targetOrg}`, '--jq', '{login:.login,name:.name}']);
failed = !printStatus(`org ${targetOrg}`, org, org.stdout || 'accessible') || failed;

for (const repo of repos) {
  const fullName = `${targetOrg}/${repo.name}`;
  const repoView = run('gh', [
    'repo',
    'view',
    fullName,
    '--json',
    'nameWithOwner,isPrivate,defaultBranchRef,url,homepageUrl,description,hasIssuesEnabled,deleteBranchOnMerge'
  ]);
  failed = !printStatus(`repo ${fullName}`, repoView, repoView.stdout || 'accessible') || failed;
  if (repoView.ok) {
    const metadata = parseJson(`repo metadata ${fullName}`, repoView.stdout);
    if (metadata && metadata.nameWithOwner !== fullName) {
      failed = true;
      console.log(`✕ nameWithOwner ${fullName}: ${metadata.nameWithOwner || '(empty)'}`);
    }
    if (metadata && !metadata.isPrivate && !publicLaunch) {
      failed = true;
      console.log(`✕ visibility ${fullName}: expected private initial staging repository`);
    }
    if (metadata && metadata.isPrivate && publicLaunch) {
      failed = true;
      console.log(`✕ visibility ${fullName}: expected public repository for public launch verification`);
    }
    if (metadata && metadata.defaultBranchRef?.name !== 'main') {
      failed = true;
      console.log(`✕ default branch ${fullName}: ${metadata.defaultBranchRef?.name || '(empty)'}`);
    }
    if (metadata && metadata.description !== repo.description) {
      failed = true;
      console.log(`✕ description ${fullName}: ${metadata.description || '(empty)'}`);
    }
    if (metadata && metadata.homepageUrl !== docsUrl) {
      failed = true;
      console.log(`✕ homepage ${fullName}: ${metadata.homepageUrl || '(empty)'}`);
    }
    if (metadata && !metadata.hasIssuesEnabled) {
      failed = true;
      console.log(`✕ issues ${fullName}: disabled`);
    }
    if (metadata && !metadata.deleteBranchOnMerge) {
      failed = true;
      console.log(`✕ delete-branch-on-merge ${fullName}: disabled`);
    }
  }

  const localPath = resolve(workspaceRoot, repo.name);
  checkRemoteUrl(repo.name, localPath, fullName, 'fetch', ['remote', 'get-url', 'origin']);
  checkRemoteUrl(repo.name, localPath, fullName, 'push', ['remote', 'get-url', '--push', 'origin']);

  const stale = run('git', [
    '-C',
    localPath,
    'grep',
    '-n',
    '-E',
    stalePattern,
    '--',
    '.',
    ':!package-lock.json',
    ':!*.svg'
  ]);
  if (stale.status === 1) {
    console.log(`✓ tracked references ${repo.name}: no stale owner/org matches`);
  } else {
    failed = true;
    console.log(`✕ tracked references ${repo.name}: ${stale.stdout || stale.stderr || `exit ${stale.status}`}`);
  }

  const ownerLinks = run('git', [
    '-C',
    localPath,
    'grep',
    '-n',
    '-E',
    ownerLinkPattern,
    '--',
    '.',
    ':!package-lock.json',
    ':!*.svg'
  ]);
  const nonTargetOwnerLines =
    ownerLinks.status === 0
      ? ownerLinks.stdout
          .split('\n')
          .filter((line) => !ownerLinkLineTargetsExpectedOwners(line))
      : [];
  if (ownerLinks.status === 1 || nonTargetOwnerLines.length === 0) {
    console.log(`✓ owner links ${repo.name}: no non-target llmwiki repo links`);
  } else if (ownerLinks.status !== 0) {
    failed = true;
    console.log(
      `✕ owner links ${repo.name}: ${ownerLinks.stderr || ownerLinks.stdout || `exit ${ownerLinks.status}`}`
    );
  } else {
    failed = true;
    console.log(
      `✕ owner links ${repo.name}: ${
        nonTargetOwnerLines.join('\n') || ownerLinks.stderr || `exit ${ownerLinks.status}`
      }`
    );
  }

  const workflows = run('gh', [
    'api',
    `repos/${fullName}/actions/workflows`,
    '--jq',
    '[.workflows[] | {name,path,state}]'
  ]);
  failed = !printStatus(`workflows ${fullName}`, workflows, workflows.stdout || 'listed') || failed;

  const maintainersAccess = run('gh', [
    'api',
    `orgs/${targetOrg}/teams/maintainers/repos/${targetOrg}/${repo.name}`,
    '--jq',
    '{name:.name,permissions:.permissions}'
  ]);
  failed =
    !printStatus(`maintainers access ${fullName}`, maintainersAccess, maintainersAccess.stdout || 'accessible') ||
    failed;

  const codeownersPath = resolve(localPath, '.github', 'CODEOWNERS');
  const expectedOwner = `@${targetOrg}/maintainers`;
  if (existsSync(codeownersPath)) {
    const codeowners = readFileSync(codeownersPath, 'utf8');
    if (codeowners.includes(expectedOwner)) {
      console.log(`✓ CODEOWNERS ${repo.name}: contains ${expectedOwner}`);
    } else {
      printLaunchPolicyProblem(`CODEOWNERS ${repo.name}`, `missing ${expectedOwner}`);
    }
  } else {
    printLaunchPolicyProblem(`CODEOWNERS ${repo.name}`, 'missing .github/CODEOWNERS');
  }

  const vulnerabilityAlerts = run('gh', ['api', '-i', `repos/${targetOrg}/${repo.name}/vulnerability-alerts`]);
  printOptionalStatus(`vulnerability alerts ${fullName}`, vulnerabilityAlerts, 'enabled');

  const privateReporting = run('gh', [
    'api',
    '-i',
    `repos/${targetOrg}/${repo.name}/private-vulnerability-reporting`
  ]);
  printOptionalStatus(`private vulnerability reporting ${fullName}`, privateReporting, 'enabled');

  const requiredChecks = expectedRequiredChecks(repo);
  const protection = run('gh', ['api', `repos/${fullName}/branches/main/protection`]);
  let facts = emptyBranchPolicyFacts();
  const apiProblems = [];
  if (protection.ok) {
    const metadata = parseJson(`branch protection ${fullName}`, protection.stdout);
    if (metadata) facts = mergeBranchPolicyFacts(facts, branchProtectionFacts(metadata));
  } else {
    apiProblems.push(`branch protection: ${protection.stderr || protection.stdout || `exit ${protection.status}`}`);
  }

  const branchRules = run('gh', [
    'api',
    `repos/${fullName}/rules/branches/main`
  ]);
  if (branchRules.ok) {
    const rules = parseJson(`branch rules ${fullName}`, branchRules.stdout);
    if (rules) facts = mergeBranchPolicyFacts(facts, branchRulesFacts(rules));
  } else {
    apiProblems.push(`branch rules: ${branchRules.stderr || branchRules.stdout || `exit ${branchRules.status}`}`);
  }

  const problems = branchPolicyProblems(facts, requiredChecks, publicLaunch);
  if (problems.length === 0) {
    console.log(
      `✓ branch policy ${fullName}: PR review, code owner review, status checks (${[
        ...facts.requiredCheckContexts
      ].join(', ')}), conversation resolution, force-push block, and deletion block`
    );
  } else {
    printLaunchPolicyProblem(
      `branch policy ${fullName}`,
      [...problems, ...apiProblems].join('; ') || 'no active main-branch policy found'
    );
  }
}

const pages = run('gh', [
  'api',
  `repos/${targetOrg}/llmwiki-docs/pages`,
  '--jq',
  '{build_type:.build_type,status:.status,html_url:.html_url}'
]);
if (pages.ok) {
  if (publicLaunch) {
    console.log(`✓ docs Pages site: ${pages.stdout || 'configured'}`);
  } else {
    printWarning('docs Pages site', `configured before public launch: ${pages.stdout || 'configured'}`);
  }
} else if (requirePages) {
  failed = !printStatus('docs Pages site', pages, pages.stdout || 'configured') || failed;
} else {
  console.log(`✓ docs Pages site: not configured during private staging (${pages.stderr || pages.stdout || `exit ${pages.status}`})`);
}
if (pages.ok) {
  const pagesMetadata = parseJson('docs Pages metadata', pages.stdout);
  if (pagesMetadata && pagesMetadata.build_type !== 'workflow') {
    failed = true;
    console.log(`✕ docs Pages build_type: ${pagesMetadata.build_type || '(empty)'}`);
  }
  if (pagesMetadata && pagesMetadata.html_url !== docsUrl) {
    failed = true;
    console.log(`✕ docs Pages html_url: ${pagesMetadata.html_url || '(empty)'}`);
  }
}

const teams = ['maintainers', 'security', 'conduct'];
for (const team of teams) {
  const result = run('gh', ['api', `orgs/${targetOrg}/teams/${team}`, '--jq', '{slug:.slug,name:.name}']);
  failed = !printStatus(`team ${team}`, result, result.stdout || 'accessible') || failed;
}

process.exit(failed ? 1 : 0);
