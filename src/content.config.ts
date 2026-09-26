import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { TOPIC_SLUGS } from './site.config';

// The CMS may save empty optional fields as '' or null: treat those as missing.
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === '' || v === null ? undefined : v), schema.optional());

const posts = defineCollection({
  // src/content/posts/slug.md or src/content/posts/slug/index.md → /slug/
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/posts',
    generateId: ({ entry }) => entry.replace(/(\/index)?\.mdx?$/, ''),
  }),
  schema: z
    .object({
      title: z.string({ error: 'Every post needs a `title`.' }).min(1),
      description: optional(z.string()),
      date: z.coerce.date({ error: '`date` must look like 2026-09-26.' }),
      updated: optional(z.coerce.date()),
      type: z.enum(['essay', 'note', 'link'], {
        error: '`type` must be one of: essay, note, link.',
      }),
      link: optional(z.url({ error: '`link` must be a full URL, e.g. https://example.com' })),
      topics: z
        .array(
          z.enum(TOPIC_SLUGS, {
            error: `Unknown topic. Allowed: ${TOPIC_SLUGS.join(', ')}. Add new ones in src/site.config.ts.`,
          }),
        )
        .default([]),
      draft: z.boolean().default(false),
      lang: z.enum(['en', 'ur']).default('en'),
    })
    .superRefine((post, ctx) => {
      if (post.type === 'link' && !post.link) {
        ctx.addIssue({
          code: 'custom',
          path: ['link'],
          message: 'Link posts need a `link:` URL.',
        });
      }
      if (!post.draft && post.type !== 'note' && !post.description?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['description'],
          message: `A published ${post.type} needs a one-sentence \`description\` (only notes may skip it).`,
        });
      }
    }),
});

// About, Now — plain Markdown pages, editable from the CMS too.
const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    updated: optional(z.coerce.date()),
  }),
});

export const collections = { posts, pages };
