import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY;

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'blueprint-api-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/generate-blueprint' && req.method === 'POST') {
              let bodyStr = '';
              req.on('data', chunk => {
                bodyStr += chunk;
              });
              req.on('end', async () => {
                try {
                  const body = JSON.parse(bodyStr || '{}');
                  const prompt = body.prompt || '3D isometric enterprise cloud architecture blueprint';
                  const runtimeApiKey = apiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

                  if (!runtimeApiKey) {
                    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
                  }

                  const { GoogleGenAI } = await import('@google/genai');
                  const ai = new GoogleGenAI({ apiKey: runtimeApiKey });

                  const imgResp = await ai.models.generateImages({
                    model: 'imagen-3.0-generate-002',
                    prompt,
                    config: {
                      numberOfImages: 1,
                      aspectRatio: '16:9',
                      outputMimeType: 'image/jpeg'
                    }
                  });

                  const imageBase64 = imgResp.generatedImages?.[0]?.image?.imageBytes;
                  if (imageBase64) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      success: true,
                      imageBase64,
                      model: 'imagen-3.0-generate-002',
                      prompt
                    }));
                    return;
                  } else {
                    throw new Error('No image bytes returned from Imagen 3 model.');
                  }
                } catch (err: any) {
                  console.error('=== GEMINI API GENERATION ERROR ===', err);
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: false,
                    error: err.message || String(err),
                    fallbackUrl: '/assets/images/blueprint_3d_isometric_1791610246387.jpg'
                  }));
                }
              });
              return;
            }

            if (req.url && req.url.startsWith('/src/assets/images/')) {
              req.url = req.url.replace('/src/assets/images/', '/assets/images/');
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});