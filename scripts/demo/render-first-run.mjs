#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = resolve(root, 'docs/public/demo/first-run');
const workDir = resolve(root, 'artifacts/demo/first-run');
const width = 1280;
const height = 720;
const durationMs = 28000;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: options.stdio ?? 'pipe',
    ...options
  });
  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    throw new Error(`${command} ${args.join(' ')} failed${detail ? `\n${detail}` : ''}`);
  }
  return result;
}

function commandExists(command) {
  const probe = process.platform === 'win32' ? ['where', command] : ['which', command];
  return spawnSync(probe[0], [probe[1]], { encoding: 'utf8' }).status === 0;
}

function findChrome() {
  const envPath = process.env.CHROME_PATH || process.env.CHROMIUM_PATH;
  const candidates = [
    envPath,
    process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : '',
    process.platform === 'win32' ? 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe' : '',
    process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : '',
    process.platform === 'linux' ? '/usr/bin/google-chrome' : '',
    process.platform === 'linux' ? '/usr/bin/chromium' : '',
    process.platform === 'linux' ? '/usr/bin/chromium-browser' : ''
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  for (const command of ['google-chrome', 'chromium', 'chromium-browser', 'chrome']) {
    if (commandExists(command)) return command;
  }

  throw new Error('Chrome or Chromium is required. Set CHROME_PATH to the executable path.');
}

function checkTools() {
  if (!commandExists('ffmpeg')) {
    throw new Error('ffmpeg is required to encode the demo. Install ffmpeg and retry.');
  }
  return { chrome: findChrome(), ffmpeg: 'ffmpeg' };
}

function demoHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=${width}, initial-scale=1">
  <style>
    :root {
      --ink: #13201e;
      --muted: #536663;
      --line: #d8e2df;
      --soft: #f4f8f7;
      --panel: #ffffff;
      --teal: #0f766e;
      --mint: #b9f3ea;
      --blue: #315a8c;
      --yellow: #b7791f;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      background: #eef4f2;
      color: var(--ink);
    }
    .app {
      width: ${width}px;
      height: ${height}px;
      padding: 22px 24px;
      display: grid;
      grid-template-rows: auto 1fr auto;
      gap: 14px;
    }
    .topbar {
      height: 48px;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: var(--panel);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      box-shadow: 0 10px 24px rgba(15, 31, 28, 0.05);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 17px;
      font-weight: 780;
    }
    .mark {
      width: 30px;
      height: 30px;
      border-radius: 7px;
      background: var(--teal);
      color: #fff;
      display: grid;
      place-items: center;
      font-weight: 860;
    }
    .top-caption {
      color: var(--muted);
      font-size: 14px;
      font-weight: 650;
    }
    .workspace {
      display: grid;
      grid-template-columns: 310px 455px 1fr;
      gap: 14px;
      min-height: 0;
    }
    .window {
      border: 1px solid var(--line);
      border-radius: 10px;
      background: var(--panel);
      overflow: hidden;
      box-shadow: 0 12px 30px rgba(15, 31, 28, 0.06);
      display: grid;
      grid-template-rows: 42px 1fr;
      min-width: 0;
      min-height: 0;
    }
    .window-title {
      border-bottom: 1px solid var(--line);
      background: #fbfdfc;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 14px;
      font-size: 13px;
      font-weight: 760;
      color: var(--muted);
    }
    .dots { display: flex; gap: 6px; }
    .dot { width: 9px; height: 9px; border-radius: 50%; background: #d7e0dd; }
    .content { padding: 14px; min-height: 0; }
    .filetree {
      display: grid;
      align-content: start;
      gap: 7px;
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 13px;
      line-height: 1.3;
    }
    .file {
      border: 1px solid transparent;
      border-radius: 7px;
      padding: 8px 9px;
      color: #263936;
      background: transparent;
      transition: 0.25s ease;
    }
    .file.folder {
      color: var(--teal);
      font-weight: 780;
      background: rgba(15, 118, 110, 0.08);
    }
    .file.hot {
      border-color: rgba(15, 118, 110, 0.35);
      background: rgba(185, 243, 234, 0.36);
      transform: translateX(4px);
    }
    .terminal {
      height: 100%;
      background: #101817;
      color: #e6f4ef;
      border-radius: 8px;
      padding: 15px;
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 13px;
      line-height: 1.48;
      white-space: pre-wrap;
      overflow: hidden;
    }
    .terminal .prompt { color: #93f4df; }
    .terminal .muted { color: #9db1ad; }
    .terminal .ok { color: #b9f3ea; }
    .terminal .json { color: #e7dba5; }
    .right {
      display: grid;
      grid-template-rows: 210px 1fr;
      gap: 14px;
      min-height: 0;
    }
    .diagram {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      align-items: center;
      gap: 10px;
      height: 100%;
    }
    .node {
      position: relative;
      border: 1px solid var(--line);
      border-radius: 9px;
      background: #fff;
      padding: 12px;
      min-height: 116px;
      display: grid;
      align-content: center;
      gap: 8px;
      text-align: center;
      transition: 0.25s ease;
    }
    .node strong { font-size: 15px; }
    .node span { color: var(--muted); font-size: 12px; line-height: 1.35; }
    .node.active {
      border-color: var(--teal);
      box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.11);
      transform: translateY(-3px);
    }
    .node:not(:last-child)::after {
      content: "→";
      position: absolute;
      right: -19px;
      top: 45%;
      color: var(--teal);
      font-weight: 820;
      z-index: 2;
    }
    .chat {
      display: grid;
      grid-template-rows: auto 1fr;
      gap: 12px;
      min-height: 0;
    }
    .statusrow {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .badge {
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 6px 10px;
      background: var(--soft);
      color: var(--muted);
      font-size: 12px;
      font-weight: 720;
    }
    .badge.ready { background: var(--mint); color: #07524c; border-color: transparent; }
    .chatbody {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
      padding: 14px;
      display: grid;
      grid-template-columns: 1fr 150px;
      gap: 12px;
      min-height: 0;
    }
    .answer {
      display: grid;
      align-content: start;
      gap: 9px;
    }
    .bubble {
      border-radius: 8px;
      background: var(--soft);
      padding: 12px;
      font-size: 13px;
      line-height: 1.45;
      color: #243734;
    }
    .bubble strong { color: var(--ink); }
    .cite { color: var(--teal); font-weight: 780; }
    .trace {
      border-left: 1px solid var(--line);
      padding-left: 12px;
      display: grid;
      align-content: start;
      gap: 9px;
      color: var(--muted);
      font-size: 12px;
    }
    .step {
      display: grid;
      grid-template-columns: 14px 1fr;
      gap: 7px;
      align-items: start;
    }
    .check {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--teal);
      margin-top: 2px;
    }
    .bottom {
      border: 1px solid var(--line);
      border-radius: 10px;
      background: var(--panel);
      padding: 12px 14px;
      display: grid;
      gap: 9px;
      box-shadow: 0 10px 24px rgba(15, 31, 28, 0.05);
    }
    .caption {
      display: flex;
      justify-content: space-between;
      gap: 18px;
      align-items: center;
      font-size: 16px;
      color: var(--ink);
      font-weight: 720;
    }
    .caption span:last-child {
      color: var(--muted);
      font-size: 13px;
      font-weight: 650;
      text-align: right;
    }
    .timeline {
      height: 7px;
      border-radius: 999px;
      background: #dce8e4;
      overflow: hidden;
    }
    .bar {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, var(--teal), #14b8a6);
      border-radius: inherit;
      transition: width 0.35s ease;
    }
    .scene-note {
      opacity: 0;
      transform: translateY(8px);
      transition: 0.35s ease;
    }
    .scene-note.visible {
      opacity: 1;
      transform: translateY(0);
    }
  </style>
</head>
<body>
  <div class="app">
    <div class="topbar">
      <div class="brand"><span class="mark">R</span> Wiki Knowledge Sources for Agents</div>
      <div class="top-caption">Public sample flow: an upstream workflow creates Markdown, serve projects it, agents consume it.</div>
    </div>
    <div class="workspace">
      <section class="window">
        <div class="window-title"><span>sample workspace</span><span class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span></div>
        <div class="content"><div id="filetree" class="filetree"></div></div>
      </section>
      <section class="window">
        <div class="window-title"><span>terminal and source API</span><span id="terminal-label">upstream workflow</span></div>
        <div class="content"><div id="terminal" class="terminal"></div></div>
      </section>
      <section class="right">
        <section class="window">
          <div class="window-title"><span>ownership map</span><span>read left to right</span></div>
          <div class="content">
            <div class="diagram">
              <div id="node-raw" class="node"><strong>raw</strong><span>notes, docs, tickets</span></div>
              <div id="node-wiki" class="node"><strong>wiki</strong><span>Markdown source of truth</span></div>
              <div id="node-serve" class="node"><strong>serve</strong><span>read-only projection APIs</span></div>
              <div id="node-agent" class="node"><strong>agent</strong><span>direct, bridge, or chat</span></div>
            </div>
          </div>
        </section>
        <section class="window">
          <div class="window-title"><span>chat / agent view</span><span id="chat-label">waiting for source</span></div>
          <div class="content chat">
            <div id="badges" class="statusrow"></div>
            <div class="chatbody">
              <div id="answer" class="answer"></div>
              <div id="trace" class="trace"></div>
            </div>
          </div>
        </section>
      </section>
    </div>
    <div class="bottom">
      <div class="caption"><span id="caption-main"></span><span id="caption-sub"></span></div>
      <div class="timeline"><div id="bar" class="bar"></div></div>
    </div>
  </div>
  <script>
    const scenes = [
      {
        active: ['raw'],
        label: 'upstream inputs',
        caption: 'Start with real project material.',
        sub: 'Raw files are not served directly.',
        files: [
          ['folder hot', 'raw-sources/'],
          ['hot', '  release-plan.md'],
          ['', '  AX-142-ticket.md'],
          ['', '  karpathy-gist.md'],
          ['', '  q3-architecture.pdf'],
          ['folder', 'wiki/  (not created yet)']
        ],
        terminal: '<span class="muted"># raw materials live in your normal workflow</span>\\n$ ls raw-sources\\nrelease-plan.md\\nAX-142-ticket.md\\nkarpathy-gist.md\\nq3-architecture.pdf',
        badges: ['No source endpoint yet'],
        answer: '<div class="bubble">No agent-facing API exists at this stage. Raw files still belong to the upstream workflow.</div>',
        trace: []
      },
      {
        active: ['raw', 'wiki'],
        label: 'upstream workflow',
        caption: 'Your upstream workflow creates Markdown.',
        sub: 'This is upstream of llmwiki-serve.',
        files: [
          ['folder', 'raw-sources/'],
          ['folder hot', 'wiki/'],
          ['hot', '  hot.md'],
          ['hot', '  index.md'],
          ['', '  topics/release-readiness.md'],
          ['', '  concepts/agentic-search.md'],
          ['', '  graph/graph.json']
        ],
        terminal: '<span class="prompt">$</span> your-upstream-wiki-workflow raw-sources/\\n<span class="ok">wrote wiki/topics/release-readiness.md</span>\\n<span class="ok">wrote wiki/index.md</span>\\n<span class="ok">wrote wiki/graph/graph.json</span>\\n\\n<span class="muted"># This command is not provided by llmwiki-serve.</span>',
        badges: ['Markdown wiki ready'],
        answer: '<div class="bubble"><strong>Upstream boundary</strong><br>Your compiler, authoring tool, script, or CI job creates Markdown. The public serving OSS starts after those files exist.</div>',
        trace: [{ text: 'run upstream workflow' }, { text: 'write Markdown pages' }]
      },
      {
        active: ['wiki', 'serve'],
        label: 'llmwiki-serve',
        caption: 'Serve reads the Markdown folder read-only.',
        sub: 'It does not author, ingest, compile, or call a model.',
        files: [
          ['folder hot', 'wiki/'],
          ['', '  hot.md'],
          ['hot', '  index.md'],
          ['', '  topics/release-readiness.md'],
          ['', '  concepts/agentic-search.md'],
          ['', '  graph/graph.json']
        ],
        terminal: '<span class="prompt">$</span> uv run llmwiki-serve serve ./wiki --port 8765\\n<span class="ok">Knowledge Source ready at http://127.0.0.1:8765</span>\\n\\n<span class="prompt">$</span> curl /health\\n<span class="json">{ "status": "ok" }</span>',
        badges: ['Source: ready', 'Read-only'],
        answer: '<div class="bubble"><strong>Projection</strong><br>Serve derives API views from files on disk. The Markdown wiki remains the source of truth.</div>',
        trace: [{ text: 'parse Markdown' }, { text: 'build manifest' }, { text: 'watch for changes' }]
      },
      {
        active: ['serve', 'agent'],
        label: 'direct retrieval',
        caption: 'Agents can query the served projection directly.',
        sub: 'HTTP/MCP returns evidence, not a final product-owned answer.',
        files: [
          ['folder', 'wiki/'],
          ['', '  hot.md'],
          ['', '  index.md'],
          ['hot', '  topics/release-readiness.md'],
          ['', '  graph/graph.json']
        ],
        terminal: '<span class="prompt">$</span> curl -s /query -d \\'{\"query\":\"release readiness\"}\\'\\n<span class="json">{\\n  "orientation": "Release readiness wiki",\\n  "citations": ["topics/release-readiness", "index"],\\n  "graph": { "nodes": 42, "edges": 61 }\\n}</span>',
        badges: ['HTTP query', 'MCP tools', 'Citations'],
        answer: '<div class="bubble"><strong>Agent context</strong><br>Use the release checklist <span class="cite">[1]</span>, open issues <span class="cite">[2]</span>, and graph hints before editing.</div>',
        trace: [{ text: 'llmwiki_context' }, { text: 'read citation [1]' }, { text: 'compose answer in host agent' }]
      },
      {
        active: ['serve', 'agent'],
        label: 'chat inspection',
        caption: 'Chat visualizes the same served source.',
        sub: 'It tests connections, shows pages, evidence, graph, and trace.',
        files: [
          ['folder', 'wiki/'],
          ['hot', '  hot.md'],
          ['hot', '  index.md'],
          ['', '  topics/release-readiness.md'],
          ['', '  graph/graph.json']
        ],
        terminal: '<span class="muted"># Browser workbench calls the source endpoint</span>\\nGET /source-bundle\\nGET /graph?limit=249\\nPOST /query\\n\\n<span class="ok">Evidence: 11 citations, 120 graph nodes</span>',
        badges: ['Source ready', 'Knowledge Map', 'Trace visible'],
        answer: '<div class="bubble"><strong>What is in this wiki?</strong><br>This wiki describes the project purpose, release process, and agent workflow <span class="cite">[1]</span><span class="cite">[2]</span>.</div><div class="bubble">Click a page to read the full Markdown. Links in/out navigate to related topics.</div>',
        trace: [{ text: 'test source' }, { text: 'load graph' }, { text: 'show citations' }]
      },
      {
        active: ['serve', 'agent'],
        label: 'optional bridge',
        caption: 'Bridge is only needed for multi-source fan-out or runtime synthesis.',
        sub: 'Skip it when the host agent can call llmwiki-serve itself.',
        files: [
          ['folder', 'wiki-a/ -> serve :8765'],
          ['folder', 'wiki-b/ -> serve :8766'],
          ['hot', 'bridge sources.json'],
          ['', 'chat workbench']
        ],
        terminal: '<span class="prompt">$</span> llmwiki-agent-bridge\\n<span class="ok">registered sources: wiki-a, wiki-b</span>\\n\\nPOST /message:send\\n<span class="json">llmwiki_agent_result { citations, graph, trace }</span>',
        badges: ['Bridge ready', '2 sources', 'Runtime optional'],
        answer: '<div class="bubble"><strong>Bridge result</strong><br>Evidence can be returned as-is, or sent to a configured runtime for a cited answer artifact.</div>',
        trace: [{ text: 'select sources' }, { text: 'fan out evidence' }, { text: 'return artifact' }]
      }
    ];

    const filetree = document.getElementById('filetree');
    const terminal = document.getElementById('terminal');
    const terminalLabel = document.getElementById('terminal-label');
    const chatLabel = document.getElementById('chat-label');
    const badges = document.getElementById('badges');
    const answer = document.getElementById('answer');
    const trace = document.getElementById('trace');
    const captionMain = document.getElementById('caption-main');
    const captionSub = document.getElementById('caption-sub');
    const bar = document.getElementById('bar');
    const nodes = {
      raw: document.getElementById('node-raw'),
      wiki: document.getElementById('node-wiki'),
      serve: document.getElementById('node-serve'),
      agent: document.getElementById('node-agent')
    };

    function render(scene, index) {
      for (const node of Object.values(nodes)) node.classList.remove('active');
      for (const key of scene.active) nodes[key].classList.add('active');
      filetree.innerHTML = scene.files.map(([cls, text]) => '<div class="file ' + cls + '">' + text + '</div>').join('');
      terminal.innerHTML = scene.terminal;
      terminalLabel.textContent = scene.label;
      chatLabel.textContent = scene.label;
      badges.innerHTML = scene.badges.map((text, i) => '<span class="badge ' + (i === 0 ? 'ready' : '') + '">' + text + '</span>').join('');
      answer.innerHTML = scene.answer;
      trace.innerHTML = scene.trace.map((item) => '<div class="step"><span class="check"></span><span>' + item.text + '</span></div>').join('');
      captionMain.textContent = scene.caption;
      captionSub.textContent = scene.sub;
      bar.style.width = (((index + 1) / scenes.length) * 100).toFixed(2) + '%';
    }

    let index = 0;
    render(scenes[0], 0);
    setInterval(() => {
      index = Math.min(index + 1, scenes.length - 1);
      render(scenes[index], index);
    }, 4300);
  </script>
</body>
</html>`;
}

function writeCaptions() {
  const captions = [
    'Start with real project material. Raw files are not served directly.',
    'Your upstream compiler, authoring tool, script, or CI job creates Markdown before llmwiki-serve starts.',
    'llmwiki-serve reads the Markdown folder read-only and exposes projection APIs.',
    'Agents can retrieve evidence directly over HTTP or MCP.',
    'llmwiki-chat visualizes the same served source with pages, graph, evidence, and trace.',
    'The bridge is optional for multi-source fan-out or runtime-backed answer artifacts.'
  ];
  const lines = ['WEBVTT', ''];
  let start = 0;
  for (const caption of captions) {
    const end = start + 4.3;
    lines.push(`${timestamp(start)} --> ${timestamp(end)}`);
    lines.push(caption);
    lines.push('');
    start = end;
  }
  writeFileSync(resolve(outDir, 'first-run.vtt'), `${lines.join('\n')}\n`);
}

function timestamp(seconds) {
  const whole = Math.floor(seconds);
  const ms = Math.round((seconds - whole) * 1000);
  const h = Math.floor(whole / 3600);
  const m = Math.floor((whole % 3600) / 60);
  const s = whole % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

async function record(chrome) {
  const { chromium } = await import('playwright-core');
  rmSync(workDir, { recursive: true, force: true });
  mkdirSync(workDir, { recursive: true });
  mkdirSync(outDir, { recursive: true });

  const htmlPath = resolve(workDir, 'first-run-demo.html');
  writeFileSync(htmlPath, demoHtml());

  const browser = await chromium.launch({
    headless: true,
    executablePath: chrome,
    args: ['--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1']
  });
  const context = await browser.newContext({
    viewport: { width, height },
    recordVideo: {
      dir: workDir,
      size: { width, height }
    }
  });
  const page = await context.newPage();
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
  await page.screenshot({ path: resolve(outDir, 'first-run-poster.png') });
  await page.waitForTimeout(durationMs);
  await context.close();
  await browser.close();

  const videos = readdirSync(workDir)
    .filter((name) => name.endsWith('.webm'))
    .map((name) => resolve(workDir, name));
  if (videos.length === 0) throw new Error('Playwright did not produce a video file.');
  videos.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  return videos[0];
}

function encodeMedia(ffmpeg, videoPath) {
  run(ffmpeg, [
    '-y',
    '-i',
    videoPath,
    '-vf',
    'fps=24,format=yuv420p',
    '-c:v',
    'libvpx-vp9',
    '-b:v',
    '0',
    '-crf',
    '32',
    '-pix_fmt',
    'yuv420p',
    resolve(outDir, 'first-run.webm')
  ]);

  run(ffmpeg, [
    '-y',
    '-i',
    videoPath,
    '-vf',
    'fps=8,scale=760:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
    '-loop',
    '0',
    resolve(outDir, 'first-run.gif')
  ]);
}

async function main() {
  const tools = checkTools();
  const capturedVideo = await record(tools.chrome);
  encodeMedia(tools.ffmpeg, capturedVideo);
  writeCaptions();

  const outputs = ['first-run.webm', 'first-run.gif', 'first-run-poster.png', 'first-run.vtt'];
  console.log(`Rendered first-run demo to ${outDir}`);
  for (const file of outputs) console.log(`- ${file}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
