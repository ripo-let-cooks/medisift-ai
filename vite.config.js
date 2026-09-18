import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function apiServerPlugin() {
  return {
    name: 'api-server-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/gemini' || req.url.startsWith('/api/gemini?')) {
          try {
            let rawBody = '';
            req.on('data', chunk => {
              rawBody += chunk;
            });
            req.on('end', async () => {
              try {
                req.body = rawBody ? JSON.parse(rawBody) : {};
              } catch {
                req.body = {};
              }
              const { default: handler } = await import('./api/gemini.js');
              await handler(req, res);
            });
          } catch (err) {
            console.error('[Vite API Middleware Error]:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        } else {
          next();
        }
      });
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.GEMINI_API_KEYS) {
    process.env.GEMINI_API_KEYS = env.GEMINI_API_KEYS;
  }

  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
})

