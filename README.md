# auto-browser-detector

A small catalog of well-known techniques for detecting automated, agentic, and headless browsers
(Playwright, Puppeteer, Selenium, headless Chromium, CDP-driven sessions).

- **One file per method** in [`detectors/`](detectors/) — each exports an id, name, category, a real
  explanation of how the technique works, and a `detect()` function that runs in the page.
- **Playwright tests** run every method against Chromium in both headless and headed mode. Tests are
  informational: they record what each method reports rather than asserting an outcome.
- **Two report pages**:
  - [`index.html`](index.html) — the full catalog with the recorded Playwright results (headless vs headed).
  - [`live.html`](live.html) — runs every detector against the browser you open it in, so you can compare
    your real browser (or your agentic browser) against the recorded runs.

## Running locally

```sh
npm install
npx playwright install chromium
npm test          # runs both projects, writes results/<project>.json
npm run serve     # serves the site at http://localhost:4173
```

The headed project opens a real browser window; on a display-less machine run tests under
`xvfb-run npx playwright test`.

### NixOS / Nix

The browsers `npx playwright install` downloads don't run on NixOS. Use the flake dev shell,
which provides Node and the Nix-patched Playwright browser bundle
(`PLAYWRIGHT_BROWSERS_PATH` is set for you):

```sh
nix develop
npm install
npm test
```

`@playwright/test` in package.json is pinned to the same version as nixpkgs'
`playwright-driver` so the browser revisions line up — bump them together.

## GitHub Pages

`.github/workflows/pages.yml` runs the full Playwright suite on every push to `main` and deploys the
site — with freshly generated results — via GitHub Pages (repo Settings → Pages → Source: GitHub Actions).

## Adding a method

1. Create `detectors/<method-id>.js` following the contract in any existing file: default-export
   `{ id, name, category, description, async detect() }` where `detect()` returns
   `{ detected: true | false | null, details: string }` (`null` = not applicable in this browser).
2. Register it in `detectors/index.js`.

The test suite and both pages pick it up automatically.

## Notes on interpretation

- `detected` means the method flags the current browser as automated/headless — not that it is
  necessarily correct. Several methods (DevTools open, software GPU) have benign explanations.
- A `clean` result under vanilla Playwright is informative too: it shows which classic checks no
  longer work against modern automation (e.g. plugins are populated in new headless mode).
