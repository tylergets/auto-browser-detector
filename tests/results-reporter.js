import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

// Collects the per-test "result" attachments and writes one JSON file per
// Playwright project into results/, which the report page (index.html) consumes.
export default class ResultsReporter {
  constructor() {
    this.byProject = new Map();
  }

  onTestEnd(test, result) {
    const attachment = result.attachments.find((a) => a.name === 'result');
    if (!attachment?.body) return;
    const project = test.parent.project()?.name || 'unknown';
    if (!this.byProject.has(project)) this.byProject.set(project, []);
    this.byProject.get(project).push(JSON.parse(attachment.body.toString('utf-8')));
  }

  onEnd() {
    const require = createRequire(import.meta.url);
    const playwrightVersion = require('@playwright/test/package.json').version;
    const outDir = path.resolve('results');
    fs.mkdirSync(outDir, { recursive: true });
    for (const [project, results] of this.byProject) {
      const file = path.join(outDir, `${project}.json`);
      fs.writeFileSync(
        file,
        JSON.stringify({ project, timestamp: new Date().toISOString(), playwrightVersion, results }, null, 2)
      );
      console.log(`Wrote ${results.length} results to ${file}`);
    }
  }
}
