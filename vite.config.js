import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        // Split the big libraries into their own files. The browser downloads
        // them in parallel, and after the first visit they stay cached even
        // when the site's own code is updated — so pages open faster.
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/ },
            { name: 'firebase', test: /node_modules[\\/](@firebase|firebase|re2js|idb)[\\/]/ },
            { name: 'motion', test: /node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/ },
          ],
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
})