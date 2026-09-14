# Deploying

`dist/` is a static site. Any static host serves it: Netlify, Vercel, Cloudflare Pages,
S3 + CloudFront, Nginx, Apache.

---

## ⚠ Before you go live — three things are NOT wired

### 1. The appointment form does not submit

This is the one that matters. **Patients cannot book through the site until you fix it.**

The source posted to `POST /do_actions/do_form_submit` on the SGEN platform. This build has
no backend, and leaving that action live would have sent patient names, phone numbers and
insurance details to the old platform after you left it. So the form is stopped:

```html
<form data-sr-unwired="1" data-sr-endpoint="/do_actions/do_form_submit"
      action="/appointment-request" method="post">
```

`action` points at a **same-origin path this build does not yet serve**, deliberately: with
JavaScript disabled the browser posts to a path that 404s rather than to the old platform,
so no patient data can leak to the previous operator. `data-sr-endpoint` records what the
source used to post to, for reference only.

`scripts/site.js` cancels the submit and shows: *"This form is not connected to a mail
handler in this build. Call (281) 488-0066 to book…"*

**To wire it**, implement a handler at `/appointment-request` (or point `action` at your
own endpoint), then delete the `data-sr-unwired` stamp so `scripts/site.js` stops
cancelling the submit:

```html
<form action="/appointment-request" method="post">
```

The stamp lives in `tools/build.mjs` (`bookingFormHTML`); remove it there and rebuild
rather than editing 44 files in `dist/`.

The field names are the source's own and are what your handler will receive:
`name` · `phone` · `email` · `daytime` · `patient` · `reason` · `insurance` · `notes`,
plus `hp` / `hpc` (honeypot — reject the submission if either is filled).

> This is a healthcare intake form. It collects name, phone, email and insurance carrier.
> Use HTTPS end to end, and confirm your handler's storage and retention meet your
> HIPAA obligations before you accept a single submission.

### 2. Clean URLs

Every page is `<route>/index.html`, so `/services/dry-eye-treatment` resolves without
configuration on almost every host. Confirm your host serves directory indexes. On Nginx:

```nginx
location / { try_files $uri $uri/ $uri/index.html =404; }
```

### 3. The 404 page

This build has no `404.html`. Add one, or point your host's 404 at `/`.

---

## Redirects

The crawl recorded **no redirect chains** — every one of the 43 source URLs returned 200
directly (`audit/site-inventory.json`, `redirectChain: []` on every page). The rebuild
keeps all 43 URLs exactly, so **no redirect map is needed** for the pages themselves.

`/search` is the one URL whose behaviour changed: it was a server-rendered results page and
is now a static page that reads `?s=`. The URL shape is identical, so existing links and
bookmarks keep working.

## Recommended headers

```
Cache-Control: public, max-age=31536000, immutable   # /assets/*, /styles/*, /scripts/*
Cache-Control: public, max-age=0, must-revalidate     # *.html
```

Add a CSP once you have wired the form. The site itself needs only `'self'` plus
`fonts.googleapis.com` / `fonts.gstatic.com`.

## What this build deliberately does not carry

- **Google Analytics** (`G-FVQWTWG7VR`), platform analytics, session attributers, phone-tap
  tracking. Re-add your own tags if you want them — and restore a consent control with them
  (see `CHANGE-LOG.md`, `reforge/remove#cookie-settings`).
- **The platform ADA/consent widget.** Its endpoint `POST /do_ada_consent/ada` returned 400
  during the crawl and is recorded as accepted in `audit/failures.json`. Nothing in `dist/`
  requests it.
- **Server-side search.** Replaced with a client-side index — see `CHANGE-LOG.md`.

## Accessibility

The rebuild adds what the source lacked: a skip link, visible focus rings on every
interactive element, `aria-current` on the active nav item, keyboard access to the mega
menus, and `prefers-reduced-motion` honoured across all animation. The source's own
accessibility-widget script is not carried over; if the practice relied on it
contractually, re-add it deliberately.
