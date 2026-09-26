// Small, dependency-free Markdown helpers used by astro.config.mjs.

// The column is 36rem (612px) plus 20px padding on each side.
const COLUMN_SIZES = '(min-width: 652px) 612px, calc(100vw - 40px)';

/**
 * Small HTML clean-ups after Markdown → HTML:
 * - `![Alt](./photo.jpg "A caption")` on its own line becomes <figure> + <figcaption>
 * - images get `sizes` matching the column, so phones don't download desktop widths
 * - tables are wrapped so wide ones scroll sideways inside the column
 * - <mark> from ==highlight== loses its empty class attribute
 */
export function rehypeTidy() {
  return (tree) => {
    visit(tree, (node, index, parent) => {
      if (node.tagName === 'img') {
        node.properties.sizes ??= COLUMN_SIZES;
      }
      if (node.tagName === 'mark' && !node.properties.className?.length) {
        delete node.properties.className;
      }
      if (!parent || index === undefined) return;

      if (node.tagName === 'table') {
        parent.children[index] = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['table'], tabIndex: 0 },
          children: [node],
        };
      }

      if (node.tagName === 'p') {
        const kids = node.children.filter((c) => !(c.type === 'text' && !c.value.trim()));
        if (kids.length !== 1 || kids[0].tagName !== 'img') return;
        const img = kids[0];
        const caption = img.properties?.title;
        if (!caption) return;
        delete img.properties.title;
        parent.children[index] = {
          type: 'element',
          tagName: 'figure',
          properties: {},
          children: [
            img,
            {
              type: 'element',
              tagName: 'figcaption',
              properties: {},
              children: [{ type: 'text', value: String(caption) }],
            },
          ],
        };
      }
    });
  };
}

/**
 * Shiki transformer: ```ts title="src/site.config.ts" shows a filename label
 * above the block. No label, no wrapper.
 */
export function shikiFilename() {
  return {
    name: 'filename',
    root(root) {
      const raw = this.options.meta?.__raw ?? '';
      const title = raw.match(/(?:title|file)=["']([^"']+)["']/)?.[1];
      if (!title) return;
      const pre = root.children.find((n) => n.type === 'element' && n.tagName === 'pre');
      if (!pre) return;
      root.children = [
        {
          type: 'element',
          tagName: 'figure',
          properties: { className: ['code'] },
          children: [
            {
              type: 'element',
              tagName: 'figcaption',
              properties: {},
              children: [{ type: 'text', value: title }],
            },
            pre,
          ],
        },
      ];
    },
  };
}

function visit(node, fn, index, parent) {
  if (node.type === 'element') fn(node, index, parent);
  if (node.children) {
    // Iterate over a copy: fn may replace children in place.
    [...node.children].forEach((child, i) => visit(child, fn, i, node));
  }
}
