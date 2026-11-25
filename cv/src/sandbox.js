import { makeEditor } from './editor.js';
import { cancelRun, runProgram } from './runner.js';

const key = 'codingvampire.sandbox.code';
const starter = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}
`;
let draft = starter;
let stdin = '';
try {
  draft = localStorage.getItem(key) ?? starter;
} catch {
  // Keep the draft in memory when browser storage is unavailable.
}

export function sandbox(main) {
  main.innerHTML = `<div class="page-intro">
    <h1>Java Sandbox</h1>
    <p>Write a Java program with a <code>main</code> method and run it in your browser.</p>
  </div>
  <div class="workspace-grid">
    <section class="workspace-panel" aria-labelledby="sandbox-code-heading">
      <div class="panel-heading"><h2 id="sandbox-code-heading">Code</h2><span>Java 17</span></div>
      <div class="editor-actions">
        <button class="button primary" type="button" id="sandbox-run" title="Run Java (Ctrl+Enter or Cmd+Enter)">Run</button>
        <button class="button" type="button" id="sandbox-stop" hidden>Stop</button>
      </div>
      <div class="editor-host"></div>
      <div class="panel-footer">To leave the editor with Tab, press Esc first.</div>
      <details class="sandbox-input">
        <summary>Program input (optional)</summary>
        <textarea rows="3" maxlength="100000" aria-label="Program input" placeholder="Text for System.in"></textarea>
      </details>
    </section>
    <section class="workspace-panel" aria-labelledby="sandbox-console-heading">
      <div class="panel-heading"><h2 id="sandbox-console-heading">Console</h2></div>
      <p class="run-status" role="status">Ready.</p>
      <pre class="sandbox-output" aria-labelledby="sandbox-console-heading" tabindex="0"></pre>
    </section>
  </div>`;

  const input = main.querySelector('textarea');
  const runButton = main.querySelector('#sandbox-run');
  const stopButton = main.querySelector('#sandbox-stop');
  const status = main.querySelector('.run-status');
  const output = main.querySelector('.sandbox-output');
  const editor = makeEditor(main.querySelector('.editor-host'), draft, code => {
    draft = code;
    if (code.length > 100_000) return;
    try {
      localStorage.setItem(key, code);
    } catch {
      // The in-memory draft is still available while the page is open.
    }
  }, 'Write a Java program');
  input.value = stdin;
  if (stdin) input.closest('details').open = true;
  input.addEventListener('input', () => { stdin = input.value; });

  let mounted = true;
  let busy = false;

  async function run() {
    if (busy) return;
    output.textContent = '';
    status.className = 'run-status';
    const code = editor.state.doc.toString();
    if (code.length > 100_000) {
      status.textContent = 'Shorten the program to 100,000 characters before running it.';
      status.classList.add('error-text');
      return;
    }

    busy = true;
    runButton.setAttribute('aria-disabled', 'true');
    stopButton.hidden = false;
    const result = await runProgram(code, input.value, message => { status.textContent = message; });
    if (!mounted) return;
    busy = false;
    runButton.removeAttribute('aria-disabled');
    if (document.activeElement === stopButton) runButton.focus();
    stopButton.hidden = true;
    const labels = {
      complete: result.message ? 'Finished.' : 'Finished. No console output.',
      'runtime-error': 'Program stopped.',
      'compile-error': 'Compilation error.',
      timeout: 'Time limit exceeded.',
      cancelled: 'Run stopped.',
      error: 'Java runner error.'
    };
    status.textContent = labels[result.kind];
    if (result.kind !== 'complete' && result.kind !== 'cancelled') status.classList.add('error-text');
    if (result.kind !== 'cancelled') output.textContent = result.message;
  }

  runButton.addEventListener('click', run);
  stopButton.addEventListener('click', cancelRun);
  return {
    run,
    dispose() {
      mounted = false;
      cancelRun();
      editor.destroy();
    }
  };
}
