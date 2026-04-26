 















// import { useState, useEffect, useRef, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import API from "../api";

// const EXAM_DURATION = 60 * 60;
// const PER_PAGE = 10;

// // ── UI + Page Translations ────────────────────────────────────────────────────
// const T = {
//   en: {
//     title:"LuckyTech Academy — Live Exam", level:"Level", page:"Page",
//     saved:"Saved", progress:"PROGRESS", left:"Left", completion:"Completion",
//     pages:"PAGES", submitExam:"Submit Exam ✓", savePage:"💾 Save Page",
//     prev:"← Prev", saveNext:"Save & Next →", totalQuestions:"Total Questions",
//     savedAnswers:"Saved Answers", unanswered:"Unanswered", submitQ:"Submit Exam?",
//     continueBtn:"Continue", submitNow:"Submit Now ✓", submitting:"Saving...",
//     loading:"Loading your exam...", loadingDesc:"Fetching questions from database",
//     failedLoad:"Failed to Load Exam", backDash:"← Back to Dashboard",
//     unansweredWarn:"unanswered questions will be marked wrong.",
//     questions:"Questions", of:"of",
//     langBox:"🌐 Question Language",
//     translateBtn:"🇮🇳 Hindi में देखें",
//     translating:"Translating all questions...",
//     showOriginal:"🇬🇧 Show English",
//     translateNote:"AI translates questions & options to Hindi. Answers stay same.",
//     translateDone:"questions translated ✅",
//     translateErr:"Translation failed. Please try again.",
//   },
//   hi: {
//     title:"LuckyTech Academy — लाइव परीक्षा", level:"स्तर", page:"पृष्ठ",
//     saved:"सहेजा", progress:"प्रगति", left:"शेष", completion:"पूर्णता",
//     pages:"पृष्ठ", submitExam:"परीक्षा जमा करें ✓", savePage:"💾 पृष्ठ सहेजें",
//     prev:"← पिछला", saveNext:"सहेजें & अगला →", totalQuestions:"कुल प्रश्न",
//     savedAnswers:"सहेजे उत्तर", unanswered:"अनुत्तरित", submitQ:"परीक्षा जमा करें?",
//     continueBtn:"जारी रखें", submitNow:"अभी जमा करें ✓", submitting:"सहेज रहे हैं...",
//     loading:"परीक्षा लोड हो रही है...", loadingDesc:"डेटाबेस से प्रश्न प्राप्त हो रहे हैं",
//     failedLoad:"परीक्षा लोड नहीं हुई", backDash:"← डैशबोर्ड पर जाएं",
//     unansweredWarn:"अनुत्तरित प्रश्न गलत माने जाएंगे।",
//     questions:"प्रश्न", of:"में से",
//     langBox:"🌐 प्रश्न भाषा",
//     translateBtn:"🇮🇳 Hindi में देखें",
//     translating:"सभी प्रश्न अनुवाद हो रहे हैं...",
//     showOriginal:"🇬🇧 English दिखाएं",
//     translateNote:"AI सभी प्रश्न व विकल्प हिंदी में बदलता है।",
//     translateDone:"प्रश्न अनुवादित ✅",
//     translateErr:"अनुवाद विफल। पुनः प्रयास करें।",
//   },
// };

// export default function Exam() {

// // ====================================================================
// //   copy disabeld
// //===================================================================
// useEffect(() => {
//     // 1. Disable Right-Click (Prevents "Copy" and "Inspect" via menu)
//     const handleContextMenu = (e) => e.preventDefault();

//     // 2. Disable Keyboard Shortcuts (Ctrl+C, Ctrl+U, Ctrl+Shift+I)
//     const handleKeyDown = (e) => {
//       if (
//         (e.ctrlKey && (e.key === 'c' || e.key === 'u' || e.key === 's')) || 
//         e.keyCode === 123 || // F12
//         (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J'))
//       ) {
//         e.preventDefault();
//       }
//     };

//     document.addEventListener('contextmenu', handleContextMenu);
//     document.addEventListener('keydown', handleKeyDown);

//     return () => {
//       document.removeEventListener('contextmenu', handleContextMenu);
//       document.removeEventListener('keydown', handleKeyDown);
//     };
//   }, []);

//   //=================================================================
//   // tab switch 
//   //==============================================================
  

//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [lang,   setLang]   = useState("en");
//   const t = T[lang];

//   // ── Exam state ────────────────────────────────────────────────────────────
//   const [questions,     setQuestions]     = useState([]);
//   const [loadError,     setLoadError]     = useState("");
//   const [loadingQs,     setLoadingQs]     = useState(true);
//   const [answers,       setAnswers]       = useState({});
//   const [draft,         setDraft]         = useState({});
//   const [savedSet,      setSavedSet]      = useState({});
//   const [page,          setPage]          = useState(0);
//   const [timeLeft,      setTimeLeft]      = useState(EXAM_DURATION);
//   const [confirmSubmit, setConfirmSubmit] = useState(false);
//   const [submitting,    setSubmitting]    = useState(false);

//   // ── Translation state ─────────────────────────────────────────────────────
//   const [showHindi,    setShowHindi]    = useState(false);
//   const [translated,   setTranslated]   = useState(null);   // map: { idx: {q, opts} }
//   const [translating,  setTranslating]  = useState(false);
//   const [translateErr, setTranslateErr] = useState("");

//   const submittedRef  = useRef(false);
//   const answersRef    = useRef({});
//   const questionsRef  = useRef([]);
//   const sessionIdRef  = useRef(null);
//   const navigateRef   = useRef(navigate);
//   const examStarted   = useRef(Date.now());

//   useEffect(() => { answersRef.current  = answers;    }, [answers]);
//   useEffect(() => { navigateRef.current = navigate; }, [navigate]);

//   // Load questions + start session
//   useEffect(() => {
//     (async () => {
//       try {
//         const [qRes, sRes] = await Promise.all([
//           API.get("/exam/questions"),
//           API.post("/exam/start"),
//         ]);
//         setQuestions(qRes.data.questions);
//         questionsRef.current = qRes.data.questions;
//         sessionIdRef.current = sRes.data.sessionId;
//         setLoadingQs(false);
//       } catch (err) {
//         setLoadError(err.response?.data?.message || "Failed to load exam.");
//         setLoadingQs(false);
//       }
//     })();
//   }, []);

//   const totalPages = Math.ceil(questions.length / PER_PAGE);
//   const pageStart  = page * PER_PAGE;
//   const pageEnd    = Math.min(pageStart + PER_PAGE, questions.length);
//   const pageQs     = questions.slice(pageStart, pageEnd);

//   // Pre-fill draft on page change
//   useEffect(() => {
//     const prefill = {};
//     for (let i = pageStart; i < pageEnd; i++) {
//       if (answersRef.current[i] !== undefined) prefill[i] = answersRef.current[i];
//     }
//     setDraft(prefill);
//   // eslint-disable-next-line
//   }, [page]);

//   // Submit handler (ref so timer can call it)
//   const doSubmit = useRef(async (timeTaken) => {
//     if (submittedRef.current) return;
//     submittedRef.current = true;
//     try {
//       await API.post("/exam/submit", {
//         sessionId: sessionIdRef.current,
//         answers:   answersRef.current,
//         questions: questionsRef.current,
//         timeTaken: timeTaken ?? Math.floor((Date.now() - examStarted.current) / 1000),
//       });
//     } catch (err) { console.error("Submit error:", err); }
//     setTimeout(() => navigateRef.current("/results"), 100);
//   });

//   // Countdown timer
//   useEffect(() => {
//     if (loadingQs) return;
//     const timer = setInterval(() => {
//       if (submittedRef.current) { clearInterval(timer); return; }
//       setTimeLeft(prev => {
//         if (prev <= 1) { clearInterval(timer); doSubmit.current(3600); return 0; }
//         return prev - 1;
//       });
//     }, 1000);
//     return () => clearInterval(timer);
//   }, [loadingQs]);

//   const handleSave = () => {
//     const merged = { ...answers, ...draft };
//     setAnswers(merged);
//     answersRef.current = merged;
//     const ns = { ...savedSet };
//     for (let i = pageStart; i < pageEnd; i++) {
//       if (draft[i] !== undefined) ns[i] = true;
//     }
//     setSavedSet(ns);
//   };

//   const handleSubmit = async () => {
//     setSubmitting(true);
//     const merged = { ...answers, ...draft };
//     setAnswers(merged);
//     answersRef.current = merged;
//     await doSubmit.current(Math.floor((Date.now() - examStarted.current) / 1000));
//   };

//   const formatTime = s => {
//     const m   = Math.floor(s / 60).toString().padStart(2, "0");
//     const sec = (s % 60).toString().padStart(2, "0");
//     return `${m}:${sec}`;
//   };

//   const getPageStats = pIdx => {
//     const ps = pIdx * PER_PAGE;
//     const pe = Math.min(ps + PER_PAGE, questions.length);
//     const sv = Array.from({ length: pe - ps }, (_, k) => ps + k)
//       .filter(i => answers[i] !== undefined).length;
//     return { saved: sv, total: pe - ps };
//   };

//   // ── ONE button: translate ALL questions via backend ───────────────────────
//   const handleTranslate = useCallback(async () => {
//     // Already translated — just toggle
//     if (translated) {
//       const next = !showHindi;
//       setShowHindi(next);
//       setLang(next ? "hi" : "en");
//       return;
//     }
//     // First time — call backend /api/exam/translate
//     setTranslating(true);
//     setTranslateErr("");
//     try {
//       const res = await API.post("/exam/translate", { questions });
//       const map = {};
//       res.data.translated.forEach(r => {
//         map[r.i] = { q: r.q, opts: r.opts };
//       });
//       setTranslated(map);
//       setShowHindi(true);
//       setLang("hi");
//     } catch (err) {
//       console.error("Translation error:", err);
//       setTranslateErr(err.response?.data?.message || t.translateErr);
//     }
//     setTranslating(false);
//   }, [questions, translated, showHindi, t.translateErr]);

//   // Return display version of question (original or hindi)
//   const getDisplayQ = (globalIdx, q) => {
//     if (!showHindi || !translated || !translated[globalIdx]) return q;
//     return { ...q, question: translated[globalIdx].q, options: translated[globalIdx].opts };
//   };

//   const totalAnswered  = Object.keys(answers).length;
//   const totalRemaining = questions.length - totalAnswered;
//   const timerColor = timeLeft < 300 ? "text-red-400" : timeLeft < 600 ? "text-yellow-400" : "text-green-400";
//   const timerBg    = timeLeft < 300 ? "bg-red-500"   : timeLeft < 600 ? "bg-yellow-500"   : "bg-green-500";

//   // ── Loading screen ────────────────────────────────────────────────────────
//   if (loadingQs) return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
//       <div className="text-center">
//         <div className="text-5xl mb-4 animate-bounce">⏳</div>
//         <p className="text-white text-lg font-semibold">{t.loading}</p>
//         <p className="text-blue-300 text-sm mt-2">{t.loadingDesc}</p>
//       </div>
//     </div>
//   );

//   // ── Error screen ──────────────────────────────────────────────────────────
//   if (loadError) return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4">
//       <div className="text-center max-w-md">
//         <div className="text-5xl mb-4">❌</div>
//         <h2 className="text-white text-xl font-bold mb-2">{t.failedLoad}</h2>
//         <p className="text-red-300 text-sm mb-6 bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-xl">{loadError}</p>
//         <button onClick={() => navigate("/dashboard")}
//           className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium">
//           {t.backDash}
//         </button>
//       </div>
//     </div>
//   );

//   // ── Main Exam UI ──────────────────────────────────────────────────────────
//   return (
//     <div
//     style={{ 
//       userSelect: 'none', 
//       WebkitUserSelect: 'none', 
//       msUserSelect: 'none', 
//     }}
//      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col">

//       {/* ── HEADER ── */}
//       <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-20">
//         <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
//           <div className="flex items-center gap-3">
//             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">🎓</div>
//             <div>
//               <div className="text-white font-semibold text-sm">{t.title}</div>
//               <div className="text-white/40 text-xs">
//                 {user?.education} {t.level} • {t.page} {page + 1}/{totalPages}
//                 {showHindi && <span className="ml-1 text-orange-400">• हिंदी</span>}
//               </div>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             {/* EN/HI toggle — switches UI labels only */}
//             <div className="flex items-center bg-white/10 border border-white/20 rounded-xl overflow-hidden">
//               <button
//                 onClick={() => { setLang("en"); setShowHindi(false); }}
//                 className={`px-2.5 py-1.5 text-xs font-semibold transition ${lang === "en" ? "bg-blue-600 text-white" : "text-white/50 hover:text-white"}`}>
//                 🇬🇧 EN
//               </button>
//               <button
//                 onClick={() => setLang("hi")}
//                 className={`px-2.5 py-1.5 text-xs font-semibold transition ${lang === "hi" ? "bg-orange-600 text-white" : "text-white/50 hover:text-white"}`}>
//                 🇮🇳 HI
//               </button>
//             </div>
//             <div className="text-center hidden sm:block">
//               <div className="text-white/50 text-xs">{t.saved}</div>
//               <div className="text-white font-bold text-sm">{totalAnswered}/{questions.length}</div>
//             </div>
//             <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${timeLeft < 300 ? "border-red-500/40 bg-red-500/10" : "border-white/10 bg-white/5"}`}>
//               <span>⏱</span>
//               <span className={`font-mono font-bold text-xl ${timerColor}`}>{formatTime(timeLeft)}</span>
//             </div>
//           </div>
//         </div>
//         <div className="h-1 bg-white/10">
//           <div className={`h-1 ${timerBg} transition-all duration-1000`}
//             style={{ width: `${(timeLeft / EXAM_DURATION) * 100}%` }} />
//         </div>
//       </header>

//       {/* ── BODY ── */}
//       <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 flex flex-col lg:flex-row gap-6">

//         {/* ── SIDEBAR ── */}
//         <aside className="lg:w-64 order-2 lg:order-1">
//           <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sticky top-24 space-y-4">

//             {/* ══ TRANSLATE SECTION — ONE button for everything ══ */}
//             <div className="border border-orange-500/30 bg-orange-500/5 rounded-xl p-3">
//               <p className="text-orange-200 text-xs font-semibold mb-2">{t.langBox}</p>

//               <button
//                 onClick={handleTranslate}
//                 disabled={translating}
//                 className={`w-full py-2.5 px-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2
//                   ${translating
//                     ? "bg-orange-500/20 text-orange-300/50 cursor-wait"
//                     : showHindi
//                       ? "bg-blue-600 hover:bg-blue-500 text-white"
//                       : "bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20"
//                   }`}>
//                 {translating
//                   ? <><span className="animate-spin inline-block">⏳</span><span>{t.translating}</span></>
//                   : showHindi
//                     ? t.showOriginal
//                     : t.translateBtn
//                 }
//               </button>

//               {/* Status messages */}
//               {translating && (
//                 <div className="mt-2 bg-orange-500/10 rounded-lg px-3 py-2">
//                   <p className="text-orange-300/80 text-xs text-center">
//                     🌐 Translating {questions.length} questions...
//                   </p>
//                   <div className="w-full bg-white/10 rounded-full h-1 mt-1.5">
//                     <div className="bg-orange-400 h-1 rounded-full animate-pulse w-3/4" />
//                   </div>
//                 </div>
//               )}
//               {translated && !translating && (
//                 <p className="text-green-400/80 text-xs mt-2 text-center">
//                   ✅ {questions.length} {t.translateDone}
//                 </p>
//               )}
//               {translateErr && !translating && (
//                 <p className="text-red-400 text-xs mt-2 text-center">{translateErr}</p>
//               )}
//               <p className="text-white/20 text-xs mt-2 text-center leading-tight">{t.translateNote}</p>
//             </div>

//             {/* Progress */}
//             <div>
//               <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">{t.progress}</h4>
//               <div className="grid grid-cols-2 gap-2 mb-3">
//                 <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
//                   <div className="text-2xl font-bold text-green-400">{totalAnswered}</div>
//                   <div className="text-xs text-green-300/70">{t.saved}</div>
//                 </div>
//                 <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-center">
//                   <div className="text-2xl font-bold text-orange-400">{totalRemaining}</div>
//                   <div className="text-xs text-orange-300/70">{t.left}</div>
//                 </div>
//               </div>
//               <div>
//                 <div className="flex justify-between text-xs text-white/40 mb-1">
//                   <span>{t.completion}</span>
//                   <span>{Math.round((totalAnswered / Math.max(questions.length, 1)) * 100)}%</span>
//                 </div>
//                 <div className="w-full bg-white/10 rounded-full h-2">
//                   <div className="bg-green-500 h-2 rounded-full transition-all duration-500"
//                     style={{ width: `${(totalAnswered / Math.max(questions.length, 1)) * 100}%` }} />
//                 </div>
//               </div>
//             </div>

//             {/* Pages */}
//             <div>
//               <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">{t.pages}</h4>
//               <div className="space-y-1 max-h-48 overflow-y-auto">
//                 {Array.from({ length: totalPages }).map((_, pIdx) => {
//                   const { saved: s, total: tot } = getPageStats(pIdx);
//                   const isCurr = pIdx === page;
//                   return (
//                     <button key={pIdx} onClick={() => { handleSave(); setPage(pIdx); }}
//                       className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition font-medium
//                         ${isCurr    ? "bg-blue-600/40 border border-blue-500/60 text-white"
//                         : s === tot ? "bg-green-500/10 border border-green-500/20 text-green-300"
//                         : s > 0     ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-300"
//                         : "bg-white/5 border border-white/10 text-white/40 hover:bg-white/10"}`}>
//                       <span>{t.page} {pIdx + 1}</span>
//                       <span className={`px-1.5 py-0.5 rounded text-xs
//                         ${s === tot ? "bg-green-500/30 text-green-300" : s > 0 ? "bg-yellow-500/30 text-yellow-300" : "bg-white/10 text-white/30"}`}>
//                         {s}/{tot}
//                       </span>
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Submit */}
//             <button onClick={() => setConfirmSubmit(true)} disabled={submitting}
//               className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-green-600/20">
//               {submitting ? t.submitting : t.submitExam}
//             </button>
//           </div>
//         </aside>

//         {/* ── QUESTIONS ── */}
//         <main className="flex-1 order-1 lg:order-2">
//           <div className="flex items-center justify-between mb-5">
//             <div>
//               <h2 className="text-white font-bold text-lg">
//                 {t.page} {page + 1}
//                 <span className="text-white/40 font-normal text-base"> / {totalPages}</span>
//               </h2>
//               <p className="text-white/40 text-xs">
//                 {t.questions} {pageStart + 1} – {pageEnd} {t.of} {questions.length}
//                 {showHindi && translated && <span className="ml-2 text-orange-400">• हिंदी में</span>}
//               </p>
//             </div>
//             <button onClick={handleSave}
//               className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-600/20">
//               {t.savePage}
//             </button>
//           </div>

//           {/* Translating banner */}
//           {translating && (
//             <div className="mb-4 bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
//               <span className="text-2xl animate-spin">🌐</span>
//               <div>
//                 <p className="text-orange-300 text-sm font-semibold">AI अनुवाद कर रहा है...</p>
//                 <p className="text-orange-200/60 text-xs">Backend translating all {questions.length} questions via Claude AI — please wait ~10 seconds</p>
//               </div>
//             </div>
//           )}

//           {/* Question cards */}
//           <div className="space-y-4">
//             {pageQs.map((q, localIdx) => {
//               const globalIdx = pageStart + localIdx;
//               const displayQ  = getDisplayQ(globalIdx, q);
//               const selected  = draft[globalIdx];
//               const isSaved   = savedSet[globalIdx] && answers[globalIdx] !== undefined;

//               return (
//                 <div key={q.id} className={`rounded-2xl border p-5 transition-all duration-200
//                   ${isSaved ? "bg-green-500/5 border-green-500/30" : "bg-white/5 border-white/10"}`}>
//                   <div className="flex items-center justify-between mb-3">
//                     <div className="flex items-center gap-2">
//                       <span className="text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-full">
//                         Q{globalIdx + 1}
//                       </span>
//                       <span className="text-xs text-white/30 hidden sm:block">{q.subject}</span>
//                       {showHindi && translated && translated[globalIdx] && (
//                         <span className="text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30 px-1.5 py-0.5 rounded-full">हिंदी</span>
//                       )}
//                     </div>
//                     {isSaved && (
//                       <span className="text-xs bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-0.5 rounded-full">
//                         ✓ {t.saved}
//                       </span>
//                     )}
//                   </div>

//                   {/* Question text — original or hindi */}
//                   <p className="text-white text-sm font-medium leading-relaxed mb-4">{displayQ.question}</p>

//                   {/* Options — original or hindi */}
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                     {displayQ.options.map((opt, optIdx) => (
//                       <button key={optIdx}
//                         onClick={() => setDraft(prev => ({ ...prev, [globalIdx]: optIdx }))}
//                         className={`text-left px-3 py-2.5 rounded-xl border text-sm transition-all flex items-start gap-2
//                           ${selected === optIdx
//                             ? "bg-blue-600/30 border-blue-400 text-white shadow shadow-blue-600/10"
//                             : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20"}`}>
//                         <span className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center text-xs font-bold border mt-0.5
//                           ${selected === optIdx ? "bg-blue-500 border-blue-400 text-white" : "bg-white/10 border-white/20 text-white/40"}`}>
//                           {String.fromCharCode(65 + optIdx)}
//                         </span>
//                         <span className="leading-snug">{opt}</span>
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Navigation */}
//           <div className="mt-6 flex items-center justify-between gap-3">
//             <button onClick={() => { handleSave(); setPage(p => Math.max(0, p - 1)); }} disabled={page === 0}
//               className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-xl text-sm font-medium transition border border-white/10">
//               {t.prev}
//             </button>
//             <div className="flex items-center gap-1.5">
//               {Array.from({ length: totalPages }).map((_, pIdx) => {
//                 const { saved: s, total: tot } = getPageStats(pIdx);
//                 return (
//                   <button key={pIdx} onClick={() => { handleSave(); setPage(pIdx); }}
//                     className={`rounded-full transition-all duration-200
//                       ${pIdx === page ? "w-6 h-2.5 bg-blue-400"
//                       : s === tot    ? "w-2.5 h-2.5 bg-green-500"
//                       : s > 0        ? "w-2.5 h-2.5 bg-yellow-500"
//                       : "w-2.5 h-2.5 bg-white/20"}`} />
//                 );
//               })}
//             </div>
//             {page < totalPages - 1 ? (
//               <button onClick={() => { handleSave(); setPage(p => p + 1); }}
//                 className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-600/20">
//                 {t.saveNext}
//               </button>
//             ) : (
//               <button onClick={() => { handleSave(); setConfirmSubmit(true); }}
//                 className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-green-600/20">
//                 {t.submitExam}
//               </button>
//             )}
//           </div>
//         </main>
//       </div>

//       {/* ── CONFIRM SUBMIT MODAL ── */}
//       {confirmSubmit && (
//         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
//           <div className="bg-slate-900 border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
//             <div className="text-4xl mb-3">📋</div>
//             <h3 className="text-white font-bold text-xl mb-3">{t.submitQ}</h3>
//             <div className="bg-white/5 rounded-xl p-4 mb-4 space-y-2.5">
//               {[
//                 [t.totalQuestions, questions.length,  "text-white"],
//                 [t.savedAnswers,   totalAnswered,     "text-green-400"],
//                 [t.unanswered,     totalRemaining,    totalRemaining > 0 ? "text-red-400" : "text-green-400"],
//               ].map(([label, val, color]) => (
//                 <div key={label} className="flex justify-between text-sm">
//                   <span className="text-white/50">{label}</span>
//                   <span className={`font-semibold ${color}`}>{val}</span>
//                 </div>
//               ))}
//             </div>
//             {totalRemaining > 0 && (
//               <p className="text-yellow-400 text-xs mb-4 flex items-start gap-1.5">
//                 <span>⚠</span><span>{totalRemaining} {t.unansweredWarn}</span>
//               </p>
//             )}
//             <div className="flex gap-3">
//               <button onClick={() => setConfirmSubmit(false)}
//                 className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl text-sm font-medium transition border border-white/10">
//                 {t.continueBtn}
//               </button>
//               <button onClick={handleSubmit} disabled={submitting}
//                 className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-green-600/20">
//                 {submitting ? t.submitting : t.submitNow}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }





















import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";

const EXAM_DURATION = 60 * 60;
const PER_PAGE = 10;

// ── UI + Page Translations ────────────────────────────────────────────────────
const T = {
  en: {
    title:"LuckyTech Academy — Live Exam", level:"Level", page:"Page",
    saved:"Saved", progress:"PROGRESS", left:"Left", completion:"Completion",
    pages:"PAGES", submitExam:"Submit Exam ✓", savePage:"💾 Save Page",
    prev:"← Prev", saveNext:"Save & Next →", totalQuestions:"Total Questions",
    savedAnswers:"Saved Answers", unanswered:"Unanswered", submitQ:"Submit Exam?",
    continueBtn:"Continue", submitNow:"Submit Now ✓", submitting:"Saving...",
    loading:"Loading your exam...", loadingDesc:"Fetching questions from database",
    failedLoad:"Failed to Load Exam", backDash:"← Back to Dashboard",
    unansweredWarn:"unanswered questions will be marked wrong.",
    questions:"Questions", of:"of",
    langBox:"🌐 Question Language",
    translateBtn:"🇮🇳 Hindi में देखें",
    translating:"Translating all questions...",
    showOriginal:"🇬🇧 Show English",
    translateNote:"MyMemory Free API translates questions & options to Hindi. Answers stay same.",
    translateDone:"questions translated ✅",
    translateErr:"Translation failed. Please try again.",
  },
  hi: {
    title:"LuckyTech Academy — लाइव परीक्षा", level:"स्तर", page:"पृष्ठ",
    saved:"सहेजा", progress:"प्रगति", left:"शेष", completion:"पूर्णता",
    pages:"पृष्ठ", submitExam:"परीक्षा जमा करें ✓", savePage:"💾 पृष्ठ सहेजें",
    prev:"← पिछला", saveNext:"सहेजें & अगला →", totalQuestions:"कुल प्रश्न",
    savedAnswers:"सहेजे उत्तर", unanswered:"अनुत्तरित", submitQ:"परीक्षा जमा करें?",
    continueBtn:"जारी रखें", submitNow:"अभी जमा करें ✓", submitting:"सहेज रहे हैं...",
    loading:"परीक्षा लोड हो रही है...", loadingDesc:"डेटाबेस से प्रश्न प्राप्त हो रहे हैं",
    failedLoad:"परीक्षा लोड नहीं हुई", backDash:"← डैशबोर्ड पर जाएं",
    unansweredWarn:"अनुत्तरित प्रश्न गलत माने जाएंगे।",
    questions:"प्रश्न", of:"में से",
    langBox:"🌐 प्रश्न भाषा",
    translateBtn:"🇮🇳 Hindi में देखें",
    translating:"सभी प्रश्न अनुवाद हो रहे हैं...",
    showOriginal:"🇬🇧 English दिखाएं",
    translateNote:"MyMemory Free API सभी प्रश्न व विकल्प हिंदी में बदलता है।",
    translateDone:"प्रश्न अनुवादित ✅",
    translateErr:"अनुवाद विफल। पुनः प्रयास करें।",
  },
};

export default function Exam() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lang,   setLang]   = useState("en");
  const t = T[lang];

  // ── Exam state ────────────────────────────────────────────────────────────
  const [questions,     setQuestions]     = useState([]);
  const [loadError,     setLoadError]     = useState("");
  const [loadingQs,     setLoadingQs]     = useState(true);
  const [answers,       setAnswers]       = useState({});
  const [draft,         setDraft]         = useState({});
  const [savedSet,      setSavedSet]      = useState({});
  const [page,          setPage]          = useState(0);
  const [timeLeft,      setTimeLeft]      = useState(EXAM_DURATION);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [submitting,    setSubmitting]    = useState(false);

  // ── Translation state ─────────────────────────────────────────────────────
  const [showHindi,    setShowHindi]    = useState(false);
  const [translated,   setTranslated]   = useState(null);   // map: { idx: {q, opts} }
  const [translating,  setTranslating]  = useState(false);
  const [translateErr, setTranslateErr] = useState("");

  const submittedRef  = useRef(false);
  const answersRef    = useRef({});
  const questionsRef  = useRef([]);
  const sessionIdRef  = useRef(null);
  const navigateRef   = useRef(navigate);
  const examStarted   = useRef(Date.now());

  useEffect(() => { answersRef.current  = answers;    }, [answers]);
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);

  // Load questions + start session
  useEffect(() => {
    (async () => {
      try {
        const [qRes, sRes] = await Promise.all([
          API.get("/exam/questions"),
          API.post("/exam/start"),
        ]);
        setQuestions(qRes.data.questions);
        questionsRef.current = qRes.data.questions;
        sessionIdRef.current = sRes.data.sessionId;
        setLoadingQs(false);
      } catch (err) {
        setLoadError(err.response?.data?.message || "Failed to load exam.");
        setLoadingQs(false);
      }
    })();
  }, []);

  const totalPages = Math.ceil(questions.length / PER_PAGE);
  const pageStart  = page * PER_PAGE;
  const pageEnd    = Math.min(pageStart + PER_PAGE, questions.length);
  const pageQs     = questions.slice(pageStart, pageEnd);

  // Pre-fill draft on page change
  useEffect(() => {
    const prefill = {};
    for (let i = pageStart; i < pageEnd; i++) {
      if (answersRef.current[i] !== undefined) prefill[i] = answersRef.current[i];
    }
    setDraft(prefill);
  // eslint-disable-next-line
  }, [page]);

  // Submit handler (ref so timer can call it)
  const doSubmit = useRef(async (timeTaken) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    try {
      await API.post("/exam/submit", {
        sessionId: sessionIdRef.current,
        answers:   answersRef.current,
        questions: questionsRef.current,
        timeTaken: timeTaken ?? Math.floor((Date.now() - examStarted.current) / 1000),
      });
    } catch (err) { console.error("Submit error:", err); }
    setTimeout(() => navigateRef.current("/results"), 100);
  });

  // Countdown timer
  useEffect(() => {
    if (loadingQs) return;
    const timer = setInterval(() => {
      if (submittedRef.current) { clearInterval(timer); return; }
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); doSubmit.current(3600); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loadingQs]);

  const handleSave = () => {
    const merged = { ...answers, ...draft };
    setAnswers(merged);
    answersRef.current = merged;
    const ns = { ...savedSet };
    for (let i = pageStart; i < pageEnd; i++) {
      if (draft[i] !== undefined) ns[i] = true;
    }
    setSavedSet(ns);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const merged = { ...answers, ...draft };
    setAnswers(merged);
    answersRef.current = merged;
    await doSubmit.current(Math.floor((Date.now() - examStarted.current) / 1000));
  };

  const formatTime = s => {
    const m   = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const getPageStats = pIdx => {
    const ps = pIdx * PER_PAGE;
    const pe = Math.min(ps + PER_PAGE, questions.length);
    const sv = Array.from({ length: pe - ps }, (_, k) => ps + k)
      .filter(i => answers[i] !== undefined).length;
    return { saved: sv, total: pe - ps };
  };

  // ── Google Translate (Unofficial) — FREE, UNLIMITED, No API Key needed ────
  const googleTranslate = async (texts, from, to) => {
    const SEP = "\n||||\n";
    const joined = texts.join(SEP);
    const url =
      `https://translate.googleapis.com/translate_a/single` +
      `?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(joined)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Google Translate request failed");
    const data = await res.json();
    const translatedJoined = (data[0] || []).map(s => s[0] || "").join("");
    return translatedJoined.split(SEP);
  };

  // ── ONE button: Hindi <-> English toggle via Google Translate FREE ────────
  // NOTE: UI hamesha English mein rehti hai — sirf question & options translate hote hain
  const handleTranslate = useCallback(async () => {
    if (translated) {
      // Sirf showHindi toggle karo — lang change mat karo (UI English mein rehni chahiye)
      setShowHindi(prev => !prev);
      return;
    }
    setTranslating(true);
    setTranslateErr("");
    try {
      const allQuestionTexts = questions.map(q => q.question);
      const allOptionTexts = questions.flatMap(q => q.options || []);
      const [translatedQs, translatedOpts] = await Promise.all([
        googleTranslate(allQuestionTexts, "en", "hi"),
        googleTranslate(allOptionTexts, "en", "hi"),
      ]);
      const map = {};
      let optIdx = 0;
      questions.forEach((q, i) => {
        const optsCount = (q.options || []).length;
        map[i] = {
          q: translatedQs[i] || q.question,
          opts: translatedOpts.slice(optIdx, optIdx + optsCount),
        };
        optIdx += optsCount;
      });
      setTranslated(map);
      setShowHindi(true);
      // setLang("hi") NAHI karenge — UI English mein hi rehni chahiye
    } catch (err) {
      console.error("Translation error:", err);
      setTranslateErr(t.translateErr);
    }
    setTranslating(false);
  }, [questions, translated, showHindi, t.translateErr]);

  // Return display version of question (original or hindi)
  const getDisplayQ = (globalIdx, q) => {
    if (!showHindi || !translated || !translated[globalIdx]) return q;
    return { ...q, question: translated[globalIdx].q, options: translated[globalIdx].opts };
  };

  const totalAnswered  = Object.keys(answers).length;
  const totalRemaining = questions.length - totalAnswered;
  const timerColor = timeLeft < 300 ? "text-red-400" : timeLeft < 600 ? "text-yellow-400" : "text-green-400";
  const timerBg    = timeLeft < 300 ? "bg-red-500"   : timeLeft < 600 ? "bg-yellow-500"   : "bg-green-500";

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loadingQs) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">⏳</div>
        <p className="text-white text-lg font-semibold">{t.loading}</p>
        <p className="text-blue-300 text-sm mt-2">{t.loadingDesc}</p>
      </div>
    </div>
  );

  // ── Error screen ──────────────────────────────────────────────────────────
  if (loadError) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">❌</div>
        <h2 className="text-white text-xl font-bold mb-2">{t.failedLoad}</h2>
        <p className="text-red-300 text-sm mb-6 bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-xl">{loadError}</p>
        <button onClick={() => navigate("/dashboard")}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium">
          {t.backDash}
        </button>
      </div>
    </div>
  );

  // ── Main Exam UI ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col">

      {/* ── HEADER ── */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">🎓</div>
            <div>
              <div className="text-white font-semibold text-sm">{t.title}</div>
              <div className="text-white/40 text-xs">
                {user?.education} {t.level} • {t.page} {page + 1}/{totalPages}
                {showHindi && <span className="ml-1 text-orange-400">• हिंदी</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">

            <div className="text-center hidden sm:block">
              <div className="text-white/50 text-xs">{t.saved}</div>
              <div className="text-white font-bold text-sm">{totalAnswered}/{questions.length}</div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${timeLeft < 300 ? "border-red-500/40 bg-red-500/10" : "border-white/10 bg-white/5"}`}>
              <span>⏱</span>
              <span className={`font-mono font-bold text-xl ${timerColor}`}>{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
        <div className="h-1 bg-white/10">
          <div className={`h-1 ${timerBg} transition-all duration-1000`}
            style={{ width: `${(timeLeft / EXAM_DURATION) * 100}%` }} />
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 flex flex-col lg:flex-row gap-6">

        {/* ── SIDEBAR ── */}
        <aside className="lg:w-64 order-2 lg:order-1">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sticky top-24 space-y-4">

            {/* ══ TRANSLATE SECTION ══ */}
            <div className="border border-orange-500/30 bg-orange-500/5 rounded-xl p-3">
              <p className="text-white/60 text-xs font-semibold mb-2">🌐 Question Language</p>
              <button
                onClick={handleTranslate}
                disabled={translating}
                className={`w-full py-2.5 px-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2
                  ${translating
                    ? "bg-orange-500/20 text-orange-300/50 cursor-wait"
                    : showHindi
                      ? "bg-blue-600 hover:bg-blue-500 text-white"
                      : "bg-orange-600 hover:bg-orange-500 text-white"
                  }`}>
                {translating
                  ? <><span className="animate-spin inline-block">⏳</span><span>Translating...</span></>
                  : showHindi
                    ? "🇬🇧 Show English"
                    : "🇮🇳 Hindi में देखें"
                }
              </button>
              {translating && (
                <p className="text-orange-300/80 text-xs mt-2 text-center">
                  Translating {questions.length} questions...
                </p>
              )}
              {translated && !translating && (
                <p className="text-green-400/80 text-xs mt-2 text-center">
                  ✅ {questions.length} questions translated
                </p>
              )}
              {translateErr && !translating && (
                <p className="text-red-400 text-xs mt-2 text-center">{translateErr}</p>
              )}
            </div>

            {/* Progress */}
            <div>
              <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">{t.progress}</h4>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-green-400">{totalAnswered}</div>
                  <div className="text-xs text-green-300/70">{t.saved}</div>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-orange-400">{totalRemaining}</div>
                  <div className="text-xs text-orange-300/70">{t.left}</div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-white/40 mb-1">
                  <span>{t.completion}</span>
                  <span>{Math.round((totalAnswered / Math.max(questions.length, 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(totalAnswered / Math.max(questions.length, 1)) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Pages */}
            <div>
              <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">{t.pages}</h4>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {Array.from({ length: totalPages }).map((_, pIdx) => {
                  const { saved: s, total: tot } = getPageStats(pIdx);
                  const isCurr = pIdx === page;
                  return (
                    <button key={pIdx} onClick={() => { handleSave(); setPage(pIdx); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition font-medium
                        ${isCurr    ? "bg-blue-600/40 border border-blue-500/60 text-white"
                        : s === tot ? "bg-green-500/10 border border-green-500/20 text-green-300"
                        : s > 0     ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-300"
                        : "bg-white/5 border border-white/10 text-white/40 hover:bg-white/10"}`}>
                      <span>{t.page} {pIdx + 1}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs
                        ${s === tot ? "bg-green-500/30 text-green-300" : s > 0 ? "bg-yellow-500/30 text-yellow-300" : "bg-white/10 text-white/30"}`}>
                        {s}/{tot}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <button onClick={() => setConfirmSubmit(true)} disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-green-600/20">
              {submitting ? t.submitting : t.submitExam}
            </button>
          </div>
        </aside>

        {/* ── QUESTIONS ── */}
        <main className="flex-1 order-1 lg:order-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-white font-bold text-lg">
                {t.page} {page + 1}
                <span className="text-white/40 font-normal text-base"> / {totalPages}</span>
              </h2>
              <p className="text-white/40 text-xs">
                {t.questions} {pageStart + 1} – {pageEnd} {t.of} {questions.length}
                {showHindi && translated && <span className="ml-2 text-orange-400">• हिंदी में</span>}
              </p>
            </div>
            <button onClick={handleSave}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-600/20">
              {t.savePage}
            </button>
          </div>

          {/* Translating banner */}
          {translating && (
            <div className="mb-4 bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-2xl animate-spin">🌐</span>
              <div>
                <p className="text-orange-300 text-sm font-semibold">AI अनुवाद कर रहा है...</p>
                <p className="text-orange-200/60 text-xs">Backend translating all {questions.length} questions via Claude AI — please wait ~10 seconds</p>
              </div>
            </div>
          )}

          {/* Question cards */}
          <div className="space-y-4">
            {pageQs.map((q, localIdx) => {
              const globalIdx = pageStart + localIdx;
              const displayQ  = getDisplayQ(globalIdx, q);
              const selected  = draft[globalIdx];
              const isSaved   = savedSet[globalIdx] && answers[globalIdx] !== undefined;

              return (
                <div key={q.id} className={`rounded-2xl border p-5 transition-all duration-200
                  ${isSaved ? "bg-green-500/5 border-green-500/30" : "bg-white/5 border-white/10"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-full">
                        Q{globalIdx + 1}
                      </span>
                      <span className="text-xs text-white/30 hidden sm:block">{q.subject}</span>
                      {showHindi && translated && translated[globalIdx] && (
                        <span className="text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30 px-1.5 py-0.5 rounded-full">हिंदी</span>
                      )}
                    </div>
                    {isSaved && (
                      <span className="text-xs bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-0.5 rounded-full">
                        ✓ {t.saved}
                      </span>
                    )}
                  </div>

                  {/* Question text — original or hindi */}
                  <p className="text-white text-sm font-medium leading-relaxed mb-4">{displayQ.question}</p>

                  {/* Options — original or hindi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {displayQ.options.map((opt, optIdx) => (
                      <button key={optIdx}
                        onClick={() => setDraft(prev => ({ ...prev, [globalIdx]: optIdx }))}
                        className={`text-left px-3 py-2.5 rounded-xl border text-sm transition-all flex items-start gap-2
                          ${selected === optIdx
                            ? "bg-blue-600/30 border-blue-400 text-white shadow shadow-blue-600/10"
                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20"}`}>
                        <span className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center text-xs font-bold border mt-0.5
                          ${selected === optIdx ? "bg-blue-500 border-blue-400 text-white" : "bg-white/10 border-white/20 text-white/40"}`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="leading-snug">{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <button onClick={() => { handleSave(); setPage(p => Math.max(0, p - 1)); }} disabled={page === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-xl text-sm font-medium transition border border-white/10">
              {t.prev}
            </button>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, pIdx) => {
                const { saved: s, total: tot } = getPageStats(pIdx);
                return (
                  <button key={pIdx} onClick={() => { handleSave(); setPage(pIdx); }}
                    className={`rounded-full transition-all duration-200
                      ${pIdx === page ? "w-6 h-2.5 bg-blue-400"
                      : s === tot    ? "w-2.5 h-2.5 bg-green-500"
                      : s > 0        ? "w-2.5 h-2.5 bg-yellow-500"
                      : "w-2.5 h-2.5 bg-white/20"}`} />
                );
              })}
            </div>
            {page < totalPages - 1 ? (
              <button onClick={() => { handleSave(); setPage(p => p + 1); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-600/20">
                {t.saveNext}
              </button>
            ) : (
              <button onClick={() => { handleSave(); setConfirmSubmit(true); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-green-600/20">
                {t.submitExam}
              </button>
            )}
          </div>
        </main>
      </div>

      {/* ── CONFIRM SUBMIT MODAL ── */}
      {confirmSubmit && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-slate-900 border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="text-white font-bold text-xl mb-3">{t.submitQ}</h3>
            <div className="bg-white/5 rounded-xl p-4 mb-4 space-y-2.5">
              {[
                [t.totalQuestions, questions.length,  "text-white"],
                [t.savedAnswers,   totalAnswered,     "text-green-400"],
                [t.unanswered,     totalRemaining,    totalRemaining > 0 ? "text-red-400" : "text-green-400"],
              ].map(([label, val, color]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-white/50">{label}</span>
                  <span className={`font-semibold ${color}`}>{val}</span>
                </div>
              ))}
            </div>
            {totalRemaining > 0 && (
              <p className="text-yellow-400 text-xs mb-4 flex items-start gap-1.5">
                <span>⚠</span><span>{totalRemaining} {t.unansweredWarn}</span>
              </p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setConfirmSubmit(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl text-sm font-medium transition border border-white/10">
                {t.continueBtn}
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-green-600/20">
                {submitting ? t.submitting : t.submitNow}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
