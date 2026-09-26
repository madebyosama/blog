// Everything you might want to change about the site lives here.

export const SITE = {
  url: 'https://blog.madebyosama.com',
  title: 'madebyosama/blog',
  author: 'Muhammad Osama',
  tagline: 'Notes on design, development and the work around them.',
  description:
    'Muhammad Osama writes about product design, development, marketing, exercise, communication and networking.',
  footerLine: 'Designing, building, writing it down.',
  email: 'hello@madebyosama.com', // TODO: confirm address
  lang: 'en',
  links: {
    home: 'https://madebyosama.com',
    linkedin: 'https://www.linkedin.com/in/madebyosama', // TODO: confirm handle
    x: 'https://x.com/madebyosama', // TODO: confirm handle
  },
  newsletter: {
    // Buttondown, via a plain HTML form POST. No script.
    enabled: false,
    username: 'madebyosama', // TODO: your Buttondown username
  },
} as const;

// Allowed topics. Add one here and it becomes valid in frontmatter,
// gets a /topics/<slug>/ page, and shows up in the CMS after you add it
// to .pages.yml as well.
export const TOPICS = {
  design: 'Design',
  development: 'Development',
  product: 'Product',
  marketing: 'Marketing',
  fitness: 'Fitness',
  communication: 'Communication',
  networking: 'Networking',
} as const;

export type Topic = keyof typeof TOPICS;
export const TOPIC_SLUGS = Object.keys(TOPICS) as [Topic, ...Topic[]];
