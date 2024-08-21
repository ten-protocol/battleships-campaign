import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import Checker from "vite-plugin-checker";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), Checker({ typescript: true })],
  define: {
    'import.meta.env.VITE_SITE_URL': `"https://${process.env.VERCEL_URL}"`,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
