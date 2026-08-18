import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",   // 👈 IMPORTANT for Docker
    port: 5173,
    https: (() => {
      const certDir = fs.existsSync('/app/certs/localhost.pem') ? '/app/certs' : '../certs';
      return {
        key: fs.readFileSync(`${certDir}/localhost-key.pem`),
        cert: fs.readFileSync(`${certDir}/localhost.pem`),
      };
    })()
  }
})


