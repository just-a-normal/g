import { rename } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const template = 'app.html';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: { input: fileURLToPath(new URL(template, import.meta.url)) }
  },
  plugins: [{
    name: 'codingvampire-entry',
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        if (request.url?.split('?')[0] === '/') request.url = '/' + template + request.url.slice(1);
        next();
      });
    },
    async writeBundle({ dir }) {
      await rename(join(dir, template), join(dir, 'index.html'));
    }
  }]
});
