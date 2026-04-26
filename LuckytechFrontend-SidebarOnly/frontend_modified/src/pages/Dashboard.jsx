import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";

const LEVEL_COLORS = {
  "10th": "bg-green-500/20 text-green-300 border-green-500/30",
  "12th": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  "Graduation": "bg-red-500/20 text-red-300 border-red-500/30",
};
const LEVEL_LABELS = { "10th": "Easy", "12th": "Medium", "Graduation": "Hard" };

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [examStatus, setExamStatus] = useState(null); // null | 'taken' | 'disabled' | 'available'
  const [examCount, setExamCount] = useState(10);

  useEffect(() => {
    API.get("/results/stats/me").then(r => setStats(r.data.stats)).catch(() => {});
    // Check exam availability
    API.get("/exam/questions").then(r => {
      setExamStatus("available");
      setExamCount(r.data.total || 10);
    }).catch(err => {
      const code = err.response?.data?.code || err.response?.data?.message;
      if (code === "EXAM_ALREADY_TAKEN") setExamStatus("taken");
      else if (code === "ACCOUNT_DISABLED") setExamStatus("disabled");
      else setExamStatus("available");
    });
    // Get exam question count from admin settings
    API.get("/admin/settings", { headers: { "x-admin-key": "" } }).catch(() => {});
  }, []);

  const handleStartExam = () => {
    if (examStatus === "taken") return;
    if (examStatus === "disabled") return;
    navigate("/exam");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Disabled Account Popup */}
      {examStatus === "disabled" && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-slate-800 border border-red-500/50 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="text-5xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">Account Disabled</h2>
            <p className="text-white/70 text-sm mb-4">Your account has been disabled by the administrator. You cannot take exams at this time.</p>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-red-300 text-sm font-semibold">📞 Please contact the Admin</p>
              <p className="text-red-200/60 text-xs mt-1">Ask the admin to re-enable your account to continue.</p>
            </div>
            <button onClick={() => { logout(); navigate("/login"); }}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl transition">
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Exam Already Taken Popup */}
      {examStatus === "taken" && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-slate-800 border border-yellow-500/50 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">Exam Already Taken</h2>
            <p className="text-white/70 text-sm mb-4">You have already completed your exam. Each student is allowed only one attempt.</p>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <p className="text-yellow-300 text-sm font-semibold">📊 View your results below</p>
              <p className="text-yellow-200/60 text-xs mt-1">Contact the admin if you need another attempt.</p>
            </div>
            <button onClick={() => setExamStatus(null)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition">
              View Dashboard
            </button>
          </div>
        </div>
      )}

      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl shadow shadow-blue-600/40">🎓</div>
            <div>
              <span className="text-white font-bold text-lg">LuckyTech Academy</span>
              <div className="text-blue-400 text-xs">Online Exam Portal</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/60 text-sm hidden sm:block">Hi, {user?.name}</span>
            <button onClick={() => { logout(); navigate("/login"); }}
              className="text-sm text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-400/60 px-3 py-1.5 rounded-lg transition">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border border-blue-500/30 rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg">👋</div>
            <div>
              <h2 className="text-2xl font-bold text-white">Welcome, {user?.name}!</h2>
              <p className="text-blue-300 text-sm mt-0.5">Ready to test your knowledge today?</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${LEVEL_COLORS[user?.education]}`}>
                  {user?.education} • {LEVEL_LABELS[user?.education]}
                </span>
                <span className="text-xs text-white/40">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: "📝", label: "Exams Taken", value: stats?.total_exams ?? "—" },
            { icon: "🏆", label: "Best Score", value: stats?.total_exams > 0 ? `${stats.best_score}/${examCount}` : "—" },
            { icon: "📊", label: "Avg Score", value: stats?.total_exams > 0 ? `${stats.avg_score}%` : "—" },
            { icon: "✅", label: "Pass Rate", value: stats?.total_exams > 0 ? `${Math.round(stats.pass_count / stats.total_exams * 100)}%` : "—" },
          ].map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-white/50 text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {/* Exam Card */}
          <div className={`border rounded-2xl p-6 transition group ${
            examStatus === "taken" ? "bg-yellow-500/10 border-yellow-500/30 cursor-not-allowed" :
            examStatus === "disabled" ? "bg-red-500/10 border-red-500/30 cursor-not-allowed" :
            "bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border-blue-500/30 hover:border-blue-400/50 cursor-pointer"
          }`} onClick={handleStartExam}>
            <div className="text-4xl mb-4">
              {examStatus === "taken" ? "🔒" : examStatus === "disabled" ? "🚫" : "🚀"}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {examStatus === "taken" ? "Exam Completed" : examStatus === "disabled" ? "Account Disabled" : "Start Exam"}
            </h3>
            <p className="text-blue-300/80 text-sm mb-4">
              {examStatus === "taken" ? "You have already taken the exam. Contact admin for reset." :
               examStatus === "disabled" ? "Your account is disabled. Please contact admin." :
               `${examCount} questions • ${LEVEL_LABELS[user?.education]} level • One attempt only`}
            </p>
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-full">{examCount} Questions</span>
              <span className={`text-xs px-2.5 py-1 rounded-full border ${LEVEL_COLORS[user?.education]}`}>{LEVEL_LABELS[user?.education]}</span>
              {examStatus === "taken" && <span className="text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2.5 py-1 rounded-full">✓ Completed</span>}
            </div>
            <button disabled={examStatus === "taken" || examStatus === "disabled"}
              className={`w-full font-semibold py-2.5 rounded-xl transition text-sm ${
                examStatus === "taken" ? "bg-yellow-500/20 text-yellow-300 cursor-not-allowed" :
                examStatus === "disabled" ? "bg-red-500/20 text-red-300 cursor-not-allowed" :
                "bg-blue-600 hover:bg-blue-500 text-white"
              }`}>
              {examStatus === "taken" ? "Already Submitted ✓" : examStatus === "disabled" ? "Contact Admin" : "Begin Exam →"}
            </button>
          </div>

          {/* Results Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition cursor-pointer group" onClick={() => navigate("/results")}>
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-bold text-white mb-2">View Results</h3>
            <p className="text-white/50 text-sm mb-4">Check your exam history and performance analysis.</p>
            <div className="bg-white/5 rounded-xl p-3 mb-4">
              {stats?.total_exams > 0 ? (
                <>
                  <div className="text-xs text-white/40 mb-1">Performance</div>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">{stats.best_score}/{examCount} Best</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${stats.pass_count > 0 ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
                      {stats.pass_count} Passed
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center text-white/30 text-sm">No exams taken yet</div>
              )}
            </div>
            <button className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 rounded-xl transition text-sm border border-white/10">
              View All Results →
            </button>
          </div>
        </div>

        {/* Rules */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">📋 Exam Rules</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-white/60">
            {[
              `${examCount} random questions from database`,
              "60-minute timer — auto-submits on timeout",
              "One attempt only per student",
              "Admin must enable account to take exam",
              "Questions match your education level",
              "Results saved immediately after submit",
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">•</span>{rule}</li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
