import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { topics } from '../problems/index.js';
import { buildSources, readResults } from '../src/harness.js';

const temp = mkdtempSync(join(tmpdir(), 'codingvampire-'));
let testCount = 0;

try {
  const jobs = [];
  for (const topic of topics) {
    assert.match(topic.id, /^[a-z0-9-]+$/);
    assert.ok(topic.problems.length >= 5 && topic.problems.length <= 6, topic.name);
    for (const problem of topic.problems) {
      assert.equal(problem.tests.filter(test => !test.hidden).length, 3, problem.id);
      assert.ok(problem.tests.filter(test => test.hidden).length >= 2, problem.id);
      testCount += problem.tests.length;
      jobs.push({ problem, code: problem.solution, check: 'OK' });
    }
  }
  const first = jobs[0].problem;
  jobs.push(
    { problem: first, code: first.starter, check: 'compile error' },
    { problem: first, code: first.starter.replace('    ', '    throw new NullPointerException("verify");'), check: 'E' },
    { problem: first, code: first.starter.replace('    ', '    return false;'), check: 'X' }
  );

  const folders = jobs.map(({ problem, code }, i) => {
    const directory = join(temp, String(i));
    mkdirSync(directory);
    const { solution, tests } = buildSources(problem, code);
    writeFileSync(join(directory, 'Solution.java'), solution);
    writeFileSync(join(directory, 'TestRunner.java'), tests);
    return directory;
  });

  const run = spawnSync('java', ['-cp', 'public/browser-judge.jar', 'codingvampire.BrowserJudge', ...folders],
    { encoding: 'utf8', timeout: 120_000 });
  if (run.error) throw run.error;
  assert.equal(run.status, 0, run.stderr);
  const rows = run.stdout.trim().split('\n');
  assert.equal(rows.length, jobs.length);
  const failures = [];
  for (const [i, job] of jobs.entries()) {
    const row = rows[i];
    if (job.check === 'compile error' && row.startsWith('C:')) {
      assert.match(Buffer.from(row.slice(2), 'base64').toString(), /missing return statement/);
      continue;
    }
    if (row.startsWith('C:')) {
      failures.push(job.problem.id + ': ' + Buffer.from(row.slice(2), 'base64').toString());
      continue;
    }
    const checks = readResults(row.replaceAll('|', '\n'));
    assert.equal(checks.length, job.problem.tests.length);
    const bad = job.check === 'X' ? !checks.some(test => test.status === 'X')
      : checks.some(test => test.status !== job.check);
    if (bad) failures.push(job.problem.id + ': ' + JSON.stringify(checks));
    if (job.check === 'E') assert.match(checks[0].detail, /NullPointerException: verify/);
  }
  assert.equal(failures.length, 0, failures.join('\n'));
  console.log('Verified ' + (jobs.length - 3) + ' Java solutions and ' + testCount + ' test cases, plus compiler, exception, and wrong-answer handling.');
} finally {
  rmSync(temp, { recursive: true, force: true });
}
