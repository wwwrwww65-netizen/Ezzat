import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import fs from 'fs'
import path from 'path'

// ── Plugin: نسخ preload.cjs مباشرة بدون bundle لتجنب "export default" ──
const copyPreloadPlugin = {
  name: 'copy-preload-cjs',
  closeBundle() {
    const src = path.resolve('electron/preload.cjs');
    const dest = path.resolve('dist-electron/preload.js');
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log('✅ preload.js copied as raw CJS');
  },
  buildStart() {
    // في وضع dev: انسخ الملف فورًا
    const src = path.resolve('electron/preload.cjs');
    const dest = path.resolve('dist-electron/preload.js');
    if (fs.existsSync(src)) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
    }
  }
};

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.js',
        vite: {
          build: {
            rollupOptions: {
              external: ['electron', 'sql.js']
            }
          }
        }
      },
    ]),
    renderer(),
    copyPreloadPlugin,
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: false },
      workbox: {
        maximumFileSizeToCacheInBytes: 50000000 // 50MB
      },
      manifest: {
        name: 'Construction ERP System',
        short_name: 'ConstERP',
        description: 'نظام إدارة شركة مقاولات - Offline First',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone'
      }
    })
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer()
      ]
    }
  },
  base: './',
  optimizeDeps: {
    exclude: ['sql.js']
  },
  server: {
    hmr: { overlay: false }
  }
})
