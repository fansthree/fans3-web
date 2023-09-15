import { viteConfig } from '@fans3/ui/src/shared/vite.config.cjs'

export default ({ mode = '' }) => {
  return viteConfig({
    server: { port: 3000 },
    build: {
      emptyOutDir: false
    }
  })({ mode })
}
