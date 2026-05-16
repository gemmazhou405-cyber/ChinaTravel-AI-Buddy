import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ChinaTravel-AI-Buddy/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
