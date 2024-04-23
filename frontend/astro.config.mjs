import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import sanity from '@sanity/astro'
import icon from 'astro-icon'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  site: 'https://www.robbywebb.com',
  scopedStyleStrategy: 'class',
  build: {
    inlineStylesheets: 'always',
  },
  integrations: [
    icon(),
    react(),
    sitemap({
      lastmod: new Date(),
    }),
    sanity({
      projectId: 'o6m55439',
      dataset: 'production',
      // Set useCdn to false if you're building statically.
      useCdn: false,
    }),
  ],
})
