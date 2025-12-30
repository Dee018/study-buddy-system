
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      'sonner@2.0.3': 'sonner',
      'react-hook-form@7.55.0': 'react-hook-form',
      'figma:asset/28b6d98ff9ebaea6720db31edf60f82e259e55cf.png': path.resolve(__dirname, './src/assets/28b6d98ff9ebaea6720db31edf60f82e259e55cf.png'),
      'class-variance-authority@0.7.1': 'class-variance-authority',
      '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
      '@jsr/supabase__supabase-js@2.49.8': '@jsr/supabase__supabase-js',
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'build',
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Proxy /functions to the Supabase Functions gateway during local development
      // Replace the target with your project URL if needed. This removes CORS during dev.
      '/functions': {
        target: process.env.VITE_SUPABASE_URL || 'https://ekwsyqhfzqibfajcqahb.supabase.co',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/functions/, '/functions')
      }
      ,
      // Proxy local API server (contact API) during development
      '/api': {
        target: process.env.VITE_LOCAL_API || 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
});