import nodemailer from "nodemailer";

let transporterPromise;

async function getTransporter() {
  if (transporterPromise) return transporterPromise;

  const hasCreds = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  const isProd = process.env.NODE_ENV === "production";

  if (hasCreds) {
    // Prefer explicit SMTP configuration for Gmail
    const host = process.env.EMAIL_HOST || "smtp.gmail.com";
    const port = Number(process.env.EMAIL_PORT || 587);
    const secure = port === 465; // true for 465, false for 587
    transporterPromise = Promise.resolve(
      nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      })
    );
  } else if (!isProd) {
    // Dev fallback: use Ethereal if no credentials are provided
    const testAccount = await nodemailer.createTestAccount();
    transporterPromise = Promise.resolve(
      nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      })
    );
    console.warn(
      "EMAIL_USER/EMAIL_PASS not set. Using Ethereal test account for emails."
    );
  } else {
    throw new Error(
      "Email credentials missing in production. Please set EMAIL_USER and EMAIL_PASS."
    );
  }

  return transporterPromise;
}

export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = await getTransporter();
    // Simple branded wrapper
    const wrappedHtml = `
      <div style="font-family:Arial,Helvetica,sans-serif;background:#f8fafc;padding:24px;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
          <div style="background:#111827;color:#f9fafb;padding:16px 20px;font-size:18px;font-weight:600;">${process.env.APP_NAME || "RentDirect"}</div>
          <div style="padding:20px;color:#111827;line-height:1.6;">${html}</div>
          <div style="padding:14px 20px;color:#6b7280;font-size:12px;background:#f9fafb;border-top:1px solid #e5e7eb;">This email was sent by ${process.env.APP_NAME || "RentDirect"}. If you did not initiate this request, you can ignore this message.</div>
        </div>
      </div>`;

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || "no-reply@example.com",
      to,
      subject,
      html: wrappedHtml,
    });
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) {
      console.log("Preview email URL:", preview);
    }
    console.log("Email sent to:", to);
    return info;
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
};
