import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import Checker from 'vite-plugin-checker';
import svgr from "vite-plugin-svgr";

export default defineConfig({
    plugins: [
        react(),
        Checker({ typescript: true }),
        svgr()
    ],
    define: {
        'import.meta.env.VITE_SITE_URL': `"${process.env.VITE_SITE_URL}"` ? `"${process.env.VITE_SITE_URL}"` : `""`,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
