import { defineConfig } from 'astro/config'
import icon from 'astro-icon'
import sitemap from '@astrojs/sitemap'

// https://astro.build/config
export default defineConfig({
  site: 'https://www.robbywebb.com',
  scopedStyleStrategy: 'class',
  build: {
    inlineStylesheets: 'always',
  },
  integrations: [
    icon(),
    sitemap({
      lastmod: new Date(),
    }),
  ],
})
