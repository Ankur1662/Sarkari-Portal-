import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes';
import { initServerScheduler } from './server/scheduler';
import { generateSitemapXml, injectSeoIntoHtml } from './server/seoHelper';

dotenv.config();

const __dirname = process.cwd();
const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(path.resolve(__dirname, 'dist'));
const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  const app = express();

  // Middleware for body parsing
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // API Routes
  app.use('/api', apiRouter);

  // Dynamic XML Sitemap for search engines
  app.get('/sitemap.xml', (_req, res) => {
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(generateSitemapXml());
  });

  // Robots.txt
  app.get('/robots.txt', (_req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(`User-agent: *
Allow: /
Allow: /latest-jobs
Allow: /results
Allow: /admit-card
Allow: /answer-key
Allow: /syllabus
Allow: /job/
Allow: /assets/
Disallow: /api/
Disallow: /admin

Sitemap: https://sarkariportal.ai.studio/sitemap.xml
`);
  });

  // Initialize server-side autonomous monitoring scheduler
  initServerScheduler();

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'SarkariPortal AI Monitoring and Auto-Publishing System',
      timestamp: new Date().toISOString(),
    });
  });

  if (!isProd) {
    // Development mode: Vite middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Server] Vite middleware mounted in development mode');
  } else {
    // Production mode: Serve built static files with page-specific SEO pre-rendering
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath, { index: false }));
      app.get('*', (req, res) => {
        try {
          const indexHtmlPath = path.resolve(distPath, 'index.html');
          const rawHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
          const finalHtml = injectSeoIntoHtml(rawHtml, req.path);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.send(finalHtml);
        } catch {
          res.sendFile(path.resolve(distPath, 'index.html'));
        }
      });
      console.log(`[Server] Serving production static assets with SEO pre-rendering from ${distPath}`);
    } else {
      console.warn('[Server] dist directory not found. Please run `npm run build`.');
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SarkariPortal] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal error during startup:', err);
  process.exit(1);
});
