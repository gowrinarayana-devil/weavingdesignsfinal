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
