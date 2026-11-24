import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiPort = process.env.MEHRANA_DEV_API_PORT || process.env.API_PORT || 8787;

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    proxy: { '/api': `http://127.0.0.1:${apiPort}` },
  },
});

