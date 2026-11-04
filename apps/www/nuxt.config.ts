import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

// The library site. It renders every item from source: `@` points at the repository's registry/, so pages and previews
// import the same .vue files apps install (`@/components/ui/Button.vue`). The site's own files use `~`.
const registry = fileURLToPath(new URL('../../registry', import.meta.url))

export default defineNuxtConfig({
  compatibilityDate: '2025-08-06',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  alias: { '@': registry },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Conare design system',
      meta: [{ name: 'description', content: 'Components, tokens and checks for building Conare pages and interfaces in Vue and Nuxt.' }],
      link: [
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'preload', href: '/conare-ds/fonts/Geist-400.woff2', as: 'font', type: 'font/woff2', crossorigin: '' },
        { rel: 'preload', href: '/conare-ds/fonts/FacultyGlyphic-400.woff2', as: 'font', type: 'font/woff2', crossorigin: '' },
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
    server: { fs: { allow: [fileURLToPath(new URL('../..', import.meta.url))] } },
  },
  typescript: { tsConfig: { compilerOptions: { paths: { '@/*': [`${registry}/*`] } } } },
  nitro: {
    routeRules: { '/**': { headers: { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' } } },
  },
})
