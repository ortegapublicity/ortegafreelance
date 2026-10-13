import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
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
build: {   
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
