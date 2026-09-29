import http from 'http';
import { agent } from './agent';
import * as fs from 'fs';
import * as path from 'path';

export const PORT = Number(process.env.PORT) || 3000;

export interface ServerRouteHandlers {
  analyze: (url: string) => Promise<unknown>;
  generate: (analysis: unknown) => Promise<unknown>;
  modify: (currentCode: string, instruction: string, url?: string) => Promise<unknown>;
}

export const serverHandlers: ServerRouteHandlers = {
  analyze: async (url: string) => {
    const { analyzeWebsite } = await import('./analyze');
    return analyzeWebsite(url);
  },
  generate: async (analysis: unknown) => {
    const { generateWebsite } = await import('./generate');
    return generateWebsite(analysis as Parameters<typeof generateWebsite>[0]);
  },
  modify: async (currentCode: string, instruction: string, url: string = '') => {
    const { modifyWebsite } = await import('./modify');
    return modifyWebsite(currentCode, instruction, url);
  },
};

/**
 * Creates a standalone HTTP server if run directly
 */
export function createServer(): http.Server {
  const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    if (url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'WebCloner AI' }));
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const json = body ? JSON.parse(body) : {};

          if (url.pathname === '/api/clone') {
            const result = await agent.clone(json.url);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, result }));
            return;
          }

          if (url.pathname === '/api/modify') {
            const result = await agent.modify(json.currentCode, json.instruction, json.url);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, result }));
            return;
          }

          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Endpoint not found' }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Server error' }));
        }
      });
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WebCloner AI Server is operational.');
  });

  return server;
}

if (process.env.NODE_ENV !== 'test' && require.main === module) {
  const server = createServer();
  server.listen(PORT, () => {
    console.log(`[Server] WebCloner AI server running on port ${PORT}`);
  });
}
