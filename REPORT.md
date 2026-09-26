# Build report — blog.madebyosama.com

Stack as built: Astro 7.3.5 (static output), TypeScript strict, plain CSS, pnpm, Node 22+, Pagefind 1.5, Pages CMS, Cloudflare (Workers static assets).

## Lighthouse

I ran Lighthouse 13 (mobile preset, simulated Slow 4G and 4× CPU throttling) against `astro preview` of the production build. The score order is Performance / Accessibility / Best Practices / SEO.

| Page | Scores | FCP | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- |
| `/` (home / archive) | 100 / 100 / 100 / 100 | 0.65 s | 0.90 s | 0 | 0 ms |
| `/why-i-design-in-the-browser/` (long essay: code, table, image, footnote) | 100 / 100 / 100 / 100 | 0.68 s | 0.90 s | 0 | 0 ms |
| `/walks-count/` (note) | 100 / 100 / 100 / 100 | 0.64 s | 0.91 s | 0 | 0 ms |
| `/practical-typography/` (link post) | 100 / 100 / 100 / 100 | 0.64 s | 0.90 s | 0 | 0 ms |
| `/topics/`, `/topics/design/` | 100 / 100 / 100 / 100 | 0.63 s | 0.90 s | 0 | 0 ms |
| `/about/`, `/now/` | 100 / 100 / 100 / 100 | 0.63 s | 0.90 s | 0 | 0 ms |
| `/search/` | 100 / 100 / 100 / 100 | 0.65 s | 0.90 s | 0 | 0 ms |
| Long essay, desktop preset | 100 / 100 / 100 / 100 | | | | |

The first run scored 95 on Accessibility because the accent `/blog` in the wordmark has only 3.33:1 contrast (see deviations). Performance was already 100, but LCP was 1.2 s until the font was subset (also below).

## Page weight (production build)

HTML includes the inlined CSS. The font and images are not counted.

| Template | HTML + CSS | gzipped | JS |
| --- | --- | --- | --- |
| Home | 12.1 KB | **4.0 KB** | 0 |
| Long post | 26.9 KB | **7.5 KB** | 0 |
| Note | 13.5 KB | 4.4 KB | 0 |
| Link post | 13.6 KB | 4.5 KB | 0 |
| Topics / topic | 11.4 KB | 3.7–3.8 KB | 0 |
| About / Now | 12.2–12.5 KB | 4.1–4.3 KB | 0 |
| 404 | 11.6 KB | 3.9 KB | 0 |
| Search | 13.8 KB | 4.7 KB | 2 KB inline module, plus Pagefind's own files |

- **CSS:** 7.9 KB minified (2.6 KB gzipped) in a single stylesheet, inlined into each page. The target was under 10 KB.
- **Font:** Inter, 25.7 KB WOFF2, preloaded. Noto Nastaliq Urdu (159 KB) loads only on `lang: ur` posts.
- **Images:** the essay's 1600px figure is 1.4–5 KB WebP, depending on the width the browser picks.

Lighthouse's total transfer for the home page is about 31 KB, font included.

## Checklist

- **Structure:** landmarks (`header`, `nav`, `main`, `article`, `footer`), one `h1` per page, and a skip link.
- **Accessibility:** accent focus ring, AA contrast, and `prefers-reduced-motion` respected. Muted text is 4.95:1 on the background and 4.61:1 on code blocks. Syntax colours are all at least 5.1:1.
- **No JavaScript:** everything works with JS disabled, which I checked with Playwright. Search falls back to a DuckDuckGo site search.
- **Dark mode:** follows `prefers-color-scheme`, with no toggle.
- **Print:** navigation and footer are hidden, and link URLs are printed after the links.
- **Meta:** title, description, canonical, OG and Twitter cards, JSON-LD `BlogPosting`, `theme-color` for light and dark, and an SVG favicon.
- **Feeds:** full-content RSS with absolute image URLs, a sitemap and `robots.txt`.
- **OG images:** one per post, generated at build time with Satori and resvg.
- **Schema:** the build fails with a readable message for a bad topic, a missing `link` on a link post, or a missing `description` on a published essay.
- **Drafts and scheduled posts:** visible in dev and excluded from production. I tested both with temporary posts.
- **RTL:** checked in the browser with the Urdu draft.
- **MDX island:** loads with `client:visible`, only on its own page.

## Deviations, and why

1. **Markdown processor.** Astro 7's default Markdown pipeline is Sätteri, its new native processor. The plugins in the spec (remark-gfm, rehype-slug, rehype-autolink-headings, the `==mark==` plugin) need the remark/rehype pipeline, so the config uses `unified()` from `@astrojs/markdown-remark`. MDX inherits the same pipeline.
2. **Inter is subset to weights 400–600 and Latin characters.** It's still one WOFF2 file, preloaded with `font-display: swap`, served through Astro's fonts API. Cutting the unused weight range brought the file from 48 KB to 26 KB and LCP from 1.2 s to 0.9 s under throttling. The italic tagline uses the browser's synthesized oblique, since a real italic would be a second file. `scripts/subset-inter.sh` rebuilds the subset.
3. **The wordmark mark uses a deeper shade of the accent (`--accent-text: #D03F1A`).** The placeholder accent `#F2542D` has only 3.33:1 contrast on the off-white background, which fails AA for 17px text. Every other accent use (nav dot, rules, focus ring, `<mark>`, selection, hover underline) keeps `#F2542D`. Dark mode uses `#FF7A59` everywhere. OG images and the favicon use the true accent, since they aren't page text.
4. **Markdown images are WebP, not AVIF.** Astro's Markdown image pipeline always outputs WebP. AVIF is available per image with `<Picture formats={['avif','webp']}>` in an `.mdx` post. At these file sizes the difference is a few KB.
5. **Syntax highlighting uses Shiki's `css-variables` theme.** Colours are CSS custom properties with light and dark values tuned to the palette (muted, no neon), not two bundled themes. This avoids duplicating colours inline on every token.
6. **CMS: Pages CMS, not Keystatic.** Both are maintained, and Keystatic's Astro integration supports Astro 7. But Keystatic needs React, a server adapter and an on-demand `/keystatic` route, which would end the pure-static build. Pages CMS is a hosted editor driven by one `.pages.yml` file, it works with any Astro version, and it commits straight to the repo. The post body uses its plain Markdown editor instead of the rich-text editor, so `==marks==`, footnotes and fenced code survive round-trips unchanged.
7. **Hosting: Cloudflare Workers static assets.** Cloudflare's "Import a repository" flow now creates a Worker, so `wrangler.jsonc` is a static-assets config: no Worker script, a real 404 page, trailing-slash redirects, and `public/_headers` honoured. Cloudflare builds every push and gives branches preview URLs. A GitHub Action only rebuilds daily, to publish scheduled posts.
8. **Analytics is the only script outside `/search`.** The Cloudflare Web Analytics beacon is a third-party script. It's included only when the `PUBLIC_CF_BEACON_TOKEN` build variable is set, and the Lighthouse runs above were done without it.
9. **Urdu posts set `lang="ur" dir="rtl"` on the title and body, not on `<html>`.** This keeps the English header, navigation and footer left-to-right on a mixed page. Satori can't shape Nastaliq, so Urdu posts use the site-wide OG image.
10. **In lists, link posts point to their own page** (with ↗ after the title), so the commentary is always read. The post's `h1` then links out to the source.
11. **Year pagination is not implemented yet.** The home page is the full archive, as the spec says to do until about 150 posts.
12. **An unused JS chunk is left in the output.** The draft MDX demo means Preact is compiled into `/_astro/`, even though no published page references it. It's unreferenced and harmless, and it disappears if that example file is deleted.
13. **Link underlines use `--rule` (#E8E8E3), as specified.** They're very quiet: about 1.2:1 against the background. Accessibility checks pass because an underline exists at all, but for readers who skim for links, a slightly darker underline (for example `#CFCFC8`) would help. This is a design decision for you.

## TODO for the owner

- Replace the placeholder copy marked `TODO` in `src/content/pages/about.md` and `now.md`.
- Confirm the email, LinkedIn and X handles in `src/site.config.ts`.
- Finalize the accent colour (see deviation 3).
- Complete the Cloudflare setup in the README's Deploy section (Worker project settings, custom domain, API token for the daily rebuild, optional analytics token).
