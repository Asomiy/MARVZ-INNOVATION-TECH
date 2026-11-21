================================================================================
MARVZ & INNOVATION TECH — CPANEL STATIC DEPLOYMENT GUIDE
================================================================================

Thank you for preparing the MARVZ & INNOVATION TECH website for production.
This package (`MARVZ-CPANEL-UPLOAD.zip`) contains the compiled static frontend
build ready for upload to shared cPanel hosting (`public_html`).

--------------------------------------------------------------------------------
1. PACKAGE CONTENTS (AT ZIP ROOT)
--------------------------------------------------------------------------------
- index.html                             Production SPA entry file
- .htaccess                              Apache SPA routing, HTTPS redirect,
                                         AutoSSL exclusion, MIME types, caching
- robots.txt                             Crawler directives (/admin & /api excluded)
- assets/                                Compiled JS/CSS bundles, fonts, all 16
                                         Organizational Profile photos, team
                                         portraits, tech photos, & company PDF
- README-DEPLOYMENT.txt                  This deployment guide
- BACKEND-DEPLOYMENT-REQUIREMENTS.md     Full-stack Node.js/SQLite/SMTP/AI guide

--------------------------------------------------------------------------------
2. STEP-BY-STEP CPANEL UPLOAD INSTRUCTIONS (STATIC FRONTEND)
--------------------------------------------------------------------------------
1. Log in to your hosting control panel (cPanel).
2. Open **File Manager**.
3. Navigate to `public_html` (or your target addon domain document root).
4. Back up any old site files if needed, then ensure the target folder is clean.
   (Leave `.well-known/` untouched if AutoSSL already created it.)
5. Click **Upload** in the File Manager toolbar.
6. Upload `MARVZ-CPANEL-UPLOAD.zip` directly into `public_html`.
7. Return to File Manager, select `MARVZ-CPANEL-UPLOAD.zip`, and click **Extract**
   into `/public_html`.
8. Verify that `index.html`, `.htaccess`, `robots.txt`, and `assets/` sit
   directly inside `public_html/` (NOT inside a nested `dist/` or extra folder).
   - Tip: Click File Manager **Settings** (top right) and check
     "Show Hidden Files (dotfiles)" so you can verify `.htaccess` is present.
9. Delete `MARVZ-CPANEL-UPLOAD.zip` from `public_html` after extraction.
10. Verify SSL/HTTPS (cPanel → SSL/TLS Status → Run AutoSSL if not active) and
    visit your domain in a private/incognito browser window to confirm:
    - Homepage, hero animations, Edge AI sections, all 5 organizational profile
      slideshows, infinite horizontal marquee, Leadership & Team section, PDF
      profile links, and footer render cleanly.
    - Clicking `marvzinnovationtech@gmail.com` opens a new email draft.
    - Direct reload on `/admin` loads cleanly without Apache 404.

--------------------------------------------------------------------------------
3. GOOGLE MAPS REFERRER KEY REMINDER
--------------------------------------------------------------------------------
If your Google Cloud `VITE_GOOGLE_MAPS_API_KEY` uses HTTP Referrer restrictions,
add your live production domain patterns in Google Cloud Console:
  - https://yourdomain.com/*
  - https://www.yourdomain.com/*
If the key is restricted or unavailable, the Visit Our Lab section safely falls
back to displaying the verified Dhaka office address and direct Google Maps
buttons.

--------------------------------------------------------------------------------
4. IMPORTANT NOTE ON BACKEND SERVICES (SHARED CPANEL STATIC LIMITATIONS)
--------------------------------------------------------------------------------
Standard cPanel `public_html` hosting serves static files only. The compiled
frontend degrades gracefully without errors on static hosting, while the
following dynamic features require running the Node.js backend (`server.ts`) on
a Node-capable server (or cPanel "Setup Node.js App"):
  - Contact form database persistence & SMTP auto-emails (visitor mailto: links
    work immediately without backend)
  - Internship application & Training registration persistence
  - Live Gemini AI chatbot replies (offline FAQ/KB fallback works in static UI)
  - Private `/admin` RBAC login, CMS edits, file uploads, and lead inbox

See `BACKEND-DEPLOYMENT-REQUIREMENTS.md` for full server, SQLite (`data/marvz.db`),
`.env`, SMTP, and Node.js deployment instructions.
================================================================================
