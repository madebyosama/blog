# blog.madebyosama.com

Muhammad Osama's blog: product design, development, marketing, exercise, communication and networking.

It's a static site built with [Astro](https://astro.build) from plain Markdown files. The stylesheet is plain CSS. Pages ship no JavaScript, except `/search` and any post that includes an interactive demo.

```sh
pnpm install
pnpm dev        # http://localhost:4321, shows drafts and scheduled posts
pnpm build      # type-check → static build in dist/ → search index
pnpm preview    # serve dist/ locally
```

You need Node 22.12 or newer (`.nvmrc` pins 24 LTS) and pnpm.

---

## Write a post

```sh
pnpm new "Why I design in the browser"                # an essay
pnpm new "Walks count" --note                         # a short note
pnpm new "Practical Typography" --link https://practicaltypography.com/
```

This creates `src/content/posts/<slug>.md`, and the post's URL is `/<slug>/`. URLs don't include dates, so if you rename the file, the URL changes too.

The new file starts as a draft, so it shows up in `pnpm dev` but never in production. Write the post, set `draft: false`, commit and push. That's all it takes to publish.

### Frontmatter

```yaml
---
title: "Why I design in the browser"
description: "One sentence for search engines and social cards."  # optional for notes
date: 2026-09-26
updated: 2026-10-02            # optional
type: essay                    # essay | note | link
link: https://example.com      # required when type is link
topics: [design, development]
draft: false
lang: en                       # optional: "ur" = right-to-left + Urdu font on that page
---
```

The schema is in `src/content.config.ts`. If something is missing or wrong, the build stops and tells you which field to fix:

```
topics.1: Unknown topic. Allowed: design, development, product, … Add new ones in src/site.config.ts.
```

### The three post types

- **essay**: long-form writing.
- **note**: a few paragraphs. It doesn't need a `description`; the first lines of the text are used instead.
- **link**: commentary on another page. The title links out with ↗, the meta line says "via domain.com", and lists mark the post with ↗.

### Markdown you can use

| You write | You get |
| --- | --- |
| `==key phrase==` | a highlighter mark |
| `Some claim.[^1]` and `[^1]: The note.` | footnotes |
| `"quotes"`, `--`, `...` | “curly quotes”, dashes and ellipses… (done automatically) |
| a table using `\|` pipes | a table that scrolls sideways on small screens |
| ` ```ts title="src/file.ts" ` | a code block with a filename label |
| `## Heading` | a heading with a `#` link that appears on hover |
| `> quote` | a blockquote with a thin accent rule |

External links get a small ↗ automatically.

## Add images

Put the post in a folder and keep its images next to it:

```
src/content/posts/my-post/
  index.md
  photo.jpg
```

```md
![Describe the image for screen readers](./photo.jpg "Optional caption, shown below the image")
```

Astro resizes and compresses the image at build time: WebP, several widths, explicit width/height and lazy loading. If you add a caption (the text in quotes), the image is wrapped in a `<figure>`. Images uploaded through the CMS go to `src/assets/images/` and are referenced as `@images/name.jpg`, and they're optimised the same way.

## Add a topic

1. Add it to `TOPICS` in `src/site.config.ts`, for example `photography: 'Photography'`.
2. To use it from the CMS, add it to the `topics` values in `.pages.yml` too.

Topic pages (`/topics/photography/`) are generated automatically once a published post uses the topic.

## Schedule a post

Give the post a future `date` and set `draft: false`. Production builds leave out anything dated in the future. A GitHub Action rebuilds the site every day at 01:07 UTC, so the post goes live the morning its date arrives. In `pnpm dev`, scheduled posts are visible and marked "scheduled".

## Interactive demos (rare)

Rename the post to `.mdx` and import a component:

```mdx
import LineLength from '../../components/demos/LineLength.tsx';

<LineLength client:visible />
```

That page ships Preact plus the component, loaded once the demo scrolls into view. Every other page stays JavaScript-free. See the draft `src/content/posts/interactive-demo-example.mdx`.

## Edit from a browser or phone (Pages CMS)

[Pages CMS](https://pagescms.org) edits these same Markdown files through GitHub. There's no database and nothing extra running.

1. Go to https://app.pagescms.org and sign in with GitHub.
2. Open this repository. `.pages.yml` defines the fields for Posts, About and Now.
3. Saving creates a commit, and the commit deploys the site.

The post body uses a plain Markdown editor instead of a rich-text editor, so `==marks==`, footnotes and code blocks are saved exactly as you typed them.

## Deploy

GitHub Actions builds every push (`.github/workflows/deploy.yml`) and deploys it to Cloudflare Pages:

- **`main`** goes to production at https://blog.madebyosama.com
- **any other branch** gets a preview URL like `https://<branch>.madebyosama-blog.pages.dev`, printed in the job log
- **daily at 01:07 UTC**, `main` is rebuilt so scheduled posts go live

One-time setup:

1. Create the Pages project:
   `pnpm dlx wrangler pages project create madebyosama-blog --production-branch=main`
2. Create a Cloudflare API token with the **Cloudflare Pages: Edit** permission. In GitHub, go to repo **Settings → Secrets and variables → Actions** and add the secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
3. Custom domain: in the Pages project, go to **Custom domains** and add `blog.madebyosama.com`. At your DNS provider, add `CNAME blog → madebyosama-blog.pages.dev`. If the zone is on Cloudflare, it does this for you.
4. Analytics (optional, cookieless): create a site in **Cloudflare Web Analytics**, copy its token, and add it as the repository **variable** `CF_BEACON_TOKEN`. Without the token, no analytics script is added.

Cache headers are in `public/_headers`. Hashed files under `/_astro/` are cached for a year and marked immutable.

## Newsletter (off)

To turn it on, set `newsletter.enabled: true` and your Buttondown `username` in `src/site.config.ts`. It adds a plain HTML form at the end of each post, with no embed script.

## Where things live

```
src/
  site.config.ts        name, tagline, links, topics, newsletter switch
  content.config.ts     the frontmatter schema
  content/posts/        the writing
  content/pages/        about.md, now.md
  styles/global.css     the only stylesheet (colour tokens at the top)
  layouts/, components/, pages/
  lib/markdown.mjs      small Markdown clean-ups (figures, tables, code filenames)
  lib/og.ts             Open Graph images (Satori → PNG)
  assets/fonts/         Inter (Latin, 400–600) and Noto Nastaliq Urdu
public/                 favicon, _headers
scripts/new-post.mjs    `pnpm new`
scripts/subset-inter.sh how the Inter subset was made
.pages.yml              CMS fields
```

The colours are CSS custom properties at the top of `global.css`, in light and dark versions. The accent (`--accent`) is still a placeholder. If you change it, also update `--accent-text` (the wordmark shade, which must keep 4.5:1 contrast on `--bg`), `--mark`, the favicon and `src/lib/og.ts`.
