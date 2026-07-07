# Demo Rendering

This folder contains reproducible demo media scripts for the docs.

## First-Run Explainer

Render the public-preview data-flow demo:

```sh
npm run demo:first-run
```

Requirements:

- Node.js, matching the repository engine requirement.
- Chrome or Chromium. Set `CHROME_PATH` when it is not installed in a standard location.
- `ffmpeg` on `PATH`.

The script writes scratch frames to `artifacts/demo/first-run/` and committed
public media to `docs/public/demo/first-run/`.

Committed outputs:

- `first-run.webm`: primary docs video.
- `first-run.gif`: small fallback preview.
- `first-run-poster.png`: video poster.
- `first-run.vtt`: captions.

The first version is a scripted explainer built from public sample concepts, not
a private screen recording. Future versions can replace or extend this with VHS
terminal recordings and Playwright browser recordings while keeping the same
public media path.
