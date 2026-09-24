# 💒 Punjabi Wedding Invitation

A high-quality, mobile-first, heavily-animated Punjabi wedding invitation site —
React 19 + Vite 6 + plain JS. All content editable via a secret admin panel backed
by **Firebase Firestore**. No demo data: without Firebase it renders with built-in
defaults; with Firebase everything (text, theme, images, sections, guests, RSVPs)
is live.

## Quick start

```bash
npm install
npm run dev      # local preview
npm run build    # → dist/ (deploy this)
```

## Firebase setup (5 min)

1. Go to **console.firebase.google.com** → *Add project* (any name, e.g. `neonsmm`).
2. **Build → Firestore Database** → *Create database* → start in **production mode**,
   pick the closest region.
3. **Build → Authentication** → *Get started* → *Sign-in method* → enable
   **Email/Password** → *Users* tab → *Add user* — this email/password is the
   **admin login**.
4. Project **Settings (⚙️) → Your apps → Add app → Web** → copy the
   `firebaseConfig` object.
5. Open the site's **admin panel → Settings → Firebase setup**, paste the JSON,
   *Validate & Save*. (Or bake it into `src/firebase.config.js` as the default
   connection — the Settings field always overrides it later.)
6. **Firestore → Rules** tab → paste the rules below → *Publish*.

### Firestore security rules (`site/*`)

Public can **read** the invite + **create** RSVPs + **bump open-counters** on
guest links. Only the logged-in admin can write anything else.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Site content: public read, admin-only write
    match /site/config {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Guest links: public read; public may ONLY touch openCount/lastOpenedAt
    match /site/guestLinks/{token} {
      allow read: if true;
      allow create, delete: if request.auth != null;
      allow update: if request.auth != null
        || request.resource.data.diff(resource.data)
             .affectedKeys().hasOnly(['openCount', 'lastOpenedAt']);
    }

    // RSVPs: anyone can submit, only admin can read/manage
    match /site/rsvps/{rsvpId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

## Admin panel

There is **no** `/admin` route. The panel lives at a secret hash route:

```
https://<your-site>/#/panel-x9f2kq8mz4t6w   ← default slug
```

Change/regenerate the slug anytime in **Settings → Secret admin link** —
the old link dies immediately. Login = the Firebase Auth email/password from
step 3 above.

Admin tabs: **Content** (every text, events, story scenes, venue, marquee, music),
**Themes** (5 themes, instant apply), **Pages** (toggle/reorder sections),
**Images** (swap any image URL), **Guests** (personal `?g=` links + open tracking
+ CSV), **RSVPs** (table + CSV), **Settings** (Firebase config, slug, reset).

## Guest personal links

Format: `https://<site>/?g=<token>#/` (the token is read from `?g=` *before*
the hash; `#/?g=` also works). Opening the link shows a shimmering
“Dear \<name\>” banner and bumps `openCount` / `lastOpenedAt` once per session —
visible in the admin Guests table.

## Cartoon images

Place the generated cartoon-style scenes in `public/images/` (see
`public/images/README.md` for exact filenames). They are referenced as
`images/*.webp` with graceful gradient fallbacks if a file is missing.

## Deploy — GitHub Pages

`vite.config.js` already sets `base: './'` for subpath hosting.

```bash
npm run build
# push the repo, then publish dist/ — e.g. with gh-pages:
npx gh-pages -d dist
# Repo → Settings → Pages → deploy from gh-pages branch
```

Check the live URL, then hard-refresh (Pages CDN can lag a few minutes).

## Deploy — Netlify

- **Drag & drop:** https://app.netlify.com/drop → drop the `dist/` folder.
- **Connect repo:** New site from Git → build command `npm run build`,
  publish directory `dist`.

## Tech

React 19 · Vite 6 · framer-motion (animations) · canvas-confetti ·
Firebase v10 (modular, lazy-loaded — the public page never crashes without it)

Component props are documented in `src/components/PROPS.md`.
