#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { delimiter, dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { releaseRepos as repos } from './release-repos.mjs';

const targetOrg = readOption('--target-org') || process.env.LLMWIKI_TARGET_ORG || 'knowledge-bridge-labs';
const docsUrl = `https://${targetOrg}.github.io/llmwiki-docs/`;
const strict = process.argv.includes('--strict');
const expectPublished = process.argv.includes('--expect-published');
const expectUnpublished = process.argv.includes('--expect-unpublished');
const expectPrivateRepos = process.argv.includes('--expect-private-repos');
const expectPublicRepos = process.argv.includes('--expect-public-repos');
const allowPagesMissing = process.argv.includes('--allow-pages-missing');
const expectPagesMissing = process.argv.includes('--expect-pages-missing');
const requirePages = process.argv.includes('--require-pages');
const requireOrgAdmin = process.argv.includes('--require-org-admin');
const strictBranchPolicy = process.argv.includes('--strict-branch-policy');
const allowRegistryInconclusive = process.argv.includes('--allow-registry-inconclusive');
const onlyLaunchCopy = process.argv.includes('--only-launch-copy');
const onlyPublishedDocsVersionCopy = process.argv.includes('--only-published-docs-version-copy');
const scriptDir = dirname(fileURLToPath(import.meta.url));
const docsRepo = resolve(scriptDir, '..');
const workspaceRoot = resolve(docsRepo, '..');
const publicLaunchCopyBlockers = [
  'the repositories now live privately',
  'the repository now lives privately',
  'current prepared state is `private org staging`',
  'private org staging under',
  'during org staging',
  'private `knowledge-bridge-labs` repositories',
  'private knowledge-bridge-labs repositories',
  'repository links now target private',
  'public links may still return 404',
  'public links may return 404',
  'hosted docs, badges, and public links may still return 404',
  'badges, package links, hosted docs, and public links may return 404',
  'GitHub Pages publication pending',
  'may return 404 until repository visibility',
  'may return 404 to unauthenticated users until the public-preview visibility change',
  'return 404 to unauthenticated users until the public-preview visibility change',
  'expected to return 404 until the docs repository is made public',
  'GitHub Pages remains unavailable until',
  'public Pages remains a release gate',
  'planned docs portal',
  'planned quickstart',
  'planned release status',
  'planned GitHub Pages deployment target',
  'planned repository path',
  'repository transfer and Pages setup',
  'organization transfer, public docs repository setup',
  'after org transfer',
  'private staging channel'
];
const publishedCopyBlockers = [
  'publication pending',
  'package publication pending',
  'package names are still unpublished',
  'package-install links should be treated as release gates',
  'package-install commands apply after the first',
  'package install commands are not the first-run path until',
  'source-checkout usage is the supported path today',
  'source checkout usage is the supported path today',
  'source checkout is the supported local path',
  'registry package installs are release gates until',
  'registry publication is still pending'
];
const launchCopyPathspecCandidates = [
  'README.md',
  'docs',
  'examples',
  'integrations',
  '.github/ISSUE_TEMPLATE',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'SUPPORT.md',
  'CODE_OF_CONDUCT.md'
];
// Keep this aligned with the public VitePress/package surface. Operational and
// historical runbooks may intentionally contain older exact package examples.
const publicDocsVersionCopyExcludedFiles = new Set([
  'docs/organization-setup.md',
  'docs/operations-release-checklist.md',
  'docs/oss-open-readiness.md',
  'docs/package-publication.md'
]);
const publicPackageVersionPattern = '\\d+\\.\\d+\\.\\d+(?:-[0-9A-Za-z.-]+)?(?:\\+[0-9A-Za-z.-]+)?';
const registryVersionCache = new Map();
let requiredFailures = 0;
let strictBlockers = 0;
let warnings = 0;

if (expectPublished && expectUnpublished) {
  throw new Error('Use only one of --expect-published or --expect-unpublished.');
}

if (expectPrivateRepos && expectPublicRepos) {
  throw new Error('Use only one of --expect-private-repos or --expect-public-repos.');
}

if ((allowPagesMissing || expectPagesMissing) && requirePages) {
  throw new Error('Use only one of --allow-pages-missing/--expect-pages-missing or --require-pages.');
}

if (onlyLaunchCopy && !expectPublicRepos && !expectPublished) {
  throw new Error('Use --expect-public-repos or --expect-published with --only-launch-copy.');
}

if (onlyLaunchCopy && onlyPublishedDocsVersionCopy) {
  throw new Error('Use only one of --only-launch-copy or --only-published-docs-version-copy.');
}

if (onlyPublishedDocsVersionCopy && !expectPublished) {
  throw new Error('Use --expect-published with --only-published-docs-version-copy.');
}

function readOption(name) {
  const prefix = `${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));
  return value ? value.slice(prefix.length).trim() : '';
}

function run(command, args, options = {}) {
  const [executable, executableArgs] = resolveSpawnCommand(command, args, options.env);
  const result = spawnSync(executable, executableArgs, {
    encoding: 'utf8',
    ...options,
    shell: false
  });
  return {
    ok: result.status === 0,
    status: result.status ?? 1,
    stdout: result.stdout?.trim() ?? '',
    stderr: result.stderr?.trim() || result.error?.message || ''
  };
}

function resolveSpawnCommand(command, args, env = process.env) {
  if (process.platform === 'win32' && command === 'npm') {
    return [process.execPath, [resolveWindowsNpmCli(env), ...args]];
  }

  return [command, args];
}

function resolveWindowsNpmCli(env) {
  const candidates = [
    env?.npm_execpath,
    env?.NPM_EXECPATH,
    resolve(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js')
  ];

  for (const candidate of candidates) {
    const trustedPath = trustedNpmCliPath(candidate);
    if (trustedPath) return trustedPath;
  }

  throw new Error('Could not locate a trusted npm CLI entrypoint for shell-free Windows execution.');
}

function trustedNpmCliPath(candidate) {
  if (typeof candidate !== 'string') return '';

  const path = candidate.trim();
  if (!isAbsolute(path)) return '';

  try {
    const realPath = realpathSync(path);
    return isNpmCliPath(realPath) ? realPath : '';
  } catch {
    return '';
  }
}

function isNpmCliPath(path) {
  return path.replaceAll('\\', '/').toLowerCase().endsWith('/node_modules/npm/bin/npm-cli.js');
}

function pass(label, details = 'ok') {
  console.log(`✓ ${label}: ${details}`);
}

function warn(label, details) {
  warnings += 1;
  console.log(`! ${label}: ${details}`);
}

function fail(label, details) {
  requiredFailures += 1;
  console.log(`✕ ${label}: ${details}`);
}

function strictOnly(label, details) {
  if (strict) {
    strictBlockers += 1;
    console.log(`✕ ${label}: ${details}`);
  } else {
    warn(label, details);
  }
}

function branchPolicyOnly(label, details) {
  if (strictBranchPolicy || expectPublicRepos || expectPublished) {
    strictBlockers += 1;
    console.log(`✕ ${label}: ${details}`);
  } else {
    warn(label, details);
  }
}

function requiredWhen(condition, label, details) {
  if (condition) {
    fail(label, details);
  } else {
    strictOnly(label, details);
  }
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

function httpHeadMessage(result, url) {
  const statusLines = result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^HTTP\/\S+\s+\d{3}/.test(line));
  if (statusLines.length > 0) {
    return `${statusLines.at(-1)} (${url})`;
  }
  return resultMessage(result);
}

function localPath(repoName) {
  return resolve(workspaceRoot, repoName);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function parseJson(label, text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    fail(label, `could not parse JSON (${error.message})`);
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
  if (expectPublicRepos || expectPublished) {
    return repo.requiredChecks?.public ?? [];
  }
  if (expectPrivateRepos) {
    return repo.requiredChecks?.private ?? [];
  }
  return [];
}

function localVersion(repo) {
  const path = localPath(repo.name);
  if (repo.type === 'node' || repo.type === 'docs') {
    return readJson(resolve(path, 'package.json')).version;
  }
  if (repo.type === 'python') {
    const pyproject = readFileSync(resolve(path, 'pyproject.toml'), 'utf8');
    const match = /^version\s*=\s*"([^"]+)"/m.exec(pyproject);
    return match?.[1] ?? '';
  }
  return '';
}

function extractNpmPackJson(stdout) {
  const candidates = [];
  for (let index = stdout.indexOf('['); index !== -1; index = stdout.indexOf('[', index + 1)) {
    const text = stdout.slice(index).trim();
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        candidates.push(parsed);
      }
    } catch {
      // npm run output can contain build logs before the final JSON payload.
    }
  }
  return candidates.at(-1) ?? null;
}

function pathMatchesSpec(filePath, spec) {
  const normalized = normalizePackagePath(spec);
  if (normalized.includes('*') || normalized.includes('?')) {
    return globSpecToRegExp(normalized).test(filePath);
  }
  return filePath === normalized || filePath.startsWith(`${normalized}/`);
}

function normalizePackagePath(spec) {
  return spec.replaceAll('\\', '/').replace(/^\.\//, '').replace(/\/$/, '');
}

function normalizeRepoPath(path) {
  return path.replaceAll('\\', '/').replace(/^\.\//, '');
}

function globSpecToRegExp(pattern) {
  let source = '^';
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    if (char === '*') {
      if (pattern[index + 1] === '*') {
        if (pattern[index + 2] === '/') {
          source += '(?:.*/)?';
          index += 2;
        } else {
          source += '.*';
          index += 1;
        }
      } else {
        source += '[^/]*';
      }
    } else if (char === '?') {
      source += '[^/]';
    } else {
      source += escapeRegexChar(char);
    }
  }
  return new RegExp(`${source}$`);
}

function escapeRegexChar(char) {
  return /[\\^$.*+?()[\]{}|]/.test(char) ? `\\${char}` : char;
}

function escapeExtendedRegex(value) {
  return value.replace(/[.[\]{}()*+?^$\\|]/g, '\\$&');
}

function phrasePattern(phrases) {
  return phrases.map(escapeExtendedRegex).join('|');
}

function assertNpmPack(repo) {
  const path = localPath(repo.name);
  const pkg = readJson(resolve(path, 'package.json'));
  const result = run('npm', ['run', '--silent', 'pack:dry-run'], { cwd: path });
  if (!result.ok) {
    fail(`${repo.name} npm package dry run`, resultMessage(result));
    return;
  }

  const pack = extractNpmPackJson(result.stdout);
  if (!pack?.[0]?.files) {
    fail(`${repo.name} npm package dry run`, 'could not parse npm pack JSON output');
    return;
  }

  const artifact = pack[0];
  const files = artifact.files.map((file) => file.path).sort();
  const allowedSpecs = ['package.json', ...(pkg.files ?? [])];
  const positiveFileSpecs = (pkg.files ?? []).filter((spec) => !spec.startsWith('!'));
  const missingSpecs = positiveFileSpecs.filter(
    (spec) => !files.some((filePath) => pathMatchesSpec(filePath, spec))
  );
  const unexpected = files.filter(
    (filePath) => !allowedSpecs.some((spec) => pathMatchesSpec(filePath, spec))
  );
  const forbidden = files.filter((filePath) =>
    [
      '.github/',
      '.vitepress/',
      'coverage/',
      'e2e/',
      'node_modules/',
      'playwright-report/',
      'test/',
      'tests/',
      ...(repo.packageCheck?.forbiddenPrefixes ?? [])
    ].some((prefix) => filePath.startsWith(prefix)) ||
    filePath === '.env' ||
    filePath.startsWith('.env.')
  );
  const requiredFiles = [
    'README.md',
    'LICENSE',
    'CHANGELOG.md',
    'CONTRIBUTING.md',
    'CODE_OF_CONDUCT.md',
    'SECURITY.md',
    'SUPPORT.md',
    'THIRD_PARTY_NOTICES.md'
  ];

  if (pkg.name === 'llmwiki-chat') {
    requiredFiles.push(
      'THIRD_PARTY_LICENSES.md',
      'dist/index.html',
      'dist/THIRD_PARTY_LICENSES.md'
    );
  }
  if (pkg.name === 'llmwiki-agent-bridge') {
    requiredFiles.push(
      'bin/llmwiki-agent-bridge.mjs',
      'src/index.mjs',
      'docs/release.md',
      'examples/README.md',
      'integrations/README.md'
    );
  }

  const missingRequiredFiles = requiredFiles.filter((filePath) => !files.includes(filePath));

  if (artifact.name !== pkg.name) {
    fail(`${repo.name} npm package name`, `expected ${pkg.name}, got ${artifact.name}`);
  }
  if (artifact.version !== pkg.version) {
    fail(`${repo.name} npm package version`, `expected ${pkg.version}, got ${artifact.version}`);
  }
  if (missingSpecs.length > 0) {
    fail(`${repo.name} npm package allowlist`, `missing package.json files entry output: ${missingSpecs.join(', ')}`);
  }
  if (unexpected.length > 0) {
    fail(`${repo.name} npm package contents`, `unexpected file(s): ${unexpected.slice(0, 12).join(', ')}`);
  }
  if (forbidden.length > 0) {
    fail(`${repo.name} npm package contents`, `forbidden file(s): ${forbidden.slice(0, 12).join(', ')}`);
  }
  if (missingRequiredFiles.length > 0) {
    fail(`${repo.name} npm package required files`, missingRequiredFiles.join(', '));
  }

  if (
    artifact.name === pkg.name &&
    artifact.version === pkg.version &&
    missingSpecs.length === 0 &&
    unexpected.length === 0 &&
    forbidden.length === 0 &&
    missingRequiredFiles.length === 0
  ) {
    pass(`${repo.name} npm package dry run`, `${files.length} packaged file(s)`);
  }
}

function assertPythonReleaseSmoke(repo) {
  const path = localPath(repo.name);
  withPreflightTempEnv((tempEnv) => {
    let result = run('uv', ['run', 'python', 'scripts/release_smoke.py'], { cwd: path, env: tempEnv });
    if (!result.ok) {
      const scriptsDir =
        process.platform === 'win32' ? resolve(path, '.venv', 'Scripts') : resolve(path, '.venv', 'bin');
      const python = process.platform === 'win32'
        ? resolve(scriptsDir, 'python.exe')
        : resolve(scriptsDir, 'python');
      if (existsSync(python)) {
        result = run(python, ['scripts/release_smoke.py'], {
          cwd: path,
          env: { ...tempEnv, PATH: `${scriptsDir}${delimiter}${tempEnv.PATH ?? ''}` }
        });
      }
    }

    if (result.ok) {
      pass(`${repo.name} Python release smoke`, result.stdout.split('\n').at(-1) || 'ok');
    } else {
      fail(`${repo.name} Python release smoke`, resultMessage(result));
    }
  });
}

function withPreflightTempEnv(callback) {
  const tempRoot = resolvePreflightTempRoot();
  const tempPath = resolve(tempRoot, `llmwiki-preflight-${process.pid}`);
  const pathValue = process.env.PATH ?? process.env.Path ?? process.env.path ?? '';
  mkdirSync(tempPath, { recursive: true });
  try {
    return callback({
      ...process.env,
      PATH: pathValue,
      Path: pathValue,
      TEMP: tempPath,
      TMP: tempPath,
      TMPDIR: tempPath
    });
  } finally {
    rmSync(tempPath, { recursive: true, force: true });
  }
}

function resolvePreflightTempRoot() {
  const candidates = [
    process.env.LLMWIKI_PREFLIGHT_TMP_DIR,
    process.env.TEMP,
    process.env.TMP,
    process.env.TMPDIR,
    process.env.LOCALAPPDATA ? resolve(process.env.LOCALAPPDATA, 'Temp') : '',
    process.env.USERPROFILE ? resolve(process.env.USERPROFILE, 'AppData', 'Local', 'Temp') : '',
    resolve(workspaceRoot, '.llmwiki-preflight-tmp')
  ].filter(Boolean);

  for (const candidate of candidates) {
    const path = resolve(candidate);
    if (isInsideKnownRepo(path)) {
      continue;
    }
    if (canUseTempRoot(path)) {
      return path;
    }
  }

  throw new Error(
    'Could not find a writable preflight temp directory outside the sibling repositories. ' +
      'Set LLMWIKI_PREFLIGHT_TMP_DIR to a writable directory outside the repo checkouts.'
  );
}

function isInsideKnownRepo(path) {
  return repos.some((repo) => isPathInside(path, localPath(repo.name)));
}

function isPathInside(candidate, parent) {
  const normalizedCandidate = resolve(candidate).toLowerCase();
  const normalizedParent = resolve(parent).toLowerCase();
  return normalizedCandidate === normalizedParent || normalizedCandidate.startsWith(`${normalizedParent}\\`) || normalizedCandidate.startsWith(`${normalizedParent}/`);
}

function canUseTempRoot(path) {
  try {
    mkdirSync(path, { recursive: true });
    const probe = resolve(path, `.llmwiki-preflight-write-test-${process.pid}`);
    writeFileSync(probe, 'ok');
    rmSync(probe, { force: true });
    return true;
  } catch {
    return false;
  }
}

function assertCleanCheckout(repoName) {
  const path = localPath(repoName);
  const inside = run('git', ['-C', path, 'rev-parse', '--is-inside-work-tree']);
  if (!inside.ok || inside.stdout !== 'true') {
    fail(`${repoName} checkout`, resultMessage(inside));
    return;
  }

  const status = run('git', ['-C', path, 'status', '--short']);
  if (status.ok && status.stdout === '') {
    pass(`${repoName} working tree`, 'clean');
  } else if (!status.ok) {
    fail(`${repoName} working tree`, resultMessage(status));
  } else {
    fail(`${repoName} working tree`, `dirty:\n${status.stdout}`);
  }

  if (expectPublicRepos || expectPublished) {
    const branch = run('git', ['-C', path, 'branch', '--show-current']);
    if (branch.ok && branch.stdout === 'main') {
      pass(`${repoName} branch`, 'main');
    } else if (branch.ok) {
      fail(`${repoName} branch`, `expected main, got ${branch.stdout || '(empty)'}`);
    } else {
      fail(`${repoName} branch`, resultMessage(branch));
    }

    const localHead = run('git', ['-C', path, 'rev-parse', 'HEAD']);
    const remoteHead = run('git', ['-C', path, 'ls-remote', 'origin', 'refs/heads/main']);
    const remoteSha = remoteHead.stdout.split(/\s+/)[0] ?? '';
    if (localHead.ok && remoteHead.ok && localHead.stdout === remoteSha) {
      pass(`${repoName} pushed state`, 'local HEAD matches origin/main');
    } else {
      fail(
        `${repoName} pushed state`,
        `local HEAD ${localHead.stdout || resultMessage(localHead)} does not match origin/main ${remoteSha || resultMessage(remoteHead)}`
      );
    }
  }

  const expectedRemote = `https://github.com/${targetOrg}/${repoName}.git`;
  checkRemoteUrl(repoName, path, expectedRemote, 'origin fetch', ['remote', 'get-url', 'origin']);
  checkRemoteUrl(repoName, path, expectedRemote, 'origin push', ['remote', 'get-url', '--push', 'origin']);
}

function checkRemoteUrl(repoName, path, expectedRemote, label, args) {
  const remote = run('git', ['-C', path, ...args]);
  if (remote.ok && remoteUrlMatches(remote.stdout, expectedRemote)) {
    pass(`${repoName} ${label}`, remote.stdout);
  } else if (remote.ok) {
    strictOnly(`${repoName} ${label}`, `expected ${expectedRemote}, got ${remote.stdout}`);
  } else {
    fail(`${repoName} ${label}`, resultMessage(remote));
  }
}

function checkTargetOrgLinks(repoName) {
  const path = localPath(repoName);
  const isExpectedOwner = (owner) =>
    owner === targetOrg || owner === '<owner>' || owner.includes('targetOrg') || owner.includes('$');
  const grep = run('git', [
    '-C',
    path,
    'grep',
    '-n',
    '-E',
    'github\\.com/[^[:space:]\'")]+/llmwiki-|[A-Za-z0-9-]+\\.github\\.io/llmwiki-docs',
    '--',
    '.',
    ':!package-lock.json',
    ':!*.svg',
    ':!docs/public/third-party-licenses.txt',
    ':!THIRD_PARTY_LICENSES.md'
  ]);

  if (grep.status === 1) {
    pass(`${repoName} target org links`, 'no committed llmwiki target links');
    return;
  }
  if (!grep.ok) {
    fail(`${repoName} target org links`, resultMessage(grep));
    return;
  }

  const badLines = grep.stdout
    .split('\n')
    .filter(Boolean)
    .filter((line) => {
      const githubOwnerMatches = [...line.matchAll(/github\.com\/([^/\s'")]+)\/llmwiki-/g)];
      const badGithubOwner = githubOwnerMatches.some((match) => !isExpectedOwner(match[1]));
      const pagesOwnerMatches = [...line.matchAll(/([A-Za-z0-9-]+)\.github\.io\/llmwiki-docs/g)];
      const badPagesOwner = pagesOwnerMatches.some((match) => !isExpectedOwner(match[1]));
      return badGithubOwner || badPagesOwner;
    });

  if (badLines.length === 0) {
    pass(`${repoName} target org links`, `all committed llmwiki links target ${targetOrg}`);
  } else {
    fail(`${repoName} target org links`, badLines.join('\n'));
  }
}

function checkLaunchCopy(repoName) {
  if (!expectPublicRepos && !expectPublished) {
    return;
  }

  const path = localPath(repoName);
  const pathspecs = launchCopyPathspecCandidates.filter((candidate) => existsSync(resolve(path, candidate)));
  if (pathspecs.length === 0) {
    pass(`${repoName} public launch copy`, 'no launch-copy files to inspect');
    return;
  }

  const blockers = [...publicLaunchCopyBlockers, ...(expectPublished ? publishedCopyBlockers : [])];
  const grep = run('git', [
    '-C',
    path,
    'grep',
    '-n',
    '-i',
    '-E',
    phrasePattern(blockers),
    '--',
    ...pathspecs,
    ':!docs/public/third-party-licenses.txt',
    ':!THIRD_PARTY_LICENSES.md'
  ]);

  if (grep.status === 1) {
    pass(`${repoName} public launch copy`, 'no private-staging or unpublished-status blockers');
    return;
  }
  if (!grep.ok) {
    fail(`${repoName} public launch copy`, resultMessage(grep));
    return;
  }

  fail(
    `${repoName} public launch copy`,
    `public launch mode still contains private-staging or stale publication wording:\n${grep.stdout}`
  );
}

function registryDisplayLabel(repo) {
  return `${repo.registry.type === 'pypi' ? 'PyPI' : 'npm'} ${repo.registry.name}`;
}

function registryLookup(repo) {
  const cacheKey = `${repo.registry.type}:${repo.registry.name}`;
  if (registryVersionCache.has(cacheKey)) {
    return registryVersionCache.get(cacheKey);
  }

  let lookup;
  if (repo.registry.type === 'npm') {
    const result = run('npm', ['view', repo.registry.name, 'version']);
    if (result.ok) {
      lookup = { state: 'published', version: result.stdout };
    } else if (result.stderr.includes('E404') || result.stdout.includes('E404')) {
      lookup = { state: 'unpublished', message: resultMessage(result) };
    } else {
      lookup = { state: 'inconclusive', message: resultMessage(result) };
    }
  } else if (repo.registry.type === 'pypi') {
    const result = run('curl', [
      '-sS',
      '-w',
      '\n%{http_code}',
      `https://pypi.org/pypi/${repo.registry.name}/json`
    ]);
    const newline = result.stdout.lastIndexOf('\n');
    const body = newline === -1 ? '' : result.stdout.slice(0, newline).replace(/^\uFEFF/, '');
    const status = newline === -1 ? result.stdout : result.stdout.slice(newline + 1).trim();
    if (status === '200') {
      try {
        const published = JSON.parse(body).info?.version ?? '';
        lookup = published
          ? { state: 'published', version: published }
          : { state: 'inconclusive', message: 'PyPI response did not include info.version' };
      } catch (error) {
        lookup = { state: 'inconclusive', message: `could not parse PyPI JSON (${error.message})` };
      }
    } else if (status === '404') {
      lookup = { state: 'unpublished', message: '404' };
    } else {
      lookup = { state: 'inconclusive', message: resultMessage(result) };
    }
  } else {
    lookup = { state: 'inconclusive', message: `unsupported registry type ${repo.registry.type}` };
  }

  registryVersionCache.set(cacheKey, lookup);
  return lookup;
}

function reportRegistryLookupProblem(repo, lookup) {
  const label = registryDisplayLabel(repo);
  if (lookup.state === 'unpublished') {
    if (expectPublished) {
      fail(label, 'expected published, got registry not found');
    } else {
      pass(label, 'unpublished / name currently returns not found');
    }
    return;
  }

  if (strict || expectPublished || expectUnpublished) {
    if (allowRegistryInconclusive) {
      warn(label, lookup.message);
    } else {
      fail(label, lookup.message);
    }
  } else {
    warn(label, lookup.message);
  }
}

function listPublicDocsVersionCopyFiles() {
  const result = run('git', ['-C', docsRepo, 'ls-files', 'README.md', 'docs/*.md']);
  if (!result.ok) {
    fail('public docs version copy files', resultMessage(result));
    return [];
  }

  return result.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map(normalizeRepoPath)
    .filter(isPublicDocsVersionCopyFile)
    .sort();
}

function isPublicDocsVersionCopyFile(path) {
  if (path === 'README.md') {
    return true;
  }
  if (!path.startsWith('docs/') || !path.endsWith('.md')) {
    return false;
  }
  if (path.startsWith('docs/dev/') || publicDocsVersionCopyExcludedFiles.has(path)) {
    return false;
  }
  return true;
}

function packageVersionMentionPattern(repo) {
  const separator = repo.registry.type === 'pypi' ? '==' : '@';
  return new RegExp(
    `(^|[^A-Za-z0-9_.-])(${escapeExtendedRegex(repo.registry.name)}${escapeExtendedRegex(separator)}(${publicPackageVersionPattern}))(?=$|[^A-Za-z0-9_.-])`,
    'gm'
  );
}

function expectedDocsVersionToken(repo, version) {
  const separator = repo.registry.type === 'pypi' ? '==' : '@';
  return `${repo.registry.name}${separator}${version}`;
}

function versionMentionLine(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function publicDocsVersionMentions(repo, files) {
  const mentions = [];
  const pattern = packageVersionMentionPattern(repo);
  for (const file of files) {
    const text = readFileSync(resolve(docsRepo, file), 'utf8');
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      const prefix = match[1] ?? '';
      mentions.push({
        file,
        line: versionMentionLine(text, match.index + prefix.length),
        token: match[2],
        version: match[3]
      });
    }
  }
  mentions.push(...publicDocsTableVersionMentions(repo, files));
  mentions.push(...publicDocsProseVersionMentions(repo, files));
  return mentions;
}

function publicDocsTableVersionMentions(repo, files) {
  const mentions = [];
  const versionPattern = new RegExp(publicPackageVersionPattern, 'g');

  for (const file of files) {
    const text = readFileSync(resolve(docsRepo, file), 'utf8');
    const lines = text.split(/\r?\n/);

    for (let index = 0; index < lines.length - 1; index += 1) {
      const headerCells = markdownTableCells(lines[index]);
      if (!headerCells || !isMarkdownTableSeparator(lines[index + 1])) {
        continue;
      }

      const versionColumnIndexes = publicDocsVersionTableColumnIndexes(headerCells);
      if (versionColumnIndexes.length === 0) {
        continue;
      }

      let rowIndex = index + 2;
      for (; rowIndex < lines.length; rowIndex += 1) {
        const rowCells = markdownTableCells(lines[rowIndex]);
        if (!rowCells || isMarkdownTableSeparator(lines[rowIndex])) {
          break;
        }

        if (!rowCells.some((cell) => markdownCellMentionsPackage(cell, repo.registry.name))) {
          continue;
        }

        for (const columnIndex of versionColumnIndexes) {
          const cell = rowCells[columnIndex] ?? '';
          versionPattern.lastIndex = 0;
          for (const match of cell.matchAll(versionPattern)) {
            mentions.push({
              file,
              line: rowIndex + 1,
              token: `${repo.registry.name} ${match[0]}`,
              version: match[0]
            });
          }
        }
      }

      index = rowIndex - 1;
    }
  }

  return mentions;
}

function markdownTableCells(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|')) {
    return null;
  }

  const row = trimmed.endsWith('|') ? trimmed.slice(1, -1) : trimmed.slice(1);
  return row.split('|').map((cell) => cell.trim());
}

function isMarkdownTableSeparator(line) {
  const cells = markdownTableCells(line);
  return Boolean(cells?.length) && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function publicDocsVersionTableColumnIndexes(headerCells) {
  return headerCells
    .map((cell, index) => ({ cell: stripMarkdownInlineFormatting(cell).toLowerCase(), index }))
    .filter(({ cell }) => /\b(package|registry|version|publication|status)\b/.test(cell))
    .map(({ index }) => index);
}

function markdownCellMentionsPackage(cell, packageName) {
  const text = stripMarkdownInlineFormatting(cell);
  const pattern = new RegExp(
    `(^|[^A-Za-z0-9_.-])${escapeExtendedRegex(packageName)}(?=$|[^A-Za-z0-9_.-])`
  );
  return pattern.test(text);
}

function stripMarkdownInlineFormatting(value) {
  return value
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

function publicDocsProseVersionMentions(repo, files) {
  const mentions = [];
  const packagePattern = new RegExp(
    `(^|[^A-Za-z0-9_.-])(\\\`?${escapeExtendedRegex(repo.registry.name)}\\\`?)(?=$|[^A-Za-z0-9_.-])`,
    'g'
  );
  const versionPattern = new RegExp(publicPackageVersionPattern, 'g');

  for (const file of files) {
    const text = readFileSync(resolve(docsRepo, file), 'utf8');
    const lines = text.split(/\r?\n/);

    for (const [lineIndex, line] of lines.entries()) {
      if (markdownTableCells(line)) {
        continue;
      }

      packagePattern.lastIndex = 0;
      for (const packageMatch of line.matchAll(packagePattern)) {
        const packagePrefix = packageMatch[1] ?? '';
        const packageToken = packageMatch[2] ?? '';
        const afterPackageIndex = packageMatch.index + packagePrefix.length + packageToken.length;
        const tail = line.slice(afterPackageIndex, afterPackageIndex + 120);

        versionPattern.lastIndex = 0;
        for (const versionMatch of tail.matchAll(versionPattern)) {
          const between = tail.slice(0, versionMatch.index);
          if (between.includes('@') || between.includes('==') || between.includes('|')) {
            continue;
          }

          const afterVersion = tail.slice(
            versionMatch.index + versionMatch[0].length,
            versionMatch.index + versionMatch[0].length + 48
          );
          const context = `${between} ${afterVersion}`.toLowerCase();
          if (!/\b(package|packages|published|version|release|contract|baseline|source)\b/.test(context)) {
            continue;
          }

          mentions.push({
            file,
            line: lineIndex + 1,
            token: `${repo.registry.name} ${versionMatch[0]}`,
            version: versionMatch[0]
          });
        }
      }
    }
  }

  return mentions;
}

function summarizeVersionMentions(mentions) {
  const lines = mentions.slice(0, 12).map((mention) => `${mention.file}:${mention.line} ${mention.token}`);
  const remaining = mentions.length - lines.length;
  return remaining > 0 ? `${lines.join('\n')}\n...and ${remaining} more` : lines.join('\n');
}

function checkPublishedDocsVersionCopy({ reportLookupProblems = false } = {}) {
  if (!expectPublished) {
    return;
  }

  const files = listPublicDocsVersionCopyFiles();
  if (files.length === 0) {
    fail('public docs version copy files', 'no README or public docs markdown files found');
    return;
  }

  for (const repo of repos) {
    if (!repo.registry) continue;

    const lookup = registryLookup(repo);
    if (lookup.state !== 'published') {
      if (reportLookupProblems) {
        reportRegistryLookupProblem(repo, lookup);
      }
      continue;
    }

    const expectedToken = expectedDocsVersionToken(repo, lookup.version);
    const mentions = publicDocsVersionMentions(repo, files);
    const staleMentions = mentions.filter((mention) => mention.version !== lookup.version);
    const label = `${repo.registry.name} public docs version copy`;

    if (mentions.length === 0) {
      fail(label, `expected at least one user-facing docs mention of ${expectedToken}`);
    } else if (staleMentions.length > 0) {
      fail(
        label,
        `expected ${expectedToken}; stale mention(s):\n${summarizeVersionMentions(staleMentions)}`
      );
    } else {
      pass(label, `${mentions.length} user-facing mention(s) match published ${expectedToken}`);
    }
  }
}

function checkOrgAccess() {
  const auth = run('gh', ['auth', 'status']);
  if (auth.ok) {
    pass('GitHub auth', 'available');
    if (auth.stdout.includes('admin:org') || auth.stderr.includes('admin:org')) {
      pass('GitHub admin:org scope', 'present');
    } else if (requireOrgAdmin) {
      fail('GitHub admin:org scope', 'missing; run `gh auth refresh -h github.com -s admin:org` before org setup');
    } else {
      warn('GitHub admin:org scope', 'missing; pass --require-org-admin to require this before org setup');
    }
  } else {
    fail('GitHub auth', resultMessage(auth));
  }

  const requireRepoVisibility = expectPrivateRepos || expectPublicRepos;
  const org = run('gh', ['api', `orgs/${targetOrg}`, '--silent']);
  if (org.ok) {
    pass(`org ${targetOrg}`, 'accessible');
  } else {
    requiredWhen(requireRepoVisibility, `org ${targetOrg}`, resultMessage(org));
  }

  for (const repo of repos) {
    const fullName = `${targetOrg}/${repo.name}`;
    const view = run('gh', ['repo', 'view', fullName, '--json', 'nameWithOwner,isPrivate,url']);
    if (view.ok) {
      pass(`repo ${fullName}`, view.stdout);
      const metadata = parseJson(`repo ${fullName} metadata`, view.stdout);
      if (metadata && expectPrivateRepos && !metadata.isPrivate) {
        fail(`repo ${fullName} visibility`, 'expected private repository for private staging');
      }
      if (metadata && expectPublicRepos && metadata.isPrivate) {
        fail(`repo ${fullName} visibility`, 'expected public repository for public launch preflight');
      }
    } else {
      requiredWhen(requireRepoVisibility, `repo ${fullName}`, resultMessage(view));
    }
  }

  const pages = run('curl', ['-sS', '-I', docsUrl]);
  const pagesReachable = pages.ok && /^HTTP\/\S+\s+2\d\d/m.test(pages.stdout);
  if (pagesReachable && expectPagesMissing) {
    fail('docs Pages URL', `expected missing during private staging, got ${docsUrl}`);
  } else if (pagesReachable) {
    pass('docs Pages URL', docsUrl);
  } else if (expectPagesMissing) {
    pass('docs Pages URL', `missing as expected for private staging: ${httpHeadMessage(pages, docsUrl)}`);
  } else if (allowPagesMissing) {
    warn('docs Pages URL', httpHeadMessage(pages, docsUrl));
  } else if (requirePages) {
    fail('docs Pages URL', httpHeadMessage(pages, docsUrl));
  } else {
    strictOnly('docs Pages URL', httpHeadMessage(pages, docsUrl));
  }
}

function checkRepositoryPolicies() {
  for (const repo of repos) {
    const fullName = `${targetOrg}/${repo.name}`;
    const requiredChecks = expectedRequiredChecks(repo);
    const protection = run('gh', ['api', `repos/${fullName}/branches/main/protection`]);
    let facts = emptyBranchPolicyFacts();
    const apiProblems = [];
    if (protection.ok) {
      const metadata = parseJson(`branch protection ${fullName}`, protection.stdout);
      if (metadata) facts = mergeBranchPolicyFacts(facts, branchProtectionFacts(metadata));
    } else {
      apiProblems.push(`branch protection: ${resultMessage(protection)}`);
    }

    const branchRules = run('gh', [
      'api',
      `repos/${fullName}/rules/branches/main`,
    ]);
    if (branchRules.ok) {
      const rules = parseJson(`branch rules ${fullName}`, branchRules.stdout);
      if (rules) facts = mergeBranchPolicyFacts(facts, branchRulesFacts(rules));
    } else {
      apiProblems.push(`branch rules: ${resultMessage(branchRules)}`);
    }

    const problems = branchPolicyProblems(facts, requiredChecks, expectPublicRepos || expectPublished);
    if (problems.length === 0) {
      pass(
        `branch policy ${fullName}`,
        `PR review, code owner review, conversation resolution, status checks (${[...facts.requiredCheckContexts].join(', ')}), force-push block, and deletion block`
      );
      continue;
    }

    branchPolicyOnly(
      `branch policy ${fullName}`,
      [...problems, ...apiProblems].join('; ') || 'no active main-branch policy found'
    );
  }
}

function checkRegistries() {
  for (const repo of repos) {
    if (!repo.registry) continue;
    const version = localVersion(repo);
    const lookup = registryLookup(repo);
    if (lookup.state === 'published') {
      if (expectUnpublished) {
        fail(registryDisplayLabel(repo), `expected unpublished, found ${lookup.version}`);
      } else if (lookup.version === version) {
        pass(registryDisplayLabel(repo), `published version matches local ${version}`);
      } else {
        strictOnly(
          registryDisplayLabel(repo),
          `published version ${lookup.version} differs from local ${version}`
        );
      }
    } else {
      reportRegistryLookupProblem(repo, lookup);
    }
  }
}

function checkPackageArtifacts() {
  for (const repo of repos) {
    if (repo.packageCheck?.type === 'npm-pack') {
      assertNpmPack(repo);
    }
    if (repo.packageCheck?.type === 'python-release-smoke') {
      assertPythonReleaseSmoke(repo);
    }
  }
}

function checkLocalReleaseArtifacts() {
  for (const repo of repos) {
    const path = localPath(repo.name);
    for (const check of repo.localChecks ?? []) {
      const result = run(check.command, check.args, { cwd: path });
      if (result.ok) {
        pass(check.label, result.stdout.split('\n').at(-1) || 'ok');
      } else {
        fail(check.label, resultMessage(result));
      }
    }
  }
}

console.log(strict ? 'Public preview preflight: strict mode' : 'Public preview preflight: staging mode');
console.log(`Target organization: ${targetOrg}`);
if (onlyPublishedDocsVersionCopy) {
  console.log(
    'Expectations: published-docs-version-copy only, repos=not checked, pages=not checked, branch-policy=not checked, registry=published'
  );
} else if (onlyLaunchCopy) {
  console.log(
    `Expectations: launch-copy=${
      expectPublished ? 'published' : 'public-unpublished'
    }, repos=not checked, pages=not checked, branch-policy=not checked, registry=not checked`
  );
} else {
  console.log(
    `Expectations: repos=${
      expectPrivateRepos ? 'private' : expectPublicRepos ? 'public' : 'warn-only'
    }, pages=${requirePages ? 'required' : expectPagesMissing ? 'expected-missing' : allowPagesMissing ? 'may-be-missing' : 'warn-only'}, branch-policy=${
      strictBranchPolicy || expectPublicRepos || expectPublished ? 'required' : 'warn-only'
    }, registry=${
      expectPublished ? 'published' : expectUnpublished ? 'unpublished' : 'warn-only'
    }`
  );
}
console.log('');

if (onlyPublishedDocsVersionCopy) {
  checkPublishedDocsVersionCopy({ reportLookupProblems: true });
} else {
  for (const repo of repos) {
    if (!onlyLaunchCopy) {
      assertCleanCheckout(repo.name);
      checkTargetOrgLinks(repo.name);
    }
    checkLaunchCopy(repo.name);
  }

  if (!onlyLaunchCopy) {
    checkLocalReleaseArtifacts();
    checkPackageArtifacts();
    checkOrgAccess();
    checkRepositoryPolicies();
    checkRegistries();
    checkPublishedDocsVersionCopy();
  }
}

console.log('');
console.log(
  `Summary: ${requiredFailures} required failure(s), ${strictBlockers} strict blocker(s), ${warnings} warning(s)`
);

if (requiredFailures > 0 || strictBlockers > 0) {
  process.exit(1);
}
