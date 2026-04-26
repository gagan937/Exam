// import { useState, useRef, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { sendOTPEmail, sendSuccessEmail } from "../services/emailService";
// import API from "../api";

// // ─── 6-Box OTP Input ──────────────────────────────────────────────────────────
// function OTPInput({ value, onChange, disabled }) {
//   const inputs = useRef([]);

//   const handleKey = (e, i) => {
//     if (e.key === "Backspace" && !e.target.value && i > 0) {
//       inputs.current[i - 1].focus();
//     }
//   };

//   const handleChange = (e, i) => {
//     const val = e.target.value.replace(/\D/, "");
//     const arr = value.split("");
//     arr[i] = val;
//     onChange(arr.join("").slice(0, 6));
//     if (val && i < 5) inputs.current[i + 1]?.focus();
//   };

//   const handlePaste = (e) => {
//     const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
//     onChange(pasted);
//     inputs.current[Math.min(pasted.length, 5)]?.focus();
//     e.preventDefault();
//   };

//   return (
//     <div className="flex gap-2 justify-center my-4">
//       {Array.from({ length: 6 }).map((_, i) => (
//         <input
//           key={i}
//           ref={(el) => (inputs.current[i] = el)}
//           type="text"
//           inputMode="numeric"
//           maxLength={1}
//           disabled={disabled}
//           value={value[i] || ""}
//           onChange={(e) => handleChange(e, i)}
//           onKeyDown={(e) => handleKey(e, i)}
//           onPaste={handlePaste}
//           className="w-11 h-12 text-center text-white text-lg font-bold bg-white/10 border-2 border-white/20 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition disabled:opacity-50"
//         />
//       ))}
//     </div>
//   );
// }

// // ─── Countdown Timer ──────────────────────────────────────────────────────────
// function CountdownTimer({ seconds, onExpire, resetKey }) {
//   const [timeLeft, setTimeLeft] = useState(seconds);

//   useEffect(() => { setTimeLeft(seconds); }, [resetKey]);

//   useEffect(() => {
//     if (timeLeft <= 0) { onExpire(); return; }
//     const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
//     return () => clearTimeout(t);
//   }, [timeLeft]);

//   const color = timeLeft <= 30 ? "text-red-400" : "text-blue-300";
//   const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
//   const ss = String(timeLeft % 60).padStart(2, "0");
//   return <span className={`text-sm font-mono font-bold ${color}`}>{mm}:{ss}</span>;
// }

// // ─── Step Indicator ───────────────────────────────────────────────────────────
// function StepBadge({ step }) {
//   const steps = ["Details", "Verify OTP", "Done"];
//   return (
//     <div className="flex items-center justify-center gap-2 mb-6">
//       {steps.map((label, i) => (
//         <div key={i} className="flex items-center gap-2">
//           <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all
//             ${i < step  ? "bg-green-500/30 text-green-300 border border-green-500/40" : ""}
//             ${i === step ? "bg-blue-500/30 text-blue-200 border border-blue-400/50" : ""}
//             ${i > step  ? "bg-white/5 text-white/30 border border-white/10" : ""}
//           `}>
//             {i < step ? "✓" : `${i + 1}`}. {label}
//           </div>
//           {i < steps.length - 1 && (
//             <div className={`w-6 h-px ${i < step ? "bg-green-500/50" : "bg-white/10"}`} />
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }

// // ─── Main Register Component ──────────────────────────────────────────────────
// export default function Register() {
//   const navigate = useNavigate();
//   const { register } = useAuth();

//   const [step, setStep]   = useState(0);   // 0=form  1=OTP  2=success
//   const [form, setForm]   = useState({ name: "", email: "", mobile: "", education: "", password: "" });
//   const [error, setError] = useState("");
//   const [alreadyRegistered, setAlreadyRegistered] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const [otpValue,    setOtpValue]    = useState("");
//   const [otpExpired,  setOtpExpired]  = useState(false);
//   const [timerKey,    setTimerKey]    = useState(0);
//   const [resendCount, setResendCount] = useState(0);

//   const handleChange = (e) => {
//     setAlreadyRegistered(false); // clear warning when user edits fields
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   // ── STEP 0: Check registration → Get OTP from server → Send via EmailJS ──
//   const handleSendOTP = async () => {
//     setError("");
//     setAlreadyRegistered(false);
//     if (!form.name || !form.email || !form.mobile || !form.education || !form.password) {
//       setError("All fields are required."); return;
//     }
//     if (!/^\d{10}$/.test(form.mobile)) {
//       setError("Mobile number must be exactly 10 digits."); return;
//     }
//     if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(form.email)) {
//       setError("Only Gmail addresses are accepted (e.g. yourname@gmail.com)"); return;
//     }
//     if (form.password.length < 6) {
//       setError("Password must be at least 6 characters."); return;
//     }

//     setLoading(true);
//     try {
//       // ── Step 1: Check if already registered (no OTP wasted) ──────────────
//       const checkRes = await API.post("/auth/check-registration", {
//         email: form.email,
//         mobile: form.mobile,
//       });
//       if (checkRes.data.alreadyRegistered) {
//         setAlreadyRegistered(true);
//         setLoading(false);
//         return;
//       }

//       // ── Step 2: Request OTP from server (generated server-side) ──────────
//       const otpRes = await API.post("/auth/request-otp", {
//         email: form.email,
//         mobile: form.mobile,
//         purpose: "register",
//       });

//       if (!otpRes.data.success) {
//         if (otpRes.data.alreadyRegistered) {
//           setAlreadyRegistered(true);
//         } else {
//           setError(otpRes.data.message || "Failed to generate OTP.");
//         }
//         setLoading(false);
//         return;
//       }

//       const serverOTP = otpRes.data.otp;

//       // ── Step 3: Send OTP to user's Gmail via EmailJS ──────────────────────
//       const emailResult = await sendOTPEmail(form.email, form.name, serverOTP);
//       if (!emailResult.success) {
//         setError(emailResult.error);
//         setLoading(false);
//         return;
//       }

//       setOtpValue("");
//       setOtpExpired(false);
//       setTimerKey((k) => k + 1);
//       setStep(1);
//     } catch (err) {
//       if (err.response?.data?.alreadyRegistered) {
//         setAlreadyRegistered(true);
//       } else {
//         setError(err.response?.data?.message || "Server error. Please try again.");
//       }
//     }
//     setLoading(false);
//   };

//   // ── Resend OTP (requests fresh OTP from server) ───────────────────────────
//   const handleResend = async () => {
//     if (resendCount >= 3) {
//       setError("Maximum resend attempts reached. Please go back and restart."); return;
//     }
//     setLoading(true);
//     try {
//       const otpRes = await API.post("/auth/request-otp", {
//         email: form.email,
//         mobile: form.mobile,
//         purpose: "register",
//       });

//       if (!otpRes.data.success) {
//         if (otpRes.data.alreadyRegistered) {
//           setAlreadyRegistered(true);
//           setStep(0);
//         } else {
//           setError(otpRes.data.message || "Failed to generate OTP.");
//         }
//         setLoading(false);
//         return;
//       }

//       const emailResult = await sendOTPEmail(form.email, form.name, otpRes.data.otp);
//       if (!emailResult.success) { setError(emailResult.error); setLoading(false); return; }

//       setOtpValue("");
//       setOtpExpired(false);
//       setTimerKey((k) => k + 1);
//       setResendCount((c) => c + 1);
//       setError("");
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to resend OTP.");
//     }
//     setLoading(false);
//   };

//   // ── STEP 1: Submit OTP for backend validation → Register ──────────────────
//   const handleVerifyOTP = async () => {
//     setError("");
//     if (otpExpired) { setError("OTP has expired. Please click Resend OTP."); return; }
//     if (otpValue.length < 6) { setError("Please enter the complete 6-digit OTP."); return; }

//     // Send otp to backend — server validates it
//     setLoading(true);
//     const result = await register({ ...form, otp: otpValue });
//     setLoading(false);

//     if (!result.success) {
//       if (result.alreadyRegistered) {
//         setAlreadyRegistered(true);
//         setStep(0);
//       } else {
//         setError(result.error);
//       }
//       return;
//     }

//     // Send welcome email (non-blocking)
//     sendSuccessEmail(form.email, form.name);
//     setStep(2);
//     setTimeout(() => navigate("/login"), 3000);
//   };

//   // ─────────────────────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-8">
//       <div className="w-full max-w-md">

//         {/* Logo */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 shadow-2xl shadow-blue-600/40">
//             <span className="text-4xl">🎓</span>
//           </div>
//           <h1 className="text-3xl font-bold text-white tracking-tight">LuckyTech Academy</h1>
//           <p className="text-blue-300 mt-1 text-sm">Online Exam Portal</p>
//         </div>

//         <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
//           <StepBadge step={step} />

//           {/* ══ STEP 2: Success ════════════════════════════════════════════ */}
//           {step === 2 && (
//             <div className="text-center py-6">
//               <div className="text-6xl mb-4">🎉</div>
//               <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
//               <p className="text-blue-300 text-sm mb-1">A welcome email has been sent to</p>
//               <p className="text-white font-semibold">{form.email}</p>
//               <div className="mt-6 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
//                 <p className="text-green-300 text-sm">✅ Your account has been created successfully</p>
//               </div>
//               <p className="text-white/40 text-xs mt-4 animate-pulse">Redirecting to login...</p>
//             </div>
//           )}

//           {/* ══ STEP 1: OTP Verification ════════════════════════════════════ */}
//           {step === 1 && (
//             <div>
//               <div className="text-center mb-4">
//                 <div className="text-3xl mb-2">📧</div>
//                 <h2 className="text-xl font-semibold text-white mb-1">Check your Gmail</h2>
//                 <p className="text-blue-300 text-sm">
//                   We sent a 6-digit OTP to
//                 </p>
//                 <p className="text-white font-bold text-sm mt-0.5">{form.email}</p>
//               </div>

//               {error && (
//                 <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-sm px-4 py-3 rounded-xl mb-4">
//                   {error}
//                 </div>
//               )}

//               <p className="text-white/50 text-xs text-center mb-1">Enter the 6-digit OTP below</p>
//               <OTPInput value={otpValue} onChange={setOtpValue} disabled={loading} />

//               <div className="flex items-center justify-between text-sm mt-2 mb-5 px-1">
//                 <span className="text-white/40 text-xs">Expires in:</span>
//                 {!otpExpired
//                   ? <CountdownTimer seconds={300} onExpire={() => setOtpExpired(true)} resetKey={timerKey} />
//                   : <span className="text-red-400 text-xs font-bold">⏰ Expired</span>
//                 }
//               </div>

//               <button
//                 onClick={handleVerifyOTP}
//                 disabled={loading || otpValue.length !== 6}
//                 className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
//               >
//                 {loading
//                   ? <><span className="animate-spin">⏳</span> Verifying...</>
//                   : "✅ Verify OTP & Register"
//                 }
//               </button>

//               <div className="flex items-center justify-between mt-4">
//                 <button
//                   onClick={() => { setStep(0); setError(""); setOtpValue(""); }}
//                   className="text-white/40 hover:text-white/70 text-sm transition"
//                 >
//                   ← Edit Details
//                 </button>
//                 <button
//                   onClick={handleResend}
//                   disabled={loading || resendCount >= 3}
//                   className="text-blue-400 hover:text-blue-300 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition"
//                 >
//                   {resendCount >= 3 ? "Max resends reached" : `🔄 Resend OTP${resendCount > 0 ? ` (${3 - resendCount} left)` : ""}`}
//                 </button>
//               </div>

//               <p className="text-white/20 text-xs text-center mt-4">
//                 💡 Check your spam/junk folder if you don't see the email
//               </p>
//             </div>
//           )}

//           {/* ══ STEP 0: Registration Form ══════════════════════════════════ */}
//           {step === 0 && (
//             <div>
//               <h2 className="text-xl font-semibold text-white mb-6">Create your account</h2>

//               {/* ── Already Registered Warning ─────────────────────────────── */}
//               {alreadyRegistered && (
//                 <div className="bg-amber-500/15 border border-amber-500/40 rounded-xl px-4 py-4 mb-4">
//                   <div className="flex items-start gap-3">
//                     <span className="text-2xl mt-0.5">⚠️</span>
//                     <div>
//                       <p className="text-amber-300 font-semibold text-sm">Already Registered!</p>
//                       <p className="text-amber-200/80 text-xs mt-1">
//                         This email or mobile number is already linked to an account. No OTP was sent.
//                       </p>
//                       <button
//                         onClick={() => navigate("/login")}
//                         className="mt-3 inline-flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
//                       >
//                         → Sign In to your account
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {error && !alreadyRegistered && (
//                 <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-sm px-4 py-3 rounded-xl mb-4">
//                   {error}
//                 </div>
//               )}

//               <div className="space-y-4">
//                 {/* Full Name */}
//                 <div>
//                   <label className="block text-sm text-blue-200 mb-1">Full Name</label>
//                   <input name="name" value={form.name} onChange={handleChange}
//                     placeholder="Enter your full name"
//                     className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition" />
//                 </div>

//                 {/* Gmail */}
//                 <div>
//                   <label className="block text-sm text-blue-200 mb-1">Gmail Address</label>
//                   <div className="relative">
//                     <input name="email" type="email" value={form.email} onChange={handleChange}
//                       placeholder="yourname@gmail.com"
//                       className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition pr-10" />
//                     {/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(form.email) && (
//                       <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-lg">✓</span>
//                     )}
//                   </div>
//                   <p className="text-white/30 text-xs mt-1">OTP will be sent to this Gmail ✉️</p>
//                 </div>

//                 {/* Mobile */}
//                 <div>
//                   <label className="block text-sm text-blue-200 mb-1">Mobile Number</label>
//                   <input name="mobile" value={form.mobile} onChange={handleChange}
//                     placeholder="10-digit mobile number" maxLength={10}
//                     className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition" />
//                 </div>

//                 {/* Education */}
//                 <div>
//                   <label className="block text-sm text-blue-200 mb-1">Education Level</label>
//                   <select name="education" value={form.education} onChange={handleChange}
//                     className="w-full bg-slate-800 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition">
//                     <option value="">Select education level</option>
//                     <option value="10th">10th Standard (Easy)</option>
//                     <option value="12th">12th Standard (Medium)</option>
//                     <option value="Graduation">Graduation (Hard)</option>
//                   </select>
//                 </div>

//                 {/* Password */}
//                 <div>
//                   <label className="block text-sm text-blue-200 mb-1">Password</label>
//                   <input name="password" type="password" value={form.password} onChange={handleChange}
//                     placeholder="Minimum 6 characters"
//                     className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition" />
//                 </div>

//                 {/* Send OTP Button */}
//                 <button onClick={handleSendOTP} disabled={loading}
//                   className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 mt-2 flex items-center justify-center gap-2">
//                   {loading
//                     ? <><span className="animate-spin">⏳</span> Checking & Sending OTP...</>
//                     : "📧 Send OTP to Gmail →"
//                   }
//                 </button>
//               </div>

//               <p className="text-center text-sm text-white/50 mt-6">
//                 Already have an account?{" "}
//                 <button onClick={() => navigate("/login")}
//                   className="text-blue-400 hover:text-blue-300 font-medium transition">
//                   Sign In
//                 </button>
//               </p>
//             </div>
//           )}
//         </div>

//         <p className="text-center text-xs text-white/20 mt-4">LuckyTech Academy © 2024</p>
//       </div>
//     </div>
//   );
// }



import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { sendOTPEmail, sendSuccessEmail } from "../services/emailService";
import API from "../api";

// ─── 6-Box OTP Input ──────────────────────────────────────────────────────────
function OTPInput({ value, onChange, disabled }) {
  const inputs = useRef([]);

  const handleKey = (e, i) => {
    if (e.key === "Backspace" && !e.target.value && i > 0) {
      inputs.current[i - 1].focus();
    }
  };

  const handleChange = (e, i) => {
    const val = e.target.value.replace(/\D/, "");
    const arr = value.split("");
    arr[i] = val;
    onChange(arr.join("").slice(0, 6));
    if (val && i < 5) inputs.current[i + 1]?.focus();
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
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={value[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKey(e, i)}
          onPaste={handlePaste}
          className="w-11 h-12 text-center text-white text-lg font-bold bg-white/10 border-2 border-white/20 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition disabled:opacity-50"
        />
      ))}
    </div>
  );
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────
function CountdownTimer({ seconds, onExpire, resetKey }) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => { setTimeLeft(seconds); }, [resetKey]);

  useEffect(() => {
    if (timeLeft <= 0) { onExpire(); return; }
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const color = timeLeft <= 30 ? "text-red-400" : "text-blue-300";
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  return <span className={`text-sm font-mono font-bold ${color}`}>{mm}:{ss}</span>;
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepBadge({ step }) {
  const steps = ["Details", "Verify OTP", "Done"];
  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all
            ${i < step  ? "bg-green-500/30 text-green-300 border border-green-500/40" : ""}
            ${i === step ? "bg-blue-500/30 text-blue-200 border border-blue-400/50" : ""}
            ${i > step  ? "bg-white/5 text-white/30 border border-white/10" : ""}
          `}>
            {i < step ? "✓" : `${i + 1}`}. {label}
          </div>
          {i < steps.length - 1 && (
            <div className={`w-6 h-px ${i < step ? "bg-green-500/50" : "bg-white/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Eye Icon (show/hide password) ───────────────────────────────────────────
function EyeIcon({ open }) {
  return open ? (
    // Eye open
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="w-4 h-4">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    // Eye closed
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="w-4 h-4">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert any string to Title Case (e.g. "john doe" → "John Doe") */
const toTitleCase = (str) =>
  str.replace(/\b\w/g, (c) => c.toUpperCase());

/** Validate any standard email (not just Gmail) */
const isValidEmail = (email) =>
  /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email.trim());

/** Validate Indian mobile: starts with 6-9, exactly 10 digits */
const isValidMobile = (mobile) =>
  /^[6-9]\d{9}$/.test(mobile.trim());

// ─── Main Register Component ──────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep]   = useState(0);   // 0=form  1=OTP  2=success
  const [form, setForm]   = useState({
    name: "", email: "", mobile: "", education: "", password: "", confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password visibility toggles
  const [showPassword, setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otpValue,    setOtpValue]    = useState("");
  const [otpExpired,  setOtpExpired]  = useState(false);
  const [timerKey,    setTimerKey]    = useState(0);
  const [resendCount, setResendCount] = useState(0);

  // ── Field-level validation errors ──────────────────────────────────────────
  const [fieldErrors, setFieldErrors] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return value.trim().length < 2 ? "Name must be at least 2 characters." : "";
      case "email":
        return !isValidEmail(value) ? "Please enter a valid email address." : "";
      case "mobile":
        if (!/^\d{0,10}$/.test(value)) return "Only digits allowed.";
        if (value.length === 10 && !isValidMobile(value))
          return "Enter a valid 10-digit Indian mobile number (starts with 6-9).";
        if (value.length > 0 && value.length < 10)
          return "Mobile number must be exactly 10 digits.";
        return "";
      case "password":
        return value.length > 0 && value.length < 6
          ? "Password must be at least 6 characters." : "";
      case "confirmPassword":
        return value.length > 0 && value !== form.password
          ? "Passwords do not match." : "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAlreadyRegistered(false);

    // Auto Title Case for name field
    const finalValue = name === "name" ? toTitleCase(value) : value;

    // Block non-digit input for mobile
    if (name === "mobile" && !/^\d*$/.test(value)) return;

    setForm((prev) => ({ ...prev, [name]: finalValue }));

    // Validate on change (only if field has been touched)
    const err = validateField(name, finalValue);
    setFieldErrors((prev) => ({ ...prev, [name]: err }));

    // Re-validate confirmPassword when password changes
    if (name === "password") {
      const cpErr = form.confirmPassword.length > 0 && form.confirmPassword !== finalValue
        ? "Passwords do not match." : "";
      setFieldErrors((prev) => ({ ...prev, confirmPassword: cpErr }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const err = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
  };

  // ── Full form validation before sending OTP ────────────────────────────────
  const validateAll = () => {
    const errors = {};
    if (!form.name.trim())         errors.name    = "Full name is required.";
    else if (form.name.trim().length < 2) errors.name = "Name must be at least 2 characters.";

    if (!form.email.trim())        errors.email   = "Email address is required.";
    else if (!isValidEmail(form.email)) errors.email = "Please enter a valid email address.";

    if (!form.mobile.trim())       errors.mobile  = "Mobile number is required.";
    else if (!isValidMobile(form.mobile)) errors.mobile = "Enter a valid 10-digit Indian mobile number (starts with 6-9).";

    if (!form.education)           errors.education = "Please select your education level.";

    if (!form.password)            errors.password = "Password is required.";
    else if (form.password.length < 6) errors.password = "Password must be at least 6 characters.";

    if (!form.confirmPassword)     errors.confirmPassword = "Please confirm your password.";
    else if (form.confirmPassword !== form.password) errors.confirmPassword = "Passwords do not match.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── STEP 0: Check registration → Get OTP from server → Send via EmailJS ──
  const handleSendOTP = async () => {
    setError("");
    setAlreadyRegistered(false);
    if (!validateAll()) return;

    setLoading(true);
    try {
      const checkRes = await API.post("/auth/check-registration", {
        email: form.email,
        mobile: form.mobile,
      });
      if (checkRes.data.alreadyRegistered) {
        setAlreadyRegistered(true);
        setLoading(false);
        return;
      }

      const otpRes = await API.post("/auth/request-otp", {
        email: form.email,
        mobile: form.mobile,
        purpose: "register",
      });

      if (!otpRes.data.success) {
        if (otpRes.data.alreadyRegistered) {
          setAlreadyRegistered(true);
        } else {
          setError(otpRes.data.message || "Failed to generate OTP.");
        }
        setLoading(false);
        return;
      }

      const serverOTP = otpRes.data.otp;

      const emailResult = await sendOTPEmail(form.email, form.name, serverOTP);
      if (!emailResult.success) {
        setError(emailResult.error);
        setLoading(false);
        return;
      }

      setOtpValue("");
      setOtpExpired(false);
      setTimerKey((k) => k + 1);
      setStep(1);
    } catch (err) {
      if (err.response?.data?.alreadyRegistered) {
        setAlreadyRegistered(true);
      } else {
        setError(err.response?.data?.message || "Server error. Please try again.");
      }
    }
    setLoading(false);
  };

  // ── Resend OTP ─────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCount >= 3) {
      setError("Maximum resend attempts reached. Please go back and restart."); return;
    }
    setLoading(true);
    try {
      const otpRes = await API.post("/auth/request-otp", {
        email: form.email,
        mobile: form.mobile,
        purpose: "register",
      });

      if (!otpRes.data.success) {
        if (otpRes.data.alreadyRegistered) {
          setAlreadyRegistered(true);
          setStep(0);
        } else {
          setError(otpRes.data.message || "Failed to generate OTP.");
        }
        setLoading(false);
        return;
      }

      const emailResult = await sendOTPEmail(form.email, form.name, otpRes.data.otp);
      if (!emailResult.success) { setError(emailResult.error); setLoading(false); return; }

      setOtpValue("");
      setOtpExpired(false);
      setTimerKey((k) => k + 1);
      setResendCount((c) => c + 1);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    }
    setLoading(false);
  };

  // ── STEP 1: Verify OTP → Register ─────────────────────────────────────────
  const handleVerifyOTP = async () => {
    setError("");
    if (otpExpired) { setError("OTP has expired. Please click Resend OTP."); return; }
    if (otpValue.length < 6) { setError("Please enter the complete 6-digit OTP."); return; }

    setLoading(true);
    const result = await register({ ...form, otp: otpValue });
    setLoading(false);

    if (!result.success) {
      if (result.alreadyRegistered) {
        setAlreadyRegistered(true);
        setStep(0);
      } else {
        setError(result.error);
      }
      return;
    }

    sendSuccessEmail(form.email, form.name);
    setStep(2);
    setTimeout(() => navigate("/login"), 3000);
  };

  // ── Shared input class helper ──────────────────────────────────────────────
  const inputClass = (field) =>
    `w-full bg-white/10 border ${
      fieldErrors[field] ? "border-red-400/70 focus:border-red-400 focus:ring-red-400/30" : "border-white/20 focus:border-blue-400 focus:ring-blue-400"
    } text-white placeholder-white/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 transition`;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-4">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-2 shadow-2xl shadow-blue-600/40">
            <span className="text-3xl">🎓</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">LuckyTech Academy</h1>
          <p className="text-blue-300 mt-0.5 text-xs">Online Exam Portal</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <StepBadge step={step} />

          {/* ══ STEP 2: Success ════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="text-center py-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
              <p className="text-blue-300 text-sm mb-1">A welcome email has been sent to</p>
              <p className="text-white font-semibold">{form.email}</p>
              <div className="mt-6 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
                <p className="text-green-300 text-sm">✅ Your account has been created successfully</p>
              </div>
              <p className="text-white/40 text-xs mt-4 animate-pulse">Redirecting to login...</p>
            </div>
          )}

          {/* ══ STEP 1: OTP Verification ════════════════════════════════════ */}
          {step === 1 && (
            <div>
              <div className="text-center mb-4">
                <div className="text-3xl mb-2">📧</div>
                <h2 className="text-xl font-semibold text-white mb-1">Check your inbox</h2>
                <p className="text-blue-300 text-sm">We sent a 6-digit OTP to</p>
                <p className="text-white font-bold text-sm mt-0.5">{form.email}</p>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-sm px-4 py-3 rounded-xl mb-4">
                  {error}
                </div>
              )}

              <p className="text-white/50 text-xs text-center mb-1">Enter the 6-digit OTP below</p>
              <OTPInput value={otpValue} onChange={setOtpValue} disabled={loading} />

              <div className="flex items-center justify-between text-sm mt-2 mb-5 px-1">
                <span className="text-white/40 text-xs">Expires in:</span>
                {!otpExpired
                  ? <CountdownTimer seconds={300} onExpire={() => setOtpExpired(true)} resetKey={timerKey} />
                  : <span className="text-red-400 text-xs font-bold">⏰ Expired</span>
                }
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={loading || otpValue.length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                {loading
                  ? <><span className="animate-spin">⏳</span> Verifying...</>
                  : "✅ Verify OTP & Register"
                }
              </button>

              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => { setStep(0); setError(""); setOtpValue(""); }}
                  className="text-white/40 hover:text-white/70 text-sm transition"
                >
                  ← Edit Details
                </button>
                <button
                  onClick={handleResend}
                  disabled={loading || resendCount >= 3}
                  className="text-blue-400 hover:text-blue-300 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition"
                >
                  {resendCount >= 3 ? "Max resends reached" : `🔄 Resend OTP${resendCount > 0 ? ` (${3 - resendCount} left)` : ""}`}
                </button>
              </div>

              <p className="text-white/20 text-xs text-center mt-4">
                💡 Check your spam/junk folder if you don't see the email
              </p>
            </div>
          )}

          {/* ══ STEP 0: Registration Form ══════════════════════════════════ */}
          {step === 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">Create your account</h2>

              {/* Already Registered Warning */}
              {alreadyRegistered && (
                <div className="bg-amber-500/15 border border-amber-500/40 rounded-xl px-4 py-4 mb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">⚠️</span>
                    <div>
                      <p className="text-amber-300 font-semibold text-sm">Already Registered!</p>
                      <p className="text-amber-200/80 text-xs mt-1">
                        This email or mobile number is already linked to an account. No OTP was sent.
                      </p>
                      <button
                        onClick={() => navigate("/login")}
                        className="mt-3 inline-flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                      >
                        → Sign In to your account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {error && !alreadyRegistered && (
                <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-sm px-4 py-3 rounded-xl mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-3">

                {/* ── Full Name ─────────────────────────────────────────── */}
                <div>
                  <label className="block text-xs text-blue-200 mb-1">Full Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your full name"
                    className={inputClass("name")}
                  />
                  {fieldErrors.name && (
                    <p className="text-red-400 text-xs mt-0.5">⚠ {fieldErrors.name}</p>
                  )}
                </div>

                {/* ── Email ─────────────────────────────────────────────── */}
                <div>
                  <label className="block text-xs text-blue-200 mb-1">Email Address</label>
                  <div className="relative">
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="yourname@gmail.com / work@company.org"
                      className={`${inputClass("email")} pr-10`}
                    />
                    {isValidEmail(form.email) && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-base">✓</span>
                    )}
                  </div>
                  {fieldErrors.email && (
                    <p className="text-red-400 text-xs mt-0.5">⚠ {fieldErrors.email}</p>
                  )}
                </div>

                {/* ── Mobile + Education (same row) ─────────────────────── */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Mobile */}
                  <div>
                    <label className="block text-xs text-blue-200 mb-1">Mobile Number</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 text-xs font-mono">+91</span>
                      <input
                        name="mobile"
                        value={form.mobile}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="10-digit number"
                        maxLength={10}
                        inputMode="numeric"
                        className={`${inputClass("mobile")} pl-10 text-sm`}
                      />
                      {isValidMobile(form.mobile) && (
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-400 text-sm">✓</span>
                      )}
                    </div>
                    {fieldErrors.mobile && (
                      <p className="text-red-400 text-xs mt-0.5">⚠ {fieldErrors.mobile}</p>
                    )}
                    {!fieldErrors.mobile && form.mobile.length > 0 && form.mobile.length < 10 && (
                      <p className="text-white/30 text-xs mt-0.5">{10 - form.mobile.length} more digits</p>
                    )}
                  </div>

                  {/* Education */}
                  <div>
                    <label className="block text-xs text-blue-200 mb-1">Education Level</label>
                    <select
                      name="education"
                      value={form.education}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${inputClass("education")} bg-slate-800 text-sm`}
                    >
                      <option value="">Select level</option>
                      <option value="10th">10th (Easy)</option>
                      <option value="12th">12th (Medium)</option>
                      <option value="Graduation">Graduation (Hard)</option>
                    </select>
                    {fieldErrors.education && (
                      <p className="text-red-400 text-xs mt-0.5">⚠ {fieldErrors.education}</p>
                    )}
                  </div>
                </div>

                {/* ── Password + Confirm Password (same row) ────────────── */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Password */}
                  <div>
                    <label className="block text-xs text-blue-200 mb-1">Password</label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Min 6 characters"
                        className={`${inputClass("password")} pr-9 text-sm`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition"
                        tabIndex={-1}
                      >
                        <EyeIcon open={showPassword} />
                      </button>
                    </div>
                    {/* Strength bar */}
                    {form.password.length > 0 && (
                      <div className="mt-1 flex items-center gap-1.5">
                        <div className="flex gap-0.5 flex-1">
                          {[1,2,3,4].map((lvl) => {
                            const s = form.password.length >= 12 ? 4 : form.password.length >= 9 ? 3 : form.password.length >= 6 ? 2 : 1;
                            return <div key={lvl} className={`h-0.5 flex-1 rounded-full ${lvl <= s ? s===1?"bg-red-400":s===2?"bg-amber-400":s===3?"bg-blue-400":"bg-green-400" : "bg-white/10"}`} />;
                          })}
                        </div>
                        <span className="text-xs text-white/30">
                          {form.password.length >= 12?"Strong":form.password.length >= 9?"Good":form.password.length >= 6?"Fair":"Weak"}
                        </span>
                      </div>
                    )}
                    {fieldErrors.password && (
                      <p className="text-red-400 text-xs mt-0.5">⚠ {fieldErrors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs text-blue-200 mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Re-enter password"
                        className={`${inputClass("confirmPassword")} pr-9 text-sm`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition"
                        tabIndex={-1}
                      >
                        <EyeIcon open={showConfirmPassword} />
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-red-400 text-xs mt-0.5">⚠ {fieldErrors.confirmPassword}</p>
                    )}
                    {!fieldErrors.confirmPassword && form.confirmPassword.length > 0 && form.confirmPassword === form.password && (
                      <p className="text-green-400 text-xs mt-0.5">✓ Passwords match</p>
                    )}
                  </div>
                </div>

                {/* ── Send OTP Button ───────────────────────────────────── */}
                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-sm"
                >
                  {loading
                    ? <><span className="animate-spin">⏳</span> Checking & Sending OTP...</>
                    : "📧 Send OTP →"
                  }
                </button>
              </div>

              <p className="text-center text-xs text-white/50 mt-3">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-blue-400 hover:text-blue-300 font-medium transition"
                >
                  Sign In
                </button>
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-white/20 mt-2">LuckyTech Academy © 2024</p>
      </div>
    </div>
  );
}