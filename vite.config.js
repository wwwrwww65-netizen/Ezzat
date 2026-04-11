import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // يجب أن يتطابق هذا الاسم مع اسم المستودع (Repository Name) في جيت هب
  base: '/Ezzat/', 
})
