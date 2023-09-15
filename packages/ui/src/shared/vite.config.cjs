const { resolve } = require('node:path')
// const glob = require('glob')
const { defineConfig, splitVendorChunkPlugin, normalizePath } = require('vite')
//
const { VitePWA } = require('vite-plugin-pwa')
const { createHtmlPlugin } = require('vite-plugin-html')
const { viteStaticCopy } = require('vite-plugin-static-copy')
const { default: minifyHTMLLiterals } = require('rollup-plugin-minify-html-literals')
const { config } = require('dotenv')
// Polyfills
const { default: legacy } = require('@vitejs/plugin-legacy')
const { default: mkcert } = require('vite-plugin-mkcert')

// Env
config()

const { env } = process
const appTitle = env.VITE_APP_TITLE || env.VITE_APP_NAME || env.npm_package_name
const mdi = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.2.96/css/materialdesignicons.min.css"/>`

const define = {
  'import.meta.env.VITE_APP_VER': JSON.stringify(env.npm_package_version),
  'import.meta.env.VITE_APP_MDI': JSON.stringify(mdi),
  global: 'globalThis'
}

const viteConfig = (options = {}) => {
  const shimNode = (s) => resolve(__dirname, '../../../core/src/shims/node', s)
  const { server: { https = true } = {}, viteConfigOptions = {} } = options
  return ({ mode = '' }) => {
    const isDev = mode === 'development'
    if (isDev) env.TAILWIND_MODE = 'watch'

    const defaultConfig = {
      base: env.VITE_APP_BASE || '/',
      define,
      server: {
        port: 3000,
        proxy: {},
        fs: { strict: false },
        host: true,
        https
      },
      resolve: {
        alias: {
          '~': resolve(process.cwd(), './src'),
          // bugfix: crypto-addr-codec@0.1.7
          'crypto-addr-codec': 'crypto-addr-codec/dist/index.js',
          // Node Shims
          stream: shimNode('stream.ts'),
          util: shimNode('util.js')
          // assert: shimNode('assert.js')
        }
      },
      build: {
        ...(isDev ? { minify: false, sourcemap: 'inline' } : {}),
        rollupOptions: {
          // external: /^lit/
          // input: {
          //   main: resolve(process.cwd(), 'index.html')
          // }
        }
      },
      css: {
        devSourcemap: true,
        modules: { generateScopedName: '[hash:base64:6]' }
      },
      plugins: [
        ...(https ? [mkcert()] : []),
        minifyHTMLLiterals(),
        ...(viteConfigOptions.splitChunk === false ? [] : [splitVendorChunkPlugin()]),
        ...(viteConfigOptions.html === false
          ? []
          : [
              createHtmlPlugin({
                inject: {
                  data: {
                    HEAD: `<meta charset="UTF-8" />
                <link rel="icon" href="/favicon.ico" />
                <meta
                  name="viewport"
                  content="width=device-width,user-scalable=0,initial-scale=1,maximum-scale=1,minimal-ui,viewport-fit=cover"
                />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/site.webmanifest" />
                <link rel="mask-icon" href="/safari-pinned-tab.svg" color="${env.VITE_APP_FG}" />
                <meta name="apple-mobile-web-app-title" content="${appTitle}" />
                <meta name="application-name" content="${appTitle}" />
                <meta name="msapplication-TileColor" content="${env.VITE_APP_BG}" />
                <meta name="theme-color" content="${env.VITE_APP_BG}" />
                <title>${appTitle}</title>
                <meta name="description" content="${env.VITE_APP_DESC}" />
                <meta name="og:type" content="website" />
                ${mdi}
                <script type="module" src="/src/main.ts"></script>
              `,
                    BODY: `
              <app-root></app-root>
              ${
                isDev || !env.VITE_APP_GA
                  ? ''
                  : `<script async src="https://www.googletagmanager.com/gtag/js?id=${env.VITE_APP_GA}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config', '${env.VITE_APP_GA}')</script>`
              }
              `
                  }
                },
                minify: true
              })
            ]),
        ...(isDev || viteConfigOptions.copies
          ? viteConfigOptions.copies ?? []
          : [
              viteStaticCopy({
                targets: [
                  // Github Pages
                  {
                    src: 'dist/index.html',
                    dest: './',
                    rename: '404.html'
                  },
                  {
                    src: normalizePath(resolve(__dirname, './.nojekyll')),
                    dest: './'
                  }
                ]
              })
            ]),
        ...(viteConfigOptions.pwa === false
          ? []
          : [
              VitePWA({
                // selfDestroying: true,
                registerType: 'autoUpdate',
                manifest: {
                  name: env.VITE_APP_TITLE || env.npm_package_displayName,
                  short_name: env.VITE_APP_NAME,
                  lang: 'en',
                  background_color: env.VITE_APP_BG
                }
              })
            ]),
        ...(viteConfigOptions.legacy === false
          ? []
          : [
              //TODO: Disabled for `BigInt` error (@vitejs/plugin-legacy@4.1.1)
              // legacy({
              //   polyfills: ['web.url', 'es.object.from-entries']
              // })
            ])
      ],
      optimizeDeps: {
        include: ['readable-stream']
      }
    }
    // options (shallow merge)
    const merge = (src, dest) => {
      for (var key in dest) {
        if (key === 'viteConfigOptions') continue
        let [vSrc, vDest] = [src[key], dest[key]]
        if (vSrc && Array.isArray(vSrc)) {
          vDest.forEach((dest) => {
            const found = vSrc.some((r) => r == dest)
            if (!found) vSrc.push(dest)
          })
        } else if (vSrc && typeof vSrc === 'object') merge(vSrc, vDest)
        else src[key] = vDest
      }
    }
    merge(defaultConfig, options)
    return defineConfig(defaultConfig)
  }
}

module.exports = { viteConfig }
