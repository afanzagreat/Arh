# SEO review — not approved for deployment

Base: `812edc829ac3a5607981446b2baa8260cc5cdade`.
Review branch: `seo/technical-foundations-review`.

This is a technical SEO proposal, not a redesign or a promise of rankings. Do not merge or deploy without owner approval. GitHub Pages currently deploys `main` at `/`; this branch is not its publishing source.

## What changes

- Eight static HTML pages: English `/` and `/works.html`; Arabic, French and Hindi equivalents under `/ar/`, `/fr/` and `/hi/`.
- Each response contains its language's existing visible copy before JavaScript runs, with matching `lang`, direction, selected language, title and description.
- Absolute self-canonicals, reciprocal `en/ar/fr/hi/x-default` annotations, matching Open Graph URLs, corrected Open Graph locale values and alternate locales.
- Homepage titles now describe the existing web-design service and Jeddah location. Portfolio titles identify the web-design portfolio. Titles appear in tabs and may appear in search/social previews; Google can choose different snippets/titles.
- Sitemap expanded from two canonical URLs to eight, without fabricated last-modified dates or priority scores.
- Factual JSON-LD relationships among the studio, website, page and existing Shabibi project; no invented reviews, ratings, outcomes, addresses, phone numbers or prices.
- Internal links and asset paths work at locale-directory depths. Development tools are disallowed in robots.txt; public pages remain crawlable.
- A single HTML doctype, plus readable homepage content when scripts cannot execute.
- Deterministic builder and regression tests for future edits.

## What a visitor sees

**Normal JavaScript-enabled browsing:** No redesigned colors, spacing, fonts, cards, form fields, on-page wording, pricing, promotions or layout. The same language dropdown remains. Search-result/social-preview wording and the browser tab title can change.

**Intentional behavior change:** Selecting a different language navigates to that page's language URL instead of replacing text in place. This reloads the document. Query parameters and the current fragment are preserved. Internal navigation and reloads keep the language through the URL.

**Important preference detail:** Explicit URLs win over old stored preferences. `/` is English even if the browser previously used Arabic; `/ar/` is Arabic even if it previously used French. This makes shared links deterministic and avoids silently changing a locale page after loading. The current selection is still written to storage, but old storage no longer overrides the URL. This replaces the previous root-only preference behavior and needs to be accepted with the branch.

**Without working JavaScript:** Visitors now see the existing homepage content instead of invisible reveal sections, plus a simple row of four actual language links. This is a deliberate visible fallback. The normal page does not show this row.

## What is deliberately unchanged

Audit issues involving color contrast, French package-name errors, native copy editing, mobile menu focus, the 50% promotion, review/commercial terms, privacy wording, WhatsApp, client proof and form submission logic are not silently bundled into this SEO change. Some are important, but they require separate visible changes or owner-provided facts. Existing limitations remain until separately approved.

No Search Console submissions, analytics installation, paid tools, purchased links, keyword stuffing or generated thin-content pages were used. No form was sent. No production branch was modified.

## Build and test

The root English `index.html` and `works.html` remain layout sources. Translations come from the existing catalogs. `tools/build_seo.py` generates the six localized documents and all page metadata/sitemap. Edit root layouts/catalog body strings and rerun the builder; do not manually edit generated locale pages.

```sh
python3 -m pip install -r tools/requirements.txt
python3 tools/build_seo.py
python3 tools/test_seo.py
node tools/test_i18n.cjs
```

Static suite: **10 tests passed**, covering all eight documents, exact/reciprocal canonicals and alternates, translated content/attributes, sitemap, local links/fragments, structured-data syntax and page references, body-copy/form/CSS preservation and two-build idempotence.

Runtime suite: **40 cases passed**, covering every source/target language on both page types, same-language no-op, URL precedence over saved preference, query/hash retention, invalid language rejection and storage failures in the localization runtime. Eight inline scripts also passed Node syntax checks; external locale/runtime scripts passed syntax checks.

Browser preview checks: all eight routes rendered with matching language, direction, metadata and selector state. Actual Arabic-home → Arabic-portfolio navigation and Arabic → French portfolio dropdown navigation worked. Pricing, FAQ, blog Enter activation, required-field validation and the normal hidden no-script fallback were verified. The Arabic script-blocked frame rendered readable content and four real language links. No console errors appeared in the exercised normal preview session.

Tests establish local correctness, not deployed HTTP behavior, Google index acceptance, rich-result eligibility, real-device certification or traffic gains. The public PageSpeed service was quota-blocked during the audit; no new Lighthouse/Core Web Vitals score is claimed.

## Owner approval and later verification

Review the exact branch diff, especially the URL/preference change and tab/search titles. Only after approval should a separate action merge/deploy. Then verify live response codes, redirects, content types, locale HTML, canonical/hreflang/sitemap delivery and form behavior. Submit or inspect through Search Console only when access and authorization are available. New language routes do not exist on the current live site until deployment.

## Implementation references

- Google: localized versions, reciprocal/self references, absolute URLs and x-default — https://developers.google.com/search/docs/specialty/international/localized-versions
- Google: language-specific URLs and avoiding undiscoverable language variations — https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
- Google: real crawlable links and internal linking — https://developers.google.com/search/docs/crawling-indexing/links-crawlable
