import './style.css';
import './classic.css';
import { topics, total, tracks } from '../problems/index.js';
import { makeEditor } from './editor.js';
import { createProgress, getClassicLayout, getTheme, saveClassicLayout, saveTheme } from './progress.js';
import { cancelRun, runTests } from './runner.js';

const main = document.querySelector('#main');
const overall = document.querySelector('#overall');
const notice = document.querySelector('#notice');
const themeButton = document.querySelector('#theme-toggle');
const settingsLink = document.querySelector('.settings-link');
const importInput = document.querySelector('#import-file');
const dialog = document.querySelector('#solution-dialog');
const problemKey = (topic, problem) => topic.id + '/' + problem.id;
const keys = new Set(topics.flatMap(topic => topic.problems.map(problem => problemKey(topic, problem))));
const progress = createProgress(keys, announce);
let theme = getTheme();
let classicLayout = getClassicLayout();
let disposeWorkspace;
let activeRun;
let currentRoute;

function escape(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function announce(message) {
  notice.textContent = message;
  notice.hidden = !message;
}

function syncProgress() {
  overall.textContent = progress.count([...keys]) + '/' + total;
}

function applyAppearance() {
  document.documentElement.dataset.layout = classicLayout ? 'classic' : 'modern';
  document.documentElement.dataset.theme = theme;
  const modernColor = theme === 'dark' ? '#17141f' : '#f7f6fa';
  document.querySelector('meta[name="theme-color"]').content = classicLayout ? '#ffffff' : modernColor;
  themeButton.hidden = classicLayout;
  themeButton.textContent = theme === 'dark' ? '☀ Light' : '☾ Dark';
  themeButton.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

themeButton.addEventListener('click', () => {
  theme = theme === 'dark' ? 'light' : 'dark';
  applyAppearance();
  saveTheme(theme);
});

document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault();
  main.focus();
});

document.querySelector('#export-progress').addEventListener('click', () => {
  progress.export();
  announce('Progress exported.');
});

document.querySelector('#import-progress').addEventListener('click', () => importInput.click());
importInput.addEventListener('change', async () => {
  const file = importInput.files[0];
  importInput.value = '';
  if (!file) return;
  try {
    if (file.size > total * 600_200 + 100) throw new Error('The progress file is too large.');
    const persisted = progress.import(await file.text());
    if (persisted) announce('Progress imported and merged with your current work.');
    render(false);
  } catch (error) {
    announce(error instanceof SyntaxError ? 'The file is invalid JSON.' : error.message);
  }
});

function topicIds(topic) {
  return topic.problems.map(problem => problemKey(topic, problem));
}

function meter(topic) {
  const solved = progress.count(topicIds(topic));
  const count = topic.problems.length;
  return `<div class="meter">
    <progress max="${count}" value="${solved}" aria-label="${escape(topic.name)} solved"></progress>
    <span>${solved}/${count} solved</span>
  </div>`;
}

function home() {
  return `<div class="page-intro">
    <h1>Java practice</h1>
    <p>${total} short exercises, from basic conditionals to streams and binary search.</p>
  </div>
  ${tracks.map(track => `<section class="track" aria-labelledby="${track.name === 'Core Java' ? 'core' : 'expanded'}">
    <div class="section-heading">
      <h2 id="${track.name === 'Core Java' ? 'core' : 'expanded'}">${track.name}</h2>
      <span>${track.topics.length} topics</span>
    </div>
    <div class="topic-grid">
      ${track.topics.map(topic => `<a class="topic-card" href="#/${topic.id}">
        <h3>${escape(topic.name)}</h3>
        <p>${escape(topic.description)}</p>
        ${meter(topic)}
      </a>`).join('')}
    </div>
  </section>`).join('')}`;
}

function settings() {
  main.innerHTML = `<div class="page-intro"><h1>Settings</h1></div>
    <div class="appearance-setting">
      <label><input id="classic-layout" type="checkbox" role="switch" aria-describedby="classic-layout-description"${classicLayout ? ' checked' : ''}> Classic layout</label>
      <p id="classic-layout-description">Use a compact, black-and-white layout. Turn it off for the modern layout with light and dark themes.</p>
    </div>`;

  main.querySelector('#classic-layout').addEventListener('change', event => {
    classicLayout = event.target.checked;
    applyAppearance();
    saveClassicLayout(classicLayout);
  });
}

function statusMarkup(entry) {
  if (entry?.solved) return '<span class="problem-status solved"><span aria-hidden="true">✓</span> Solved</span>';
  if (entry?.attempted) return '<span class="problem-status attempted"><span aria-hidden="true">×</span> Attempted</span>';
  return '<span class="problem-status fresh"><span aria-hidden="true">○</span> Unattempted</span>';
}

function category(topic) {
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="#/">Java topics</a> <span aria-hidden="true">/</span> ${escape(topic.name)}</nav>
    <div class="page-intro category-intro">
      <h1>${escape(topic.name)}</h1>
      <p>${escape(topic.description)}</p>
      ${meter(topic)}
    </div>
    <section aria-labelledby="topic-problems">
      <div class="section-heading"><h2 id="topic-problems">Problems</h2><span>${topic.problems.length} exercises</span></div>
      <ul class="problem-list">
        ${topic.problems.map(problem => `<li><a href="#/${problemKey(topic, problem)}">
          <code>${escape(problem.name)}</code>${statusMarkup(progress.get(problemKey(topic, problem)))}
        </a></li>`).join('')}
      </ul>
    </section>`;
}

function workspace(topic, problem) {
  const id = problemKey(topic, problem);
  const index = topic.problems.indexOf(problem);
  const difficulty = problem.difficulty || topic.difficulty;
  const examples = problem.tests.filter(test => !test.hidden);
  const sibling = (item, label) => item
    ? `<a class="button small" href="#/${problemKey(topic, item)}">${label}</a>`
    : `<button class="button small" type="button" disabled>${label}</button>`;
  const navigation = `<nav class="workspace-nav" aria-label="Problem navigation">
    ${sibling(topic.problems[index - 1], 'Previous problem')}
    <span>${index + 1} of ${topic.problems.length}</span>
    ${sibling(topic.problems[index + 1], 'Next problem')}
  </nav>`;

  main.innerHTML = `<nav class="breadcrumbs" aria-label="Breadcrumb">
    <a href="#/">Java topics</a><span aria-hidden="true">/</span><a href="#/${topic.id}">${escape(topic.name)}</a>
  </nav>
  <section class="problem-intro" aria-labelledby="problem-heading">
    <div class="problem-title">
      <h1 id="problem-heading">${escape(problem.name)}</h1>
      <span class="difficulty ${difficulty.toLowerCase()}">${escape(difficulty)}</span>
      <span id="workspace-status">${statusMarkup(progress.get(id))}</span>
    </div>
    ${classicLayout ? navigation : ''}
    <p>${escape(problem.description)}</p>
    <ul class="examples" aria-label="Examples">
      ${examples.map(test => `<li><code>${escape(test.call)} <span aria-label="returns">→</span> ${escape(test.expectedDisplay)}</code></li>`).join('')}
    </ul>
    <div class="problem-details">
      <details><summary>Show hint</summary><p>${escape(problem.hint)}</p></details>
      ${problem.helpers ? `<details><summary>Provided Java classes</summary><pre><code>${escape(problem.helpers)}</code></pre></details>` : ''}
    </div>
  </section>
  <div class="workspace-grid">
    <section class="workspace-panel" aria-labelledby="editor-heading">
      <div class="panel-heading"><h2 id="editor-heading">Code</h2><span>Java 17</span></div>
      <div class="editor-actions">
        <button class="button primary" type="button" id="go" title="Run tests (Ctrl+Enter or Cmd+Enter)">Go <kbd>${/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl+'}↵</kbd></button>
        <button class="button" type="button" id="stop" hidden>Stop</button>
        <button class="button" type="button" id="reset">Reset code</button>
        <button class="button" type="button" id="show-solution">Show solution</button>
      </div>
      <div class="editor-host"></div>
      <div class="panel-footer">To leave the editor with Tab, press Esc first.</div>
    </section>
    <section class="workspace-panel results-panel" aria-labelledby="results-heading">
      <div class="panel-heading"><h2 id="results-heading">Test results</h2><span>${problem.tests.length} cases</span></div>
      <p id="run-status" class="run-status" role="status">Press Go to compile your method and run the tests.</p>
      <div id="test-output"></div>
    </section>
  </div>
  ${classicLayout ? '' : navigation}`;

  const output = main.querySelector('#test-output');
  const runStatus = main.querySelector('#run-status');
  const workspaceStatus = main.querySelector('#workspace-status');
  const go = main.querySelector('#go');
  const stop = main.querySelector('#stop');
  const editor = makeEditor(main.querySelector('.editor-host'), progress.get(id)?.code ?? problem.starter,
    code => progress.update(id, { code }));
  const getCode = () => editor.state.doc.toString();
  let mounted = true;
  let busy = false;

  main.querySelector('#reset').addEventListener('click', () => {
    if (getCode() === problem.starter || !window.confirm('Reset this draft to the original method stub?')) return;
    editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: problem.starter } });
    editor.focus();
  });

  main.querySelector('#show-solution').addEventListener('click', () => {
    if (!window.confirm('Reveal the reference solution for this problem?')) return;
    document.querySelector('#reference-code').textContent = problem.solution;
    dialog.showModal();
  });

  async function run() {
    if (busy) return;
    const code = getCode();
    busy = true;
    go.setAttribute('aria-disabled', 'true');
    stop.hidden = false;
    runStatus.className = 'run-status';
    output.replaceChildren();

    if (code.length > 100_000) {
      showResult({ kind: 'compile-error', message: 'Shorten this method to 100,000 characters before running it.' });
      return;
    }

    const result = await runTests(problem, code, message => { runStatus.textContent = message; });
    if (!mounted) return;
    if (['results', 'compile-error'].includes(result.kind) ||
        (result.kind === 'timeout' && result.message.startsWith('Execution exceeded'))) {
      progress.update(id, { attempted: true, solved: Boolean(result.rows?.every(row => row.status === 'OK')) });
      syncProgress();
      workspaceStatus.innerHTML = statusMarkup(progress.get(id));
    }
    showResult(result);
  }

  function showResult(result) {
    busy = false;
    go.removeAttribute('aria-disabled');
    if (document.activeElement === stop) go.focus();
    stop.hidden = true;
    if (result.kind !== 'results') {
      runStatus.textContent = result.kind === 'compile-error' ? 'Compilation error'
        : result.kind === 'timeout' ? 'Time limit exceeded'
        : result.kind === 'cancelled' ? 'Run stopped' : 'Java runner error';
      if (result.kind !== 'cancelled') {
        runStatus.classList.add('error-text');
        const error = document.createElement('pre');
        error.className = 'diagnostic';
        error.textContent = result.message;
        output.replaceChildren(error);
      }
      return;
    }

    const passed = result.rows.filter(row => row.status === 'OK').length;
    runStatus.textContent = passed === result.rows.length ? '✓ All tests passed' : passed + ' of ' + result.rows.length + ' tests passed';
    runStatus.classList.add(passed === result.rows.length ? 'success-text' : 'error-text');
    output.innerHTML = resultsTable(problem.tests, result.rows);
  }

  go.addEventListener('click', run);
  stop.addEventListener('click', cancelRun);
  activeRun = run;
  disposeWorkspace = () => {
    mounted = false;
    activeRun = undefined;
    cancelRun();
    editor.destroy();
    if (dialog.open) dialog.close();
  };
}

function resultsTable(tests, results) {
  const rows = [];
  const hidden = [];
  tests.forEach((test, index) => {
    const row = results[index];
    if (test.hidden) {
      hidden.push(row);
      return;
    }
    rows.push(`<tr><td><code>${escape(test.call)} → ${escape(test.expectedDisplay)}</code></td>
      <td><code class="${row.status === 'E' ? 'stack-trace' : ''}">${escape(row.detail)}</code></td>
      <td class="result-mark ${row.status === 'OK' ? 'pass' : 'fail'}">${row.status === 'E' ? 'Error' : row.status}</td></tr>`);
  });
  if (hidden.length) {
    const passed = hidden.filter(row => row.status === 'OK').length;
    const allPassed = passed === hidden.length;
    rows.push(`<tr><td>Hidden tests</td><td>${passed}/${hidden.length} passed</td>
      <td class="result-mark ${allPassed ? 'pass' : 'fail'}">${allPassed ? 'OK' : 'X'}</td></tr>`);
  }
  return `<div class="result-scroll"><table aria-label="Java test results">
    <thead><tr><th scope="col">Expected</th><th scope="col">Run</th><th scope="col">Status</th></tr></thead>
    <tbody>${rows.join('')}</tbody></table></div>`;
}

function render(moveFocus = true) {
  disposeWorkspace?.();
  disposeWorkspace = undefined;
  const route = location.hash.slice(1) || '/';
  const parts = route.split('/').slice(1);
  const topic = topics.find(item => item.id === parts[0]);
  const problem = topic?.problems.find(item => item.id === parts[1]);
  syncProgress();
  if (route === '/settings') settingsLink.setAttribute('aria-current', 'page');
  else settingsLink.removeAttribute('aria-current');
  if (route === '/') {
    main.innerHTML = home();
    document.title = 'CodingVampire · Java practice';
  } else if (route === '/settings') {
    settings();
    document.title = 'Settings · CodingVampire';
  } else if (topic && parts.length === 1) {
    main.innerHTML = category(topic);
    document.title = topic.name + ' · CodingVampire';
  } else if (problem && parts.length === 2) {
    workspace(topic, problem);
    document.title = problem.name + ' · CodingVampire';
  } else {
    main.innerHTML = '<div class="page-intro"><h1>Page unavailable</h1><p><a href="#/">Browse Java topics</a></p></div>';
    document.title = 'Page unavailable · CodingVampire';
  }
  if (moveFocus && currentRoute !== route) {
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }
  currentRoute = route;
}

window.addEventListener('hashchange', () => render());
window.addEventListener('keydown', event => {
  if (activeRun && !dialog.open && event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    activeRun();
  }
});

applyAppearance();
render(false);
