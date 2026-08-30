import { mkdirSync, readdirSync, copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const src = resolve(process.cwd(), 'dist', 'client', 'assets');
const dest = resolve(process.cwd(), 'public', 'assets');

if (!existsSync(src)) {
  console.error('Source assets folder not found:', src);
  process.exit(1);
}

mkdirSync(dest, { recursive: true });

const files = readdirSync(src);
for (const file of files) {
  const s = resolve(src, file);
  const d = resolve(dest, file);
  copyFileSync(s, d);
}

console.log('Copied', files.length, 'assets to', dest);
