import type { APIRoute, GetStaticPaths } from 'astro';
import { getPosts, formatLong, type Post } from '../../lib/posts';
import { SITE } from '../../site.config';
import { ogImage } from '../../lib/og';

export const getStaticPaths = (async () => {
  const posts = await getPosts();
  // Satori can't shape Nastaliq; Urdu posts use the site image.
  return posts.filter((p) => p.data.lang !== 'ur').map((post) => ({ params: { slug: post.id }, props: { post } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ post: Post }> = async ({ props: { post } }) => {
  const png = await ogImage({ title: post.data.title, meta: `${SITE.author} · ${formatLong(post.data.date)}` });
  return new Response(png as BodyInit, { headers: { 'Content-Type': 'image/png' } });
};
