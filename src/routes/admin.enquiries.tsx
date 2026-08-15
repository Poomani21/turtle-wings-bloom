import { createFileRoute } from "@tanstack/react-router";
import { CollectionAdmin, type FieldDef } from "@/components/admin/CollectionAdmin";

export const Route = createFileRoute("/admin/enquiries")({
  component: AdminEnquiries,
});

const fields: FieldDef[] = [
  { name: "name", label: "Parent / guardian" },
  { name: "email", label: "Email" },
  { name: "phone", label: "Phone" },
  { name: "childAge", label: "Child's age" },
  { name: "area", label: "Area" },
  { name: "program", label: "Program of interest" },
  { name: "preferredContact", label: "Preferred contact" },
  { name: "status", label: "Status", type: "select", options: ["new", "contacted", "closed"] },
  { name: "message", label: "Message", type: "textarea" },
];

function AdminEnquiries() {
  return (
    <CollectionAdmin
      name="enquiries"
      heading="Enquiries"
      intro="Enquiries submitted through the website contact form. Update the status as you follow up."
      allowCreate={false}
      fields={fields}
      defaults={{ status: "new" }}
      primary={(row) => String(row["name"] ?? "Enquiry")}
      secondary={(row) =>
        `${String(row["phone"] ?? "")} · ${String(row["email"] ?? "")} · ${String(row["status"] ?? "new")}`
      }
      details={(row) => (
        <div className="space-y-1 text-muted-foreground">
          <p>{String(row["message"] ?? "")}</p>
          <p className="text-xs">
            Child's age {String(row["childAge"] ?? "—")} · Area {String(row["area"] ?? "—")} ·
            Prefers {String(row["preferredContact"] ?? "—")} · Received{" "}
            {String(row["createdAt"] ?? "—")}
          </p>
        </div>
      )}
    />
  );
}
