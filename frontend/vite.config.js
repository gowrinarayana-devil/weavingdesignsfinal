import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to move CSS links right after the viewport meta tag to prevent FOUC, and replace env variables in HTML
const htmlOptimizePlugin = (env) => {
  return {
    name: 'html-optimize',
    transformIndexHtml(html) {
      // 1. Move CSS links to prevent FOUC
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
      
      // 2. Explicitly replace Supabase environment variables in HTML script pre-fetcher
      if (env.VITE_SUPABASE_URL) {
        cleanHtml = cleanHtml.replace(/%VITE_SUPABASE_URL%/g, env.VITE_SUPABASE_URL);
      }
      if (env.VITE_SUPABASE_ANON_KEY) {
        cleanHtml = cleanHtml.replace(/%VITE_SUPABASE_ANON_KEY%/g, env.VITE_SUPABASE_ANON_KEY);
      }
      
      return cleanHtml;
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), htmlOptimizePlugin(env)],
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
  };
})
