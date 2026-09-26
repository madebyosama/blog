import type { APIRoute } from 'astro';
import { ogImage } from '../lib/og';

export const GET: APIRoute = async () =>
  new Response((await ogImage({})) as BodyInit, { headers: { 'Content-Type': 'image/png' } });
