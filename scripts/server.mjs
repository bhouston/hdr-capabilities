import { build } from 'esbuild';
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export async function startPrototypeServer(port = 0) {
  const bundle = await build({
    entryPoints: [new URL('../src/hdr-canvas.js', import.meta.url).pathname],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
  });
  const html = await readFile(new URL('../src/index.html', import.meta.url));
  const sample = await readFile(new URL('../public/sample.hdr', import.meta.url));
  const logo = await readFile(new URL('../public/logo.png', import.meta.url));
  const routes = new Map([
    ['/logo.png', ['image/png', logo]],
    ['/', ['text/html; charset=utf-8', html]],
    ['/prototype.js', ['text/javascript', bundle.outputFiles[0].contents]],
    ['/sample.hdr', ['application/octet-stream', sample]],
  ]);
  for (const file of await readdir(new URL('../public/fixtures/', import.meta.url))) routes.set(`/fixtures/${file}`, ['image/jxl', await readFile(new URL(`../public/fixtures/${file}`, import.meta.url))]);
  const server = createServer((request, response) => {
    const route = routes.get(new URL(request.url, 'http://localhost').pathname);
    response.writeHead(route ? 200 : 404, { 'Content-Type': route?.[0] ?? 'text/plain' });
    response.end(route?.[1] ?? 'Not found');
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = await startPrototypeServer(Number(process.env.PORT ?? 4178));
  console.log(`Canvas 2D HDR prototype: ${server.url}`);
}
