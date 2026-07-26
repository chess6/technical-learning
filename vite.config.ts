import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { benchmarkLabPlugin } from './scripts/benchmarkLabPlugin.ts'

const rootDir = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  // benchmarkLabPlugin is dev-server-only (apply: "serve"): it serves the
  // git-ignored reference media and accepts lab captures; builds never see it.
  plugins: [react(), benchmarkLabPlugin(rootDir)],
})
