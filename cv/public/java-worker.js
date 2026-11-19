const runtimeURL = 'https://cjrtnc.leaningtech.com/5.0/loader.js';
let judge;

self.onmessage = async ({ data: { solution, tests } }) => {
  let phase = 'initializing';
  try {
    if (!judge) {
      self.postMessage({ phase });
      importScripts(runtimeURL);
      await self.cheerpjInit({ version: 17 });
      const jarPath = '/app' + new URL('browser-judge.jar', self.location.href).pathname;
      const library = await self.cheerpjRunLibrary(jarPath);
      judge = await library.codingvampire.BrowserJudge;
    }

    phase = 'compiling';
    self.postMessage({ phase });
    const diagnostic = await judge.compile(solution, tests);
    if (diagnostic) {
      self.postMessage({ phase: 'compile-error', diagnostic });
      return;
    }

    phase = 'running';
    self.postMessage({ phase });
    const output = await judge.run();
    self.postMessage({ phase: 'complete', output });
  } catch (error) {
    self.postMessage({
      phase: 'failed',
      diagnostic: phase === 'initializing'
        ? 'Could not start CheerpJ. Check your connection to the runtime CDN and try again.\n' + String(error)
        : String(error)
    });
  }
};
