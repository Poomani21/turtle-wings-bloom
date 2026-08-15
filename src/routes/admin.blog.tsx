import { createFileRoute } from "@tanstack/react-router";
import { CollectionAdmin, type FieldDef } from "@/components/admin/CollectionAdmin";
import { categories } from "@/lib/blog-data";

export const Route = createFileRoute("/admin/blog")({
  component: AdminBlog,
});

const fields: FieldDef[] = [
  { name: "title", label: "Title", required: true },
  { name: "slug", label: "URL slug", required: true, help: "e.g. helping-children-settle-in" },
  { name: "category", label: "Category", type: "select", options: categories },
  { name: "author", label: "Author" },
  { name: "publishedDate", label: "Published date", type: "date" },
  { name: "image", label: "Cover image", type: "upload", folder: "blogs" },
  { name: "imageAlt", label: "Image description", help: "Describe the image for screen readers." },
  { name: "isPublished", label: "Published", type: "switch", help: "Visible on the website" },
  { name: "excerpt", label: "Excerpt", type: "textarea", required: true },
  { name: "content", label: "Article content", type: "textarea", required: true, help: "One paragraph per line." },
];

function AdminBlog() {
  return (
    <CollectionAdmin
      name="blogs"
      heading="Blog posts"
      intro="Published posts appear on the Blog page alongside the existing articles."
      fields={fields}
      defaults={{
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        category: categories[0],
        author: "Neha Choudhary",
        image: "",
        imageAlt: "",
        isPublished: false,
        publishedDate: new Date().toISOString().slice(0, 10),
      }}
      primary={(row) => String(row["title"] ?? "Untitled post")}
      secondary={(row) =>
        `${String(row["category"] ?? "")} · ${String(row["publishedDate"] ?? "")} · ${row["isPublished"] ? "published" : "draft"}`
      }
    />
  );
}
