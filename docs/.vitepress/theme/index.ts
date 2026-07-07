import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import { inBrowser, onContentUpdated, useData } from 'vitepress';
import { h, nextTick, watch } from 'vue';
import './styles.css';

function readMermaidSource(diagram: HTMLElement) {
  const source = diagram.dataset.source;
  if (!source) return diagram.textContent || '';

  try {
    return decodeURIComponent(source);
  } catch {
    return source;
  }
}

async function renderMermaidDiagrams(isDark: boolean, reset = false) {
  if (!inBrowser) return;
  await nextTick();

  const diagrams = Array.from(document.querySelectorAll<HTMLElement>('.mermaid'));
  if (!diagrams.length) return;

  for (const diagram of diagrams) {
    if (!diagram.dataset.source) {
      diagram.dataset.source = encodeURIComponent(diagram.textContent || '');
    }
    if (reset || diagram.dataset.processed !== 'true') {
      diagram.removeAttribute('data-processed');
      diagram.textContent = readMermaidSource(diagram).trim();
    }
  }

  const pending = diagrams.filter((diagram) => diagram.dataset.processed !== 'true');
  if (!pending.length) return;

  const { default: mermaid } = await import('mermaid');
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: isDark ? 'dark' : 'default'
  });
  await mermaid.run({ nodes: pending });
}

const MermaidLayout = {
  setup() {
    const { isDark } = useData();

    onContentUpdated(() => {
      void renderMermaidDiagrams(isDark.value);
    });

    watch(
      isDark,
      () => {
        void renderMermaidDiagrams(isDark.value, true);
      },
      { flush: 'post' }
    );

    return () => h(DefaultTheme.Layout!);
  }
};

export default {
  extends: DefaultTheme,
  Layout: MermaidLayout
} satisfies Theme;
