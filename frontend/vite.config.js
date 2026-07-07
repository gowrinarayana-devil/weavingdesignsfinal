import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to move CSS links to the top of <head> to prevent FOUC (Flash of Unstyled Content) and CLS
const prioritizeCssPlugin = () => {
  return {
    name: 'prioritize-css',
    transformIndexHtml(html) {
      const cssRegex = /<link rel="stylesheet"[^>]*>/g;
      const cssLinks = html.match(cssRegex) || [];
      if (cssLinks.length === 0) return html;
      
      // Remove them from their original positions
      let cleanHtml = html.replace(cssRegex, '');
      
      // Inject them right at the start of <head>
      const cssInjected = cssLinks.join('\n    ');
      cleanHtml = cleanHtml.replace('<head>', `<head>\n    ${cssInjected}`);
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
