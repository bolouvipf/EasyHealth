import { Routes, Route, Navigate, useLocation, Link } from "react-router-dom"
import { useState } from "react"
import { AuthProvider, useAuth } from "./hooks/useAuth"
import { LanguageProvider, useLanguage } from "./i18n/LanguageContext"
import LanguageSwitcher from "./components/LanguageSwitcher"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import AdminLoginPage from "./pages/AdminLoginPage"
import RegisterPage from "./pages/RegisterPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import ResetPasswordPage from "./pages/ResetPasswordPage"
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

function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="loading">Chargement...</div>
  if (!user) return <Navigate to="/adminlogin" />
  if (user.role !== "admin") return <Navigate to="/" />
  return <>{children}</>
}

function Navbar() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { path: "/dashboard", label: t("nav.home") },
    { path: "/patients", label: t("nav.patients") },
    ...(user?.role === "admin" ? [{ path: "/audit", label: t("nav.audit") }, { path: "/admin", label: t("nav.admin") }] : []),
  ]

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="nav-brand">EasyHealth</Link>

        <nav className="nav-links" aria-label="Navigation principale">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>{item.label}</Link>
          ))}
        </nav>

        <div className="nav-links" style={{ gap: '0.75rem' }}>
          <LanguageSwitcher />
          <button onClick={logout} className="btn btn-ghost">{t("nav.logout")}</button>
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>

        {mobileMenuOpen && (
          <div id="mobile-menu" className="mobile-menu open" role="navigation" aria-label="Menu mobile">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>{item.label}</Link>
            ))}
            <LanguageSwitcher />
            <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="btn btn-ghost" style={{ width: '100%', textAlign: 'left' }}>{t("nav.logout")}</button>
          </div>
        )}
      </div>
    </nav>
  )
}

function App() {
  const location = useLocation()
  const publicPaths = ["/", "/login", "/adminlogin", "/register", "/forgot-password", "/reset-password"]
  const showNavbar = !publicPaths.includes(location.pathname)

  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="app">
          {showNavbar && <Navbar />}
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/adminlogin" element={<AdminLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/patients" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
            <Route path="/patients/:id" element={<ProtectedRoute roles={["medecin", "infirmier", "admin"]}><PatientDetail /></ProtectedRoute>} />
            <Route path="/share/:id" element={<ProtectedRoute roles={["patient"]}><SharePage /></ProtectedRoute>} />
            <Route path="/audit" element={<ProtectedRoute roles={["admin"]}><AuditLogPage /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminProtectedRoute><AdminPage /></AdminProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
