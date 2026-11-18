import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'marvz.db');

export type AdminRole =
  | 'Super Admin'
  | 'Content Manager'
  | 'HR & Training Coordinator'
  | 'Knowledge Editor'
  | 'Support Agent';

export const VALID_ADMIN_ROLES: AdminRole[] = [
  'Super Admin',
  'Content Manager',
  'HR & Training Coordinator',
  'Knowledge Editor',
  'Support Agent',
];

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  phone: string;
  department: string;
  passwordHash: string;
  legacySalt: string;
  needsPasswordSetup: boolean;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export interface SafeAdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  phone: string;
  department: string;
  needsPasswordSetup: boolean;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

export interface AdminSessionRecord {
  id: string;
  userId: string;
  email: string;
  role: AdminRole;
  rememberMe: boolean;
  csrfToken: string;
  createdAt: string;
  expiresAt: string;
}

export interface AuthAuditLogRecord {
  id: string;
  eventType: string;
  email: string;
  userId: string;
  success: boolean;
  ipAddress: string;
  userAgent: string;
  details: string;
  createdAt: string;
}

export interface LegacyAdminAccountInput {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  department?: string;
  passwordHash?: string;
  passwordSalt?: string;
  isActive?: boolean;
  lastLogin?: string;
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');

db.exec(`
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
`);

const BCRYPT_ROUNDS = 12;

export function normalizeEmail(email: string): string {
  return String(email || '').trim().toLowerCase();
}

export function sha256Hex(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (typeof password !== 'string' || password.length < 8) {
    errors.push('At least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('At least one uppercase letter (A-Z)');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('At least one lowercase letter (a-z)');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('At least one numeric digit (0-9)');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('At least one special character (e.g. !@#$%^&*)');
  }
  return { valid: errors.length === 0, errors };
}

export async function hashPasswordBcrypt(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

function verifyLegacyScrypt(password: string, storedHash: string, salt: string): boolean {
  try {
    if (!storedHash || !salt) return false;
    const derived = crypto.scryptSync(password, salt, 64);
    const storedBuf = Buffer.from(storedHash, 'hex');
    if (derived.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(derived, storedBuf);
  } catch {
    return false;
  }
}

export async function verifyUserPassword(
  user: AdminUserRecord,
  plainPassword: string
): Promise<{ valid: boolean; upgradedBcryptHash?: string }> {
  if (!user.passwordHash || user.needsPasswordSetup) {
    return { valid: false };
  }

  // Standard bcrypt hash ($2a$, $2b$, $2y$)
  if (user.passwordHash.startsWith('$2')) {
    const valid = await bcrypt.compare(plainPassword, user.passwordHash);
    return { valid };
  }

  // Legacy scrypt migration path (auto-upgrades to bcrypt on valid login)
  if (user.legacySalt) {
    const valid = verifyLegacyScrypt(plainPassword, user.passwordHash, user.legacySalt);
    if (valid) {
      const upgradedBcryptHash = await hashPasswordBcrypt(plainPassword);
      return { valid: true, upgradedBcryptHash };
    }
  }

  return { valid: false };
}

function mapAdminUserRow(row: any): AdminUserRecord {
  const role: AdminRole = VALID_ADMIN_ROLES.includes(row.role) ? row.role : 'Support Agent';
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role,
    phone: row.phone || '',
    department: row.department || '',
    passwordHash: row.password_hash || '',
    legacySalt: row.legacy_salt || '',
    needsPasswordSetup: Number(row.needs_password_setup) === 1 || !row.password_hash,
    isActive: Number(row.is_active) === 1,
    lastLogin: row.last_login || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toSafeAdminUser(user: AdminUserRecord): SafeAdminUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    department: user.department,
    needsPasswordSetup: user.needsPasswordSetup,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
  };
}

/**
 * Initializes admin_users cleanly on first database bootstrap.
 * - Preserves existing admin emails from legacy admin_store.json or environment config.
 * - Never injects hardcoded passwords in source code.
 * - Never overwrites or resets passwords on subsequent restarts once initialized.
 */
export function initializeAdminUsers(legacyAccounts: LegacyAdminAccountInput[] = []): void {
  const now = new Date().toISOString();
  const countRow = db.prepare(`SELECT COUNT(*) AS cnt FROM admin_users`).get() as { cnt: number };

  if (countRow.cnt === 0) {
    const insertStmt = db.prepare(`
      INSERT INTO admin_users (
        id, name, email, role, phone, department,
        password_hash, legacy_salt, needs_password_setup,
        is_active, last_login, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    if (legacyAccounts.length > 0) {
      // Detect if multiple seeded accounts share the exact same untouched factory hash
      const firstHash = legacyAccounts[0]?.passwordHash || '';
      const sharedFactoryHash =
        legacyAccounts.length > 1 &&
        Boolean(firstHash) &&
        legacyAccounts.every((a) => a.passwordHash === firstHash);

      const tx = db.transaction((accounts: LegacyAdminAccountInput[]) => {
        for (const acc of accounts) {
          const email = normalizeEmail(acc.email);
          if (!email) continue;
          const role = VALID_ADMIN_ROLES.includes(acc.role as AdminRole)
            ? acc.role
            : 'Support Agent';

          const hasCustomPassword = Boolean(acc.passwordHash) && !sharedFactoryHash;
          insertStmt.run(
            acc.id || `adm-${crypto.randomUUID().slice(0, 8)}`,
            String(acc.name || 'MARVZ Administrator').trim(),
            email,
            role,
            String(acc.phone || '').trim(),
            String(acc.department || 'Operations').trim(),
            hasCustomPassword ? String(acc.passwordHash) : '',
            hasCustomPassword ? String(acc.passwordSalt || '') : '',
            hasCustomPassword ? 0 : 1,
            1, // Ensure existing preserved admin accounts are active
            acc.lastLogin || '',
            now,
            now
          );
        }
      });
      tx(legacyAccounts);
    } else {
      const configuredPrimaryEmail = normalizeEmail(
        process.env.ADMIN_EMAIL || 'admin@marvztech.com'
      );
      const envInitialPass = (process.env.ADMIN_INITIAL_PASSWORD || '').trim();
      const initialHash = envInitialPass ? bcrypt.hashSync(envInitialPass, BCRYPT_ROUNDS) : '';
      const needsSetup = initialHash ? 0 : 1;

      const defaultSeeds: Array<{
        id: string;
        name: string;
        email: string;
        role: AdminRole;
        phone: string;
        department: string;
        passwordHash: string;
        needsSetup: number;
      }> = [
        {
          id: 'adm-001',
          name: 'Engr. Zamil Rahman',
          email: configuredPrimaryEmail,
          role: 'Super Admin',
          phone: '+8801775551987',
          department: 'Executive & Engineering Governance',
          passwordHash: initialHash,
          needsSetup,
        },
        {
          id: 'adm-002',
          name: 'Admissions & Content Lead',
          email: 'editor@marvztech.com',
          role: 'Content Manager',
          phone: '+880 1711-000001',
          department: 'Website Content & Knowledge Base',
          passwordHash: '',
          needsSetup: 1,
        },
        {
          id: 'adm-003',
          name: 'HR & Training Desk',
          email: 'coordinator@marvztech.com',
          role: 'HR & Training Coordinator',
          phone: '+880 1711-000002',
          department: 'Internships & Bootcamps',
          passwordHash: '',
          needsSetup: 1,
        },
        {
          id: 'adm-004',
          name: 'Support Desk Dispatch',
          email: 'support@marvztech.com',
          role: 'Support Agent',
          phone: '+880 1711-000003',
          department: 'Live Chat & Client Inquiries',
          passwordHash: '',
          needsSetup: 1,
        },
      ];

      const tx = db.transaction(() => {
        for (const seed of defaultSeeds) {
          insertStmt.run(
            seed.id,
            seed.name,
            seed.email,
            seed.role,
            seed.phone,
            seed.department,
            seed.passwordHash,
            '',
            seed.needsSetup,
            1,
            '',
            now,
            now
          );
        }
      });
      tx();
    }
  } else {
    // Ensure primary existing admin account remains active without resetting any passwords
    const primaryEmail = normalizeEmail(process.env.ADMIN_EMAIL || 'admin@marvztech.com');
    const existingPrimary = getAdminUserByEmail(primaryEmail);
    if (existingPrimary && !existingPrimary.isActive) {
      db.prepare(`UPDATE admin_users SET is_active = 1, updated_at = ? WHERE id = ?`).run(
        now,
        existingPrimary.id
      );
    }
  }
}

export function getAdminUserByEmail(email: string): AdminUserRecord | null {
  const row = db
    .prepare(`SELECT * FROM admin_users WHERE lower(email) = lower(?) LIMIT 1`)
    .get(normalizeEmail(email));
  return row ? mapAdminUserRow(row) : null;
}

export function getAdminUserById(id: string): AdminUserRecord | null {
  const row = db.prepare(`SELECT * FROM admin_users WHERE id = ? LIMIT 1`).get(id);
  return row ? mapAdminUserRow(row) : null;
}

export function listAdminUsers(): SafeAdminUser[] {
  const rows = db
    .prepare(`SELECT * FROM admin_users ORDER BY CASE WHEN role = 'Super Admin' THEN 0 ELSE 1 END, created_at ASC`)
    .all();
  return rows.map((r) => toSafeAdminUser(mapAdminUserRow(r)));
}

export function countActiveSuperAdmins(excludeUserId?: string): number {
  const row = excludeUserId
    ? (db
        .prepare(
          `SELECT COUNT(*) AS cnt FROM admin_users WHERE role = 'Super Admin' AND is_active = 1 AND id != ?`
        )
        .get(excludeUserId) as { cnt: number })
    : (db
        .prepare(`SELECT COUNT(*) AS cnt FROM admin_users WHERE role = 'Super Admin' AND is_active = 1`)
        .get() as { cnt: number });
  return row?.cnt || 0;
}

export async function createAdminUser(params: {
  name: string;
  email: string;
  role: AdminRole;
  department?: string;
  phone?: string;
  password?: string;
  requireFirstTimeSetup?: boolean;
}): Promise<SafeAdminUser> {
  const now = new Date().toISOString();
  const normalized = normalizeEmail(params.email);
  const role: AdminRole = VALID_ADMIN_ROLES.includes(params.role) ? params.role : 'Support Agent';

  let passwordHash = '';
  let needsSetup = 1;

  if (!params.requireFirstTimeSetup && params.password) {
    passwordHash = await hashPasswordBcrypt(params.password);
    needsSetup = 0;
  }

  const id = `adm-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  db.prepare(`
    INSERT INTO admin_users (
      id, name, email, role, phone, department,
      password_hash, legacy_salt, needs_password_setup,
      is_active, last_login, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, '', ?, 1, '', ?, ?)
  `).run(
    id,
    String(params.name).trim(),
    normalized,
    role,
    String(params.phone || '').trim(),
    String(params.department || 'Operations').trim(),
    passwordHash,
    needsSetup,
    now,
    now
  );

  return toSafeAdminUser(getAdminUserById(id)!);
}

export function updateAdminUserProfile(
  id: string,
  updates: { name?: string; phone?: string; department?: string }
): SafeAdminUser | null {
  const user = getAdminUserById(id);
  if (!user) return null;
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE admin_users
    SET name = ?, phone = ?, department = ?, updated_at = ?
    WHERE id = ?
  `).run(
    updates.name !== undefined && updates.name.trim() ? updates.name.trim() : user.name,
    updates.phone !== undefined ? updates.phone.trim() : user.phone,
    updates.department !== undefined ? updates.department.trim() : user.department,
    now,
    id
  );
  return toSafeAdminUser(getAdminUserById(id)!);
}

export function updateAdminUserGovernance(
  id: string,
  updates: { role?: AdminRole; isActive?: boolean; department?: string }
): SafeAdminUser | null {
  const user = getAdminUserById(id);
  if (!user) return null;
  const now = new Date().toISOString();
  const nextRole =
    updates.role && VALID_ADMIN_ROLES.includes(updates.role) ? updates.role : user.role;
  const nextActive = typeof updates.isActive === 'boolean' ? (updates.isActive ? 1 : 0) : user.isActive ? 1 : 0;
  const nextDept =
    updates.department !== undefined ? String(updates.department).trim() : user.department;

  db.prepare(`
    UPDATE admin_users
    SET role = ?, is_active = ?, department = ?, updated_at = ?
    WHERE id = ?
  `).run(nextRole, nextActive, nextDept, now, id);

  if (nextActive === 0) {
    revokeAllUserSessions(id);
  }

  return toSafeAdminUser(getAdminUserById(id)!);
}

export function deleteAdminUser(id: string): boolean {
  const info = db.prepare(`DELETE FROM admin_users WHERE id = ?`).run(id);
  return info.changes > 0;
}

export async function setAdminUserPassword(
  userId: string,
  newPassword: string
): Promise<AdminUserRecord | null> {
  const hash = await hashPasswordBcrypt(newPassword);
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE admin_users
    SET password_hash = ?, legacy_salt = '', needs_password_setup = 0, updated_at = ?
    WHERE id = ?
  `).run(hash, now, userId);
  return getAdminUserById(userId);
}

export function upgradePasswordHashDirect(userId: string, bcryptHash: string): void {
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE admin_users
    SET password_hash = ?, legacy_salt = '', needs_password_setup = 0, updated_at = ?
    WHERE id = ?
  `).run(bcryptHash, now, userId);
}

export function recordAdminLoginTimestamp(userId: string): void {
  const now = new Date().toISOString();
  db.prepare(`UPDATE admin_users SET last_login = ?, updated_at = ? WHERE id = ?`).run(
    now,
    now,
    userId
  );
}

// ==========================================================
// SESSION MANAGEMENT (SHA-256 HASHED TOKENS IN SQLITE)
// ==========================================================
export function createAdminSession(params: {
  user: AdminUserRecord;
  rememberMe: boolean;
  ipAddress: string;
  userAgent: string;
}): { rawToken: string; csrfToken: string; expiresAt: string; ttlMs: number } {
  const rawToken = `marvz-sess-${crypto.randomBytes(32).toString('hex')}`;
  const tokenHash = sha256Hex(rawToken);
  const csrfToken = crypto.randomBytes(24).toString('hex');
  const ttlMs = params.rememberMe
    ? 1000 * 60 * 60 * 24 * 30 // 30 days
    : 1000 * 60 * 60 * 12; // 12 hours
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMs).toISOString();

  // Prune expired or previously revoked sessions periodically
  db.prepare(`DELETE FROM admin_sessions WHERE expires_at <= ? OR revoked_at IS NOT NULL`).run(
    now.toISOString()
  );

  db.prepare(`
    INSERT INTO admin_sessions (
      id, token_hash, user_id, email, role, remember_me, csrf_token,
      ip_address, user_agent, created_at, expires_at, revoked_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
  `).run(
    `sess-${crypto.randomUUID()}`,
    tokenHash,
    params.user.id,
    params.user.email,
    params.user.role,
    params.rememberMe ? 1 : 0,
    csrfToken,
    params.ipAddress.slice(0, 120),
    params.userAgent.slice(0, 250),
    now.toISOString(),
    expiresAt
  );

  return { rawToken, csrfToken, expiresAt, ttlMs };
}

export function verifyAdminSessionToken(rawToken: string): {
  session: AdminSessionRecord;
  user: AdminUserRecord;
} | null {
  if (!rawToken) return null;
  const tokenHash = sha256Hex(rawToken);
  const row = db
    .prepare(`
      SELECT s.*, u.id AS u_id
      FROM admin_sessions s
      JOIN admin_users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.revoked_at IS NULL
      LIMIT 1
    `)
    .get(tokenHash) as any;

  if (!row) return null;
  if (new Date(row.expires_at).getTime() <= Date.now()) {
    db.prepare(`UPDATE admin_sessions SET revoked_at = ? WHERE id = ?`).run(
      new Date().toISOString(),
      row.id
    );
    return null;
  }

  const user = getAdminUserById(row.user_id);
  if (!user || !user.isActive) return null;

  return {
    session: {
      id: row.id,
      userId: row.user_id,
      email: row.email,
      role: user.role,
      rememberMe: Number(row.remember_me) === 1,
      csrfToken: row.csrf_token,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
    },
    user,
  };
}

export function revokeSessionByToken(rawToken: string): void {
  if (!rawToken) return;
  db.prepare(`UPDATE admin_sessions SET revoked_at = ? WHERE token_hash = ?`).run(
    new Date().toISOString(),
    sha256Hex(rawToken)
  );
}

export function revokeAllUserSessions(userId: string, exceptSessionId?: string): void {
  const now = new Date().toISOString();
  if (exceptSessionId) {
    db.prepare(
      `UPDATE admin_sessions SET revoked_at = ? WHERE user_id = ? AND id != ? AND revoked_at IS NULL`
    ).run(now, userId, exceptSessionId);
  } else {
    db.prepare(
      `UPDATE admin_sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL`
    ).run(now, userId);
  }
}

// ==========================================================
// PASSWORD RESET TOKENS (EXPIRING + ONE-TIME USE)
// ==========================================================
export function createPasswordResetToken(user: AdminUserRecord): {
  resetToken: string;
  verificationCode: string;
  expiresAt: string;
  expiresMinutes: number;
} {
  const now = new Date();
  const expiresMinutes = 30;
  const expiresAt = new Date(now.getTime() + expiresMinutes * 60 * 1000).toISOString();

  // Invalidate any prior unused reset tokens for this user
  db.prepare(
    `UPDATE password_reset_tokens SET used_at = ? WHERE user_id = ? AND used_at IS NULL`
  ).run(now.toISOString(), user.id);

  const resetToken = crypto.randomBytes(32).toString('hex');
  // 8-character ambiguous-free uppercase alphanumeric verification code
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let verificationCode = '';
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    verificationCode += alphabet[bytes[i] % alphabet.length];
  }

  db.prepare(`
    INSERT INTO password_reset_tokens (
      id, user_id, email, token_hash, code_hash, expires_at, used_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, NULL, ?)
  `).run(
    `rst-${crypto.randomUUID()}`,
    user.id,
    user.email,
    sha256Hex(resetToken),
    sha256Hex(verificationCode),
    expiresAt,
    now.toISOString()
  );

  return { resetToken, verificationCode, expiresAt, expiresMinutes };
}

export function consumePasswordResetToken(params: {
  email: string;
  tokenOrCode: string;
}): AdminUserRecord | null {
  const email = normalizeEmail(params.email);
  const rawInput = String(params.tokenOrCode || '').trim();
  if (!email || !rawInput) return null;

  const nowIso = new Date().toISOString();
  const inputHashExact = sha256Hex(rawInput);
  const inputHashUpper = sha256Hex(rawInput.toUpperCase());

  const row = db
    .prepare(`
      SELECT * FROM password_reset_tokens
      WHERE lower(email) = lower(?)
        AND used_at IS NULL
        AND expires_at > ?
        AND (token_hash = ? OR code_hash = ?)
      ORDER BY created_at DESC
      LIMIT 1
    `)
    .get(email, nowIso, inputHashExact, inputHashUpper) as any;

  if (!row) return null;

  const user = getAdminUserById(row.user_id);
  if (!user || !user.isActive) return null;

  db.prepare(`UPDATE password_reset_tokens SET used_at = ? WHERE id = ?`).run(nowIso, row.id);
  return user;
}

// ==========================================================
// SECURITY AUDIT LOGGING
// ==========================================================
export function logAuthAudit(params: {
  eventType:
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILED'
    | 'FIRST_PASSWORD_SETUP'
    | 'PASSWORD_CHANGED'
    | 'PASSWORD_RESET_REQUESTED'
    | 'PASSWORD_RESET_COMPLETED'
    | 'LOGOUT'
    | 'USER_CREATED'
    | 'USER_UPDATED'
    | 'USER_DELETED'
    | 'ACCESS_DENIED';
  email?: string;
  userId?: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
}): void {
  try {
    db.prepare(`
      INSERT INTO auth_audit_logs (
        id, event_type, email, user_id, success, ip_address, user_agent, details, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `aud-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      params.eventType,
      normalizeEmail(params.email || ''),
      String(params.userId || ''),
      params.success ? 1 : 0,
      String(params.ipAddress || '').slice(0, 120),
      String(params.userAgent || '').slice(0, 240),
      String(params.details || '').slice(0, 500),
      new Date().toISOString()
    );
  } catch (err) {
    console.error('Failed to write auth audit log:', err);
  }
}

export function listRecentAuthAuditLogs(limit = 40): AuthAuditLogRecord[] {
  const safeLimit = Math.min(200, Math.max(1, Number(limit) || 40));
  const rows = db
    .prepare(`SELECT * FROM auth_audit_logs ORDER BY created_at DESC LIMIT ?`)
    .all(safeLimit) as any[];
  return rows.map((r) => ({
    id: r.id,
    eventType: r.event_type,
    email: r.email,
    userId: r.user_id,
    success: Number(r.success) === 1,
    ipAddress: r.ip_address,
    userAgent: r.user_agent,
    details: r.details,
    createdAt: r.created_at,
  }));
}
