import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const sitemapPaths = ['/', '/idt-home']

function createSitemap(siteUrl, lastModified) {
  const baseUrl = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`
  const entries = sitemapPaths.map((path) => {
    const url = new URL(path.replace(/^\//, ''), baseUrl).toString()
    return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastModified}</lastmod>
  </url>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const robotsDirective = env.VITE_APP_ENV === 'live'
    ? 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
    : 'noindex, nofollow, noarchive'
  const siteUrl = env.VITE_SITE_URL || 'https://idt.equitypandit.in/'
  let outputDirectory = resolve(process.cwd(), 'dist')

  return {
    plugins: [
      react(),
      {
        name: 'build-time-robots-meta',
        transformIndexHtml(html) {
          return html.replaceAll('__ROBOTS_DIRECTIVE__', robotsDirective)
        },
      },
      {
        name: 'build-time-sitemap',
        apply: 'build',
        configResolved(config) {
          outputDirectory = resolve(config.root, config.build.outDir)
        },
        async closeBundle() {
          const lastModified = new Date().toISOString()
          await mkdir(outputDirectory, { recursive: true })
          const config = {
            __FIREBASE_API_KEY__: env.VITE_FIREBASE_API_KEY,
            __FIREBASE_AUTH_DOMAIN__: env.VITE_FIREBASE_AUTH_DOMAIN,
            __FIREBASE_PROJECT_ID__: env.VITE_FIREBASE_PROJECT_ID,
            __FIREBASE_STORAGE_BUCKET__: env.VITE_FIREBASE_STORAGE_BUCKET,
            __FIREBASE_MESSAGING_SENDER_ID__: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            __FIREBASE_APP_ID__: env.VITE_FIREBASE_APP_ID,
          }
          for (const [placeholder, value] of Object.entries(config)) {
            if (!value) throw new Error(`Missing Firebase setting for ${placeholder}`)
          }
          const workerPath = resolve(outputDirectory, 'firebase-messaging-sw.js')
          await copyFile(resolve(process.cwd(), 'public/firebase-messaging-sw.js'), workerPath)
          let worker = await readFile(workerPath, 'utf8')
          for (const [placeholder, value] of Object.entries(config)) {
            worker = worker.replaceAll(placeholder, value)
          }
          await writeFile(workerPath, worker, 'utf8')
          await writeFile(
            resolve(outputDirectory, 'sitemap.xml'),
            createSitemap(siteUrl, lastModified),
            'utf8',
          )
        },
      },
    ],
    server: {
      host: true,
    },
    define: {
      CASHFREE_ENV: JSON.stringify(env.CASHFREE_ENV || 'sandbox'),
      DIGIO_ENV: JSON.stringify(env.DIGIO_ENV || 'sandbox'),
    },
  }
})
