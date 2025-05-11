import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/2akel/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
