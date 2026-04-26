import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Register       from "./pages/Register";
import Login          from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard      from "./pages/Dashboard";
import Exam           from "./pages/Exam";
import Results        from "./pages/Results";
import AdminPanel     from "./pages/AdminPanel";

// ─── Loading Screen ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-2xl animate-pulse">
          🎓
        </div>
        <p className="text-white text-lg font-semibold">LuckyTech Academy</p>
        <p className="text-blue-300 text-sm mt-1">Loading...</p>
      </div>
    </div>
  );
}

// ─── Private Route: Login hona zaroori hai ────────────────────────────────────
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
}

// ─── Public Route: Already logged in ho toh dashboard pe bhejo ───────────────
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return !user ? children : <Navigate to="/dashboard" replace />;
}

// ─── All Routes ───────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login"           element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register"        element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

      {/* Admin Panel */}
      <Route path="/admin" element={<AdminPanel />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/exam"      element={<PrivateRoute><Exam /></PrivateRoute>} />
      <Route path="/results"   element={<PrivateRoute><Results /></PrivateRoute>} />

      {/* Fallback */}
      <Route path="/"  element={<Navigate to="/login" replace />} />
      <Route path="*"  element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
