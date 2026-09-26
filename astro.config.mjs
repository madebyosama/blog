// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import remarkGfm from 'remark-gfm';
import remarkFlexibleMarkers from 'remark-flexible-markers';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { rehypeTidy, shikiFilename } from './src/lib/markdown.mjs';

export default defineConfig({
  site: 'https://blog.madebyosama.com',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // One small stylesheet: inline it and save a request.
    inlineStylesheets: 'always',
  },

  integrations: [
    mdx(),
    // Only used by MDX islands (client:visible). Pages without one ship no JS.
    preact(),
    sitemap({ filter: (page) => !page.endsWith('/404/') }),
  ],

  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Inter',
      cssVariable: '--font-sans',
      fallbacks: ['-apple-system', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      options: {
        variants: [
          { src: ['./src/assets/fonts/inter-latin-400-600.woff2'], weight: '400 600', style: 'normal' },
        ],
      },
    },
    {
      // Loaded only on posts with `lang: ur`.
      provider: fontProviders.local(),
      name: 'Noto Nastaliq Urdu',
      cssVariable: '--font-urdu',
      fallbacks: ['serif'],
      options: {
        variants: [
          { src: ['./src/assets/fonts/noto-nastaliq-urdu-arabic-400-normal.woff2'], weight: 400, style: 'normal' },
        ],
      },
    },
  ],

  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      // Colors come from CSS custom properties, so light/dark follow the site palette.
      theme: 'css-variables',
      transformers: [shikiFilename()],
    },
    processor: unified({
      gfm: true, // tables, footnotes, strikethrough, autolinks
      smartypants: true, // “smart quotes” — and dashes…
      remarkPlugins: [
        remarkGfm,
        // ==highlight== → <mark>
        [remarkFlexibleMarkers, { markerClassName: () => [] }],
      ],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'append',
            /** @param {{ tagName: string, properties: Record<string, unknown> }} el */
            test: (el) => ['h2', 'h3'].includes(el.tagName) && el.properties['id'] !== 'footnote-label',
            properties: { className: ['anchor'], ariaHidden: 'true', tabIndex: -1, dataPagefindIgnore: true },
            content: { type: 'text', value: '#' },
          },
        ],
        rehypeTidy,
      ],
    }),
  },

  image: {
    // Markdown images get width/height, srcset and lazy loading.
    layout: 'constrained',
  },

  vite: {
    build: { assetsInlineLimit: 0 },
  },
});
