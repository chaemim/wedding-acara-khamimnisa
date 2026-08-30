import { readdirSync, copyFileSync, mkdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const clientDir = resolve(process.cwd(), 'dist', 'client');
const outDir = resolve(process.cwd(), 'dist');

try {
  mkdirSync(outDir, { recursive: true });
  const files = readdirSync(clientDir);
  for (const file of files) {
    const src = resolve(clientDir, file);
    const dest = resolve(outDir, file);
    const s = statSync(src);
    if (s.isDirectory()) {
      // copy directory contents (assets)
      mkdirSync(dest, { recursive: true });
      const inner = readdirSync(src);
      for (const f of inner) {
        copyFileSync(resolve(src, f), resolve(dest, f));
      }
    } else {
      copyFileSync(src, dest);
    }
  }
  console.log('Flattened dist/client into dist');
} catch (err) {
  console.error('Failed to flatten client build:', err);
  process.exit(1);
}
