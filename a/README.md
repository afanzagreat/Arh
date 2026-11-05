# ARH Design: site prototype (v3)

Home, Work and a Shabibi Juice case study, with a dark/light theme toggle.

## Put it on GitHub
Upload everything in this folder into `home-test/a6/` in your repo (drag the folders `assets` and `work`, plus `index.html`).
Keep the folder structure exactly as it is. Wait a minute, then hard-refresh (Ctrl+F5).

## Pages
- `index.html`: home (loader, hero, template wall, services, how it works, contact)
- `work/index.html`: the project list
- `work/shabibi-juice/index.html`: the case study

## Add a new project (3 steps)
1. Copy the folder `work/shabibi-juice` and rename it (for example `work/my-bakery`).
2. Open the new `index.html` and change the text, links and images. Put new images in `assets/img/`.
3. Open `work/index.html`, copy the `<li class="proj">` block, and change the name, the line of details, the link and the image paths.

Only real information, please: no invented results or numbers.

## Colours and fonts
All colours live in the two token blocks at the top of `assets/site.css` (dark and light). Change them there only.

## Still to fill in
- `[NAME]` in the handwritten note (home page, section `#hello`)
- `[PLACEHOLDER] email` in three places: the menu footer (every page), the contact section, and the Start a project button (`href="#"`; use `mailto:you@yourdomain`)
- The five service lines are drafts: edit them in `index.html`

## Licences
- Fonts: Anton, DM Sans, DM Mono and Caveat (all SIL Open Font License, via Fontsource)
- GSAP: free "Standard No Charge" licence
- Shabibi Juice photos and logo: the client's existing assets, taken from your repo

## v4 changes
- Services page: services/index.html (+ assets/services.css, services.js). Edit the five draft lines directly in the HTML.
- Footer wordmark is now dots on a canvas (assets/footer-dots.js). Colours: --dot and --dot-hi at the top of site.css.
- Theme toggle now grows a circle from the button, 1.5s (falls back to a slow fade without View Transitions).
- Ghost removed from Work and case-study pages (still on Home).
- Email and name filled in.
- v4b: About page (about/index.html, assets/about.css, about.js). Fruit bowl removed from the case study.
- TODO: swap Shabibi hero/preview photo for a homepage screenshot (see work/index.html data-peek + p-thumb, case study c-full figure).
- v4c: Contact page (contact/index.html, contact.css/js) using FormSubmit. FIRST submission triggers an activation email to founder@arhdesign.tech: click it once. About photo replaced by a stamp. Pen button (assets/doodle.js) added to the header on every page.
- v4d: pen only via ghost (2 clicks, home page); ink wipes on scroll. Page reveal from centre on non-menu links (sessionStorage flag arh-reveal). Dark menu is red. New menu badge (seal + ring text, centre word changes on link hover). About: stamp removed, note rewritten, name tag is paper in both themes.
- v4e (phone pass): contact form text fits at 390px, services reveal faster, case-study hero uses srcset (phone loads the 85 KB image), bigger tap targets in footer/email links, home links to Services page. Unused fruit image removed.
- v4f: ghost removed on phones/touch. Prices page (prices/index.html, USD; toggle is pure CSS radios; plan links prefill the contact form via ?plan=). Services redesigned: each service has a live demo. Menu has 6 links.
- v4g: contact form now uses Web3Forms (access key in contact/index.html). FormSubmit removed.
- v4h: home hero now has section tabs (Work/Services/Prices/About/Contact) at the bottom of the first screen; horizontally scrollable on phones.
- v4i: Prices plans side by side on desktop, swipe row on phones; page shortened.
- v4j: Prices small print is now a hand-drawn (i) next to the billing toggle with a small sticky-note popup (hover, focus, tap; Esc closes).
- v4k: About page redesigned (editorial layout, receipts, steps, promises, note, facts). Anton only on the name tag.
- v4l: About envelope note, centred CTA, removed 'how a project goes' and 'short version'. Cursor: no idle dot, hover badges only, no lag. Home: result-focused subline (calls, bookings, enquiries); TEMPLATE wall compact on phones.
- v4m: About: small envelope top-right pops the note; treasure hunt of hidden features; first-person copy. Promises moved to Services as a torn 'deal sheet' with a self-drawing signature.
- v4n: About: removed 'Things I hid', restored 'The short version', added a lazy cat (halftone-dot, click to poke) sitting on the facts box.
- v4o: cat removed; short version is now a 'Studio Facts' nutrition label.
- v4p: short version re-staged: centred under its label, note attached beside/under the Studio Facts label (label unchanged).
