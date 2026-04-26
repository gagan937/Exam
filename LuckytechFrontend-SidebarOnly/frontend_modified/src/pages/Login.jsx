// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// export default function Login() {
//   const navigate = useNavigate();
//   const { login } = useAuth();
//   const [form, setForm]   = useState({ mobile: "", email: "", password: "" });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.mobile || !form.email || !form.password) { setError("All fields are required."); return; }
//     setLoading(true); setError("");
//     const result = await login(form.mobile, form.email, form.password);
//     setLoading(false);
//     if (!result.success) {
//       if (result.code === "ACCOUNT_DISABLED") {
//         setError("__DISABLED__");
//       } else {
//         setError(result.error);
//       }
//       return;
//     }
//     navigate("/dashboard");
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 shadow-2xl shadow-blue-600/40">
//             <span className="text-4xl">🎓</span>
//           </div>
//           <h1 className="text-3xl font-bold text-white tracking-tight">LuckyTech Academy</h1>
//           <p className="text-blue-300 mt-1 text-sm">Online Exam Portal</p>
//         </div>

//         <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
//           <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>

//           {/* Account Disabled Popup */}
//           {error === "__DISABLED__" && (
//             <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-5 mb-5 text-center">
//               <div className="text-4xl mb-2">🚫</div>
//               <h3 className="text-red-300 font-bold text-lg mb-1">Account Disabled</h3>
//               <p className="text-red-200/80 text-sm">Your account has been disabled by the administrator.</p>
//               <p className="text-red-200/60 text-sm mt-1">Please contact the admin to re-enable your account.</p>
//               <div className="mt-3 bg-red-500/10 rounded-xl px-4 py-2">
//                 <p className="text-red-300 text-xs">📞 Contact Admin for assistance</p>
//               </div>
//             </div>
//           )}

//           {error && error !== "__DISABLED__" && (
//             <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm text-blue-200 mb-1">Mobile Number</label>
//               <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="10-digit mobile" maxLength={10}
//                 className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition" />
//             </div>
//             <div>
//               <label className="block text-sm text-blue-200 mb-1">Email Address</label>
//               <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="yourname@gmail.com"
//                 className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition" />
//             </div>
//             <div>
//               <label className="block text-sm text-blue-200 mb-1">Password</label>
//               <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Your password"
//                 className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition" />
//             </div>
//             <div className="flex justify-end">
//               <button type="button" onClick={() => navigate("/forgot-password")}
//                 className="text-blue-400 hover:text-blue-300 text-xs transition">
//                 Forgot Password?
//               </button>
//             </div>
//             <button type="submit" disabled={loading}
//               className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2">
//               {loading ? <><span className="animate-spin">⏳</span> Signing in...</> : "Sign In →"}
//             </button>
//           </form>

//           <p className="text-center text-sm text-white/50 mt-6">
//             Don't have an account?{" "}
//             <button onClick={() => navigate("/register")} className="text-blue-400 hover:text-blue-300 font-medium transition">Register Now</button>
//           </p>
//         </div>
//         <div className="text-center mt-4"><p className="text-xs text-white/20">LuckyTech Academy © 2024</p><button onClick={() => navigate("/admin")} className="text-xs text-purple-400/50 hover:text-purple-400 mt-1 transition">🛡️ Admin Panel</button></div>
//       </div>
//     </div>
//   );
// }









import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

// ─── Email validator (all formats) ───────────────────────────────────────────
const isValidEmail = (email) =>
  /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email.trim());

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm]                 = useState({ email: "", password: "" });
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const emailError =
    emailTouched && form.email.length > 0 && !isValidEmail(form.email)
      ? "Please enter a valid email address (e.g. user@gmail.com, roll@iitb.ac.in)."
      : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailTouched(true);

    if (!form.email || !form.password) { setError("All fields are required."); return; }
    if (!isValidEmail(form.email))     { setError("Please enter a valid email address."); return; }

    setLoading(true); setError("");
    const result = await login(form.email, form.password);
    setLoading(false);

    if (!result.success) {
      setError(result.code === "ACCOUNT_DISABLED" ? "__DISABLED__" : result.error);
      return;
    }
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 shadow-2xl shadow-blue-600/40">
            <span className="text-4xl">🎓</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">LuckyTech Academy</h1>
          <p className="text-blue-300 mt-1 text-sm">Online Exam Portal</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>

          {/* Account Disabled */}
          {error === "__DISABLED__" && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-5 mb-5 text-center">
              <div className="text-4xl mb-2">🚫</div>
              <h3 className="text-red-300 font-bold text-lg mb-1">Account Disabled</h3>
              <p className="text-red-200/80 text-sm">Your account has been disabled by the administrator.</p>
              <p className="text-red-200/60 text-sm mt-1">Please contact the admin to re-enable your account.</p>
              <div className="mt-3 bg-red-500/10 rounded-xl px-4 py-2">
                <p className="text-red-300 text-xs">📞 Contact Admin for assistance</p>
              </div>
            </div>
          )}

          {error && error !== "__DISABLED__" && (
            <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ── Email ─────────────────────────────────────────────────── */}
            <div>
              <label className="block text-sm text-blue-200 mb-1">Email Address</label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="yourname@gmail.com"
                  className={`w-full bg-white/10 border ${
                    emailError
                      ? "border-red-400/70 focus:border-red-400 focus:ring-red-400/30"
                      : "border-white/20 focus:border-blue-400 focus:ring-blue-400"
                  } text-white placeholder-white/30 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-1 transition`}
                />
                {/* Green tick when valid */}
                {isValidEmail(form.email) && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-base font-bold">✓</span>
                )}
              </div>
              {emailError && (
                <p className="text-red-400 text-xs mt-1">⚠ {emailError}</p>
              )}
            </div>

            {/* ── Password ──────────────────────────────────────────────── */}
            <div>
              <label className="block text-sm text-blue-200 mb-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-blue-300 transition"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end -mt-1">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-blue-400 hover:text-blue-300 text-xs transition"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              {loading ? <><span className="animate-spin">⏳</span> Signing in...</> : "Sign In →"}
            </button>
          </form>

          <p className="text-center text-sm text-white/50 mt-6">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-blue-400 hover:text-blue-300 font-medium transition"
            >
              Register Now
            </button>
          </p>
        </div>

        <div className="text-center mt-4">
          <p className="text-xs text-white/20">LuckyTech Academy © 2024</p>
          <button
            onClick={() => navigate("/admin")}
            className="text-xs text-purple-400/50 hover:text-purple-400 mt-1 transition"
          >
            🛡️ Admin Panel
          </button>
        </div>

      </div>
    </div>
  );
}