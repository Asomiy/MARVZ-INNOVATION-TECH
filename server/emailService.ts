import nodemailer from 'nodemailer';
import type { EmailDeliveryStatus } from './contactDb.js';

export interface ContactEmailPayload {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  collaboratorType: string;
  technologyDomain: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface EmailDispatchResult {
  configured: boolean;
  recipientConfigured: boolean;
  companyEmailStatus: EmailDeliveryStatus;
  visitorEmailStatus: EmailDeliveryStatus;
  error?: string;
}

function stripHeaderBreaks(val: string): string {
  return String(val || '').replace(/[\r\n]+/g, ' ').trim();
}

function escapeHtml(raw: string): string {
  return String(raw || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function resolveCompanyRecipientEmail(fallbackEmail?: string): string {
  const envRecipient =
    process.env.CONTACT_RECIPIENT_EMAIL ||
    process.env.MAIL_TO ||
    process.env.COMPANY_CONTACT_EMAIL ||
    '';
  return stripHeaderBreaks(envRecipient || fallbackEmail || '');
}

export function isSmtpConfigured(): boolean {
  const host = (process.env.SMTP_HOST || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  // Local test/relay SMTP may omit auth, whereas cloud/Gmail/cPanel SMTP requires host + user + pass
  const allowNoAuth = process.env.SMTP_ALLOW_UNAUTHENTICATED === 'true';
  if (!host) return false;
  if (allowNoAuth) return true;
  return Boolean(user && pass);
}

export function getSmtpStatus(fallbackRecipientEmail?: string) {
  const recipientEmail = resolveCompanyRecipientEmail(fallbackRecipientEmail);
  return {
    configured: isSmtpConfigured(),
    recipientConfigured: Boolean(recipientEmail),
    recipientEmail: recipientEmail || null,
    smtpHost: process.env.SMTP_HOST ? process.env.SMTP_HOST.trim() : null,
    smtpPort: Number(process.env.SMTP_PORT || 587),
  };
}

function createTransporter() {
  const host = (process.env.SMTP_HOST || '').trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const secureEnv = (process.env.SMTP_SECURE || '').toLowerCase();
  const secure = secureEnv ? secureEnv === 'true' : port === 465;
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();

  return nodemailer.createTransport({
    host,
    port,
    secure,
    ...(user && pass ? { auth: { user, pass } } : {}),
    tls: {
      rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false',
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

function buildCompanyNotificationHtml(payload: ContactEmailPayload): string {
  const submittedTime = new Date(payload.createdAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Contact Inquiry — MARVZ & INNOVATION TECH</title>
</head>
<body style="margin:0;padding:0;background-color:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#202124;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#F3F4F6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="620" cellspacing="0" cellpadding="0" style="max-width:620px;width:100%;background-color:#FFFFFF;border:1px solid #E5E7EB;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background-color:#202124;padding:24px 28px;border-bottom:4px solid #DC2626;">
              <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#D1D5DB;font-weight:700;">MARVZ &amp; INNOVATION TECH</div>
              <h1 style="margin:6px 0 0 0;font-size:20px;line-height:1.3;color:#FFFFFF;font-weight:800;">New Website Contact Inquiry</h1>
              <div style="margin-top:6px;font-size:12px;color:#9CA3AF;">Reference ID: ${escapeHtml(payload.id)} &bull; ${escapeHtml(submittedTime)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 18px 0;font-size:14px;line-height:1.6;color:#4B5563;">
                A visitor submitted a new inquiry through the official <strong>Start a Conversation</strong> form. You can reply directly to this email to respond to the visitor.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #E5E7EB;border-radius:12px;background-color:#FAFAFB;margin-bottom:20px;">
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #E5E7EB;width:36%;font-size:12px;font-weight:700;color:#6B7280;text-transform:uppercase;">Visitor Name</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #E5E7EB;font-size:14px;font-weight:600;color:#202124;">${escapeHtml(payload.fullName)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #E5E7EB;font-size:12px;font-weight:700;color:#6B7280;text-transform:uppercase;">Email Address</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #E5E7EB;font-size:14px;color:#DC2626;font-weight:600;"><a href="mailto:${escapeHtml(payload.email)}" style="color:#DC2626;text-decoration:none;">${escapeHtml(payload.email)}</a></td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #E5E7EB;font-size:12px;font-weight:700;color:#6B7280;text-transform:uppercase;">Phone / WhatsApp</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #E5E7EB;font-size:14px;color:#202124;">${escapeHtml(payload.phone || 'Not provided')}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #E5E7EB;font-size:12px;font-weight:700;color:#6B7280;text-transform:uppercase;">Reaching Out As</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #E5E7EB;font-size:14px;color:#202124;">${escapeHtml(payload.collaboratorType)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #E5E7EB;font-size:12px;font-weight:700;color:#6B7280;text-transform:uppercase;">Tech Domain</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #E5E7EB;font-size:14px;font-weight:600;color:#202124;">${escapeHtml(payload.technologyDomain)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:12px;font-weight:700;color:#6B7280;text-transform:uppercase;">Subject</td>
                  <td style="padding:12px 16px;font-size:14px;font-weight:600;color:#202124;">${escapeHtml(payload.subject)}</td>
                </tr>
              </table>

              <div style="font-size:12px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;">Complete Inquiry Message</div>
              <div style="padding:16px 18px;border-radius:12px;background-color:#FFFFFF;border:1px solid #E5E7EB;border-left:4px solid #DC2626;font-size:14px;line-height:1.65;color:#202124;white-space:pre-wrap;">${escapeHtml(payload.message)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px;background-color:#FAFAFB;border-top:1px solid #E5E7EB;font-size:11px;color:#6B7280;line-height:1.5;">
              This inquiry has also been archived in the <strong>MARVZ Admin Dashboard &rarr; Contact Messages / Inquiry Management</strong>.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildVisitorConfirmationHtml(payload: ContactEmailPayload, officialEmail: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thank You for Contacting MARVZ & INNOVATION TECH</title>
</head>
<body style="margin:0;padding:0;background-color:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#202124;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#F3F4F6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border:1px solid #E5E7EB;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background-color:#202124;padding:24px 28px;border-bottom:4px solid #DC2626;">
              <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#D1D5DB;font-weight:700;">MARVZ &amp; INNOVATION TECH</div>
              <h1 style="margin:6px 0 0 0;font-size:20px;line-height:1.3;color:#FFFFFF;font-weight:800;">We Have Received Your Message</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 14px 0;font-size:15px;line-height:1.6;color:#202124;">
                Dear <strong>${escapeHtml(payload.fullName)}</strong>,
              </p>
              <p style="margin:0 0 18px 0;font-size:14px;line-height:1.65;color:#4B5563;">
                Thank you for contacting <strong>MARVZ &amp; INNOVATION TECH</strong>! Your message has been submitted successfully. Our engineering and advisory team will review your inquiry and get back to you soon.
              </p>

              <div style="padding:16px 18px;border-radius:12px;background-color:#FAFAFB;border:1px solid #E5E7EB;margin-bottom:20px;">
                <div style="font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;">Submission Summary</div>
                <div style="font-size:13px;color:#202124;margin-bottom:4px;"><strong>Reference:</strong> ${escapeHtml(payload.id)}</div>
                <div style="font-size:13px;color:#202124;margin-bottom:4px;"><strong>Subject:</strong> ${escapeHtml(payload.subject)}</div>
                <div style="font-size:13px;color:#202124;margin-bottom:4px;"><strong>Domain:</strong> ${escapeHtml(payload.technologyDomain)}</div>
                <div style="font-size:13px;color:#202124;"><strong>Category:</strong> ${escapeHtml(payload.collaboratorType)}</div>
              </div>

              <p style="margin:0 0 8px 0;font-size:13px;line-height:1.6;color:#4B5563;">
                Need urgent assistance? Reach us directly:
              </p>
              <p style="margin:0;font-size:13px;line-height:1.7;color:#202124;">
                <strong>Email:</strong> <a href="mailto:${escapeHtml(officialEmail)}" style="color:#DC2626;text-decoration:none;">${escapeHtml(officialEmail)}</a><br/>
                <strong>Phone / WhatsApp:</strong> +8801775551987<br/>
                <strong>Offices:</strong> 92/A Banani DOHS, Dhaka-1213 &bull; Aysha Tower, West Shewrapara, Dhaka-1216
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px;background-color:#FAFAFB;border-top:1px solid #E5E7EB;font-size:11px;color:#6B7280;">
              &copy; ${new Date().getFullYear()} MARVZ &amp; INNOVATION TECH &bull; Think Beyond. Build Tomorrow.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendContactNotificationEmails(
  payload: ContactEmailPayload,
  fallbackRecipientEmail?: string
): Promise<EmailDispatchResult> {
  const recipientEmail = resolveCompanyRecipientEmail(fallbackRecipientEmail);
  if (!recipientEmail) {
    return {
      configured: isSmtpConfigured(),
      recipientConfigured: false,
      companyEmailStatus: 'not_configured',
      visitorEmailStatus: 'not_configured',
      error: 'Official recipient business email is not configured.',
    };
  }

  if (!isSmtpConfigured()) {
    return {
      configured: false,
      recipientConfigured: true,
      companyEmailStatus: 'not_configured',
      visitorEmailStatus: 'not_configured',
      error: 'SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) are not configured on the server.',
    };
  }

  const fromName = stripHeaderBreaks(process.env.SMTP_FROM_NAME || 'MARVZ & INNOVATION TECH');
  const fromEmail = stripHeaderBreaks(
    process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || recipientEmail
  );
  const safeVisitorName = stripHeaderBreaks(payload.fullName);
  const safeVisitorEmail = stripHeaderBreaks(payload.email);
  const safeSubject = stripHeaderBreaks(payload.subject);

  const transporter = createTransporter();

  let companyEmailStatus: EmailDeliveryStatus = 'pending';
  let visitorEmailStatus: EmailDeliveryStatus = 'pending';
  const errors: string[] = [];

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: recipientEmail,
      replyTo: `"${safeVisitorName}" <${safeVisitorEmail}>`,
      subject: `[MARVZ Contact Inquiry] ${safeSubject} — ${safeVisitorName}`,
      html: buildCompanyNotificationHtml(payload),
      text: [
        `New Contact Form Inquiry (${payload.id})`,
        `Full Name: ${payload.fullName}`,
        `Email: ${payload.email}`,
        `Phone / WhatsApp: ${payload.phone || 'Not provided'}`,
        `Category: ${payload.collaboratorType}`,
        `Technology Domain: ${payload.technologyDomain}`,
        `Subject: ${payload.subject}`,
        `Submitted At: ${payload.createdAt}`,
        '',
        'Message:',
        payload.message,
      ].join('\n'),
    });
    companyEmailStatus = 'sent';
  } catch (err: any) {
    companyEmailStatus = 'failed';
    errors.push(`Company notification failed: ${err?.message || String(err)}`);
  }

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: safeVisitorEmail,
      replyTo: recipientEmail,
      subject: 'Thank you for contacting MARVZ & INNOVATION TECH',
      html: buildVisitorConfirmationHtml(payload, recipientEmail),
      text: [
        `Dear ${payload.fullName},`,
        '',
        'Thank you for contacting MARVZ & INNOVATION TECH! Your message has been submitted successfully. Our team will get back to you soon.',
        '',
        `Reference: ${payload.id}`,
        `Subject: ${payload.subject}`,
        `Technology Domain: ${payload.technologyDomain}`,
        '',
        `Official Contact: ${recipientEmail} | +8801775551987`,
      ].join('\n'),
    });
    visitorEmailStatus = 'sent';
  } catch (err: any) {
    visitorEmailStatus = 'failed';
    errors.push(`Visitor confirmation failed: ${err?.message || String(err)}`);
  }

  return {
    configured: true,
    recipientConfigured: true,
    companyEmailStatus,
    visitorEmailStatus,
    error: errors.length ? errors.join(' | ') : undefined,
  };
}

export async function sendAdminReplyEmail(params: {
  visitorName: string;
  visitorEmail: string;
  originalSubject: string;
  replyBody: string;
  senderName: string;
  officialEmail: string;
}): Promise<{ sent: boolean; error?: string }> {
  if (!isSmtpConfigured()) {
    return { sent: false, error: 'SMTP not configured' };
  }

  const fromName = stripHeaderBreaks(process.env.SMTP_FROM_NAME || 'MARVZ & INNOVATION TECH');
  const fromEmail = stripHeaderBreaks(
    process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || params.officialEmail
  );
  const safeSubject = stripHeaderBreaks(params.originalSubject);

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: stripHeaderBreaks(params.visitorEmail),
      replyTo: stripHeaderBreaks(params.officialEmail),
      subject: `Re: ${safeSubject} — MARVZ & INNOVATION TECH`,
      html: `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:24px;background-color:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#202124;">
  <div style="max-width:600px;margin:0 auto;background:#FFFFFF;border:1px solid #E5E7EB;border-radius:16px;overflow:hidden;">
    <div style="background:#202124;padding:20px 24px;border-bottom:4px solid #DC2626;color:#FFFFFF;">
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#D1D5DB;font-weight:700;">MARVZ &amp; INNOVATION TECH</div>
      <div style="font-size:17px;font-weight:700;margin-top:4px;">Response to Your Inquiry</div>
    </div>
    <div style="padding:24px;font-size:14px;line-height:1.65;color:#202124;">
      <p style="margin-top:0;">Dear <strong>${escapeHtml(params.visitorName)}</strong>,</p>
      <div style="white-space:pre-wrap;padding:14px 16px;background:#FAFAFB;border:1px solid #E5E7EB;border-left:4px solid #DC2626;border-radius:10px;">${escapeHtml(params.replyBody)}</div>
      <p style="margin-bottom:0;margin-top:18px;font-size:13px;color:#4B5563;">
        Best regards,<br/>
        <strong>${escapeHtml(params.senderName)}</strong><br/>
        MARVZ &amp; INNOVATION TECH<br/>
        ${escapeHtml(params.officialEmail)} &bull; +8801775551987
      </p>
    </div>
  </div>
</body>
</html>`,
      text: `Dear ${params.visitorName},\n\n${params.replyBody}\n\nBest regards,\n${params.senderName}\nMARVZ & INNOVATION TECH\n${params.officialEmail} | +8801775551987`,
    });
    return { sent: true };
  } catch (err: any) {
    return { sent: false, error: err?.message || String(err) };
  }
}

export async function sendPasswordResetEmail(params: {
  email: string;
  name: string;
  resetUrl: string;
  verificationCode: string;
  expiresMinutes: number;
  officialSupportEmail?: string;
}): Promise<{ sent: boolean; configured: boolean; error?: string }> {
  if (!isSmtpConfigured()) {
    return {
      sent: false,
      configured: false,
      error:
        'SMTP mail server is not configured (SMTP_HOST, SMTP_USER, SMTP_PASS missing).',
    };
  }

  const fromName = stripHeaderBreaks(process.env.SMTP_FROM_NAME || 'MARVZ & INNOVATION TECH');
  const fromEmail = stripHeaderBreaks(
    process.env.SMTP_FROM_EMAIL ||
      process.env.SMTP_USER ||
      params.officialSupportEmail ||
      'marvzinnovationtech@gmail.com'
  );
  const supportEmail = stripHeaderBreaks(
    params.officialSupportEmail || 'marvzinnovationtech@gmail.com'
  );

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: stripHeaderBreaks(params.email),
      replyTo: supportEmail,
      subject: 'MARVZ Admin Panel — Password Reset Verification',
      html: `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:24px;background-color:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#202124;">
  <div style="max-width:580px;margin:0 auto;background:#FFFFFF;border:1px solid #E5E7EB;border-radius:16px;overflow:hidden;">
    <div style="background:#202124;padding:22px 26px;border-bottom:4px solid #DC2626;color:#FFFFFF;">
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#D1D5DB;font-weight:700;">MARVZ &amp; INNOVATION TECH</div>
      <h1 style="margin:6px 0 0 0;font-size:19px;font-weight:800;color:#FFFFFF;">Admin Password Reset Request</h1>
    </div>
    <div style="padding:26px;font-size:14px;line-height:1.65;color:#202124;">
      <p style="margin-top:0;">Hello <strong>${escapeHtml(params.name)}</strong>,</p>
      <p style="color:#4B5563;">
        We received a password reset request for your MARVZ Admin Panel account (<strong>${escapeHtml(params.email)}</strong>). This verification expires in <strong>${params.expiresMinutes} minutes</strong> and can only be used once.
      </p>

      <div style="margin:20px 0;padding:16px;background:#FAFAFB;border:1px solid #E5E7EB;border-radius:12px;text-align:center;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6B7280;margin-bottom:6px;">Verification Code</div>
        <div style="font-family:monospace;font-size:24px;font-weight:800;letter-spacing:4px;color:#202124;">${escapeHtml(params.verificationCode)}</div>
      </div>

      <p style="margin:20px 0;text-align:center;">
        <a href="${escapeHtml(params.resetUrl)}" style="display:inline-block;padding:12px 24px;background:#DC2626;color:#FFFFFF;font-weight:700;font-size:13px;text-decoration:none;border-radius:10px;">
          Reset Admin Password
        </a>
      </p>

      <p style="font-size:12px;color:#6B7280;margin-bottom:0;">
        If you did not request this password reset, you can safely ignore this email — your existing password remains unchanged.
      </p>
    </div>
  </div>
</body>
</html>`,
      text: [
        `MARVZ & INNOVATION TECH — Admin Password Reset`,
        '',
        `Hello ${params.name},`,
        `A password reset was requested for ${params.email}.`,
        `Verification Code: ${params.verificationCode}`,
        `Reset Link: ${params.resetUrl}`,
        `Expires in ${params.expiresMinutes} minutes.`,
        '',
        `If you did not request this, please ignore this message.`,
      ].join('\n'),
    });
    return { sent: true, configured: true };
  } catch (err: any) {
    return {
      sent: false,
      configured: true,
      error: err?.message || String(err),
    };
  }
}

