import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";

function ScoreBadge({ score }) {
  if (score >= 90) return <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Excellent</span>;
  if (score >= 75) return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">Good</span>;
  if (score >= 60) return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">Pass</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">Fail</span>;
}

function formatDuration(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
}

function formatDate(dt) {
  return new Date(dt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ── Google Translate FREE, UNLIMITED ─────────────────────────────────────────
async function googleTranslate(texts, from, to) {
  const SEP = "\n||||\n";
  const joined = texts.join(SEP);
  const url =
    `https://translate.googleapis.com/translate_a/single` +
    `?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(joined)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Google Translate failed");
  const data = await res.json();
  const translatedJoined = (data[0] || []).map(s => s[0] || "").join("");
  return translatedJoined.split(SEP);
}

// ── Detail Modal — Hindi/English toggle ──────────────────────────────────────
function DetailModal({ sessionId, onClose }) {
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(0);
  const [showHindi,   setShowHindi]   = useState(false);
  const [translated,  setTranslated]  = useState(null);  // { idx: {q, opts} }
  const [translating, setTranslating] = useState(false);
  const perPage = 10;

  useEffect(() => {
    API.get(`/results/${sessionId}`)
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [sessionId]);

  // Translate all questions in this result
  const handleTranslate = useCallback(async (qs) => {
    if (translated) {
      setShowHindi(prev => !prev);
      return;
    }
    setTranslating(true);
    try {
      const allQTexts  = qs.map(q => q.question);
      const allOptTexts = qs.flatMap(q => q.options || []);
      const [translatedQs, translatedOpts] = await Promise.all([
        googleTranslate(allQTexts,  "en", "hi"),
        googleTranslate(allOptTexts,"en", "hi"),
      ]);
      const map = {};
      let optIdx = 0;
      qs.forEach((q, i) => {
        const optsCount = (q.options || []).length;
        map[i] = {
          q:    translatedQs[i] || q.question,
          opts: translatedOpts.slice(optIdx, optIdx + optsCount),
        };
        optIdx += optsCount;
      });
      setTranslated(map);
      setShowHindi(true);
    } catch (err) {
      console.error("Translation error:", err);
    }
    setTranslating(false);
  }, [translated]);

  if (loading) return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-white text-center"><div className="text-4xl mb-3 animate-spin">⏳</div><p>Loading review...</p></div>
    </div>
  );
  if (!data) return null;

  const qs      = data.questions || [];
  const pages   = Math.ceil(qs.length / perPage);
  const current = qs.slice(page * perPage, (page + 1) * perPage);

  // Get display version — original or hindi
  const getDisplayQ = (q, globalIdx) => {
    if (!showHindi || !translated || !translated[globalIdx]) return q;
    return { ...q, question: translated[globalIdx].q, options: translated[globalIdx].opts };
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6">
      <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold text-lg">Detailed Review</h3>
            <button onClick={onClose} className="text-white/50 hover:text-white text-2xl transition leading-none">×</button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-white/40 text-xs">{formatDate(data.session.started_at)} • Score: {data.session.score}/{data.session.total_qs}</p>
            {/* EN / HI toggle */}
            <div className="flex items-center bg-white/10 border border-white/20 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowHindi(false)}
                className={`px-3 py-1.5 text-xs font-bold transition ${!showHindi ? "bg-blue-600 text-white" : "text-white/50 hover:text-white"}`}>
                🇬🇧 EN
              </button>
              <button
                onClick={() => handleTranslate(qs)}
                disabled={translating}
                className={`px-3 py-1.5 text-xs font-bold transition ${showHindi ? "bg-orange-500 text-white" : "text-white/50 hover:text-white"} ${translating ? "opacity-50 cursor-wait" : ""}`}>
                {translating ? "⏳..." : "🇮🇳 HI"}
              </button>
            </div>
          </div>
        </div>

        {/* Questions list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {current.map((q) => {
            const globalIdx  = page * perPage + current.indexOf(q);
            const displayQ   = getDisplayQ(q, globalIdx);
            const correct    = q.isCorrect;
            const notAnswered = q.selected === null || q.selected === undefined;
            return (
              <div key={q.idx} className={`rounded-xl border p-4 text-sm ${correct ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}>
                <div className="flex items-start gap-2 mb-2">
                  <span className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${correct ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                    {correct ? "✓" : "✗"}
                  </span>
                  <div>
                    <span className="text-white/40 text-xs">Q{q.idx + 1} • {q.subject}</span>
                    <p className="text-white/90 mt-0.5">{displayQ.question}</p>
                  </div>
                </div>
                <div className="ml-7 space-y-1">
                  {(displayQ.options || []).map((opt, i) => (
                    <div key={i} className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-2
                      ${i === q.answer ? "bg-green-500/20 border-green-500/40 text-green-300"
                        : i === q.selected && !correct ? "bg-red-500/20 border-red-500/40 text-red-300"
                        : "border-white/5 text-white/40"}`}>
                      <span className={`w-4 h-4 rounded flex items-center justify-center text-xs font-bold
                        ${i === q.answer ? "bg-green-500 text-white" : i === q.selected && !correct ? "bg-red-500 text-white" : "bg-white/10 text-white/30"}`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                      {i === q.answer && <span className="ml-auto">✓ Correct</span>}
                      {i === q.selected && !correct && <span className="ml-auto">Your answer</span>}
                    </div>
                  ))}
                  {notAnswered && <div className="text-xs text-yellow-400 mt-1">⚠ Not answered</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-6 py-3 border-t border-white/10 flex items-center justify-between">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="text-sm text-white/60 hover:text-white disabled:opacity-30 transition px-3 py-1.5 rounded-lg bg-white/5">← Prev</button>
            <span className="text-white/40 text-xs">Page {page + 1} of {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page === pages - 1}
              className="text-sm text-white/60 hover:text-white disabled:opacity-30 transition px-3 py-1.5 rounded-lg bg-white/5">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Results Page ─────────────────────────────────────────────────────────
export default function Results() {
  const navigate = useNavigate();
  const [results, setResults]   = useState([]);
  const [stats,   setStats]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [selected,setSelected]  = useState(null);

  useEffect(() => {
    Promise.all([API.get("/results"), API.get("/results/stats/me")])
      .then(([rRes, sRes]) => { setResults(rRes.data.results); setStats(sRes.data.stats); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
      <div className="text-center"><div className="text-5xl mb-4 animate-spin">⏳</div><p className="text-white">Loading results...</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="text-white/60 hover:text-white transition text-sm flex items-center gap-1">← Dashboard</button>
            <span className="text-white/20">|</span>
            <span className="text-white font-semibold">My Results</span>
          </div>
          <button onClick={() => navigate("/exam")} className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg transition">New Exam</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Exams",  value: stats?.total_exams || 0,                                                          icon: "📝" },
            { label: "Best Score",   value: stats?.total_exams > 0 ? `${stats.best_score}/100`                        : "—", icon: "🏆" },
            { label: "Average",      value: stats?.total_exams > 0 ? `${stats.avg_score}%`                            : "—", icon: "📊" },
            { label: "Pass Rate",    value: stats?.total_exams > 0 ? `${Math.round(stats.pass_count / stats.total_exams * 100)}%` : "—", icon: "✅" },
          ].map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-white/40 text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {results.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-white text-xl font-semibold mb-2">No results yet</h3>
            <p className="text-white/50 text-sm mb-6">Take your first exam to see results here.</p>
            <button onClick={() => navigate("/exam")} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition">Start First Exam</button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-4">Exam History ({results.length} exams)</h3>
            {results.map((result) => {
              const pct    = Math.round((result.score / result.total_qs) * 100);
              const passed = result.score >= 60;
              return (
                <div key={result.id} className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-5 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex-shrink-0 flex flex-col items-center justify-center border-2 ${passed ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"}`}>
                      <span className={`text-xl font-bold ${passed ? "text-green-400" : "text-red-400"}`}>{result.score}</span>
                      <span className="text-white/40 text-xs">/{result.total_qs}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-white font-semibold">{formatDate(result.started_at)}</span>
                        <ScoreBadge score={result.score} />
                        <span className="text-xs text-white/30">{result.education}</span>
                        {result.status === "timed_out" && <span className="text-xs text-orange-400 border border-orange-400/30 px-2 py-0.5 rounded-full">Timed Out</span>}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-white/50 mb-2">
                        <span>⏱ {formatDuration(result.time_taken || 0)}</span>
                        <span>✅ {result.score} correct</span>
                        <span>❌ {result.total_qs - result.score} wrong</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full transition-all ${passed ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <button onClick={() => setSelected(result.id)}
                      className="text-sm bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition border border-white/10 flex-shrink-0">
                      Review →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selected && <DetailModal sessionId={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
