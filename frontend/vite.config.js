import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to move CSS links right after the viewport meta tag to prevent FOUC and viewport resizing shifts
const prioritizeCssPlugin = () => {
  return {
    name: 'prioritize-css',
    transformIndexHtml(html) {
      const cssRegex = /<link rel="stylesheet"[^>]*>/g;
      const cssLinks = html.match(cssRegex) || [];
      if (cssLinks.length === 0) return html;
      
      // Remove them from their original positions
      let cleanHtml = html.replace(cssRegex, '');
      
      // Inject them right after the viewport meta tag to ensure layout scales are configured first
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
  plugins: [react(), prioritizeCssPlugin()],
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
