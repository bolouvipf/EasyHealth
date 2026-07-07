import { useState, useEffect } from "react"
import { professionals as professionalsApi } from "../services/api"

interface PendingProfessional {
  id: string
  userId: string
  licenseNumber: string
  establishment?: string
  status: string
  user?: { nom: string; prenom: string; email: string; role: string }
}

export default function AdminPage() {
  const [pending, setPending] = useState<PendingProfessional[]>([])

  useEffect(() => {
    professionalsApi.findPending().then(setPending).catch(console.error)
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

  return (
    <div>
      <div className="page-header">
        <h1>Administration</h1>
      </div>

      <div className="card">
        <h2>Vérifications professionnelles en attente</h2>
        {pending.length === 0 ? (
          <p className="empty-state">Aucune demande en attente</p>
        ) : (
          <table className="audit-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
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
        )}
      </div>
    </div>
  )
}
