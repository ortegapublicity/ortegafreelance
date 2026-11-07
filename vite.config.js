import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
import { fileURLToPath } from 'node:url'
// const path = require('path')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteCommonjs()
  ],
  // root:path.resolve(__dirname, 'src'),
  // build:{
  //   outDir:"../dist"
  // }
  optimizeDeps: {
    include: ['contentful'],
  },
// Dos páginas: la web (SPA de React) y el panel de correo /sistemas/, que es
// HTML y TypeScript sin React. Netlify sirve dist/sistemas/index.html antes
// de la regla del SPA porque el archivo existe.
build: {
  rollupOptions: {
    input: {
      main: fileURLToPath(new URL('./index.html', import.meta.url)),
      sistemas: fileURLToPath(new URL('./sistemas/index.html', import.meta.url)),
    },
  },
},
preview: {
  historyApiFallback: true,
},
// Mismo reenvío a Contentful que netlify.toml, para desarrollo local.
server: {
  proxy: {
    '/cf-api': { target: 'https://cdn.contentful.com', changeOrigin: true, rewrite: (p) => p.replace(/^\/cf-api/, '') },
    '/cf-preview': { target: 'https://preview.contentful.com', changeOrigin: true, rewrite: (p) => p.replace(/^\/cf-preview/, '') },
    '/cf-img': { target: 'https://images.ctfassets.net', changeOrigin: true, rewrite: (p) => p.replace(/^\/cf-img/, '') },
  },
},
});
