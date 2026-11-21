# MARVZ & INNOVATION TECH — Production Build & cPanel Verification Report

**Project Root:** `/app/applet`  
**Target Hosting:** Shared cPanel Static Hosting (`public_html`) + Optional Separate Node.js Backend (`server.ts`)  
**Verification Date:** 2026-11-21

---

## 1. Project & Dependency Audit Summary

- **Frontend Stack:** React `19.0.1`, TypeScript `~7.0.2`, Vite `8.3.0` (`@vitejs/plugin-react`), Tailwind CSS v4 (`@tailwindcss/vite` `4.3.3`), `lucide-react`, `@vis.gl/react-google-maps`, `motion`, `three`.
- **Backend Stack (`server.ts` + `server/`):** Node.js + Express `4.21.2` (`tsx`), SQLite (`better-sqlite3` `13.2.0`), `bcryptjs`, `nodemailer`, `@google/genai`, `dotenv`.
- **Package Audit:** All npm imports in `src/` resolve cleanly to declared dependencies in `package.json`; `tsconfig.json` and `vite.config.ts` (`base: '/'`, `@/` alias) verified valid for cPanel root hosting.
- **Database & Persistent Data Preservation:**
  - `data/marvz.db` (plus `-wal` and `-shm`), `data/admin_store.json`, and `database/schema.sql` verified intact and untouched.
  - None of `data/`, `database/`, `server/`, `server.ts`, `src/`, `node_modules/`, or `.env*` are included in the static deployment bundle or ZIP.

---

## 2. Preserved Website Sections & Content Verification

All existing website features, media assets, and interactive components remain completely preserved in the production build:

- **Homepage, Hero & Navigation:** Top navbar, hero section, company metrics, mission & pillars, and footer (`marvzinnovationtech@gmail.com` clickable `mailto:` links, `tel:`, WhatsApp).
- **Edge AI & Core Technology Domains:** Innovation & Technology, Cinematic Edge AI Animation, AI Research & Edge Inference, Drone Engineering & UAVs, Robotics & Automation, Cybersecurity, Software Development, Embedded IoT, Technology Training, and Learn & Experiment.
- **5 Organizational Profile Slideshows (`src/data/profileSlideshowData.ts`, `ProfileSlideshow.tsx`):**
  1. Organizational Introduction
  2. Drone Technology
  3. Robotics & Science Innovation
  4. Empowering Future Creators
  5. Recognition & Partnerships
  - Uses all **16 extracted photographs** from `MARVZ_Innovation_Tech_Organizational_Profile.pdf` under `/assets/profile/` plus the embedded profile PDF (`/assets/aistudio/MARVZ_Innovation_Tech_Organizational_Profile_e728b6b8.pdf`).
- **Infinite Horizontal Moving Image Gallery (`ProfileMarqueeGallery.tsx` & `index.css`):** Seamless right-to-left loop displaying all 16 profile photographs.
- **TOP MANAGEMENT & TEAM MEMBERS (`LeadershipTeamSection.tsx`):** Preserves exact 5-photo mapping:
  - Md. Ibna Zahan (`/assets/aistudio/image_eb48400e.png`)
  - Nafisa Tabassum (`/assets/aistudio/image_5c8192ff.png`)
  - A K M Azad (`/assets/aistudio/image_32ac750d.png`)
  - Soahib Al Kawsar (`/assets/aistudio/image_8fe61ebb.png`)
  - Amiya Sharma (`/assets/aistudio/image_c1f4040d.png`)
- **Office Location Map (`OfficeLocationMap.tsx`):** Interactive `@vis.gl/react-google-maps` view + verified Dhaka office fallback and direct Google Maps links.
- **AI Assistant Widget (`ChatWidget.tsx`, `ChatWindow.tsx`):** Local MARVZ knowledge fallback works statically; live Gemini streaming uses backend when connected.
- **Private `/admin` Portal (`AdminPortal.tsx`):** SPA route loads cleanly under `.htaccess` fallback; full authentication and data management connect to the Node.js backend.

---

## 3. Build, Lint & Static Security Audit Results

| Check | Command / Method | Result |
| :--- | :--- | :--- |
| **TypeScript Check** | `tsc --noEmit` | **Passed** (`0` errors) |
| **Production Build** | `vite build` | **Passed** (`dist/index.html`, `dist/assets/index-BeMjhk4e.js` [1,617,067 B], `dist/assets/index-DxBKhS17.css` [82,682 B]) |
| **Secret & Env Leak Scan** | Scanned all built `.js` & `.css` bundles | **Passed** (`0` hits for `GEMINI_API_KEY`, `ADMIN_INITIAL_PASSWORD`, `admin_store.json`, `marvz.db`) |
| **Hardcoded Localhost Scan** | Scanned all built `.js` & `.css` bundles | **Passed** (`0` `http://localhost` or `http://127.0.0.1` URLs in production bundle) |
| **JSON Content-Type Hardening** | Audited `App.tsx`, `OfficeLocationMap.tsx`, `ChatWindow.tsx` | Verified `application/json` checks prevent HTML-as-JSON crashes on static 404 `/api/*` |
| **Apache `.htaccess` Check** | Audited `public/.htaccess` | `<IfModule>` guards, AutoSSL `.well-known/` pass-through, loop-safe HTTPS redirect, `/api/` & static asset exclusions, SPA `/index.html` rewrite, MIME types, cache headers |
| **`robots.txt` Check** | Audited `public/robots.txt` | Present (`Allow: /`, `Disallow: /admin`, `Disallow: /api/`) |

---

## 4. Packaging & ZIP Verification (`MARVZ-CPANEL-UPLOAD.zip`)

- **ZIP File:** `/app/applet/MARVZ-CPANEL-UPLOAD.zip`
- **ZIP Size:** `12,254,875` bytes
- **Total Files Packed:** `39` files
- **CRC Integrity Check (`zipfile.testzip()`):** `None` (0 corrupted files)
- **Root Entries Verified Inside ZIP:**
  - `.htaccess`
  - `BACKEND-DEPLOYMENT-REQUIREMENTS.md`
  - `README-DEPLOYMENT.txt`
  - `assets/` (all JS, CSS, 8 `/assets/tech/*`, 16 `/assets/profile/*`, 6 `/assets/aistudio/*` images + Organizational Profile PDF)
  - `index.html`
  - `robots.txt`
- **Structure Compliance:** No nested `dist/` directory; no `src/`, `server/`, `data/`, `database/`, `node_modules/`, `.git/`, or `.env` files inside the ZIP.
- **Asset Reference Completeness:** `30` referenced `/assets/*` paths across `src/` & `index.html` + `3` built bundle/favicon links = **0 missing files** in `MARVZ-CPANEL-UPLOAD.zip`.

---

## 5. Pure Static HTTP Server Verification (Phase 9)

Tested serving `/app/applet/MARVZ-CPANEL-UPLOAD/` via an isolated Python `http.server` static server (with no Node.js `/api/*` server attached) and stopped cleanly immediately after verification:

- **URLs Tested:** `34` (`/` [`3,591` B, `text/html`], `/robots.txt` [`56` B, `text/plain`], `/assets/index-BeMjhk4e.js` [`1,617,067` B, `text/javascript`], `/assets/index-DxBKhS17.css` [`82,682` B, `text/css`], and all `30` referenced image & PDF assets).
- **Result:** **34 / 34 returned HTTP 200** with valid MIME types and non-zero byte counts (`0` failed requests).
- **Headless Browser Runtime Limitation in Sandbox:** `chromium`, `google-chrome`, and `playwright` are not installed in this container environment (`which` check confirmed absent), so automated headless browser DOM/click/viewport screenshots could not be executed in-container. All static bundle compilation, TypeScript checks, asset resolution, `.htaccess` directives, and static HTTP delivery were verified directly. Complete browser walkthrough on the live cPanel domain is included in the post-upload verification steps in `README-DEPLOYMENT.txt`.

---

## 6. Unresolved Items / Backend Hosting Separation

Standard shared cPanel `public_html` static hosting does not run Express or SQLite (`better-sqlite3`). The following features require deploying the separate Node.js backend documented in `BACKEND-DEPLOYMENT-REQUIREMENTS.md`:

1. Contact form persistence (`data/marvz.db`) and SMTP auto-reply emails (`POST /api/public/contact`).
2. Internship applications and Training registrations persistence (`POST /api/public/internships/apply`, `POST /api/public/training/register`).
3. Live Gemini AI streaming replies & conversation persistence (`POST /api/chat`, `/api/chat/stream`, `/api/leads`).
4. Private `/admin` RBAC authentication, password recovery, CMS edits, file uploads (`public/uploads/`), and inbox replies.
5. Server-side office re-geocoding (`GET /api/public/geocode-office`) and Google Maps referrer whitelist confirmation in Google Cloud Console (`https://yourdomain.com/*`) once your live domain is known.
