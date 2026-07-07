import { Routes, Route, Navigate, useLocation, Link } from "react-router-dom"
import { AuthProvider, useAuth } from "./hooks/useAuth"
import { LanguageProvider, useLanguage } from "./i18n/LanguageContext"
import LanguageSwitcher from "./components/LanguageSwitcher"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import DashboardPage from "./pages/DashboardPage"
import PatientDashboard from "./pages/PatientDashboard"
import PatientDetail from "./pages/PatientDetail"
import SharePage from "./pages/SharePage"
import AuditLogPage from "./pages/AuditLogPage"
import AdminPage from "./pages/AdminPage"
import NotFoundPage from "./pages/NotFoundPage"

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="loading">Chargement...</div>
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />
  return <>{children}</>
}

function Navbar() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="nav-brand">EasyHealth</Link>
        <div className="nav-links">
          <Link to="/dashboard">{t("nav.home")}</Link>
          <Link to="/patients">{t("nav.patients")}</Link>
          {user?.role === "admin" && <Link to="/audit">{t("nav.audit")}</Link>}
          {user?.role === "admin" && <Link to="/admin">{t("nav.admin")}</Link>}
          <LanguageSwitcher />
          <button onClick={logout} className="btn btn-ghost">{t("nav.logout")}</button>
        </div>
      </div>
    </nav>
  )
}

function App() {
  const location = useLocation()
  const publicPaths = ["/", "/login", "/register", "/forgot-password"]
  const showNavbar = !publicPaths.includes(location.pathname)

  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="app">
          {showNavbar && <Navbar />}
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/patients" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
            <Route path="/patients/:id" element={<ProtectedRoute roles={["medecin", "infirmier", "admin"]}><PatientDetail /></ProtectedRoute>} />
            <Route path="/share/:id" element={<ProtectedRoute roles={["patient"]}><SharePage /></ProtectedRoute>} />
            <Route path="/audit" element={<ProtectedRoute roles={["admin"]}><AuditLogPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
