# auto-browser-detector

A collection of browser automation checks, with explanations and results from Playwright
running Chromium with and without a visible window.

Each check lives in [`detectors/`](detectors/). The tests record what the checks report;
they don't assert whether automation should be detected.

- [`index.html`](index.html) lists the checks and their recorded results.
- [`live.html`](live.html) runs the checks in your current browser.

## Running locally

```sh
npm install
npx playwright install chromium
npm test
npm run serve
```

Open http://localhost:4173 for the recorded results, or http://localhost:4173/live.html
to check your browser. Tests write results to `results/<project>.json`.

The headed tests need a display. On a machine without one, use
`xvfb-run npx playwright test` instead of `npm test`.

### NixOS / Nix

On NixOS, use the dev shell instead of downloading browsers with `npx playwright install`.
It provides Node, patched browsers, and sets `PLAYWRIGHT_BROWSERS_PATH`:

```sh
nix develop
npm install
npm test
```

Keep `@playwright/test` in `package.json` at the same version as the flake's
`playwright-driver`. They need matching browser revisions.

## GitHub Pages

The [Pages workflow](.github/workflows/pages.yml) runs the tests and publishes the site
with updated results on every push to `main`. In the repository settings, set
**Pages → Source** to **GitHub Actions**.

## Adding a method

1. Create `detectors/<method-id>.js`. Use an existing detector as a reference and default-export
   `{ id, name, category, description, async detect() }`.
2. Register it in `detectors/index.js`.

The `detect()` function runs in the page and returns `{ detected, details }`:

- `detected`: `true` if the check flags automation, `false` if it doesn't, or `null` if it
  doesn't apply to this browser.
- `details`: a string explaining the result.

The tests and both report pages use the registered detectors.

## Reading the results

A detection isn't proof of automation. An open DevTools window or a software GPU can
trigger some checks during normal browsing.

A `clean` result doesn't rule out automation either. Some older checks no longer catch
current browsers. For example, modern headless Chromium has a populated plugin list.
