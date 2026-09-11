import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
await build({
  entryPoints: ['src/testing-entry.ts'],
  bundle: true,
  format: 'iife',
  outfile: 'tests/generated-runtime.js',
  define: { 'process.env.NODE_ENV': '"production"' },
});
execFileSync('python3', ['scripts/prepare_tests.py'], { stdio: 'inherit' });

await import('./isolate-interface-tests.mjs');
