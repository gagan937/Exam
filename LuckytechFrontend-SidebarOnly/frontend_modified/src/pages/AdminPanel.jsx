 










// import { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import API from "../api";

// const ADMIN_KEY = "Lucky@dm!n";
// const headers   = { "x-admin-key": ADMIN_KEY };

// // ── Edit Student Modal ────────────────────────────────────────────────────────
// function EditModal({ student, onClose, onSave }) {
//   const [form, setForm] = useState({
//     name: student.name, email: student.email,
//     mobile: student.mobile, education: student.education, password: "",
//   });
//   const [error,   setError]   = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSave = async () => {
//     setError("");
//     if (!form.name || !form.email || !form.mobile || !form.education) {
//       setError("All fields except password are required."); return;
//     }
//     setLoading(true);
//     try {
//       await API.put(`/admin/student/${student.id}`, form, { headers });
//       onSave();
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to update.");
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
//       <div className="bg-slate-800 border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
//         <div className="flex items-center justify-between mb-5">
//           <h3 className="text-white font-bold text-lg">✏️ Edit Student</h3>
//           <button onClick={onClose} className="text-white/40 hover:text-white text-xl">×</button>
//         </div>
//         {error && <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
//         <div className="space-y-3">
//           {[
//             { label:"Full Name", name:"name",   type:"text",  placeholder:"Full name" },
//             { label:"Email",     name:"email",  type:"email", placeholder:"email@gmail.com" },
//             { label:"Mobile",    name:"mobile", type:"text",  placeholder:"10-digit mobile", maxLength:10 },
//           ].map(f => (
//             <div key={f.name}>
//               <label className="block text-xs text-blue-200 mb-1">{f.label}</label>
//               <input type={f.type} value={form[f.name]} maxLength={f.maxLength}
//                 onChange={e => setForm({ ...form, [f.name]: e.target.value })}
//                 placeholder={f.placeholder}
//                 className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition" />
//             </div>
//           ))}
//           <div>
//             <label className="block text-xs text-blue-200 mb-1">Education</label>
//             <select value={form.education} onChange={e => setForm({ ...form, education: e.target.value })}
//               className="w-full bg-slate-700 border border-white/20 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition">
//               <option value="10th">10th (Easy)</option>
//               <option value="12th">12th (Medium)</option>
//               <option value="Graduation">Graduation (Hard)</option>
//             </select>
//           </div>
//           <div>
//             <label className="block text-xs text-blue-200 mb-1">
//               New Password <span className="text-white/30">(leave blank to keep current)</span>
//             </label>
//             <input type="password" value={form.password}
//               onChange={e => setForm({ ...form, password: e.target.value })}
//               placeholder="Min 6 characters"
//               className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition" />
//           </div>
//         </div>
//         <div className="flex gap-3 mt-5">
//           <button onClick={onClose}
//             className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl text-sm transition border border-white/10">
//             Cancel
//           </button>
//           <button onClick={handleSave} disabled={loading}
//             className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition">
//             {loading ? "Saving..." : "Save Changes"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Delete Confirm Modal ──────────────────────────────────────────────────────
// function DeleteModal({ student, onClose, onConfirm, loading }) {
//   return (
//     <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
//       <div className="bg-slate-800 border border-red-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
//         <div className="text-4xl mb-3">🗑️</div>
//         <h3 className="text-white font-bold text-lg mb-2">Delete Student?</h3>
//         <p className="text-white/60 text-sm mb-2"><span className="text-white font-semibold">{student.name}</span></p>
//         <p className="text-red-300/80 text-xs mb-5">This permanently deletes the student and all exam data. Cannot be undone.</p>
//         <div className="flex gap-3">
//           <button onClick={onClose}
//             className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl text-sm transition border border-white/10">
//             Cancel
//           </button>
//           <button onClick={onConfirm} disabled={loading}
//             className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition">
//             {loading ? "Deleting..." : "Delete"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Main Admin Panel ──────────────────────────────────────────────────────────
// export default function AdminPanel() {
//   const navigate = useNavigate();
//   const [adminKey,   setAdminKey]   = useState("");
//   const [authed,     setAuthed]     = useState(false);
//   const [authError,  setAuthError]  = useState("");

//   const [stats,      setStats]      = useState(null);
//   const [students,   setStudents]   = useState([]);
//   const [loading,    setLoading]    = useState(false);
//   const [toast,      setToast]      = useState("");

//   const [editStudent,   setEditStudent]   = useState(null);
//   const [deleteStudent, setDeleteStudent] = useState(null);
//   const [deleteLoading, setDeleteLoading] = useState(false);

//   const [examQsInput, setExamQsInput] = useState("");
//   const [savingQs,    setSavingQs]    = useState(false);

//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState("all");

//   // Auto-refresh interval ref
//   const autoRefreshRef = useRef(null);

//   const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

//   const fetchData = async (silent = false) => {
//     if (!silent) setLoading(true);
//     try {
//       const [sRes, stRes] = await Promise.all([
//         API.get("/admin/stats",    { headers }),
//         API.get("/admin/students", { headers }),
//       ]);
//       setStats(sRes.data.stats);
//       setStudents(stRes.data.students);
//       setExamQsInput(sRes.data.stats.exam_questions || 10);
//       if (!silent) showToast("✅ Data refreshed");
//     } catch {
//       if (!silent) showToast("❌ Failed to load data");
//     }
//     if (!silent) setLoading(false);
//   };

//   // Start auto-refresh every 30 seconds after login
//   const startAutoRefresh = () => {
//     if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
//     autoRefreshRef.current = setInterval(() => {
//       fetchData(true); // silent refresh — no toast, no loading state
//     }, 30000);
//   };

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
//     };
//   }, []);

//   const handleAuth = () => {
//     if (adminKey === ADMIN_KEY) {
//       setAuthed(true);
//       fetchData(true).then(() => startAutoRefresh());
//     } else {
//       setAuthError("Wrong admin key. Please try again 👾");
//     }
//   };

//   // Manual refresh — shows loading + toast
//   const handleManualRefresh = async () => {
//     await fetchData(false);
//     // Reset auto-refresh timer after manual refresh
//     startAutoRefresh();
//   };

//   const handleToggle = async (student) => {
//     try {
//       const res = await API.patch(`/admin/student/${student.id}/toggle`, {}, { headers });
//       showToast(`✅ ${res.data.message}`);
//       fetchData(true); // silent after toggle
//     } catch { showToast("❌ Failed to toggle status"); }
//   };

//   const handleResetExam = async (student) => {
//     if (!window.confirm(`Reset exam for ${student.name}? They can retake the exam.`)) return;
//     try {
//       await API.patch(`/admin/student/${student.id}/reset-exam`, {}, { headers });
//       showToast(`✅ Exam reset for ${student.name}`);
//       fetchData(true);
//     } catch { showToast("❌ Failed to reset exam"); }
//   };

//   const handleDelete = async () => {
//     setDeleteLoading(true);
//     try {
//       await API.delete(`/admin/student/${deleteStudent.id}`, { headers });
//       showToast(`✅ ${deleteStudent.name} deleted.`);
//       setDeleteStudent(null);
//       fetchData(true);
//     } catch { showToast("❌ Failed to delete."); }
//     setDeleteLoading(false);
//   };

//   const handleSaveQs = async () => {
//     setSavingQs(true);
//     try {
//       const res = await API.put("/admin/settings", { exam_questions: parseInt(examQsInput) }, { headers });
//       showToast(`✅ ${res.data.message}`);
//       fetchData(true);
//     } catch (err) {
//       showToast("❌ " + (err.response?.data?.message || "Failed to save"));
//     }
//     setSavingQs(false);
//   };

//   const filteredStudents = students.filter(s => {
//     const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
//       s.email.toLowerCase().includes(search.toLowerCase()) ||
//       s.mobile.includes(search);
//     const matchFilter = filter === "all" ? true : filter === "active" ? s.is_active : !s.is_active;
//     return matchSearch && matchFilter;
//   });

//   // ── Admin Login ───────────────────────────────────────────────────────────
//   if (!authed) return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center px-4">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 mb-4 shadow-2xl">
//             <span className="text-4xl">🛡️</span>
//           </div>
//           <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
//           <p className="text-purple-300 mt-1 text-sm">LuckyTech Academy</p>
//         </div>
//         <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
//           <h2 className="text-lg font-semibold text-white mb-5">Enter Admin Key</h2>
//           {authError && (
//             <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-sm px-4 py-3 rounded-xl mb-4">{authError}</div>
//           )}
//           <input type="password" value={adminKey}
//             onChange={e => setAdminKey(e.target.value)}
//             onKeyDown={e => e.key === "Enter" && handleAuth()}
//             placeholder="Admin secret key"
//             className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 transition mb-4" />
//           <button onClick={handleAuth}
//             className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl transition">
//             Access Admin Panel →
//           </button>
//           <button onClick={() => navigate("/login")}
//             className="w-full text-white/30 hover:text-white/60 text-sm mt-4 transition">
//             ← Back to Login
//           </button>
//         </div>
//       </div>
//     </div>
//   );

//   // ── Admin Dashboard ───────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">

//       {/* Toast */}
//       {toast && (
//         <div className="fixed top-4 right-4 z-50 bg-slate-800 border border-white/20 text-white px-5 py-3 rounded-xl shadow-2xl text-sm">
//           {toast}
//         </div>
//       )}

//       {/* Modals */}
//       {editStudent && (
//         <EditModal student={editStudent} onClose={() => setEditStudent(null)}
//           onSave={() => { setEditStudent(null); fetchData(true); showToast("✅ Student updated."); }} />
//       )}
//       {deleteStudent && (
//         <DeleteModal student={deleteStudent} loading={deleteLoading}
//           onClose={() => setDeleteStudent(null)} onConfirm={handleDelete} />
//       )}

//       {/* Header */}
//       <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-xl">🛡️</div>
//             <div>
//               <span className="text-white font-bold text-lg">Admin Panel</span>
//               <div className="text-purple-400 text-xs">LuckyTech Academy • Auto-refresh every 30s</div>
//             </div>
//           </div>
//           <button onClick={() => { clearInterval(autoRefreshRef.current); navigate("/login"); }}
//             className="text-sm text-red-400 hover:text-red-300 border border-red-400/30 px-3 py-1.5 rounded-lg transition">
//             Exit Admin
//           </button>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-4 py-8">

//         {/* Stats */}
//         <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
//           {[
//             { icon:"👥", label:"Total Students",  value: stats?.total_students  ?? "—" },
//             { icon:"✅", label:"Active",           value: stats?.active_students ?? "—" },
//             { icon:"📝", label:"Exams Done",       value: stats?.total_exams     ?? "—" },
//             { icon:"📊", label:"Avg Score",        value: stats?.avg_score       ?? "—" },
//             { icon:"❓", label:"Questions/Exam",   value: stats?.exam_questions  ?? "—" },
//           ].map((s, i) => (
//             <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
//               <div className="text-2xl mb-1">{s.icon}</div>
//               <div className="text-xl font-bold text-white">{s.value}</div>
//               <div className="text-white/50 text-xs">{s.label}</div>
//             </div>
//           ))}
//         </div>

//         {/* Exam Settings */}
//         <div className="bg-white/5 border border-purple-500/30 rounded-2xl p-5 mb-8">
//           <h3 className="text-white font-bold mb-3">⚙️ Exam Settings</h3>
//           <div className="flex items-center gap-3 flex-wrap">
//             <div>
//               <label className="block text-xs text-purple-200 mb-1">Number of Questions per Exam</label>
//               <input type="number" min="1" max="200" value={examQsInput}
//                 onChange={e => setExamQsInput(e.target.value)}
//                 className="w-32 bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400 transition" />
//             </div>
//             <button onClick={handleSaveQs} disabled={savingQs}
//               className="mt-5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition">
//               {savingQs ? "Saving..." : "Save Setting"}
//             </button>
//             <p className="text-white/40 text-xs mt-5">Min: 1 • Max: 200 • Currently: {stats?.exam_questions}</p>
//           </div>
//         </div>

//         {/* Students Table */}
//         <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
//           <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center gap-3">
//             <h3 className="text-white font-bold text-lg flex-1">👥 All Students</h3>

//             {/* Search */}
//             <input placeholder="Search name, email, mobile..."
//               value={search} onChange={e => setSearch(e.target.value)}
//               className="bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-400 transition w-full sm:w-64" />

//             {/* Filter */}
//             <div className="flex gap-2">
//               {["all","active","disabled"].map(f => (
//                 <button key={f} onClick={() => setFilter(f)}
//                   className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize
//                     ${filter === f ? "bg-purple-600 text-white" : "bg-white/10 text-white/60 hover:bg-white/20"}`}>
//                   {f}
//                 </button>
//               ))}
//             </div>

//             {/* Manual Refresh Button */}
//             <button onClick={handleManualRefresh} disabled={loading}
//               className="flex items-center gap-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
//               <span className={loading ? "animate-spin" : ""}>🔄</span>
//               {loading ? "Refreshing..." : "Refresh"}
//             </button>
//           </div>

//           {/* Auto-refresh indicator */}
//           <div className="px-5 py-2 bg-purple-500/5 border-b border-white/5 flex items-center gap-2">
//             <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
//             <span className="text-white/30 text-xs">Auto-refreshing every 30 seconds — new registrations appear automatically</span>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-wider">
//                   <th className="px-4 py-3 text-left">#</th>
//                   <th className="px-4 py-3 text-left">Student</th>
//                   <th className="px-4 py-3 text-left">Mobile</th>
//                   <th className="px-4 py-3 text-left">Education</th>
//                   <th className="px-4 py-3 text-center">Exams</th>
//                   <th className="px-4 py-3 text-center">Best</th>
//                   <th className="px-4 py-3 text-center">Status</th>
//                   <th className="px-4 py-3 text-center">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredStudents.length === 0 && (
//                   <tr>
//                     <td colSpan="8" className="text-center text-white/30 py-10">
//                       {loading ? "Loading..." : "No students found"}
//                     </td>
//                   </tr>
//                 )}
//                 {filteredStudents.map((s, i) => (
//                   <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition">
//                     <td className="px-4 py-3 text-white/40">{i + 1}</td>
//                     <td className="px-4 py-3">
//                       <div className="text-white font-medium">{s.name}</div>
//                       <div className="text-white/40 text-xs">{s.email}</div>
//                     </td>
//                     <td className="px-4 py-3 text-white/70">{s.mobile}</td>
//                     <td className="px-4 py-3">
//                       <span className={`text-xs px-2 py-0.5 rounded-full border
//                         ${s.education === "10th"       ? "bg-green-500/20 text-green-300 border-green-500/30"
//                         : s.education === "12th"       ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
//                         : "bg-red-500/20 text-red-300 border-red-500/30"}`}>
//                         {s.education}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 text-center text-white/70">{s.exams_taken || 0}</td>
//                     <td className="px-4 py-3 text-center text-white/70">{s.best_score ?? "—"}</td>
//                     <td className="px-4 py-3 text-center">
//                       {/* Toggle Enable/Disable */}
//                       <button onClick={() => handleToggle(s)}
//                         title={s.is_active ? "Click to Disable" : "Click to Enable"}
//                         className={`px-3 py-1 rounded-full text-xs font-semibold transition border
//                           ${s.is_active
//                             ? "bg-green-500/20 text-green-300 border-green-500/30 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30"
//                             : "bg-red-500/20 text-red-300 border-red-500/30 hover:bg-green-500/20 hover:text-green-300 hover:border-green-500/30"
//                           }`}>
//                         {s.is_active ? "✅ Enabled" : "🚫 Disabled"}
//                       </button>
//                     </td>
//                     <td className="px-4 py-3">
//                       <div className="flex items-center gap-1 justify-center flex-wrap">
//                         <button onClick={() => setEditStudent(s)}
//                           className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-lg text-xs transition">
//                           ✏️ Edit
//                         </button>
//                         {s.exams_taken > 0 && (
//                           <button onClick={() => handleResetExam(s)}
//                             className="bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300 border border-yellow-500/30 px-2.5 py-1 rounded-lg text-xs transition">
//                             🔄 Reset
//                           </button>
//                         )}
//                         <button onClick={() => setDeleteStudent(s)}
//                           className="bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 px-2.5 py-1 rounded-lg text-xs transition">
//                           🗑️ Del
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div className="px-5 py-3 border-t border-white/10 text-white/40 text-xs">
//             Showing {filteredStudents.length} of {students.length} students
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }



import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const ADMIN_KEY = "Lucky@dm!n";
const headers   = { "x-admin-key": ADMIN_KEY };

// ── Edit Student Modal ────────────────────────────────────────────────────────
function EditModal({ student, onClose, onSave }) {
  const [form, setForm] = useState({
    name: student.name, email: student.email,
    mobile: student.mobile, education: student.education, password: "",
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setError("");
    if (!form.name || !form.email || !form.mobile || !form.education) {
      setError("All fields except password are required."); return;
    }
    setLoading(true);
    try {
      await API.put(`/admin/student/${student.id}`, form, { headers });
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-slate-800 border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold text-lg">✏️ Edit Student</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">×</button>
        </div>
        {error && <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
        <div className="space-y-3">
          {[
            { label:"Full Name", name:"name",   type:"text",  placeholder:"Full name" },
            { label:"Email",     name:"email",  type:"email", placeholder:"email@gmail.com" },
            { label:"Mobile",    name:"mobile", type:"text",  placeholder:"10-digit mobile", maxLength:10 },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-xs text-blue-200 mb-1">{f.label}</label>
              <input type={f.type} value={form[f.name]} maxLength={f.maxLength}
                onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                placeholder={f.placeholder}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition" />
            </div>
          ))}
          <div>
            <label className="block text-xs text-blue-200 mb-1">Education</label>
            <select value={form.education} onChange={e => setForm({ ...form, education: e.target.value })}
              className="w-full bg-slate-700 border border-white/20 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition">
              <option value="10th">10th (Easy)</option>
              <option value="12th">12th (Medium)</option>
              <option value="Graduation">Graduation (Hard)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-blue-200 mb-1">
              New Password <span className="text-white/30">(leave blank to keep current)</span>
            </label>
            <input type="password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Min 6 characters"
              className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl text-sm transition border border-white/10">
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteModal({ student, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-slate-800 border border-red-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
        <div className="text-4xl mb-3">🗑️</div>
        <h3 className="text-white font-bold text-lg mb-2">Delete Student?</h3>
        <p className="text-white/60 text-sm mb-2"><span className="text-white font-semibold">{student.name}</span></p>
        <p className="text-red-300/80 text-xs mb-5">This permanently deletes the student and all exam data. Cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl text-sm transition border border-white/10">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition">
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Student Result Modal ──────────────────────────────────────────────────────
function StudentResultModal({ student, onClose }) {
  const [results,      setResults]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [selected,     setSelected]     = useState(null);
  const [detail,       setDetail]       = useState(null);
  const [detailLoad,   setDetailLoad]   = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get(`/admin/student/${student.id}/results`, { headers });
        setResults(res.data.results || []);
      } catch {
        setError("Could not load results. Add the backend route (see instructions below).");
      }
      setLoading(false);
    })();
  }, [student.id]);

  const loadDetail = async (sessionId) => {
    setDetailLoad(true);
    setSelected(sessionId);
    setDetail(null);
    try {
      const res = await API.get(`/admin/student/${student.id}/results/${sessionId}`, { headers });
      setDetail(res.data);
    } catch {
      setDetail(null);
    }
    setDetailLoad(false);
  };

  const formatTime = (secs) => {
    if (!secs && secs !== 0) return "—";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-IN", {
      day:"2-digit", month:"short", year:"numeric",
      hour:"2-digit", minute:"2-digit"
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-3 py-4">
      <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col"
        style={{ maxHeight: "92vh" }}>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-xl flex-shrink-0">
              📊
            </div>
            <div>
              <h3 className="text-white font-bold text-base">{student.name} — Exam Results</h3>
              <p className="text-white/40 text-xs">{student.email} • {student.education}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="text-white/40 hover:text-white text-2xl leading-none transition ml-4">
            ×
          </button>
        </div>

        {/* Modal Body — two column layout */}
        <div className="flex flex-1 overflow-hidden">

          {/* LEFT: Attempts List */}
          <div className="w-64 border-r border-white/10 flex flex-col flex-shrink-0">
            <div className="px-4 py-2.5 border-b border-white/10 flex-shrink-0">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                All Attempts ({results.length})
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading && (
                <div className="text-center text-white/30 py-10 text-sm">Loading...</div>
              )}
              {error && (
                <div className="m-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-3 py-3 rounded-xl leading-relaxed">
                  {error}
                </div>
              )}
              {!loading && !error && results.length === 0 && (
                <div className="text-center text-white/30 py-10 text-sm px-4">
                  No exams taken yet
                </div>
              )}
              {results.map((r, i) => {
                const pct    = r.total_qs ? Math.round((r.score / r.total_qs) * 100) : 0;
                const passed = pct >= 60;
                const isSel  = selected === r.id;
                return (
                  <button key={r.id} onClick={() => loadDetail(r.id)}
                    className={`w-full text-left px-4 py-3 border-b border-white/5 transition
                      ${isSel
                        ? "bg-purple-600/20 border-l-2 border-l-purple-400"
                        : "hover:bg-white/5"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/50 text-xs">Attempt #{results.length - i}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                        ${passed
                          ? "bg-green-500/20 text-green-300"
                          : "bg-red-500/20 text-red-300"}`}>
                        {passed ? "PASS" : "FAIL"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-white font-semibold text-sm">
                        {r.score}/{r.total_qs} correct
                      </span>
                      <span className={`font-bold text-sm ${passed ? "text-green-400" : "text-red-400"}`}>
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 mb-1">
                      <div className={`h-1.5 rounded-full ${passed ? "bg-green-500" : "bg-red-500"}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-white/25 text-xs">{formatDate(r.completed_at)}</div>
                  </button>
                );
              })}
            </div>

            {/* Summary */}
            {!loading && results.length > 0 && (
              <div className="px-4 py-3 border-t border-white/10 bg-white/5 flex-shrink-0">
                <div className="grid grid-cols-3 gap-1 text-center">
                  <div>
                    <div className="text-white font-bold text-sm">{results.length}</div>
                    <div className="text-white/40 text-xs">Total</div>
                  </div>
                  <div>
                    <div className="text-green-400 font-bold text-sm">
                      {results.filter(r => r.total_qs && Math.round((r.score / r.total_qs) * 100) >= 60).length}
                    </div>
                    <div className="text-white/40 text-xs">Passed</div>
                  </div>
                  <div>
                    <div className="text-red-400 font-bold text-sm">
                      {results.filter(r => !r.total_qs || Math.round((r.score / r.total_qs) * 100) < 60).length}
                    </div>
                    <div className="text-white/40 text-xs">Failed</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Detail */}
          <div className="flex-1 overflow-y-auto">

            {/* No selection placeholder */}
            {!selected && !loading && !error && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-white/20">
                  <div className="text-5xl mb-3">👈</div>
                  <p className="text-sm">Select an attempt to see details</p>
                </div>
              </div>
            )}

            {detailLoad && (
              <div className="flex items-center justify-center h-full text-white/30 text-sm">
                Loading details...
              </div>
            )}

            {selected && !detailLoad && detail && (
              <div className="p-5">

                {/* Score cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    {
                      icon: "✅", label: "Correct",
                      value: detail.session?.score ?? "—",
                      color: "text-green-400",
                      bg: "bg-green-500/10 border-green-500/20"
                    },
                    {
                      icon: "❌", label: "Wrong",
                      value: detail.session?.total_qs != null
                        ? detail.session.total_qs - (detail.session.score ?? 0)
                        : "—",
                      color: "text-red-400",
                      bg: "bg-red-500/10 border-red-500/20"
                    },
                    {
                      icon: "📋", label: "Total Qs",
                      value: detail.session?.total_qs ?? "—",
                      color: "text-blue-400",
                      bg: "bg-blue-500/10 border-blue-500/20"
                    },
                    {
                      icon: "⏱️", label: "Time Taken",
                      value: formatTime(detail.session?.time_taken),
                      color: "text-yellow-400",
                      bg: "bg-yellow-500/10 border-yellow-500/20"
                    },
                  ].map((card, ci) => (
                    <div key={ci} className={`rounded-xl border p-3 text-center ${card.bg}`}>
                      <div className="text-xl mb-1">{card.icon}</div>
                      <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                      <div className="text-white/50 text-xs">{card.label}</div>
                    </div>
                  ))}
                </div>

                {/* Score bar */}
                {detail.session?.total_qs > 0 && (() => {
                  const pct    = Math.round((detail.session.score / detail.session.total_qs) * 100);
                  const passed = pct >= 60;
                  return (
                    <div className={`rounded-xl border p-4 mb-4
                      ${passed
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-red-500/10 border-red-500/30"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold text-sm">Overall Score</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-lg ${passed ? "text-green-400" : "text-red-400"}`}>
                            {pct}%
                          </span>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold
                            ${passed
                              ? "bg-green-500/20 text-green-300"
                              : "bg-red-500/20 text-red-300"}`}>
                            {passed ? "PASSED ✓" : "FAILED ✗"}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${passed ? "bg-green-500" : "bg-red-500"}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-white/30 mt-1.5">
                        <span>0%</span>
                        <span className="text-yellow-400/70">60% = passing mark</span>
                        <span>100%</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Question breakdown */}
                <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  📝 Question-wise Breakdown
                  <span className="text-white/30 font-normal text-xs">
                    ({detail.questions?.length || 0} questions)
                  </span>
                </h4>

                <div className="space-y-3">
                  {(detail.questions || []).map((q, qi) => (
                    <div key={qi}
                      className={`rounded-xl border p-4
                        ${q.isCorrect
                          ? "bg-green-500/5 border-green-500/20"
                          : "bg-red-500/5 border-red-500/20"}`}>

                      {/* Question row */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-2 flex-1">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center
                            text-xs font-bold flex-shrink-0 mt-0.5
                            ${q.isCorrect
                              ? "bg-green-500/30 text-green-300"
                              : "bg-red-500/30 text-red-300"}`}>
                            {qi + 1}
                          </span>
                          <p className="text-white text-sm font-medium leading-snug">{q.question}</p>
                        </div>
                        <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border
                          ${q.isCorrect
                            ? "bg-green-500/20 text-green-300 border-green-500/30"
                            : "bg-red-500/20 text-red-300 border-red-500/30"}`}>
                          {q.isCorrect ? "✓ Correct" : "✗ Wrong"}
                        </span>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-9">
                        {(q.options || []).map((opt, oi) => {
                          const isCorrectOpt  = oi === q.answer;
                          const isSelectedOpt = oi === q.selected;
                          let cls = "bg-white/5 border-white/10 text-white/50";
                          if (isCorrectOpt && isSelectedOpt)
                            cls = "bg-green-500/20 border-green-500/50 text-green-200";
                          else if (isCorrectOpt)
                            cls = "bg-green-500/10 border-green-500/40 text-green-300";
                          else if (isSelectedOpt)
                            cls = "bg-red-500/20 border-red-500/50 text-red-200";

                          return (
                            <div key={oi}
                              className={`flex items-start gap-2 px-3 py-2 rounded-lg border text-xs ${cls}`}>
                              <span className={`w-5 h-5 rounded flex items-center justify-center
                                text-xs font-bold flex-shrink-0 mt-0.5
                                ${isCorrectOpt
                                  ? "bg-green-500/40 text-green-200"
                                  : isSelectedOpt
                                    ? "bg-red-500/40 text-red-200"
                                    : "bg-white/10 text-white/30"}`}>
                                {String.fromCharCode(65 + oi)}
                              </span>
                              <span className="flex-1 leading-snug">{opt}</span>
                              {isCorrectOpt && (
                                <span className="text-green-400 text-xs flex-shrink-0">✓</span>
                              )}
                              {isSelectedOpt && !isCorrectOpt && (
                                <span className="text-red-400 text-xs flex-shrink-0">✗</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Subject tag */}
                      {q.subject && (
                        <div className="ml-9 mt-2">
                          <span className="text-xs text-white/20 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                            {q.subject}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Admin Panel ──────────────────────────────────────────────────────────
export default function AdminPanel() {
  const navigate = useNavigate();
  const [adminKey,      setAdminKey]      = useState("");
  const [authed,        setAuthed]        = useState(false);
  const [authError,     setAuthError]     = useState("");
  const [stats,         setStats]         = useState(null);
  const [students,      setStudents]      = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [toast,         setToast]         = useState("");
  const [editStudent,   setEditStudent]   = useState(null);
  const [deleteStudent, setDeleteStudent] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewResult,    setViewResult]    = useState(null);
  const [examQsInput,   setExamQsInput]   = useState("");
  const [savingQs,      setSavingQs]      = useState(false);
  const [search,        setSearch]        = useState("");
  const [filter,        setFilter]        = useState("all");
  const autoRefreshRef = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [sRes, stRes] = await Promise.all([
        API.get("/admin/stats",    { headers }),
        API.get("/admin/students", { headers }),
      ]);
      setStats(sRes.data.stats);
      setStudents(stRes.data.students);
      setExamQsInput(sRes.data.stats.exam_questions || 10);
      if (!silent) showToast("✅ Data refreshed");
    } catch {
      if (!silent) showToast("❌ Failed to load data");
    }
    if (!silent) setLoading(false);
  };

  const startAutoRefresh = () => {
    if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    autoRefreshRef.current = setInterval(() => fetchData(true), 30000);
  };

  useEffect(() => {
    return () => { if (autoRefreshRef.current) clearInterval(autoRefreshRef.current); };
  }, []);

  const handleAuth = () => {
    if (adminKey === ADMIN_KEY) {
      setAuthed(true);
      fetchData(true).then(() => startAutoRefresh());
    } else {
      setAuthError("Wrong admin key. Please try again.");
    }
  };

  const handleManualRefresh = async () => {
    await fetchData(false);
    startAutoRefresh();
  };

  const handleToggle = async (s) => {
    try {
      const res = await API.patch(`/admin/student/${s.id}/toggle`, {}, { headers });
      showToast(`✅ ${res.data.message}`);
      fetchData(true);
    } catch { showToast("❌ Failed to toggle status"); }
  };

  const handleResetExam = async (s) => {
    if (!window.confirm(`Reset exam for ${s.name}? They can retake the exam.`)) return;
    try {
      console.log("we are trying to the reset exam ..................")
      await API.patch(`/admin/student/${s.id}/reset-exam`, {}, { headers });
      showToast(`✅ Exam reset for ${s.name}`);
      fetchData(true);
    } catch { showToast("❌ Failed to reset exam"); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await API.delete(`/admin/student/${deleteStudent.id}`, { headers });
      showToast(`✅ ${deleteStudent.name} deleted.`);
      setDeleteStudent(null);
      fetchData(true);
    } catch { showToast("❌ Failed to delete."); }
    setDeleteLoading(false);
  };

  const handleSaveQs = async () => {
    setSavingQs(true);
    try {
      const res = await API.put("/admin/settings", { exam_questions: parseInt(examQsInput) }, { headers });
      showToast(`✅ ${res.data.message}`);
      fetchData(true);
    } catch (err) {
      showToast("❌ " + (err.response?.data?.message || "Failed to save"));
    }
    setSavingQs(false);
  };

  const filteredStudents = students.filter(s => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.mobile.includes(search);
    const matchFilter =
      filter === "all"      ? true
      : filter === "active" ? s.is_active
      : !s.is_active;
    return matchSearch && matchFilter;
  });

  // ── Login Screen ───────────────────────────────────────────────────────────
  if (!authed) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 mb-4 shadow-2xl">
            <span className="text-4xl">🛡️</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-purple-300 mt-1 text-sm">LuckyTech Academy</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-5">Enter Admin Key</h2>
          {authError && (
            <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-sm px-4 py-3 rounded-xl mb-4">
              {authError}
            </div>
          )}
          <input type="password" value={adminKey}
            onChange={e => setAdminKey(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAuth()}
            placeholder="Admin secret key"
            className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 transition mb-4" />
          <button onClick={handleAuth}
            className="w-full bg-purple-600 hover:bg-purple-950 text-white font-semibold py-3 rounded-xl transition">
            Access Admin Panel →
          </button>
          <button onClick={() => navigate("/login")}
            className="w-full text-white/30 hover:text-white/60 text-sm mt-4 transition">
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );

  // ── Dashboard ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">

      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 border border-white/20 text-white px-5 py-3 rounded-xl shadow-2xl text-sm">
          {toast}
        </div>
      )}

      {editStudent && (
        <EditModal student={editStudent} onClose={() => setEditStudent(null)}
          onSave={() => { setEditStudent(null); fetchData(true); showToast("✅ Student updated."); }} />
      )}
      {deleteStudent && (
        <DeleteModal student={deleteStudent} loading={deleteLoading}
          onClose={() => setDeleteStudent(null)} onConfirm={handleDelete} />
      )}
      {viewResult && (
        <StudentResultModal student={viewResult} onClose={() => setViewResult(null)} />
      )}

      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-xl">🛡️</div>
            <div>
              <span className="text-white font-bold text-lg">Admin Panel</span>
              <div className="text-purple-400 text-xs">LuckyTech Academy • Auto-refresh every 30s</div>
            </div>
          </div>
          <button onClick={() => { clearInterval(autoRefreshRef.current); navigate("/login"); }}
            className="text-sm text-red-400 hover:text-red-300 border border-red-400/30 px-3 py-1.5 rounded-lg transition">
            Exit Admin
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {[
            { icon:"👥", label:"Total Students",  value: stats?.total_students  ?? "—" },
            { icon:"✅", label:"Active",           value: stats?.active_students ?? "—" },
            { icon:"📝", label:"Exams Done",       value: stats?.total_exams     ?? "—" },
            { icon:"📊", label:"Avg Score",        value: stats?.avg_score       ?? "—" },
            { icon:"❓", label:"Questions/Exam",   value: stats?.exam_questions  ?? "—" },
          ].map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-white/50 text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Exam Settings */}
        <div className="bg-white/5 border border-purple-500/30 rounded-2xl p-5 mb-8">
          <h3 className="text-white font-bold mb-3">⚙️ Exam Settings</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <label className="block text-xs text-purple-200 mb-1">Number of Questions per Exam</label>
              <input type="number" min="1" max="200" value={examQsInput}
                onChange={e => setExamQsInput(e.target.value)}
                className="w-32 bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400 transition" />
            </div>
            <button onClick={handleSaveQs} disabled={savingQs}
              className="mt-5 bg-purple-600 hover:bg-purple-950 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition">
              {savingQs ? "Saving..." : "Save Setting"}
            </button>
            <p className="text-white/40 text-xs mt-5">Min: 1 • Max: 200 • Currently: {stats?.exam_questions}</p>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center gap-3">
            <h3 className="text-white font-bold text-lg flex-1">👥 All Students</h3>
            <input placeholder="Search name, email, mobile..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-400 transition w-full sm:w-64" />
            <div className="flex gap-2">
              {["all","active","disabled"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize
                    ${filter === f ? "bg-purple-600 text-white" : "bg-white/10 text-white/60 hover:bg-white/20"}`}>
                  {f}
                </button>
              ))}
            </div>
            <button onClick={handleManualRefresh} disabled={loading}
              className="flex items-center gap-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
              <span className={loading ? "animate-spin" : ""}>🔄</span>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="px-5 py-2 bg-purple-500/5 border-b border-white/5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-white/30 text-xs">Auto-refreshing every 30 seconds</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left">Mobile</th>
                  <th className="px-4 py-3 text-left">Education</th>
                  <th className="px-4 py-3 text-center">Exams</th>
                  <th className="px-4 py-3 text-center">Best</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center text-white/30 py-10">
                      {loading ? "Loading..." : "No students found"}
                    </td>
                  </tr>
                )}
                {filteredStudents.map((s, i) => (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-4 py-3 text-white/40">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="text-white font-medium">{s.name}</div>
                      <div className="text-white/40 text-xs">{s.email}</div>
                    </td>
                    <td className="px-4 py-3 text-white/70">{s.mobile}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border
                        ${s.education === "10th"       ? "bg-green-500/20 text-green-300 border-green-500/30"
                        : s.education === "12th"       ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                        : "bg-red-500/20 text-red-300 border-red-500/30"}`}>
                        {s.education}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-white/70">{s.exams_taken || 0}</td>
                    <td className="px-4 py-3 text-center text-white/70">{s.best_score ?? "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleToggle(s)}
                        title={s.is_active ? "Click to Disable" : "Click to Enable"}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition border
                          ${s.is_active
                            ? "bg-green-500/20 text-green-300 border-green-500/30 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30"
                            : "bg-red-500/20 text-red-300 border-red-500/30 hover:bg-green-500/20 hover:text-green-300 hover:border-green-500/30"}`}>
                        {s.is_active ? "✅ Enabled" : "🚫 Disabled"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-center flex-wrap">
                        {s.exams_taken > 0 && (
                          <button onClick={() => setViewResult(s)}
                            className="bg-green-500/20 hover:bg-green-500/40 text-green-300 border border-green-500/30 px-2.5 py-1 rounded-lg text-xs transition font-semibold">
                            📊 Results
                          </button>
                        )}
                        <button onClick={() => setEditStudent(s)}
                          className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-lg text-xs transition">
                          ✏️ Edit
                        </button>
                        {s.exams_taken > 0 && (
                          <button onClick={() => handleResetExam(s)}
                            className="bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300 border border-yellow-500/30 px-2.5 py-1 rounded-lg text-xs transition">
                            🔄 Reset
                          </button>
                        )}
                        <button onClick={() => setDeleteStudent(s)}
                          className="bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 px-2.5 py-1 rounded-lg text-xs transition">
                          🗑️ Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-white/10 text-white/40 text-xs">
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </div>
      </main>
    </div>
  );
}