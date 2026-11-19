import { buildSources, readResults } from './harness.js';

const budgets = { initializing: 120_000, compiling: 60_000, running: 3_000 };
const phaseText = {
  initializing: 'Loading Java 17…',
  compiling: 'Compiling your method…',
  running: 'Running tests…'
};

let worker;
let active;

function discardWorker() {
  worker?.terminate();
  worker = undefined;
}

export function cancelRun() {
  if (!active) return;
  const finish = active;
  discardWorker();
  finish({ kind: 'cancelled', message: 'Run stopped.' });
}

export function runTests(problem, code, onPhase) {
  if (active) cancelRun();

  return new Promise(resolve => {
    let timer;

    function finish(result) {
      clearTimeout(timer);
      if (worker) worker.onmessage = worker.onerror = worker.onmessageerror = null;
      active = undefined;
      resolve(result);
    }

    function advance(phase) {
      clearTimeout(timer);
      onPhase(phaseText[phase]);
      timer = setTimeout(() => {
        discardWorker();
        const message = phase === 'running'
          ? 'Execution exceeded 3 seconds. Check for an infinite loop or unbounded recursion.'
          : phase === 'compiling'
            ? 'Compilation took too long. Try running your code again.'
            : 'Java took too long to load. Check your connection and try again.';
        finish({ kind: 'timeout', message });
      }, budgets[phase]);
    }

    function failed(message) {
      discardWorker();
      finish({ kind: 'error', message });
    }

    active = finish;
    try {
      const base = new URL(import.meta.env.BASE_URL, window.location.href);
      worker ??= new Worker(new URL('java-worker.js', base));
      worker.onerror = event => failed(event.message || 'The Java worker stopped unexpectedly.');
      worker.onmessageerror = () => failed('Could not read the Java worker response.');
      worker.onmessage = ({ data }) => {
        if (Object.hasOwn(budgets, data.phase)) {
          advance(data.phase);
        } else if (data.phase === 'compile-error') {
          finish({ kind: 'compile-error', message: data.diagnostic });
        } else if (data.phase === 'complete') {
          try {
            const rows = readResults(data.output);
            if (rows.length !== problem.tests.length) throw new Error('The Java runner returned an incomplete result.');
            finish({ kind: 'results', rows });
          } catch (error) {
            failed(error.message);
          }
        } else {
          failed(data.diagnostic || 'The Java worker returned an unexpected response.');
        }
      };

      advance('initializing');
      worker.postMessage(buildSources(problem, code));
    } catch (error) {
      failed(error.message);
    }
  });
}
