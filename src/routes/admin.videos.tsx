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
    name: "videoUrl",
    label: "Video",
    type: "upload",
    accept: "video/*",
    folder: "videos",
    help: "Upload an MP4, or paste a YouTube link.",
  },
  { name: "thumbnailUrl", label: "Thumbnail image", type: "upload", folder: "videos" },
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
