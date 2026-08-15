# Turtle Wings — WordPress / Hostinger migration guide

This site is a React (TanStack Start) application. It is built so the content,
structure and SEO can be reproduced in WordPress with minimal rework.

## 1. Content sources in this codebase

| What                                    | Where                                        |
| --------------------------------------- | -------------------------------------------- |
| Site name, contact details, nav labels  | `src/lib/site-content.ts`                    |
| Page copy (home, about, program, FAQ)   | `src/lib/site-content.ts` + the route files  |
| Blog posts                              | `src/lib/blog-data.ts`                       |
| Images / illustrations                  | `src/assets/`                                |
| Design tokens (colors, fonts, radii)    | `src/styles.css`                             |

## 2. Recommended WordPress structure

Pages (static, one per route):

- `/` — Home
- `/about` — About Us
- `/program` — Evening Group Program
- `/faq` — FAQ
- `/contact` — Contact & Inquiry

Posts (blog): one post per entry in `src/lib/blog-data.ts`, with
categories `Autism Support`, `Parenting`, `Early Learning`, `News & Updates`.
Each post needs: title, slug, excerpt, publish date, category, author,
featured image (+ alt text), and the body sections in order.

## 3. Two migration paths

### A. Headless WordPress (keep this React front end — recommended)

`src/lib/blog-data.ts` is intentionally the single content boundary. Replace the
static `posts` array with WP REST calls; keep the `Post` type unchanged.

```ts
// GET https://your-site.com/wp-json/wp/v2/posts?_embed&per_page=20
// map: slug, title.rendered, excerpt.rendered (strip tags), date,
// _embedded["wp:term"][0][0].name -> category,
// _embedded.author[0].name -> author,
// _embedded["wp:featuredmedia"][0].source_url -> image (+ alt_text)
```

Fetch inside a TanStack route loader via `queryClient.ensureQueryData` so pages
stay server-rendered and SEO-safe. The listing (`src/routes/blog.index.tsx`) and
detail (`src/routes/blog.$slug.tsx`) templates need no other change.

Deployment on Hostinger: host WordPress as the content backend only
(`wp-admin` + REST), and serve this app as the public site.

### B. Full WordPress theme (classic Hostinger shared hosting)

1. Install a block theme and set fonts: **Baloo 2** (headings), **Nunito**
   (body), **Caveat** (handwritten accents) — via `theme.json` or a
   `wp_enqueue_style` Google Fonts call.
2. Copy the palette from `src/styles.css` `:root` into `theme.json` palette
   entries: forest deep, forest, leaf, sun, sun deep, cream, sky, berry.
3. Rebuild each page with blocks in the same section order as the route files.
4. Reveal-on-scroll animation: port `src/components/site/Reveal.tsx` behaviour as
   a small `assets/js/reveal.js` using `IntersectionObserver`, adding a
   `.reveal-in` class. Copy the `@keyframes` and the
   `prefers-reduced-motion` block from `src/styles.css` verbatim.

## 4. Inquiry form

`src/components/site/InquiryForm.tsx` posts JSON to `VITE_INQUIRY_ENDPOINT`.

- Headless path: set that env var to a WP endpoint (e.g. WPForms/CF7 REST or a
  custom `register_rest_route`) and keep the honeypot check server-side.
- Theme path: rebuild with Contact Form 7 / WPForms using the same fields
  (parent name, email, phone, child's name, child's age, message) and keep the
  required-field validation and honeypot.

Always add server-side spam protection and send an email notification to
the centre's address in `src/lib/site-content.ts`.

## 5. SEO parity checklist

- One `<h1>` per page; unique title (<60 chars) and meta description (<160).
- Titles/descriptions currently live in each route's `head()` — copy them into
  Yoast or Rank Math per page/post.
- JSON-LD: `EducationalOrganization` on all pages (see `src/routes/__root.tsx`)
  and `Article` on each blog post (see `src/routes/blog.$slug.tsx`).
- Canonical URLs, `og:*` and `twitter:*` tags per page.
- Keep image `alt` text; enable lazy loading for below-the-fold images.
- Preserve the URL paths above so no redirects are needed. If a path must
  change, add a 301 redirect.
- Copy `public/robots.txt` and generate an XML sitemap.

## 6. Accessibility notes to preserve

- Skip-to-content link, visible focus outlines (3px leaf green).
- Minimum 44px touch targets on buttons and nav links.
- Accordion FAQ must keep keyboard support and `aria-expanded`.
- Respect `prefers-reduced-motion` in any animation you port.
