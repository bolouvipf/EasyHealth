import { useState, useEffect } from "react"
import { professionals as professionalsApi, admin as adminApi } from "../services/api"

interface PendingProfessional {
  id: string
  userId: string
  licenseNumber: string
  establishment?: string
  status: string
  user?: { nom: string; prenom: string; email: string; role: string; telephone?: string }
}

interface AdminStats {
  totalUsers: number
  activeUsers: number
  pendingProfessionals: number
  totalPatients: number
  usersByRole: Array<{ role: string; count: number }>
}

interface AdminUser {
  id: string
  email: string
  nom: string
  prenom: string
  role: string
  professionalStatus: string
  isActive: boolean
  createdAt: string
}

type Tab = "dashboard" | "users" | "verifications"

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("dashboard")
  const [pending, setPending] = useState<PendingProfessional[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [s, p, u] = await Promise.all([
          adminApi.getStats(),
          professionalsApi.findPending(),
          adminApi.getUsers(),
        ])
        setStats(s)
        setPending(p)
        setUsers(u)
      } catch {
        setError("Impossible de charger les données administratives.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleVerify = async (id: string) => {
    try {
      await professionalsApi.verify(id)
      setPending(pending.filter((p) => p.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleReject = async (id: string) => {
    const reason = prompt("Motif du rejet :")
    if (!reason) return
    try {
      await professionalsApi.reject(id, reason)
      setPending(pending.filter((p) => p.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleActive = async (id: string) => {
    try {
      const updated = await adminApi.toggleUserActive(id)
      setUsers(users.map((u) => (u.id === updated.id ? updated : u)))
    } catch (err) {
      console.error(err)
    }
  }

  const roleLabels: Record<string, string> = {
    patient: "Patient",
    medecin: "Médecin",
    infirmier: "Infirmier",
    agent_communautaire: "Agent communautaire",
    administratif: "Administratif",
    admin: "Admin",
  }

  return (
    <div>
      <div className="page-header">
        <h1>Administration</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p className="empty-state">Chargement…</p>}

      <div className="admin-tabs">
        <button className={`btn ${tab === "dashboard" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTab("dashboard")}>Tableau de bord</button>
        <button className={`btn ${tab === "users" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTab("users")}>Utilisateurs</button>
        <button className={`btn ${tab === "verifications" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTab("verifications")}>
          Vérifications {pending.length > 0 && <span className="badge">{pending.length}</span>}
        </button>
      </div>

      {tab === "dashboard" && stats && (
        <div className="stats-grid">
          <div className="card stat-card">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Utilisateurs</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{stats.activeUsers}</div>
            <div className="stat-label">Actifs</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{stats.totalPatients}</div>
            <div className="stat-label">Dossiers patients</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{stats.pendingProfessionals}</div>
            <div className="stat-label">En attente</div>
          </div>
        </div>
      )}

      {tab === "dashboard" && stats && (
        <div className="card">
          <h2>Répartition par rôle</h2>
          <div className="role-breakdown">
            {stats.usersByRole.map((r) => (
              <div key={r.role} className="role-row">
                <span className="role-name">{roleLabels[r.role] || r.role}</span>
                <div className="role-bar-wrapper">
                  <div className="role-bar" style={{ width: `${(r.count / stats.totalUsers) * 100}%` }} />
                </div>
                <span className="role-count">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="card">
          <h2>Gestion des utilisateurs</h2>
          <div className="audit-table-wrapper">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.prenom} {u.nom}</td>
                    <td>{u.email}</td>
                    <td>{roleLabels[u.role] || u.role}</td>
                    <td>
                      <span className={`status-badge ${u.isActive ? "status-active" : "status-inactive"}`}>
                        {u.isActive ? "Actif" : "Inactif"}
                      </span>
                      {u.professionalStatus === "pending" && <span className="status-badge status-pending">En attente</span>}
                    </td>
                    <td>
                      <button className={`btn btn-sm ${u.isActive ? "btn-danger" : "btn-success"}`} onClick={() => handleToggleActive(u.id)}>
                        {u.isActive ? "Désactiver" : "Activer"}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={5} className="empty-state">Aucun utilisateur</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "verifications" && (
        <div className="card">
          <h2>Vérifications professionnelles en attente</h2>
          {pending.length === 0 ? (
            <p className="empty-state">Aucune demande en attente</p>
          ) : (
            <div className="audit-table-wrapper">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Rôle</th>
                    <th>N° d'enregistrement</th>
                    <th>Établissement</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((p) => (
                      <tr key={p.id}>
                        <td>{p.user ? `${p.user.prenom} ${p.user.nom}` : "—"}</td>
                        <td>{p.user?.email || "—"}</td>
                        <td>{p.user?.telephone || "—"}</td>
                        <td>{p.user?.role || "—"}</td>
                        <td>{p.licenseNumber}</td>
                        <td>{p.establishment || "—"}</td>
                        <td className="action-cells">
                        <button className="btn btn-success btn-sm" onClick={() => handleVerify(p.id)}>Vérifier</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleReject(p.id)}>Rejeter</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
