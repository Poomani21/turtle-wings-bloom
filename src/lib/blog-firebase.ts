import { useQuery } from "@tanstack/react-query";
import { fetchPublishedBlogs } from "./cms";
import type { BlogDoc } from "./cms-types";
import type { Post } from "./blog-data";

/**
 * Adapters that let published Firebase blogs reuse the existing static
 * `Post` shape (and therefore the existing blog card / detail markup).
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
 * Never throws: if Firestore is unavailable the caller simply gets an empty
 * list, so the static articles keep rendering.
 */
export async function fetchPublishedFirebasePosts(): Promise<Post[]> {
  try {
    const docs = await fetchPublishedBlogs();
    return docs.filter((d) => d.isPublished && d.slug).map(blogDocToPost);
  } catch {
    return [];
  }
}

/**
 * Static posts are permanent website content and are ALWAYS included.
 * Published Firebase posts are added on top; when a Firebase post reuses a
 * static slug it replaces that single card (no duplicates), and the combined
 * list is ordered newest first.
 */
export function mergePostsBySlug(staticPosts: Post[], firebasePosts: Post[]): Post[] {
  const merged = new Map<string, Post>();
  for (const post of staticPosts) if (post.slug) merged.set(post.slug, post);
  for (const post of firebasePosts) if (post.slug) merged.set(post.slug, post);
  return [...merged.values()].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

/**
 * Shared, deterministic loader for published Firebase posts.
 *
 * `placeholderData` (not `initialData`) is used deliberately: `initialData`
 * seeds the cache as *fresh*, so with a `staleTime` the very first mount after a
 * hard reload would skip the network request entirely and dynamic posts would
 * appear only sometimes. With placeholder data the request always runs, static
 * posts stay visible while it is in flight, and a failure resolves to an empty
 * list instead of blanking the page.
 */
export function usePublishedFirebasePosts() {
  const query = useQuery({
    queryKey: ["published-firebase-blogs"],
    queryFn: fetchPublishedFirebasePosts,
    placeholderData: [] as Post[],
    staleTime: 30_000,
    refetchOnMount: "always",
    retry: 1,
  });

  return {
    posts: query.data ?? [],
    /** True until this mount has actually finished asking Firebase. */
    isLoading: !query.isFetchedAfterMount,
  };
}
