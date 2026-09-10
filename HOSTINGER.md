# Hostinger deployment

This site uses React and Vite. Use Node.js 22.12 or newer.

Install dependencies with `npm ci`, then build with `npm run build`.
The deployable static site is generated in `out/`.

For a Hostinger GitHub build, select Vite, use `npm run build` as the
build command, and set the output directory to `out`.

For static hosting, upload the contents of `out/` to `public_html/`, including
the `.htaccess` file. This file supports direct visits and refreshes on routes
such as `/contact`.
