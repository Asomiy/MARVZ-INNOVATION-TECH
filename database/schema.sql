-- MARVZ & INNOVATION TECH — Persistent SQLite Database Schema
-- Primary Engine: SQLite (data/marvz.db via better-sqlite3)
-- Compatible with MySQL 8+ / PostgreSQL with minor type adjustments.

-- ==========================================================
-- 1. CONTACT MESSAGES & ADMIN REPLIES
-- ==========================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  collaborator_type TEXT NOT NULL DEFAULT 'General Visitor',
  technology_domain TEXT NOT NULL DEFAULT 'General Inquiry',
  subject TEXT NOT NULL DEFAULT 'Website Contact Message',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Read', 'Replied', 'Archived')),
  ip_address TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  submission_hash TEXT NOT NULL DEFAULT '',
  company_email_status TEXT NOT NULL DEFAULT 'pending' CHECK (company_email_status IN ('pending', 'sent', 'failed', 'not_configured')),
  visitor_email_status TEXT NOT NULL DEFAULT 'pending' CHECK (visitor_email_status IN ('pending', 'sent', 'failed', 'not_configured')),
  email_error TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
  ON contact_messages (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status
  ON contact_messages (status);

CREATE INDEX IF NOT EXISTS idx_contact_messages_hash_created
  ON contact_messages (submission_hash, created_at DESC);

CREATE TABLE IF NOT EXISTS contact_replies (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  email_sent INTEGER NOT NULL DEFAULT 0,
  sent_at TEXT NOT NULL,
  FOREIGN KEY (message_id) REFERENCES contact_messages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_contact_replies_message_id
  ON contact_replies (message_id, sent_at ASC);

-- ==========================================================
-- 2. ADMIN USERS, SESSIONS, PASSWORD RESETS & AUDIT LOGS
-- ==========================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (
    role IN (
      'Super Admin',
      'Content Manager',
      'HR & Training Coordinator',
      'Knowledge Editor',
      'Support Agent'
    )
  ),
  phone TEXT NOT NULL DEFAULT '',
  department TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL DEFAULT '',
  legacy_salt TEXT NOT NULL DEFAULT '',
  needs_password_setup INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1,
  last_login TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email
  ON admin_users (email);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  remember_me INTEGER NOT NULL DEFAULT 0,
  csrf_token TEXT NOT NULL,
  ip_address TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token_hash
  ON admin_sessions (token_hash);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id
  ON admin_sessions (user_id);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_password_reset_email
  ON password_reset_tokens (email, created_at DESC);

CREATE TABLE IF NOT EXISTS auth_audit_logs (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  user_id TEXT NOT NULL DEFAULT '',
  success INTEGER NOT NULL DEFAULT 0,
  ip_address TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  details TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_created_at
  ON auth_audit_logs (created_at DESC);
