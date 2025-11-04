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
});
