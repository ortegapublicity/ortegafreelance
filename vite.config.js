import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
// const path = require('path')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // root:path.resolve(__dirname, 'src'),
  // build:{
  //   outDir:"../dist"
  // }
  optimizeDeps: {
    include: ['contentful'],
  },
build: {
    commonjsOptions: {
      include: [/node_modules/],
      namedExports: {
        'contentful': ['createClient'], // Indica qué exportaciones buscar
    },
  },
},
});
