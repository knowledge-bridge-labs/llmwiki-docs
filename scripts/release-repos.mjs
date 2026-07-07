export const releaseRepos = [
  {
    name: 'llmwiki-serve',
    type: 'python',
    description:
      'Serve local Markdown/wiki knowledge folders as agent-readable HTTP, MCP-style, and A2A-style context.',
    registry: { type: 'pypi', name: 'llmwiki-serve' },
    packageCheck: { type: 'python-release-smoke' },
    requiredChecks: {
      private: ['test (3.11)', 'test (3.12)'],
      public: ['test (3.11)', 'test (3.12)', 'analyze python', 'dependency review']
    }
  },
  {
    name: 'llmwiki-agent-bridge',
    type: 'node',
    description:
      'Bridge local agent runtimes to Markdown/wiki knowledge sources with grounded answers and traces.',
    registry: { type: 'npm', name: 'llmwiki-agent-bridge' },
    packageCheck: { type: 'npm-pack' },
    requiredChecks: {
      private: ['lint, contracts, tests, pack, audit'],
      public: ['lint, contracts, tests, pack, audit', 'codeql', 'dependency review']
    }
  },
  {
    name: 'llmwiki-chat',
    type: 'node',
    description:
      'Browser workbench for querying Markdown/wiki knowledge sources through agent runtime, MCP-style, and A2A-style flows.',
    registry: { type: 'npm', name: 'llmwiki-chat' },
    packageCheck: { type: 'npm-pack' },
    requiredChecks: {
      private: ['lint, typecheck, tests, build, pack, audit'],
      public: ['lint, typecheck, tests, build, pack, audit', 'analyze javascript-typescript', 'dependency review']
    },
    localChecks: [
      {
        label: 'chat license artifact',
        command: 'npm',
        args: ['run', 'licenses:check']
      }
    ]
  },
  {
    name: 'llmwiki-docs',
    type: 'docs',
    description: 'GitHub Pages documentation portal for LLM Wiki-style knowledge source tools.',
    packageCheck: {
      type: 'npm-pack',
      forbiddenPrefixes: ['docs/.vitepress/cache/', 'docs/.vitepress/dist/']
    },
    requiredChecks: {
      private: ['build'],
      public: ['build', 'analyze javascript-typescript', 'dependency review']
    },
    localChecks: [
      {
        label: 'docs license artifact',
        command: 'npm',
        args: ['run', 'licenses:check']
      }
    ]
  }
];
