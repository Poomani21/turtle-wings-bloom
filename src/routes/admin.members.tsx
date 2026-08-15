import { createFileRoute } from "@tanstack/react-router";
import { CollectionAdmin, type FieldDef } from "@/components/admin/CollectionAdmin";

export const Route = createFileRoute("/admin/members")({
  component: AdminMembers,
});

const fields: FieldDef[] = [
  { name: "name", label: "Child's name", required: true },
  { name: "age", label: "Age", type: "number" },
  { name: "program", label: "Program" },
  { name: "joinedDate", label: "Joined date", type: "date" },
  { name: "status", label: "Status", type: "select", options: ["active", "inactive"] },
  { name: "image", label: "Photo", type: "upload", folder: "members" },
  {
    name: "isPublic",
    label: "Show on website",
    type: "switch",
    help: "Only enable with written parent consent — public entries appear on the website.",
  },
  { name: "notes", label: "Private notes", type: "textarea" },
];

function AdminMembers() {
  return (
    <CollectionAdmin
      name="members"
      heading="Members"
      intro="Member records are private by default. Nothing is published unless you switch on “Show on website”."
      fields={fields}
      defaults={{
        name: "",
        age: 5,
        program: "Evening Group Program",
        status: "active",
        joinedDate: "",
        image: "",
        isPublic: false,
        notes: "",
      }}
      primary={(row) => String(row["name"] ?? "Unnamed")}
      secondary={(row) =>
        `${String(row["age"] ?? "")} yrs · ${String(row["program"] ?? "")} · ${String(row["status"] ?? "")}${row["isPublic"] ? " · public" : " · private"}`
      }
    />
  );
}
