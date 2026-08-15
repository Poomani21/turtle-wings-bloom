# Security rules — Firestore & Storage

Files: `firestore.rules`, `storage.rules`.

## Admin allowlist

Authorisation is **not** based on `request.auth != null`. Both rule sets use an
`isAdmin()` helper that checks for a document at `admins/{uid}` in Firestore.
A signed-in user with no allowlist document has no admin privileges.

To add an admin:

1. Sign the person up in Firebase Authentication and copy their UID.
2. Create a document `admins/<uid>` in Firestore (any fields, e.g. `{ email: "…" }`).
3. Remove the document to revoke access.

`admins/*` is readable by admins only and never writable from a client — manage
it from the Firebase console or a trusted backend.

## Firestore

| Collection      | Public                     | Admin           |
| --------------- | -------------------------- | --------------- |
| `blogs`         | read where `isPublished == true` | full read/write |
| `videos`        | read where `isPublished == true` | full read/write |
| `programs`      | read where `status == "active"`  | full read/write |
| `settings/site` | read (site renders it)     | write           |
| `members`       | no access                  | full read/write |
| `enquiries`     | `create` only              | full read/write |

- Draft blogs, unpublished videos and inactive programs are unreadable publicly.
- `members` is private data — public users cannot read it at all.
- The public contact form can submit an enquiry (`create`) but cannot read,
  update or delete any enquiry.
- Any path not matched above is denied.

## Storage

Uploads land in `<collection>/<timestamp>-<filename>` (`blogs/`, `videos/`,
`programs/`, `members/`).

- `blogs/`, `videos/`, `programs/` — public read (these images are shown on the
  website), admin-only write/delete.
- `members/` — admin read and write only, since member photos are private.
- All other paths are denied.

## Admin allowlist in the panel

`/admin` now mirrors the rules in the UI: after Firebase sign-in the panel calls
`isAdminUser(uid)` (a read of `admins/{uid}`). Accounts that are not on the
allowlist see a "cannot manage content" screen with their UID and a sign-out
button instead of the content manager. Add the UID as a document at
`admins/{uid}` in the Firebase console to grant access.
