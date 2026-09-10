# Qlugen SEO Step 3

Status: generation implemented and tested; production files await the confirmed custom domain in `src/seo/site.js`.

The existing Vite SEO build plugin generates `out/sitemap.xml` and `out/robots.txt` once `productionOrigin` is configured. Firebase Hosting already serves the `out` directory, so these files need no new page routes.

- Sitemap includes the 36 public pages in the canonical metadata catalogue, using exactly the same canonical URL construction.
- The wildcard 404 page, debug/preview pages, generated HTML filenames and other non-public routes are excluded.
- No fabricated modification dates are added.
- Robots declares `User-agent: *`, `Allow: /` and the absolute production sitemap URL. CSS, JavaScript and images are not blocked.
- No page design, visible content or route was changed.

Validation: `node scripts/check-crawl-files.mjs` passed route coverage, uniqueness, canonical consistency, exclusions, robots directives, rejection of Firebase domains, and the Vite output hook. Test files use an isolated test domain under `.tmp`, outside the deployment directory. Production build and changed-file lint also passed.

Pending: confirm the real production HTTPS origin, including whether it uses `www`, then rebuild and verify the generated production URLs. No guessed or staging domain has been published; no deployment was performed.
