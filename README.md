# Turtle Wings Enhancements

# Turtle Wings — Existing Project Modification Request

Repository:

https://github.com/Poomani21/turtle-wings-admin-ff914d93.git

You are working on an **existing Turtle Wings project**. Do NOT rebuild the project from scratch.

## VERY IMPORTANT — Preserve Existing Functionality

Before making any changes:

1. Inspect the entire existing repository.
2. Understand the current architecture, routes, Firebase configuration, authentication, Firestore structure, CMS/admin panel, website pages, blog system, and existing styling.
3. Do NOT delete existing functionality.
4. Do NOT remove existing static content.
5. Do NOT redesign the website unnecessarily.
6. Preserve the existing visual design and components unless a change is specifically required below.
7. Make the smallest safe changes necessary.
8. After changes, verify that existing functionality still works.

---

# 1. BLOG — KEEP STATIC BLOGS + ADD FIREBASE BLOGS

The website already has static blog content.

The existing static blog implementation includes:

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { PageHero, CtaBand } from "@/components/site/Sections";
import { posts, formatDate } from "@/lib/blog-data";
import { fetchPublishedFirebasePosts, mergePostsBySlug } from "@/lib/blog-firebase";

const title = "Blog — Autism Support, Parenting & Early Learning | Turtle Wings";

const description =
  "Practical notes on routines, communication, play and early learning for children with Autism Spectrum Disorder, written by the team at Turtle Wings, Bengaluru.";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const { data: firebasePosts } = useQuery({
    queryKey: ["published-firebase-blogs"],
    queryFn: fetchPublishedFirebasePosts,
    initialData: [],
    staleTime: 60_000,
  });

  const allPosts = mergePostsBySlug(posts, firebasePosts);

  return (
    <>
      

      


        


          


            {allPosts.map((post, i) => (
              
                
                  
                    
                  

                  
                    
                      {post.category}
                    

                    
                      
                      
                        {formatDate(post.date)}
                      
                    

                    
                      {post.title}
                    

                    
                      {post.excerpt}
                    

                    
                      Read more
                      
                    
                  
                
              
            ))}
          


        


      



      
    
  );
}
```

### Required blog behavior

**DO NOT DELETE OR REPLACE the existing static blogs.**

The existing static posts from:

```text
src/lib/blog-data
```

must always remain available.

Add Firebase/admin-created published blogs **in addition to** the static blogs.

The final website should show:

```text
Existing Static Blogs
        +
Published Firebase/Admin Blogs
        ↓
Combined Blog Listing
```

The current `mergePostsBySlug(posts, firebasePosts)` approach can be retained or improved if necessary.

### Important

If an admin-created blog has the same slug as a static blog, prevent duplicate cards.

Do not accidentally hide the static blog posts if Firebase returns no data.

If Firebase is temporarily unavailable, the static blogs must still render normally.

The public blog page must therefore work like:

```text
Firebase available:
Static blogs + Firebase published blogs

Firebase unavailable:
Static blogs only
```

---

# 2. BLOG DETAIL / READ MORE

When clicking:

```text
Read more
```

the correct individual blog must open.

This applies to:

* Existing static blogs
* Firebase/admin-created blogs

Do not break the existing:

```text
/blog/$slug
```

route.

The individual blog page must correctly determine whether the requested slug belongs to:

1. Static blog data
2. Firebase blog data

and render the appropriate content.

Do not remove any existing static blog detail pages/content.

---

# 3. REMOVE FIREBASE CLOUD STORAGE FOR IMAGE UPLOADS

The current project is using Firebase Storage for image uploads.

I do NOT want to use Firebase Cloud Storage.

Remove the Firebase Storage dependency from the image upload functionality **only after confirming all current usages**.

Do not break:

* Firebase Authentication
* Firestore
* Existing admin login
* Existing Firestore content
* Public website data fetching

Firebase should continue to be used for:

```text
Firebase Authentication
Firestore
```

but NOT:

```text
Firebase Cloud Storage
```

for website image uploads.

---

# 4. ADMIN IMAGE UPLOAD — STORE IMAGE IN PROJECT PUBLIC FOLDER

New admin image uploads should ultimately be stored in the project's:

```text
public/
```

folder.

Use an appropriate structure such as:

```text
public/
  images/
    programs/
    members/
    blogs/
    other/
```

For example:

```text
public/images/programs/program-123.webp
public/images/members/member-456.webp
public/images/blogs/blog-789.webp
```

Use a unique ID/filename so images do not accidentally overwrite existing files.

For example:

```text
program-{uniqueId}.webp
member-{uniqueId}.webp
blog-{uniqueId}.webp
```

or another safe naming strategy.

---

# 5. IMPORTANT SECURITY REQUIREMENT FOR GITHUB IMAGE UPLOAD

The admin panel is deployed separately.

Do NOT put a GitHub Personal Access Token directly inside the frontend/browser JavaScript.

Never do:

```text
VITE_GITHUB_TOKEN=...
```

and expose that token to the browser.

The GitHub token must remain server-side.

Use the existing backend/API capabilities of the project, or create a secure API endpoint/server-side function that:

1. Receives the selected image from the authenticated admin.
2. Validates the user is an authorized admin.
3. Validates file type.
4. Validates file size.
5. Generates a safe unique filename.
6. Uploads/commits the image into the GitHub repository's `public/images/...` directory.
7. Returns the resulting public image URL.
8. Stores that URL in Firestore.

The browser must never receive the GitHub write token.

---

# 6. ADMIN DELETE IMAGE

This is very important.

If an admin deletes a:

* Program
* Member
* Blog
* Other content containing an uploaded image

the associated image should also be removed from the GitHub `public/images/...` directory when appropriate.

Do not blindly delete images that are still referenced by another record.

Before deleting an image:

1. Identify the exact stored image path.
2. Check whether another Firestore record references the same image.
3. If it is still used elsewhere, do not delete the physical image.
4. Otherwise delete the corresponding GitHub file.
5. Then delete/update the Firestore document.

The delete operation must delete **only the particular image associated with that record**.

Do NOT delete the entire `public/images` directory.

---

# 7. IMAGE URL HANDLING

Use stable public URLs after deployment.

Do not save local development URLs such as:

```text
http://localhost:...
```

Do not save Firebase Storage URLs.

The Firestore document should contain the final public image URL/path, for example:

```text
/images/programs/program-123.webp
```

or the correct production URL strategy for the existing hosting architecture.

Make sure the same image works after:

* Hard refresh
* Browser refresh
* Opening the website in a new tab
* Opening the direct blog/program/member page

---

# 8. IMAGE FILE VALIDATION

For admin uploads:

Allow normal web image formats:

```text
jpg
jpeg
png
webp
```

Do not treat `.ico` as a normal program/member/blog image unless the existing application specifically requires it.

Validate:

* MIME type
* Extension
* File size

Compress/resize images where practical so the repository does not become unnecessarily large.

Do not upload huge original images if an optimized version can be generated safely.

---

# 9. FIRESTORE CONTENT

Keep Firestore for content and metadata.

For example:

```text
programs
members
blogs
videos
settings
enquiries
```

For image fields, store the public image path/URL.

Example:

```text
image: "/images/programs/program-123.webp"
```

Do not store Firebase Storage URLs for new uploads.

---

# 10. VIDEO FUNCTIONALITY

Do NOT use Firebase Storage for videos.

Videos should not be committed to the GitHub repository's `public` folder.

For videos, support an external video URL/embed approach.

Prefer:

```text
YouTube
```

with an Unlisted video where appropriate.

The admin can save:

```text
videoUrl
youtubeUrl
embedUrl
```

in Firestore.

The website should then render the video from the external URL.

Do not upload large `.mp4` files into GitHub.

---

# 11. CONTACT PAGE — GOOGLE MAP

On the website Contact page:

Add a Google Maps iframe **above the footer**.

Use the client's provided location:

```text
[USE THE EXISTING/PROVIDED TURTLE WINGS LOCATION FROM THE PROJECT]
```

If the project already contains the correct Turtle Wings address/location, reuse it.

Do not invent a different location.

The map should:

* Be responsive
* Work on mobile
* Work on desktop
* Not overflow horizontally
* Have appropriate width/height
* Match the existing website design
* Appear above the footer

Use a responsive container such as:

```text
width: 100%
aspect-ratio: 16 / 9
```

or another suitable responsive implementation.

---

# 12. MOBILE RESPONSIVE FIXES

There are currently CSS/alignment issues on mobile and desktop.

Perform a proper responsive pass across:

```text
1920px
1440px
1024px
768px
390px
375px
```

Check:

* Header
* Navigation
* Hero sections
* Cards
* Blog cards
* Blog detail page
* Program page
* Members page
* Contact page
* Footer
* Buttons
* Images
* Long text
* Forms
* Map iframe

There must be no unwanted horizontal scrolling.

---

# 13. LONG CONTENT / DESCRIPTION OVERFLOW BUG

There is currently an issue where if a user enters a long description/content, the content goes outside the website/container.

Fix this properly.

Long content must:

* Wrap correctly
* Stay inside its container
* Never cause horizontal page overflow
* Work on mobile
* Work on desktop
* Handle long words/URLs safely
* Preserve readable spacing

Check CSS properties such as:

```text
overflow-wrap
word-break
min-width: 0
max-width
white-space
```

where appropriate.

Do NOT solve this by simply hiding content with:

```text
overflow: hidden
```

if that would hide legitimate content.

The entire content must remain readable.

---

# 14. BLOG PAGE RESPONSIVENESS

Fix the blog listing page so cards remain aligned correctly.

Check:

```text
/blog
/blog/$slug
```

Make sure:

* Cards have equal/appropriate layout
* Images don't overflow
* Titles wrap correctly
* Long titles don't break the layout
* Long excerpts don't break the layout
* Read More stays inside the card
* Mobile uses a clean single-column layout
* Tablet uses an appropriate grid
* Desktop uses the existing multi-column design

---

# 15. BLOG DETAIL PAGE

Fix the individual blog page.

When clicking:

```text
Read more
```

the selected blog must display correctly.

The content must:

* Stay inside the page container
* Wrap correctly
* Handle long paragraphs
* Handle headings
* Handle lists
* Handle links
* Handle images
* Handle long URLs
* Not create horizontal scrolling

---

# 16. PROGRAM PAGE

Fix responsive/alignment issues on the Programs page.

Check:

* Program cards
* Program title
* Description
* Images
* Buttons
* Long descriptions
* Mobile layout
* Desktop layout

Long program descriptions must wrap correctly.

---

# 17. MEMBERS PAGE

Fix responsive/alignment issues on the Members page.

Check:

* Member cards
* Member images
* Names
* Roles
* Descriptions
* Long descriptions
* Mobile layout
* Desktop layout

No text should overflow outside cards or the page.

---

# 18. DO NOT REMOVE EXISTING DESIGN

This is critical.

Do NOT remove existing:

* Header
* Footer
* WhatsApp button
* Location/map components that already exist
* Existing animations
* Existing Reveal components
* Existing typography
* Existing colors
* Existing cards
* Existing static blog content
* Existing Firebase Authentication
* Existing Firestore functionality

Only make the requested improvements.

---

# 19. HARD REFRESH / DATA LOADING

The public website must work correctly after:

```text
Normal navigation
Hard refresh
Direct URL navigation
Opening blog URL directly
Opening program URL directly
Opening member URL directly
```

Especially verify the blog page.

After hard refresh:

```text
Static blogs must still appear.
Firebase blogs should appear when available.
```

Do not make the static content dependent on Firebase.

---

# 20. ERROR HANDLING

If Firebase is unavailable:

```text
Static website content should continue working.
```

If a Firebase blog request fails:

```text
Show static blogs.
Do not show a blank page.
Do not crash the application.
```

If an image upload fails:

```text
Show a clear admin error.
Do not create a broken Firestore record.
```

If GitHub upload succeeds but Firestore write fails:

```text
Handle the orphan image safely.
Do not leave the CMS in an inconsistent state.
```

---

# 21. BEFORE CHANGING CODE

First inspect and report:

1. Current Firebase Storage usage
2. Current Firestore usage
3. Current Firebase Authentication implementation
4. Current blog implementation
5. Current admin image upload implementation
6. Current program/member/blog image fields
7. Current backend/API routes
8. Current hosting/deployment architecture
9. Existing public folder structure
10. Existing responsive/CSS issues

Then implement the changes.

Do not make assumptions if an existing implementation already solves part of the requirement.

---

# 22. TESTING REQUIREMENTS

After implementation, test:

### Admin

* Login
* Add program
* Upload program image
* Edit program
* Delete program
* Add member
* Upload member image
* Delete member
* Add blog
* Upload blog image
* Publish blog
* Delete blog
* Add video URL
* Delete video

### Website

* Programs
* Members
* Blogs
* Static blogs
* Firebase blogs
* Blog Read More
* Blog detail
* Videos
* Contact page
* Google Map
* Footer

### Responsive

Test at:

```text
1920px
1440px
1024px
768px
390px
375px
```

### Refresh

Test:

```text
Normal navigation
Hard refresh
Direct URL
```

---

# 23. FINAL IMPORTANT REQUIREMENT

Do NOT simply tell me that the feature is implemented.

Actually inspect the repository and implement it.

After completing the work, provide a concise report containing:

```text
Completed:
- ...
- ...
- ...

Files changed:
- ...
- ...

Firebase Storage:
Removed/No longer used for image uploads

Firestore:
Still used for CMS data

Authentication:
Still used for admin login

Images:
Stored through the new public-folder/GitHub API mechanism

Videos:
External video URL / YouTube approach

Blog:
Static blogs preserved + Firebase blogs added

Responsive:
Desktop + mobile fixed

Google Maps:
Added above footer

Testing:
- ...
```

Most importantly:

**DO NOT DELETE THE EXISTING STATIC BLOG CONTENT.**

The existing static blog posts must remain visible even if Firebase has zero blog records or Firebase is temporarily unavailable.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://turtle-wings-bloom.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/84cd5a9d-11d2-45ad-8a17-311d856961a9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
