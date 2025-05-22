import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  assetsInclude:['**/*.glb'],
  css: {
    postcss: './postcss.config.js', // Explicitly point to config
  },
});