import { getCollection, type CollectionEntry } from 'astro:content';
import readingTime from 'reading-time';

export type Post = CollectionEntry<'posts'>;

const isProd = import.meta.env.PROD;

/** A post is live when it's not a draft and its date has arrived. */
export function isScheduled(post: Post, now = new Date()): boolean {
  return post.data.date.getTime() > now.getTime();
}

/**
 * All posts that should exist in this build, newest first.
 * Production: no drafts, nothing dated in the future.
 * Dev: everything, so you can preview drafts and scheduled posts.
 */
export async function getPosts(): Promise<Post[]> {
  const now = new Date();
  const posts = await getCollection('posts', (post) =>
    isProd ? !post.data.draft && !isScheduled(post, now) : true,
  );
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function groupByYear(posts: Post[]): [number, Post[]][] {
  const years = new Map<number, Post[]>();
  for (const post of posts) {
    const y = post.data.date.getUTCFullYear();
    years.set(y, [...(years.get(y) ?? []), post]);
  }
  return [...years.entries()];
}

export function minutesToRead(post: Post): number {
  return Math.max(1, Math.round(readingTime(post.body ?? '').minutes));
}

export function hostname(url: string): string {
  return new URL(url).hostname.replace(/^www\./, '');
}

// Dates in frontmatter are calendar dates: format them in UTC so a post
// written on the 26th never shows up as the 25th.
const short = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const long = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' });

export const formatShort = (d: Date) => short.format(d); // Sep 26
export const formatLong = (d: Date) => long.format(d); // September 26, 2026
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** The post's description, or the start of its text for notes without one. */
export function summary(post: Post, max = 160): string {
  const description = post.data.description?.trim();
  if (description) return description;
  const text = (post.body ?? '')
    .replace(/^import .*$/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>#=~]|<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, '')}…` : text;
}
