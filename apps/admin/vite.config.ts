import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const rootDir = path.resolve(__dirname, '../../');
  const env = loadEnv(mode, rootDir, '');
  const target = env.VITE_API_URL || env.API_URL || 'http://localhost:5000';

  return {
    root: __dirname,
    envDir: rootDir,
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 1235,
      host: true,
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
        },
        '/socket.io': {
          target: env.VITE_SOCKET_URL || target,
          ws: true,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 1235,
      host: true,
    },
    build: {
      outDir: path.resolve(__dirname, './dist'),
      emptyOutDir: true,
    },
  };
});
