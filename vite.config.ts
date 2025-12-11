import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    base: './', // Ensures relative paths for GitHub Pages deployment
    define: {
      // 安全地替換 process.env.API_KEY，如果沒有值則給空字串，避免 undefined 錯誤
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
    }
  };
});