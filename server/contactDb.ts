import Database from 'better-sqlite3';
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

export type ContactMessageStatus = 'New' | 'Read' | 'Replied' | 'Archived';
export type EmailDeliveryStatus = 'pending' | 'sent' | 'failed' | 'not_configured';

export interface ContactReplyRecord {
  id: string;
  senderName: string;
  message: string;
  emailSent: boolean;
  sentAt: string;
}

export interface ContactMessageRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  collaboratorType: string;
  technologyDomain: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  companyEmailStatus: EmailDeliveryStatus;
  visitorEmailStatus: EmailDeliveryStatus;
  emailError?: string;
  replies: ContactReplyRecord[];
  createdAt: string;
  updatedAt: string;
}

interface LegacyContactMessage {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  collaboratorType?: string;
  technologyDomain?: string;
  subject?: string;
  message: string;
  status?: string;
  replies?: Array<{ id: string; senderName: string; message: string; sentAt: string }>;
  createdAt?: string;
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
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
`);

export function computeSubmissionHash(email: string, subject: string, message: string): string {
  const normalized = [
    email.trim().toLowerCase(),
    subject.trim().toLowerCase(),
    message.trim().replace(/\s+/g, ' ').toLowerCase(),
  ].join('|');
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

function normalizeStatus(raw?: string): ContactMessageStatus {
  if (raw === 'New' || raw === 'Read' || raw === 'Replied' || raw === 'Archived') {
    return raw;
  }
  if (raw === 'In Progress') return 'Read';
  if (raw === 'Resolved') return 'Archived';
  return 'New';
}

function mapRow(row: any, repliesByMsgId: Map<string, ContactReplyRecord[]>): ContactMessageRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone || '',
    collaboratorType: row.collaborator_type,
    technologyDomain: row.technology_domain,
    subject: row.subject,
    message: row.message,
    status: normalizeStatus(row.status),
    companyEmailStatus: row.company_email_status || 'pending',
    visitorEmailStatus: row.visitor_email_status || 'pending',
    emailError: row.email_error || '',
    replies: repliesByMsgId.get(row.id) || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
  };
}

export function migrateLegacyContactMessages(legacyMessages: LegacyContactMessage[]): void {
  const countRow = db.prepare('SELECT COUNT(*) as total FROM contact_messages').get() as { total: number };
  if (countRow.total > 0 || !Array.isArray(legacyMessages) || legacyMessages.length === 0) {
    return;
  }

  const insertMsg = db.prepare(`
    INSERT OR IGNORE INTO contact_messages (
      id, full_name, email, phone, collaborator_type, technology_domain,
      subject, message, status, submission_hash, company_email_status,
      visitor_email_status, email_error, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'not_configured', 'not_configured', '', ?, ?)
  `);

  const insertReply = db.prepare(`
    INSERT OR IGNORE INTO contact_replies (id, message_id, sender_name, message, email_sent, sent_at)
    VALUES (?, ?, ?, ?, 0, ?)
  `);

  const tx = db.transaction((items: LegacyContactMessage[]) => {
    for (const item of items) {
      const createdAt = item.createdAt || new Date().toISOString();
      const subject = item.subject || 'Website Contact Message';
      const hash = computeSubmissionHash(item.email || '', subject, item.message || '');
      insertMsg.run(
        item.id,
        item.fullName,
        item.email,
        item.phone || '',
        item.collaboratorType || 'General Visitor',
        item.technologyDomain || 'General Inquiry',
        subject,
        item.message,
        normalizeStatus(item.status),
        hash,
        createdAt,
        createdAt
      );
      if (Array.isArray(item.replies)) {
        for (const rep of item.replies) {
          insertReply.run(rep.id, item.id, rep.senderName, rep.message, rep.sentAt || createdAt);
        }
      }
    }
  });

  tx(legacyMessages);
}

export function findRecentDuplicateSubmission(submissionHash: string, withinMinutes = 10): ContactMessageRecord | null {
  const cutoffIso = new Date(Date.now() - withinMinutes * 60 * 1000).toISOString();
  const row = db
    .prepare(
      `SELECT * FROM contact_messages
       WHERE submission_hash = ? AND created_at >= ?
       ORDER BY created_at DESC LIMIT 1`
    )
    .get(submissionHash, cutoffIso) as any;

  if (!row) return null;
  return getContactMessageById(row.id);
}

export function insertContactMessage(input: {
  fullName: string;
  email: string;
  phone: string;
  collaboratorType: string;
  technologyDomain: string;
  subject: string;
  message: string;
  ipAddress: string;
  userAgent: string;
  submissionHash: string;
}): ContactMessageRecord {
  const now = new Date().toISOString();
  const id = `msg-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

  db.prepare(`
    INSERT INTO contact_messages (
      id, full_name, email, phone, collaborator_type, technology_domain,
      subject, message, status, ip_address, user_agent, submission_hash,
      company_email_status, visitor_email_status, email_error, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'New', ?, ?, ?, 'pending', 'pending', '', ?, ?)
  `).run(
    id,
    input.fullName,
    input.email,
    input.phone,
    input.collaboratorType,
    input.technologyDomain,
    input.subject,
    input.message,
    input.ipAddress,
    input.userAgent,
    input.submissionHash,
    now,
    now
  );

  return getContactMessageById(id)!;
}

export function updateContactEmailDeliveryStatus(
  id: string,
  companyEmailStatus: EmailDeliveryStatus,
  visitorEmailStatus: EmailDeliveryStatus,
  emailError = ''
): ContactMessageRecord | null {
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE contact_messages
    SET company_email_status = ?, visitor_email_status = ?, email_error = ?, updated_at = ?
    WHERE id = ?
  `).run(companyEmailStatus, visitorEmailStatus, emailError.slice(0, 500), now, id);

  return getContactMessageById(id);
}

export function listContactMessages(): ContactMessageRecord[] {
  const rows = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all() as any[];
  const replyRows = db.prepare('SELECT * FROM contact_replies ORDER BY sent_at ASC').all() as any[];

  const repliesByMsgId = new Map<string, ContactReplyRecord[]>();
  for (const r of replyRows) {
    const arr = repliesByMsgId.get(r.message_id) || [];
    arr.push({
      id: r.id,
      senderName: r.sender_name,
      message: r.message,
      emailSent: Boolean(r.email_sent),
      sentAt: r.sent_at,
    });
    repliesByMsgId.set(r.message_id, arr);
  }

  return rows.map((row) => mapRow(row, repliesByMsgId));
}

export function getContactMessageById(id: string): ContactMessageRecord | null {
  const row = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(id) as any;
  if (!row) return null;

  const replyRows = db
    .prepare('SELECT * FROM contact_replies WHERE message_id = ? ORDER BY sent_at ASC')
    .all(id) as any[];

  const map = new Map<string, ContactReplyRecord[]>();
  map.set(
    id,
    replyRows.map((r) => ({
      id: r.id,
      senderName: r.sender_name,
      message: r.message,
      emailSent: Boolean(r.email_sent),
      sentAt: r.sent_at,
    }))
  );

  return mapRow(row, map);
}

export function updateContactMessageStatus(id: string, status: ContactMessageStatus): ContactMessageRecord | null {
  const now = new Date().toISOString();
  const info = db
    .prepare('UPDATE contact_messages SET status = ?, updated_at = ? WHERE id = ?')
    .run(status, now, id);
  if (info.changes === 0) return null;
  return getContactMessageById(id);
}

export function addContactMessageReply(
  messageId: string,
  senderName: string,
  replyMessage: string,
  emailSent: boolean
): ContactMessageRecord | null {
  const existing = getContactMessageById(messageId);
  if (!existing) return null;

  const now = new Date().toISOString();
  const replyId = `rep-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;

  const tx = db.transaction(() => {
    db.prepare(`
      INSERT INTO contact_replies (id, message_id, sender_name, message, email_sent, sent_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(replyId, messageId, senderName, replyMessage, emailSent ? 1 : 0, now);

    db.prepare(`
      UPDATE contact_messages SET status = 'Replied', updated_at = ? WHERE id = ?
    `).run(now, messageId);
  });

  tx();
  return getContactMessageById(messageId);
}

export function deleteContactMessage(id: string): boolean {
  const info = db.prepare('DELETE FROM contact_messages WHERE id = ?').run(id);
  return info.changes > 0;
}

export function getContactMessageStats(): { total: number; unread: number } {
  const row = db
    .prepare(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'New' THEN 1 ELSE 0 END) as unread
       FROM contact_messages`
    )
    .get() as { total: number; unread: number | null };

  return {
    total: Number(row?.total || 0),
    unread: Number(row?.unread || 0),
  };
}
