import { build } from 'esbuild';
import { cp, mkdir, copyFile } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
await build({ entryPoints: ['src/hdr-canvas.js'], outfile: 'dist/prototype.js', bundle: true, format: 'esm', platform: 'browser', target: 'es2022', minify: true });
await cp('public', 'dist', { recursive: true });
await copyFile('src/index.html', 'dist/index.html');
