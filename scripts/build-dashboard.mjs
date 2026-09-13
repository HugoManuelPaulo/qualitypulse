import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';

const resultsPath = 'test-results/results.json';
const outputPath = 'docs/data/latest.json';

function collect(suites, rows = [], inheritedFile = '') {
  for (const suite of suites || []) {
    const file = suite.file || inheritedFile;
    for (const spec of suite.specs || []) {
      for (const item of spec.tests || []) {
        const result = item.results?.at(-1) || {};
        rows.push({
          title: spec.title,
          suite: file.includes('api.spec') ? 'API' : 'UI',
          status: result.status === 'passed' ? 'passed' : 'failed',
          duration: result.duration || 0
        });
      }
    }
    collect(suite.suites, rows, file);
  }
  return rows;
}

let report;
try {
  report = JSON.parse(await readFile(resultsPath, 'utf8'));
} catch {
  report = { suites: [] };
}

const tests = collect(report.suites);
const passed = tests.filter((test) => test.status === 'passed').length;
const failed = tests.length - passed;
const duration = tests.reduce((sum, test) => sum + test.duration, 0);
const ui = tests.filter((test) => test.suite === 'UI');
const api = tests.filter((test) => test.suite === 'API');
const passRate = tests.length ? Math.round((passed / tests.length) * 100) : 0;

const dashboard = {
  generatedAt: new Date().toISOString(),
  status: failed === 0 && tests.length > 0 ? 'healthy' : 'attention',
  summary: { total: tests.length, passed, failed, passRate, duration },
  layers: [
    { name: 'Browser UI', total: ui.length, passed: ui.filter((test) => test.status === 'passed').length },
    { name: 'REST API', total: api.length, passed: api.filter((test) => test.status === 'passed').length }
  ],
  tests: tests.sort((a, b) => a.suite.localeCompare(b.suite) || a.title.localeCompare(b.title))
};

await mkdir('docs/data', { recursive: true });
await writeFile(outputPath, `${JSON.stringify(dashboard, null, 2)}\n`);
try {
  await cp('playwright-report', 'docs/report', { recursive: true, force: true });
} catch {
  // A report is optional when no test run exists yet.
}
console.log(`Dashboard generated: ${passed}/${tests.length} tests passed.`);
