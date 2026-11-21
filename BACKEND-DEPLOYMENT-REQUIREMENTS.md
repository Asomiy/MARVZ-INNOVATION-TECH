# MARVZ & INNOVATION TECH — Backend Deployment Requirements

This document details all server-side features, runtime requirements, environment variables, database schemas, and hosting steps for running the full-stack backend (`server.ts`) alongside the static cPanel frontend build.

---

## 1. Architecture Overview (Static Frontend vs. Node.js Backend)

The MARVZ & INNOVATION TECH project is a **full-stack TypeScript application**:

- **Frontend (`dist/` / `MARVZ-CPANEL-UPLOAD/`):** React 19 + TypeScript + Vite 8 + Tailwind CSS v4 Single-Page Application (SPA). Compiles to pure static HTML, CSS, JS, and media assets suitable for standard shared cPanel `public_html`.
- **Backend (`server.ts` + `server/`):** Node.js + Express (`tsx server.ts`) API server listening on `PORT` (default `3000`) with persistent SQLite (`data/marvz.db`), JSON CMS/bot storage (`data/admin_store.json`), uploaded assets (`public/uploads/`), Gemini AI chatbot integration, and SMTP email delivery.

> **Important:** Standard shared cPanel `public_html` hosting serves static files only and **cannot** execute long-running Node.js processes or native C++ SQLite (`better-sqlite3`) add-ons directly from `.htaccess`. Static hosting renders the entire public website, all 5 organizational slideshows, marquee gallery, leadership & team section, Edge AI sections, mailto/tel/WhatsApp links, embedded Organizational Profile PDF, and interactive Google Map cleanly using built-in frontend defaults—while dynamic `/api/*` endpoints require a separate Node.js environment.

---

## 2. Features Requiring the Node.js Backend (`/api/*`)

| Feature Category | API Endpoints | What Works Without Backend | What Requires Node.js Backend |
| :--- | :--- | :--- | :--- |
| **Public Site & Slideshows** | `GET /api/public/site-data` | Full site renders with built-in defaults (`companyData.ts`, `DEFAULT_CONTENT`, `profileSlideshowData.ts`) | Live CMS edits saved via `/admin` overriding default copy/banners/location |
| **Office Location Map** | `GET /api/public/geocode-office` | Renders verified Dhaka address (`DEFAULT_LOCATION`) + Google Maps widget (if browser key allows domain) | Server-side re-geocoding when address changes in `/admin` |
| **Contact Form Submissions** | `POST /api/public/contact` | Client-side validation + direct `mailto:` / `tel:` / WhatsApp links | Saving messages to SQLite (`contact_messages`) & sending SMTP notifications |
| **Internship Applications** | `POST /api/public/internships/apply` | Form UI and validation | Persisting applications to `data/admin_store.json` |
| **Training Registrations** | `POST /api/public/training/register` | Training program list & modal UI | Persisting student registrations to `data/admin_store.json` |
| **AI Assistant Chatbot** | `POST /api/chat`, `POST /api/chat/stream`, `GET /api/visitor/config`, `GET /api/conversations/:id/*`, `POST /api/leads` | Chatbot UI opens; built-in local knowledge fallback answers common MARVZ FAQs (`chatbotKnowledge.ts`) | Live Gemini (`@google/genai`) streaming AI responses, server conversation history, human agent escalation, lead capture |
| **Private `/admin` Portal & RBAC** | `/api/admin/auth/*`, `/api/admin/users*`, `/api/admin/overview`, `/api/admin/content`, `/api/admin/upload`, `/api/admin/contacts*`, `/api/admin/kb*`, `/api/admin/leads*`, `/api/admin/settings` | `/admin` route & login/setup UI loads | All authentication, password setup/reset, RBAC sessions, CMS updates, media uploads (`public/uploads`), and reply emails |

---

## 3. Server Runtime & Native Dependency Requirements

1. **Node.js:** Node.js **v20 LTS or v22 LTS** (ESM modules + `tsx`).
2. **Process Manager:** `pm2`, systemd, Cloud Run, Railway/Render/Fly.io, or cPanel **"Setup Node.js App"** (CloudLinux Passenger).
3. **Native Addon (`better-sqlite3`):**
   - `better-sqlite3` compiles a native C++ binary against the target OS architecture and Node.js ABI version.
   - Do **not** copy `node_modules` from another OS/CPU. Run `npm ci` (or `npm install --omit=dev` plus `tsx`) directly on the target Linux host where `python3`, `make`, and `g++` build tools are installed.
4. **Disk Persistence:** Ensure persistent read/write storage (non-ephemeral disk) for:
   - `data/marvz.db`, `data/marvz.db-wal`, `data/marvz.db-shm` (SQLite database in WAL mode)
   - `data/admin_store.json` (CMS website content, leads, FAQs, chat logs, trainings, internships, settings)
   - `public/uploads/` (files uploaded from the Admin CMS)

---

## 4. Database Architecture

### Primary SQLite Database (`data/marvz.db`)
Canonical SQL schema is defined in `database/schema.sql` and automatically initialized/migrated on server startup by `server/contactDb.ts` and `server/adminAuthDb.ts`.

Tables:
- `contact_messages` — Visitor contact inquiries, duplicate-submission hashes, status (`New`, `Read`, `Replied`, `Archived`), and SMTP delivery status (`company_email_status`, `visitor_email_status`)
- `contact_replies` — Admin replies sent to contact inquiries
- `admin_users` — Multi-role RBAC accounts (`Super Admin`, `Content Manager`, `HR & Training Coordinator`, `Knowledge Editor`, `Support Agent`) with `bcryptjs` password hashes
- `admin_sessions` — Hashed HTTP-only session tokens, CSRF tokens, expiration, and revocation tracking
- `password_reset_tokens` — Expiring hashed reset codes/tokens for admin recovery
- `auth_audit_logs` — Security audit trail of login, password setup, and reset events

### JSON Application Store (`data/admin_store.json`)
Stores CMS text blocks, uploaded media metadata, internship applications, training programs and registrations, knowledge base entries, unanswered questions, ingested documents, visitor chat sessions, leads, office coordinates config, and chatbot settings.

> **Security Note:** `server.ts` explicitly returns HTTP `404` for direct requests to `/data/*`, `/database/*`, `/server/*`, `/.env*`, `/.git*`, and `/server.ts`. Never place `data/`, `database/`, `server/`, or `.env` inside `public_html/`.

---

## 5. Required Environment Variables (`.env`)

Configure these variables on the Node.js host (never commit real secrets to Git or upload `.env` to `public_html`):

```env
NODE_ENV="production"
PORT="3000"
APP_URL="https://yourdomain.com"
COOKIE_SECURE="true"

# Gemini AI Chatbot
GEMINI_API_KEY="YOUR_SERVER_GEMINI_API_KEY"

# Google Maps API (Frontend + Optional Server Geocoding)
VITE_GOOGLE_MAPS_API_KEY="YOUR_PUBLIC_MAPS_BROWSER_KEY"
GOOGLE_MAPS_API_KEY="YOUR_SERVER_MAPS_GEOCODING_KEY"

# SMTP Email Delivery (Gmail App Password or cPanel Mail Account)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="marvzinnovationtech@gmail.com"
SMTP_PASS="YOUR_SMTP_APP_PASSWORD"
SMTP_FROM_NAME="MARVZ & INNOVATION TECH"
SMTP_FROM_EMAIL="marvzinnovationtech@gmail.com"
CONTACT_RECIPIENT_EMAIL="marvzinnovationtech@gmail.com"

# Optional Admin Bootstrap Overrides (first-time setup UI handles password creation if omitted)
ADMIN_EMAIL="admin@marvztech.com"
# ADMIN_INITIAL_PASSWORD="SET_STRONG_INITIAL_PASSWORD_IF_NEEDED"
```

---

## 6. Deployment Options

### Option A — Separate Node.js Server / Cloud VPS / Cloud Run + cPanel Proxy
1. Deploy the full repository (`server.ts`, `server/`, `database/`, `data/`, `dist/`, `package.json`, `package-lock.json`/`bun.lock`) to your Node.js server or VPS.
2. Create `.env` on the server with the variables above (`NODE_ENV="production"`).
3. Install dependencies on the target host (`npm install`) so `better-sqlite3` compiles cleanly for that Node runtime.
4. Start the server (`npm start` — runs `tsx server.ts` on `PORT=3000`) under `pm2` or systemd.
5. Either point your domain directly to the Node.js reverse proxy (Nginx/Apache), **or** keep static files on cPanel `public_html` and add an Apache reverse proxy rule (requires WHM/VPS `mod_proxy` privileges) forwarding `/api/*` and `/uploads/*` to your Node backend origin.

### Option B — cPanel "Setup Node.js App" (If Enabled by Your Hosting Plan)
1. Upload backend files (`server.ts`, `server/`, `database/`, `data/`, `package.json`) into a **non-public** folder outside `public_html` (e.g., `/home/username/marvz-backend/`). **Do not put backend files inside `public_html`.**
2. Open **cPanel → Setup Node.js App → Create Application**:
   - **Node.js version:** `20.x` or `22.x`
   - **Application root:** `/home/username/marvz-backend`
   - **Application startup file:** `server.ts` (or use an `npm run start` wrapper / compiled JS entry if Passenger requires `.js`)
   - Add all `.env` variables in the cPanel Node.js App environment panel.
3. Click **Run NPM Install** inside cPanel to compile `better-sqlite3` on the server.
4. Set `NODE_ENV=production`, place built `dist/` or configure `/api` route mapping as supported by your host, and restart the Node application.

---

## 7. Security Checklist for Production

- Never expose `GEMINI_API_KEY`, `SMTP_PASS`, or database files in client bundles or `public_html/`.
- Enable HTTPS (`AutoSSL` / Let's Encrypt in cPanel) and set `COOKIE_SECURE="true"` so HttpOnly admin session cookies require TLS.
- Restrict `VITE_GOOGLE_MAPS_API_KEY` in Google Cloud Console by **HTTP Referrer** (`https://yourdomain.com/*`, `https://www.yourdomain.com/*`) and enable only the **Maps JavaScript API**.
- Regularly back up `data/marvz.db` (plus `-wal`/`-shm` or via SQLite `.backup`), `data/admin_store.json`, and `public/uploads/`.
