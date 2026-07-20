import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to move CSS links right after the viewport meta tag to prevent FOUC and CLS
const htmlOptimizePlugin = () => {
  return {
    name: 'html-optimize',
    transformIndexHtml(html) {
      // Move CSS links to prevent FOUC
      const cssRegex = /<link rel="stylesheet"[^>]*>/g;
      const cssLinks = html.match(cssRegex) || [];
      let cleanHtml = html.replace(cssRegex, '');
      
      const cssInjected = cssLinks.join('\n    ');
      const viewportRegex = /<meta name="viewport"[^>]*>/;
      if (viewportRegex.test(cleanHtml)) {
        cleanHtml = cleanHtml.replace(viewportRegex, `$&\n    ${cssInjected}`);
      } else {
        cleanHtml = cleanHtml.replace('<head>', `<head>\n    ${cssInjected}`);
      }
      
      return cleanHtml;
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), htmlOptimizePlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler') || id.includes('react-dom') || id.includes('react-router') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('supabase-js') || id.includes('postgrest-js') || id.includes('storage-js') || id.includes('realtime-js')) {
              return 'vendor-supabase';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            return 'vendor-others';
          }
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true, // allows access from external network interfaces
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
