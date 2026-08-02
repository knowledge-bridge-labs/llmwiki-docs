import { defineConfig } from 'vitepress';

const targetOrg = 'knowledge-bridge-labs';
const repoUrl = `https://github.com/${targetOrg}/llmwiki-docs`;
const docsUrl = `https://${targetOrg}.github.io/llmwiki-docs/`;

export default defineConfig({
  title: 'Wiki Knowledge Sources for Agents',
  description:
    'Public-preview documentation for serving existing LLMWiki, Markdown, and Obsidian folders as agent-readable Knowledge Sources.',
  base: '/llmwiki-docs/',
  cleanUrls: true,
  lastUpdated: true,
  metaChunk: true,
  srcExclude: [
    'dev/**',
    'organization-setup.md',
    'operations-release-checklist.md',
    'oss-open-readiness.md'
  ],
  sitemap: {
    hostname: docsUrl
  },
  markdown: {
    config(md) {
      const defaultFence = md.renderer.rules.fence?.bind(md.renderer.rules);
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const language = token.info.trim().split(/\s+/)[0];
        if (language === 'mermaid') {
          return `<pre class="mermaid" data-source="${encodeURIComponent(token.content)}">${md.utils.escapeHtml(token.content)}</pre>`;
        }
        return defaultFence
          ? defaultFence(tokens, idx, options, env, self)
          : self.renderToken(tokens, idx, options);
      };
    }
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/llmwiki-docs/mark.svg' }],
    ['meta', { name: 'theme-color', content: '#0f766e' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Wiki Knowledge Sources for Agents' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    [
      'meta',
      {
        property: 'og:description',
        content:
          'Cross-repo OSS docs for serving, bridging, and inspecting local LLM Wiki-style knowledge sources.'
      }
    ]
  ],
  themeConfig: {
    logo: { src: '/mark.svg', alt: 'Wiki Knowledge Sources for Agents' },
    siteTitle: 'Wiki Sources for Agents',
    outline: {
      level: [2, 3],
      label: 'On this page'
    },
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'QuickStart', link: '/quickstart' },
      { text: 'Status', link: '/status' },
      { text: 'Evidence', link: '/evidence' },
      {
        text: 'Learn',
        items: [
          { text: 'Core Concepts', link: '/core-concepts' },
          { text: 'llmwiki-serve', link: '/llmwiki-serve' },
          { text: 'Demo', link: '/demo' },
          { text: 'Data Flow', link: '/data-flow' },
          { text: 'Positioning', link: '/positioning' },
          { text: 'Architecture', link: '/architecture' },
          { text: 'Examples', link: '/examples' }
        ]
      },
      {
        text: 'Connect',
        items: [
          { text: 'Direct Agent Integrations', link: '/direct-agent-integrations' },
          { text: 'Runtime Adapters', link: '/runtime-adapters' },
          { text: 'AI Tool Support', link: '/ai-tools' }
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'Knowledge Source Format', link: '/knowledge-source-format' },
          { text: 'CLI Reference', link: '/cli-reference' },
          { text: 'API Reference', link: '/api-reference' },
          { text: 'Protocols', link: '/protocols' },
          { text: 'Network & Security', link: '/network-security' },
          { text: 'Diagnostics', link: '/diagnostics' },
          { text: 'Troubleshooting', link: '/troubleshooting' }
        ]
      },
      { text: 'FAQ', link: '/faq' },
      {
        text: 'Community',
        items: [
          { text: 'Contributing', link: '/community#contributing' },
          { text: 'Support', link: '/community#support' },
          { text: 'Security', link: '/community#security' },
          { text: 'Code of Conduct', link: '/community#code-of-conduct' },
          { text: 'GitHub', link: `https://github.com/${targetOrg}` }
        ]
      },
      {
        text: 'Operations',
        items: [
          { text: 'Deployment', link: '/deployment' },
          { text: 'Package Publication', link: '/package-publication' },
          { text: 'Network & Security', link: '/network-security' },
          { text: 'Troubleshooting', link: '/troubleshooting' }
        ]
      }
    ],
    sidebar: [
      {
        text: 'Start Here',
        items: [
          { text: 'Overview', link: '/' },
          { text: 'Demo', link: '/demo' },
          { text: 'QuickStart', link: '/quickstart' },
          { text: 'Examples', link: '/examples' },
          { text: 'Release Status & Compatibility', link: '/status' },
          { text: 'Evidence', link: '/evidence' }
        ]
      },
      {
        text: 'Understand the Layer',
        items: [
          { text: 'Core Concepts', link: '/core-concepts' },
          { text: 'llmwiki-serve', link: '/llmwiki-serve' },
          { text: 'Demo', link: '/demo' },
          { text: 'Data Flow', link: '/data-flow' },
          { text: 'Positioning', link: '/positioning' },
          { text: 'Architecture', link: '/architecture' }
        ]
      },
      {
        text: 'Connect Tools',
        items: [
          { text: 'Direct Agent Integrations', link: '/direct-agent-integrations' },
          { text: 'Runtime Adapters', link: '/runtime-adapters' },
          { text: 'AI Tool Support', link: '/ai-tools' }
        ]
      },
      {
        text: 'Protocol Reference',
        items: [
          { text: 'Knowledge Source Format', link: '/knowledge-source-format' },
          { text: 'Protocols', link: '/protocols' },
          { text: 'API Reference', link: '/api-reference' },
          { text: 'CLI Reference', link: '/cli-reference' },
          { text: 'Network & Security', link: '/network-security' },
          { text: 'Diagnostics', link: '/diagnostics' }
        ]
      },
      {
        text: 'Operations',
        items: [
          { text: 'Deployment', link: '/deployment' },
          { text: 'Package Publication', link: '/package-publication' },
          { text: 'Network & Security', link: '/network-security' },
          { text: 'Troubleshooting', link: '/troubleshooting' }
        ]
      },
      {
        text: 'Community & Legal',
        items: [
          { text: 'FAQ', link: '/faq' },
          { text: 'Community', link: '/community' },
          { text: 'Code of Conduct', link: '/community#code-of-conduct' },
          { text: 'Legal Notices', link: '/legal-notices' },
          { text: 'Third-Party Licenses', link: '/third-party-licenses' }
        ]
      }
    ],
    socialLinks: [{ icon: 'github', link: `https://github.com/${targetOrg}`, ariaLabel: 'GitHub organization' }],
    editLink: {
      pattern: `${repoUrl}/edit/main/docs/:path`,
      text: 'Edit this page on GitHub'
    },
    footer: {
      message:
        'Public-preview documentation for Knowledge Bridge Labs wiki Knowledge Source components.',
      copyright: 'Released under the Apache-2.0 License.'
    }
  }
});
