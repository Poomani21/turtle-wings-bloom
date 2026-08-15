import { createFileRoute } from "@tanstack/react-router";
import { CollectionAdmin, type FieldDef } from "@/components/admin/CollectionAdmin";

export const Route = createFileRoute("/admin/videos")({
  component: AdminVideos,
});

const fields: FieldDef[] = [
  { name: "title", label: "Title", required: true },
  {
    name: "category",
    label: "Category",
    type: "select",
    options: ["Activities", "Parent Guidance", "Centre Tour", "Announcements"],
  },
  {
    // Videos are never uploaded to the project — only linked. Paste the
    // YouTube watch/share/short link and the public gallery embeds it.
    name: "videoUrl",
    label: "YouTube link",
    required: true,
    help: "Paste a YouTube link, e.g. https://www.youtube.com/watch?v=XXXXXXXXXXX or https://youtu.be/XXXXXXXXXXX",
  },
  {
    name: "thumbnailUrl",
    label: "Thumbnail image (optional)",
    type: "upload",
    folder: "videos",
    help: "Leave empty to use the YouTube thumbnail automatically.",
  },
  { name: "isPublished", label: "Published", type: "switch", help: "Visible on the Videos page" },
  { name: "description", label: "Description", type: "textarea" },
];

function AdminVideos() {
  return (
    <CollectionAdmin
      name="videos"
      heading="Videos"
      intro="Published videos appear in the public Videos gallery."
      fields={fields}
      defaults={{
        title: "",
        description: "",
        videoUrl: "",
        thumbnailUrl: "",
        category: "Activities",
        isPublished: false,
      }}
      primary={(row) => String(row["title"] ?? "Untitled video")}
      secondary={(row) =>
        `${String(row["category"] ?? "")} · ${row["isPublished"] ? "published" : "draft"}`
      }
    />
  );
}
