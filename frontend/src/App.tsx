import { Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./hooks/useAuth"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import PatientDashboard from "./pages/PatientDashboard"
import PatientDetail from "./pages/PatientDetail"
import SharePage from "./pages/SharePage"
import AuditLogPage from "./pages/AuditLogPage"
import AdminPage from "./pages/AdminPage"

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="loading">Chargement...</div>
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />
  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">EasyHealth</div>
          <div className="nav-links">
            <a href="/patients">Patients</a>
            <a href="/audit">Audit</a>
            <LogoutButton />
          </div>
        </nav>
        <main className="container">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/patients" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
            <Route path="/patients/:id" element={<ProtectedRoute roles={["medecin", "infirmier", "admin"]}><PatientDetail /></ProtectedRoute>} />
            <Route path="/share/:id" element={<ProtectedRoute roles={["patient"]}><SharePage /></ProtectedRoute>} />
            <Route path="/audit" element={<ProtectedRoute roles={["admin"]}><AuditLogPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminPage /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/patients" />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}

function LogoutButton() {
  const { logout } = useAuth()
  return <button onClick={logout} className="btn btn-secondary">Déconnexion</button>
}

export default App
