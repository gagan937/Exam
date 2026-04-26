// ─────────────────────────────────────────────────────────────────────────────
//  LuckyTech Academy — EmailJS Service
//  Credentials already configured — just works!
// ─────────────────────────────────────────────────────────────────────────────

import emailjs from "@emailjs/browser";

const SERVICE_ID  = "service_l5jjsi8";
const TEMPLATE_ID = "template_0vx5cid";
const PUBLIC_KEY  = "KfHV9a-xgjn3JCXsL";

/** Generates a random 6-digit OTP */
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Sends OTP email via EmailJS
 * Returns { success: true } or { success: false, error: "..." }
 */
export async function sendOTPEmail(toEmail, toName, otp) {
  try {
    const result = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_email: toEmail,
        to_name:  toName || "Student",
        otp:      otp,
      },
      PUBLIC_KEY
    );
    if (result.status === 200) return { success: true };
    return { success: false, error: "Failed to send OTP. Please try again." };
  } catch (err) {
    console.error("EmailJS sendOTP error:", err);
    return {
      success: false,
      error: "Could not send OTP. Check your Gmail address and try again.",
    };
  }
}

/**
 * Sends a welcome email after successful registration (non-blocking)
 */
export async function sendSuccessEmail(toEmail, toName) {
  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_email: toEmail,
        to_name:  toName,
        otp:      "🎉 Welcome to LuckyTech Academy! You have successfully registered. Login and start your exam now!",
      },
      PUBLIC_KEY
    );
  } catch (err) {
    console.error("Success email failed (non-critical):", err);
  }
}
