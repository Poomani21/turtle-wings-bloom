import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, MessageCircle } from "lucide-react";
import { useSiteContact } from "@/lib/site-contact";
import { submitEnquiry } from "@/lib/cms";

/**
 * Inquiry form.
 *
 * Submissions are written to the Firestore `enquiries` collection through
 * submitEnquiry() and appear in Admin → Enquiries. The success state is only
 * shown once the write actually succeeds; failures show the error state.
 */

type Errors = Partial<Record<string, string>>;

/** WhatsApp business number in international format (no +, no spaces). */
const WHATSAPP_NUMBER = "919620135222";

type Enquiry = {
  name: string;
  email: string;
  phone: string;
  childAge: string;
  area: string;
  program: string;
  preferredContact: string;
  message: string;
};

/** Builds the wa.me link containing every field the parent filled in. */
function whatsappLink(enquiry: Enquiry): string {
  const lines = [
    "Hello Turtle Wings,",
    "",
    "New Enquiry",
    `Name: ${enquiry.name}`,
    `Phone: ${enquiry.phone}`,
    `Email: ${enquiry.email}`,
  ];
  if (enquiry.childAge) lines.push(`Child's Age: ${enquiry.childAge}`);
  if (enquiry.area) lines.push(`Area / Location: ${enquiry.area}`);
  if (enquiry.program) lines.push(`Program Interested In: ${enquiry.program}`);
  if (enquiry.preferredContact) lines.push(`Preferred Contact: ${enquiry.preferredContact}`);
  lines.push(`Message: ${enquiry.message}`);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}

const programOptions = ["Evening Group Program (3–10 years)", "Parent Consultation", "Not sure yet"];

export function InquiryForm() {
  const contact = useSiteContact();
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  function validate(data: FormData): Errors {
    const next: Errors = {};
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const age = String(data.get("childAge") ?? "").trim();

    if (name.length < 2) next["name"] = "Please enter the parent or guardian's name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
      next["email"] = "Please enter a valid email address, e.g. name@example.com.";
    if (!/^[+]?[\d\s-]{8,15}$/.test(phone))
      next["phone"] = "Please enter a valid phone number (8–15 digits).";
    if (age) {
      const n = Number(age);
      if (!Number.isFinite(n) || n < 1 || n > 18) next["childAge"] = "Please enter an age in years.";
    }
    if (message.length < 10) next["message"] = "Please tell us a little more (10 characters or more).";
    return next;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // Simple honeypot spam protection — real visitors leave this empty.
    if (String(data.get("company") ?? "")) return;

    const found = validate(data);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = form.querySelector<HTMLElement>(`[name="${Object.keys(found)[0]}"]`);
      first?.focus();
      return;
    }

    if (status === "loading") return;
    setStatus("loading");
    const enquiry: Enquiry = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      childAge: String(data.get("childAge") ?? "").trim(),
      area: String(data.get("area") ?? "").trim(),
      program: String(data.get("program") ?? "").trim(),
      preferredContact: String(data.get("preferredContact") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
    };
    const url = whatsappLink(enquiry);
    try {
      await submitEnquiry(enquiry);
      setWhatsappUrl(url);
      setStatus("success");
      form.reset();
      // Hand the same enquiry over to WhatsApp. Browsers may block a popup that
      // opens after an await, so the success panel always shows the link too.
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Enquiry submission failed", error);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="card-soft p-8 text-center"
      >
        <CheckCircle2 aria-hidden="true" className="mx-auto size-12 text-leaf" />
        <h3 className="mt-4 text-2xl">Thank you for reaching out</h3>
        <p className="mt-3 text-muted-foreground">
          We have received your enquiry and will contact you to schedule your complimentary Parent
          Consultation. You can also reach us on {contact.phone}.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-secondary px-5 font-extrabold text-secondary-foreground"
            >
              <MessageCircle aria-hidden="true" className="size-4" /> Send on WhatsApp
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setWhatsappUrl(null);
              setStatus("idle");
            }}
            className="inline-flex min-h-11 items-center rounded-full border border-input px-5 font-bold transition-colors hover:bg-accent"
          >
            Send another enquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card-soft p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Parent / Guardian Name"
          name="name"
          required
          error={errors["name"]}
          autoComplete="name"
        />
        <Field
          label="Email"
          name="email"
          type="email"
          required
          error={errors["email"]}
          autoComplete="email"
        />
        <Field
          label="Phone Number"
          name="phone"
          type="tel"
          required
          error={errors["phone"]}
          autoComplete="tel"
        />
        <Field
          label="Child's Age (years)"
          name="childAge"
          type="number"
          error={errors["childAge"]}
          hint="Our program is for children aged 3–10 years."
        />
        <Field label="Area / Location" name="area" error={errors["area"]} />
        <div>
          <label htmlFor="program" className="mb-1.5 block text-sm font-bold">
            Program Interested In
          </label>
          <select
            id="program"
            name="program"
            defaultValue={programOptions[0]}
            className="min-h-11 w-full rounded-xl border border-input bg-card px-3 text-base"
          >
            {programOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="mt-6">
        <legend className="mb-2 text-sm font-bold">Preferred Contact Method</legend>
        <div className="flex flex-wrap gap-4">
          {["Phone call", "WhatsApp", "Email"].map((option, i) => (
            <label key={option} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="preferredContact"
                value={option}
                defaultChecked={i === 0}
                className="size-4 accent-[var(--leaf)]"
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5">
        <label htmlFor="message" className="mb-1.5 block text-sm font-bold">
          Message <span className="text-destructive">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          aria-invalid={Boolean(errors["message"])}
          aria-describedby={errors["message"] ? "message-error" : undefined}
          className="w-full rounded-xl border border-input bg-card p-3 text-base"
          placeholder="Tell us about your child and what you would like support with."
        />
        {errors["message"] ? (
          <p id="message-error" className="mt-1.5 flex gap-1.5 text-sm text-destructive">
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {errors["message"]}
          </p>
        ) : null}
      </div>

      {/* Honeypot: hidden from users and assistive tech */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      {status === "error" ? (
        <p role="alert" className="mt-5 flex gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Something went wrong sending your enquiry. Please try again, or call us on {contact.phone}.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-secondary px-6 font-extrabold text-secondary-foreground shadow-sun transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 sm:w-auto"
      >
        {status === "loading" ? (
          <>
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            Sending…
          </>
        ) : (
          "Book a Parent Consultation"
        )}
      </button>
      <p className="mt-3 text-xs text-muted-foreground">
        Fields marked * are required. We use your details only to respond to your enquiry.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  error,
  hint,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string | undefined;
  required?: boolean | undefined;
  error?: string | undefined;
  hint?: string | undefined;
  autoComplete?: string | undefined;
}) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-bold">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className="min-h-11 w-full rounded-xl border border-input bg-card px-3 text-base placeholder:text-muted-foreground"
      />
      {error ? (
        <p id={errorId} className="mt-1.5 flex gap-1.5 text-sm text-destructive">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
