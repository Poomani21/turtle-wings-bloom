import routines from "@/assets/blog-routines.jpg";
import communication from "@/assets/blog-communication.jpg";
import artcraft from "@/assets/blog-artcraft.jpg";

/**
 * Blog content source.
 * WordPress migration: replace this module with the WP REST API
 * (`/wp-json/wp/v2/posts?_embed`) — the Post shape below mirrors the fields
 * used by the listing and detail templates.
 */
export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  author: string;
  image: string;
  imageAlt: string;
  body: { heading?: string; paragraphs: string[] }[];
};

export const categories = [
  "Autism Support",
  "Parenting",
  "Early Learning",
  "News & Updates",
] as const;

export const posts: Post[] = [
  {
    slug: "why-predictable-routines-help-children-learn",
    title: "Why predictable routines help children learn",
    excerpt:
      "A predictable session structure helps a child know what comes next — and a child who feels secure is a child who is ready to learn.",
    date: "2026-06-18",
    category: "Autism Support",
    author: "Neha Choudhary",
    image: routines,
    imageAlt: "Illustration of a parent and child working through a counting activity together",
    body: [
      {
        paragraphs: [
          "At Turtle Wings, predictable routines are a deliberate part of every session. When a child can anticipate what happens next, attention is freed up for learning instead of being spent on uncertainty.",
        ],
      },
      {
        heading: "Structure creates safety",
        paragraphs: [
          "Our Evening Group Program follows a consistent flow — arrival, movement, focused learning, sensory time, and a calm close with music and mantra chanting. Predictable routines help children feel secure, confident, and ready to learn.",
          "Small groups of up to five children mean the routine can stay steady while individual activities are still planned around each child's needs and abilities.",
        ],
      },
      {
        heading: "Carrying the routine home",
        paragraphs: [
          "Parents often ask how to support the same predictability at home. Simple, repeatable steps at the same time each day — the same place for the school bag, the same order for evening activities — build on what the child already practises with us.",
        ],
      },
    ],
  },
  {
    slug: "supporting-communication-in-everyday-moments",
    title: "Supporting communication in everyday moments",
    excerpt:
      "Communication grows in ordinary moments: snack time, choosing an activity, greeting a friend. Here is how structured practice supports it.",
    date: "2026-06-04",
    category: "Early Learning",
    author: "Neha Choudhary",
    image: communication,
    imageAlt: "Illustration of a child and educator using a picture communication board",
    body: [
      {
        paragraphs: [
          "Communication is one of the objectives of our Evening Group Program, alongside listening skills, attention, and emotional regulation. It is practised through structured activities rather than drills.",
        ],
      },
      {
        heading: "Building vocabulary through activity",
        paragraphs: [
          "Our English and Language Development domain focuses on vocabulary, listening skills, phonics, early reading, comprehension, and expressive language — always through structured, hands-on activities that hold a child's interest.",
          "Please note: Turtle Wings is a special education centre. We do not provide Speech Therapy, Occupational Therapy, or ABA Therapy.",
        ],
      },
      {
        heading: "Turn-taking with peers",
        paragraphs: [
          "Play and Social Skills sessions encourage sharing, turn-taking, cooperation, and emotional understanding — the natural setting in which early communication becomes useful to the child.",
        ],
      },
    ],
  },
  {
    slug: "art-and-craft-more-than-a-creative-break",
    title: "Art and craft: more than a creative break",
    excerpt:
      "Cutting, pasting, painting and threading strengthen fine motor skills, hand-eye coordination and focus while children express themselves.",
    date: "2026-05-21",
    category: "Parenting",
    author: "Neha Choudhary",
    image: artcraft,
    imageAlt: "Illustration of children painting and doing craft work with an educator",
    body: [
      {
        paragraphs: [
          "Art and craft is one of the nine learning domains at Turtle Wings, and it does far more developmental work than it appears to at first glance.",
        ],
      },
      {
        heading: "Fine motor skills in disguise",
        paragraphs: [
          "Creative activities encourage imagination while strengthening fine motor skills, hand-eye coordination, focus, and self-expression — the same skills a child later needs for writing and self-care.",
        ],
      },
      {
        heading: "Simple ideas for home",
        paragraphs: [
          "Tearing paper, threading large beads, and painting with thick brushes are low-pressure activities that fit easily into an evening at home and follow the child's lead.",
        ],
      },
    ],
  },
];

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
