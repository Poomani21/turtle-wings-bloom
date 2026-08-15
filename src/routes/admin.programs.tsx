import { createFileRoute } from "@tanstack/react-router";
import { CollectionAdmin, type FieldDef } from "@/components/admin/CollectionAdmin";

export const Route = createFileRoute("/admin/programs")({
  component: AdminPrograms,
});

const fields: FieldDef[] = [
  { name: "title", label: "Program title", required: true },
  { name: "ageGroup", label: "Age group", help: "e.g. 3–10 years" },
  { name: "days", label: "Days", help: "e.g. Monday – Friday" },
  { name: "startTime", label: "Start time", help: "e.g. 5:00 PM" },
  { name: "endTime", label: "End time", help: "e.g. 7:00 PM" },
  { name: "maxChildren", label: "Maximum children", type: "number" },
  { name: "order", label: "Display order", type: "number" },
  { name: "status", label: "Status", type: "select", options: ["active", "inactive"] },
  { name: "image", label: "Program image", type: "upload", folder: "programs" },
  {
    name: "activities",
    label: "Activities",
    type: "list",
    help: "One activity per line.",
  },
  { name: "description", label: "Description", type: "textarea", required: true },
];

function AdminPrograms() {
  return (
    <CollectionAdmin
      name="programs"
      heading="Programs"
      intro="Active programs are shown on the Program page with their schedule."
      fields={fields}
      defaults={{
        title: "",
        description: "",
        ageGroup: "3–10 years",
        days: "Monday – Friday",
        startTime: "5:00 PM",
        endTime: "7:00 PM",
        maxChildren: 8,
        status: "active",
        image: "",
        activities: [],
        order: 0,
      }}
      primary={(row) => String(row["title"] ?? "Untitled program")}
      secondary={(row) =>
        `${String(row["ageGroup"] ?? "")} · ${String(row["days"] ?? "")} · ${String(row["startTime"] ?? "")}–${String(row["endTime"] ?? "")} · ${String(row["status"] ?? "")}`
      }
      details={(row) => (
        <p className="text-muted-foreground">{String(row["description"] ?? "")}</p>
      )}
    />
  );
}
