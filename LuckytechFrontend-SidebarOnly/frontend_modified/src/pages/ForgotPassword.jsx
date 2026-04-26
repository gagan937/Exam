import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { sendOTPEmail } from "../services/emailService";

// ─── Eye Icon ────────────────────────────────────────────────────────────────
function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="w-4 h-4">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="w-4 h-4">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

// ─── OTP Input ────────────────────────────────────────────────────────────────
function OTPInput({ value, onChange, disabled }) {
  const inputs = useRef([]);
  const handleChange = (e, i) => {
    const val = e.target.value.replace(/\D/, "");
    const arr = value.split("");
    arr[i] = val;
    onChange(arr.join("").slice(0, 6));
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };
  const handleKey = (e, i) => {
    if (e.key === "Backspace" && !e.target.value && i > 0) inputs.current[i - 1].focus();
  };
  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };
  return (
    <div className="flex gap-2 justify-center my-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <input key={i} ref={(el) => (inputs.current[i] = el)} type="text" inputMode="numeric"
          maxLength={1} disabled={disabled} value={value[i] || ""}
          onChange={(e) => handleChange(e, i)} onKeyDown={(e) => handleKey(e, i)} onPaste={handlePaste}
          className="w-11 h-12 text-center text-white text-lg font-bold bg-white/10 border-2 border-white/20 rounded-xl focus:outline-none focus:border-blue-400 transition disabled:opacity-50" />
      ))}
    </div>
  );
}

// ─── Countdown Timer ─────────────────────────────────────────────────────────
function CountdownTimer({ seconds, onExpire, resetKey }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  useEffect(() => { setTimeLeft(seconds); }, [resetKey]);
  useEffect(() => {
    if (timeLeft <= 0) { onExpire(); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  return <span className={`text-sm font-mono font-bold ${timeLeft <= 30 ? "text-red-400" : "text-blue-300"}`}>{mm}:{ss}</span>;
}

// ─── Validators ───────────────────────────────────────────────────────────────
const isValidEmail  = (v) => /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(v.trim());
const isValidMobile = (v) => /^[6-9]\d{9}$/.test(v.trim());

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep]         = useState(0); // 0=verify, 1=OTP, 2=new password, 3=success
  const [form, setForm]         = useState({ email: "", mobile: "" });
  const [touched, setTouched]   = useState({ email: false, mobile: false });

  const [otpValue,    setOtpValue]    = useState("");
  const [otpExpired,  setOtpExpired]  = useState(false);
  const [timerKey,    setTimerKey]    = useState(0);

  const [studentName,   setStudentName]   = useState("");
  const [studentEmail,  setStudentEmail]  = useState("");
  const [studentMobile, setStudentMobile] = useState("");
  const [verifiedOtp,   setVerifiedOtp]   = useState("");

  const [newPassword,      setNewPassword]      = useState("");
  const [confirmPassword,  setConfirmPassword]  = useState("");
  const [showNew,          setShowNew]          = useState(false);
  const [showConfirm,      setShowConfirm]      = useState(false);

  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  // ── Field errors (shown after blur) ───────────────────────────────────────
  const emailErr  = touched.email  && form.email.length  > 0 && !isValidEmail(form.email)
    ? "Please enter a valid email address." : "";
  const mobileErr = touched.mobile && form.mobile.length > 0 && !isValidMobile(form.mobile)
    ? "Enter a valid 10-digit Indian mobile number (starts with 6–9)." : "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Only digits for mobile
    if (name === "mobile" && !/^\d*$/.test(value)) return;
    setForm({ ...form, [name]: value });
  };

  const handleBlur = (field) => setTouched(t => ({ ...t, [field]: true }));

  // ── Step 0: Verify identity ────────────────────────────────────────────────
  const handleVerifyIdentity = async () => {
    setTouched({ email: true, mobile: true });
    setError("");

    if (!form.email || !form.mobile) { setError("Both email and mobile are required."); return; }
    if (!isValidEmail(form.email))   { setError("Please enter a valid email address."); return; }
    if (!isValidMobile(form.mobile)) { setError("Enter a valid 10-digit Indian mobile number (starts with 6–9)."); return; }

    setLoading(true);
    try {
      const res = await API.post("/auth/forgot-password", { email: form.email, mobile: form.mobile });
      const serverOTP = res.data.otp;
      setStudentName(res.data.name);
      setStudentEmail(form.email);
      setStudentMobile(form.mobile);

      const emailResult = await sendOTPEmail(form.email, res.data.name, serverOTP);
      if (!emailResult.success) { setError(emailResult.error); setLoading(false); return; }

      setOtpExpired(false);
      setOtpValue("");
      setTimerKey(k => k + 1);
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.message || "Account not found. Check email and mobile.");
    }
    setLoading(false);
  };

  // ── Step 1: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOTP = () => {
    setError("");
    if (otpExpired)          { setError("OTP expired. Click Resend."); return; }
    if (otpValue.length < 6) { setError("Enter complete 6-digit OTP."); return; }
    setVerifiedOtp(otpValue);
    setStep(2);
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const res = await API.post("/auth/forgot-password", { email: studentEmail, mobile: studentMobile });
      const emailResult = await sendOTPEmail(studentEmail, studentName, res.data.otp);
      if (!emailResult.success) { setError(emailResult.error); setLoading(false); return; }
      setOtpValue(""); setOtpExpired(false); setTimerKey(k => k + 1); setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    }
    setLoading(false);
  };

  // ── Step 2: Reset password ────────────────────────────────────────────────
  const handleResetPassword = async () => {
    setError("");
    if (!newPassword || !confirmPassword) { setError("Both fields are required."); return; }
    if (newPassword.length < 6)           { setError("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword)  { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await API.post("/auth/reset-password", {
        email: studentEmail, mobile: studentMobile, newPassword, otp: verifiedOtp,
      });
      setStep(3);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Please start over.");
      if (err.response?.status === 400) setStep(1);
    }
    setLoading(false);
  };

  // ── Shared input base class ───────────────────────────────────────────────
  const inputBase = (hasErr) =>
    `w-full bg-white/10 border ${hasErr
      ? "border-red-400/70 focus:border-red-400 focus:ring-red-400/30"
      : "border-white/20 focus:border-blue-400 focus:ring-blue-400"
    } text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition`;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 mb-4 shadow-2xl shadow-orange-600/40">
            <span className="text-4xl">🔑</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Reset Password</h1>
          <p className="text-orange-300 mt-1 text-sm">LuckyTech Academy</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-1 mb-6">
            {["Verify", "OTP", "New Password", "Done"].map((label, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className={`px-2 py-0.5 rounded-full text-xs font-semibold
                  ${i < step  ? "bg-green-500/30 text-green-300 border border-green-500/40" : ""}
                  ${i === step ? "bg-blue-500/30 text-blue-200 border border-blue-400/50" : ""}
                  ${i > step  ? "bg-white/5 text-white/30 border border-white/10" : ""}
                `}>{i < step ? "✓" : `${i + 1}`}. {label}</div>
                {i < 3 && <div className={`w-4 h-px ${i < step ? "bg-green-500/50" : "bg-white/10"}`} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {/* ══ Step 3: Success ══════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="text-center py-6">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-white mb-2">Password Reset!</h2>
              <p className="text-blue-300 text-sm">You can now login with your new password.</p>
              <p className="text-white/40 text-xs mt-4 animate-pulse">Redirecting to login...</p>
            </div>
          )}

          {/* ══ Step 2: New Password ════════════════════════════════════════ */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Set New Password</h2>
              <div className="space-y-4">

                {/* New Password */}
                <div>
                  <label className="block text-sm text-blue-200 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                    />
                    <button type="button" onClick={() => setShowNew(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-blue-300 transition" tabIndex={-1}>
                      <EyeIcon open={showNew} />
                    </button>
                  </div>
                  {/* Strength bar */}
                  {newPassword.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex gap-1 flex-1">
                        {[1,2,3,4].map(lvl => {
                          const s = newPassword.length >= 12 ? 4 : newPassword.length >= 9 ? 3 : newPassword.length >= 6 ? 2 : 1;
                          return <div key={lvl} className={`h-1 flex-1 rounded-full transition-all ${lvl <= s ? s===1?"bg-red-400":s===2?"bg-amber-400":s===3?"bg-blue-400":"bg-green-400":"bg-white/10"}`} />;
                        })}
                      </div>
                      <span className="text-xs text-white/40">
                        {newPassword.length >= 12?"Strong":newPassword.length >= 9?"Good":newPassword.length >= 6?"Fair":"Weak"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm text-blue-200 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-blue-300 transition" tabIndex={-1}>
                      <EyeIcon open={showConfirm} />
                    </button>
                  </div>
                  {confirmPassword.length > 0 && confirmPassword === newPassword && (
                    <p className="text-green-400 text-xs mt-1">✓ Passwords match</p>
                  )}
                  {confirmPassword.length > 0 && confirmPassword !== newPassword && (
                    <p className="text-red-400 text-xs mt-1">⚠ Passwords do not match</p>
                  )}
                </div>

                <button onClick={handleResetPassword} disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
                  {loading ? <><span className="animate-spin">⏳</span> Resetting...</> : "🔐 Reset Password"}
                </button>
              </div>
            </div>
          )}

          {/* ══ Step 1: OTP ══════════════════════════════════════════════════ */}
          {step === 1 && (
            <div>
              <div className="text-center mb-4">
                <div className="text-3xl mb-2">📧</div>
                <h2 className="text-lg font-semibold text-white mb-1">Check your inbox</h2>
                <p className="text-blue-300 text-sm">OTP sent to <span className="text-white font-bold">{studentEmail}</span></p>
              </div>
              <OTPInput value={otpValue} onChange={setOtpValue} disabled={loading} />
              <div className="flex items-center justify-between text-sm mt-2 mb-5 px-1">
                <span className="text-white/40 text-xs">Expires in:</span>
                {!otpExpired
                  ? <CountdownTimer seconds={300} onExpire={() => setOtpExpired(true)} resetKey={timerKey} />
                  : <span className="text-red-400 text-xs font-bold">⏰ Expired</span>
                }
              </div>
              <button onClick={handleVerifyOTP} disabled={loading || otpValue.length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
                {loading ? <><span className="animate-spin">⏳</span> Verifying...</> : "✅ Verify OTP"}
              </button>
              <div className="flex items-center justify-between mt-4">
                <button onClick={() => { setStep(0); setError(""); }} className="text-white/40 hover:text-white/70 text-sm transition">← Back</button>
                <button onClick={handleResend} disabled={loading} className="text-blue-400 hover:text-blue-300 disabled:opacity-40 text-sm transition">🔄 Resend OTP</button>
              </div>
            </div>
          )}

          {/* ══ Step 0: Verify Identity ═══════════════════════════════════════ */}
          {step === 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Verify your identity</h2>
              <p className="text-white/50 text-sm mb-5">Enter the email and mobile linked to your account.</p>

              <div className="space-y-4">

                {/* Email */}
                <div>
                  <label className="block text-sm text-blue-200 mb-1">Email Address</label>
                  <div className="relative">
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur("email")}
                      placeholder="yourname@gmail.com"
                      className={`${inputBase(!!emailErr)} pr-10`}
                    />
                    {isValidEmail(form.email) && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-base font-bold">✓</span>
                    )}
                  </div>
                  {emailErr && <p className="text-red-400 text-xs mt-1">⚠ {emailErr}</p>}
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-sm text-blue-200 mb-1">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm font-mono">+91</span>
                    <input
                      name="mobile"
                      value={form.mobile}
                      onChange={handleChange}
                      onBlur={() => handleBlur("mobile")}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      inputMode="numeric"
                      className={`${inputBase(!!mobileErr)} pl-12`}
                    />
                    {isValidMobile(form.mobile) && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-base font-bold">✓</span>
                    )}
                  </div>
                  {mobileErr && <p className="text-red-400 text-xs mt-1">⚠ {mobileErr}</p>}
                  {!mobileErr && form.mobile.length > 0 && form.mobile.length < 10 && (
                    <p className="text-white/30 text-xs mt-1">{10 - form.mobile.length} more digits needed</p>
                  )}
                </div>

                <button onClick={handleVerifyIdentity} disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
                  {loading ? <><span className="animate-spin">⏳</span> Verifying...</> : "Send OTP →"}
                </button>
              </div>

              <p className="text-center text-sm text-white/50 mt-6">
                Remembered password?{" "}
                <button onClick={() => navigate("/login")} className="text-blue-400 hover:text-blue-300 font-medium transition">Sign In</button>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}