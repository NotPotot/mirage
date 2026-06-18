import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      nextjs: 'src/server/middleware/nextjs.ts',
      express: 'src/server/middleware/express.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    outDir: 'dist',
    clean: false,
    external: ['next', 'express', 'react', 'react-dom'],
    splitting: false,
  },
  {
    entry: { react: 'src/client/index.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    outDir: 'dist',
    platform: 'browser',
    external: ['react', 'react-dom'],
  },
  {
    entry: { client: 'src/client/standalone.ts' },
    format: ['iife'],
    outDir: 'dist',
    platform: 'browser',
    globalName: 'Mirage',
  },
]);
