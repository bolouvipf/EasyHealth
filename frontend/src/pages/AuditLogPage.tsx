import { useState, useEffect } from "react"
import { audit as auditApi } from "../services/api"
import type { AuditLog } from "../types"

const actionLabels: Record<string, string> = {
  consultation: "Consultation",
  creation: "Création",
  modification: "Modification",
  suppression: "Suppression",
  partage: "Partage",
  export: "Export",
  connexion: "Connexion",
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filter, setFilter] = useState("")

  useEffect(() => {
    auditApi.findAll().then(setLogs).catch(console.error)
  }, [])

  const filtered = filter ? logs.filter((l) => l.action === filter) : logs

  return (
    <div>
      <div className="page-header">
        <h1>Journal d'audit</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
          <option value="">Toutes les actions</option>
          {Object.entries(actionLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className="audit-table-wrapper">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Action</th>
              <th>Utilisateur</th>
              <th>Détails</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.createdAt).toLocaleString("fr-FR")}</td>
                <td><span className={`action-badge action-${log.action}`}>{actionLabels[log.action] || log.action}</span></td>
                <td>{log.user ? `${log.user.prenom} ${log.user.nom}` : log.userId || "—"}</td>
                <td>{log.details || "—"}</td>
                <td>{log.ipAddress || "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="empty-state">Aucun log d'audit</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
