# Salt & Slate Cleaning Company — website

Static marketing site for Salt & Slate Cleaning Company: premium residential and
commercial cleaning across Utah, Arizona, Nevada, and Texas.

Vanilla HTML, CSS, and JavaScript. No build step, no dependencies — `index.html` is
the entry point and every page is a plain static file.

## Structure

```
index.html                          home
about/                              about, company stats, six office locations
services/                           residential index + 9 service pages
commercial/                         commercial index + 8 industry pages
locations/                          service-area index + Utah / Arizona / Nevada / Texas
assets/css/site.css                 design system (tokens + all components)
assets/js/site.js                   nav drawer, dropdowns, form submission, scroll reveal
images/source/                      photography from the business
favicon.svg
```

## Design system

A single stylesheet drives every page. The palette is slate/ink with a brass accent on
a salt-white base; display type is a serif stack and body copy a system sans stack, so
there are no external font requests. Components are class-based (`.phero`, `.svc`,
`.tile`, `.room`, `.ck`, `.scope`, `.faq`, `.ba`, `.chips`, `.state`, `.office`,
`.form-card`) and layout is responsive down to 320px. The desktop nav breakpoint is
1000px; below it a drawer and a sticky action bar take over.

`site.js` is progressive enhancement only — every page, including the quote form, works
with JavaScript disabled.

## Forms

Every page carries one quote form at `#quote`, posting to LeadrVision:

- `method="POST"` to `https://vision.leadrai.com/api/forms/0c57a1a86465becf246c760ec5e310a4`
- `_form` names the form, `_page` is stamped with `window.location.href` on load, and
  `_gotcha` is a hidden honeypot
- `name`, `email`, and `phone` use those exact field names; every other field has a
  human-readable name
- JavaScript submits via `fetch()` to the same URL and shows an inline confirmation on
  `{"ok": true}`; without JavaScript the plain POST returns to the page with
  `?submitted=1`, which renders the same confirmation

## Conventions

- All internal links are root-relative (`/services/deep-cleaning/`).
- `/review` is provided by the hosting platform and is intentionally not built here; it
  is linked from the footer and from the contact block on every page.
- Service-area city and county names are rendered as plain text, because only the
  state-level location pages exist.
