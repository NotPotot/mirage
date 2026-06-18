import { defineConfig } from 'tsup';

export default defineConfig([
  // Node entry points (server middleware + shared core)
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
  // React provider (ESM + CJS, for bundlers)
  {
    entry: { react: 'src/client/index.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    outDir: 'dist',
    platform: 'browser',
    external: ['react', 'react-dom'],
  },
  // Standalone browser bundle as ESM (for <script type="module"> and browser imports)
  {
    entry: { 'browser': 'src/client/standalone.ts' },
    format: ['esm'],
    outDir: 'dist',
    platform: 'browser',
    dts: true,
    minify: true,
  },
  // Global IIFE bundle - exposes window.Mirage; safe to drop in any HTML page
  {
    entry: { client: 'src/client/standalone.ts' },
    format: ['iife'],
    outDir: 'dist',
    platform: 'browser',
    globalName: 'Mirage',
    minify: true,
    footer: {
      js: 'if(typeof window!=="undefined"&&Mirage&&Mirage.default)Object.assign(Mirage,Mirage.default);',
    },
  },
]);
