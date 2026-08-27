import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { socialVectorApiPlugin } from './vite-api-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    socialVectorApiPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
