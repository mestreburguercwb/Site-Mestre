import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Site-Mestre/',
  plugins: [react()],
});