import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), 'docs');
const port = Number(process.env.PORT || 4173);

const products = [
  { id: 1, name: 'Precision Headphones', category: 'Audio', price: 129.99, stock: 12 },
  { id: 2, name: 'Trace Mechanical Keyboard', category: 'Workspace', price: 89.5, stock: 8 },
  { id: 3, name: 'Signal USB-C Hub', category: 'Workspace', price: 54.0, stock: 21 },
  { id: 4, name: 'Pulse Fitness Watch', category: 'Wearables', price: 179.0, stock: 5 }
];

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

function json(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

async function handleApi(request, response, url) {
  if (request.method === 'GET' && url.pathname === '/api/health') {
    return json(response, 200, { status: 'ok', service: 'qualitypulse', version: '1.0.0' });
  }

  if (request.method === 'GET' && url.pathname === '/api/products') {
    return json(response, 200, { count: products.length, products });
  }

  const productMatch = url.pathname.match(/^\/api\/products\/(\d+)$/);
  if (request.method === 'GET' && productMatch) {
    const product = products.find((item) => item.id === Number(productMatch[1]));
    return product
      ? json(response, 200, product)
      : json(response, 404, { error: 'Product not found' });
  }

  if (request.method === 'POST' && url.pathname === '/api/orders') {
    try {
      const body = await readBody(request);
      if (!Array.isArray(body.items) || body.items.length === 0 || !body.email) {
        return json(response, 400, { error: 'Email and at least one item are required' });
      }
      const invalid = body.items.some((item) => !products.some((product) => product.id === item.productId));
      if (invalid) return json(response, 422, { error: 'Order contains an unknown product' });
      return json(response, 201, {
        orderId: 'QP-2026-001',
        status: 'confirmed',
        itemCount: body.items.length,
        email: body.email
      });
    } catch {
      return json(response, 400, { error: 'Invalid JSON body' });
    }
  }

  return json(response, 404, { error: 'Route not found' });
}

async function serveStatic(response, pathname) {
  const requested = pathname === '/' ? '/index.html' : pathname;
  let path = normalize(join(root, requested));
  if (!path.startsWith(root)) return json(response, 403, { error: 'Forbidden' });

  try {
    if ((await stat(path)).isDirectory()) path = join(path, 'index.html');
    const body = await readFile(path);
    response.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream' });
    response.end(body);
  } catch {
    json(response, 404, { error: 'File not found' });
  }
}

createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host}`);
  if (url.pathname.startsWith('/api/')) return handleApi(request, response, url);
  return serveStatic(response, decodeURIComponent(url.pathname));
}).listen(port, '127.0.0.1', () => {
  console.log(`QualityPulse running at http://127.0.0.1:${port}`);
});
