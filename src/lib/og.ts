// Open Graph images, rendered at build time: Satori (layout → SVG) + resvg (SVG → PNG).
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Builds run from the project root.
const font = (file: string) => readFile(join(process.cwd(), 'src/assets/og', file));

let fonts: Promise<Parameters<typeof satori>[1]['fonts']> | undefined;
const loadFonts = () =>
  (fonts ??= Promise.all([
    font('inter-latin-400-normal.woff'),
    font('inter-latin-600-normal.woff'),
    font('jetbrains-mono-latin-500-normal.woff'),
  ]).then(([regular, semibold, mono]) => [
    { name: 'Inter', data: regular, weight: 400 as const, style: 'normal' as const },
    { name: 'Inter', data: semibold, weight: 600 as const, style: 'normal' as const },
    { name: 'Mono', data: mono, weight: 500 as const, style: 'normal' as const },
  ]));

type Node = { type: string; props: { style?: Record<string, unknown>; children?: unknown } };
const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({
  type,
  props: { style, children },
});

export async function ogImage({ title, meta }: { title?: string; meta?: string }): Promise<Uint8Array> {
  const tree = h(
    'div',
    {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '80px 88px',
      background: '#FBFBF9',
      color: '#1A1A1A',
      fontFamily: 'Inter',
    },
    [
      h('div', { display: 'flex', fontFamily: 'Mono', fontSize: 34 }, [
        h('span', {}, 'madebyosama'),
        h('span', { color: '#F2542D' }, '/blog'),
      ]),
      title
        ? h('div', { display: 'flex', fontSize: 64, fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.02em' }, title)
        : h('div', { display: 'flex', fontSize: 44, fontStyle: 'normal', color: '#6E6E69', lineHeight: 1.35 },
            'Notes on design, development and the work around them.'),
      h('div', { display: 'flex', borderTop: '2px solid #E8E8E3', paddingTop: 28, fontSize: 28, color: '#6E6E69' },
        meta ?? 'Muhammad Osama'),
    ],
  );

  const svg = await satori(tree as never, { width: 1200, height: 630, fonts: await loadFonts() });
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}
