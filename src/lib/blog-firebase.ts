import { fetchPublishedBlogs } from "./cms";
import type { BlogDoc } from "./cms-types";
import type { Post } from "./blog-data";

/**
 * Adapters that let published Firebase blogs reuse the existing static
 * `Post` shape (and therefore the existing blog card / detail markup).
 * No new Firebase fetching logic — `fetchPublishedBlogs()` is reused.
 */
export function blogDocToPost(doc: BlogDoc): Post {
  const paragraphs = (doc.content ?? "")
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return {
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt ?? "",
    date: doc.publishedDate ?? doc.createdAt ?? "",
    category: doc.category ?? "",
    author: doc.author ?? "",
    image: doc.image ?? "",
    imageAlt: doc.imageAlt ?? doc.title ?? "",
    body: paragraphs.length ? [{ paragraphs }] : [],
  };
}

/**
 * Published Firebase posts, mapped to `Post`.
 * Throws on failure so React Query can surface a real error state instead of
 * silently falling back to static content.
 */
export async function fetchPublishedFirebasePosts(): Promise<Post[]> {
  const docs = await fetchPublishedBlogs();
  return docs.filter((d) => d.isPublished && d.slug).map(blogDocToPost);
}

/**
 * Firebase is the source of truth. Static posts are demo content only and are
 * used when Firestore has no published posts at all — they never override,
 * re-order or shadow a Firebase post.
 */
export function resolvePosts(firebasePosts: Post[], demoPosts: Post[]): Post[] {
  return firebasePosts.length > 0 ? firebasePosts : demoPosts;
}

