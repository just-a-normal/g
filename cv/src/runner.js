import { buildSources, readResults } from './harness.js';

const budgets = { initializing: 120_000, compiling: 60_000, running: 3_000 };
const phaseText = {
  initializing: 'Loading Java 17…',
  compiling: 'Compiling your method…',
  running: 'Running tests…'
};

let exerciseWorker;
let active;

export function cancelRun() {
  active?.();
}

export function runTests(problem, code, onPhase) {
  return runJava(buildSources(problem, code), onPhase, output => {
    const rows = readResults(output);
    if (rows.length !== problem.tests.length) throw new Error('The Java runner returned an incomplete result.');
    return { kind: 'results', rows };
  });
}

export function runProgram(program, input, onPhase) {
  return runJava({ program, input }, onPhase, output => {
    if (!/^[01]\n/.test(output)) throw new Error('The Java runner returned an incomplete result.');
    return { kind: output[0] === '0' ? 'complete' : 'runtime-error', message: output.slice(2) };
  }, true);
}

function runJava(payload, onPhase, parse, sandbox = false) {
  cancelRun();
  const executionSeconds = sandbox ? 5 : budgets.running / 1000;

  return new Promise(resolve => {
    let timer;
    let worker;

    function finish(result, discard = false) {
      clearTimeout(timer);
      if (worker) worker.onmessage = worker.onerror = worker.onmessageerror = null;
      if (sandbox || discard) {
        worker?.terminate();
        if (worker === exerciseWorker) exerciseWorker = undefined;
      }
      active = undefined;
      resolve(result);
    }

    function advance(phase) {
      clearTimeout(timer);
      const label = sandbox && phase !== 'initializing'
        ? (phase === 'compiling' ? 'Compiling Java…' : 'Running program…')
        : phaseText[phase];
      onPhase(label);
      timer = setTimeout(() => {
        const message = phase === 'running'
          ? 'Execution exceeded ' + executionSeconds + ' seconds. Check for an infinite loop or unbounded recursion.'
          : phase === 'compiling'
            ? 'Compilation took too long. Try running your code again.'
            : 'Java took too long to load. Check your connection and try again.';
        finish({ kind: 'timeout', message }, true);
      }, phase === 'running' ? executionSeconds * 1000 : budgets[phase]);
    }

    function failed(message) {
      finish({ kind: 'error', message }, true);
    }

    active = () => finish({ kind: 'cancelled', message: 'Run stopped.' }, true);
    try {
      const base = new URL(import.meta.env.BASE_URL, window.location.href);
      const url = new URL('runtime-worker.js', base);
      worker = sandbox ? new Worker(url) : (exerciseWorker ??= new Worker(url));
      worker.onerror = event => failed(event.message || 'The Java worker stopped unexpectedly.');
      worker.onmessageerror = () => failed('Could not read the Java worker response.');
      worker.onmessage = ({ data }) => {
        if (Object.hasOwn(budgets, data.phase)) {
          advance(data.phase);
        } else if (data.phase === 'compile-error') {
          finish({ kind: 'compile-error', message: data.diagnostic });
        } else if (data.phase === 'complete') {
          try {
            finish(parse(data.output));
          } catch (error) {
            failed(error.message);
          }
        } else {
          failed(data.diagnostic || 'The Java worker returned an unexpected response.');
        }
      };

      advance('initializing');
      worker.postMessage(payload);
    } catch (error) {
      failed(error.message);
    }
  });
}
