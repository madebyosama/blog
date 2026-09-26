import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { render } from 'astro:content';
import mdxRenderer from '@astrojs/mdx/server.js';
import preactRenderer from '@astrojs/preact/server.js';
import { SITE, TOPICS } from '../site.config';
import { getPosts, summary } from '../lib/posts';

// Full-content feed: every post, rendered exactly as on the site.
export const GET: APIRoute = async () => {
  const container = await AstroContainer.create();
  container.addServerRenderer({ name: 'astro:jsx', renderer: mdxRenderer });
  container.addServerRenderer({ name: '@astrojs/preact', renderer: preactRenderer });
  const posts = await getPosts();

  const items = await Promise.all(
    posts.map(async (post) => {
      const { Content } = await render(post);
      const html = absolutize(await container.renderToString(Content));
      const via = post.data.link
        ? `<p>↗ <a href="${post.data.link}">${post.data.link}</a></p>`
        : '';
      return {
        title: post.data.type === 'link' ? `↗ ${post.data.title}` : post.data.title,
        link: `/${post.id}/`,
        pubDate: post.data.date,
        description: summary(post),
        categories: post.data.topics.map((t) => TOPICS[t]),
        content: via + html,
      };
    }),
  );

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: SITE.url,
    items,
    trailingSlash: true,
    customData: `<language>en</language>`,
  });
};

/** Feed readers don't know our base URL: make links and images absolute, drop heading anchors. */
function absolutize(html: string): string {
  return html
    .replace(/<a[^>]*class="anchor"[^>]*>#<\/a>/g, '')
    .replace(/(href|src)="\/(?!\/)/g, `$1="${SITE.url}/`)
    .replace(/(srcset)="([^"]+)"/g, (_, attr, value: string) =>
      `${attr}="${value.replace(/(^|,\s*)\/(?!\/)/g, `$1${SITE.url}/`)}"`,
    );
}
