import { readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const distDir = resolve(process.cwd(), 'dist/client');
const assetsDir = resolve(distDir, 'assets');
const files = readdirSync(assetsDir);

const cssFiles = files.filter((file) => file.endsWith('.css') && file.startsWith('index-'));
const jsFiles = files.filter((file) => file.endsWith('.js') && file.startsWith('index-'));

if (jsFiles.length === 0) {
  throw new Error('No index JS file found in dist/client/assets. Please run build first.');
}

const cssLinks = cssFiles
  .map((file) => `<link rel="stylesheet" href="/assets/${file}" />`)
  .join('\n    ');

const jsScripts = jsFiles
  .map((file) => `<script type="module" src="/assets/${file}"></script>`)
  .join('\n    ');

const html = `<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Undangan Pernikahan Abdul Khamim & Fariqotun Nisa</title>
    ${cssLinks}
  </head>
  <body>
    <div id="root"></div>
    ${jsScripts}
  </body>
</html>
`;

writeFileSync(resolve(distDir, 'index.html'), html, 'utf8');
console.log('Generated dist/client/index.html');
