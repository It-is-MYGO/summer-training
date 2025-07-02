import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),

    // 自动引入 API（如 ref、reactive、ElMessage）
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router'],
      dts: 'src/auto-imports.d.ts'
    }),

    // 自动注册组件（如 <el-button />）
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            // 删除日志输出
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 删除日志输出
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // 删除日志输出
          });
        },
        // 添加对文件上传的特殊处理
        onProxyReq: (proxyReq, req, res) => {
          if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
            // 删除日志输出
            // 移除可能导致问题的头部
            proxyReq.removeHeader('content-length');
          }
        }
      }
    }
  }
})
