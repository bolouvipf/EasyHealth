import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { patients as patientsApi } from "../services/api"
import { useAuth } from "../hooks/useAuth"
import type { PatientRecord } from "../types"

export default function PatientDashboard() {
  const [records, setRecords] = useState<PatientRecord[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ nom: "", prenom: "", dateNaissance: "", sexe: "", telephone: "", adresse: "", profession: "", consentGiven: false })
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    patientsApi.findAll().then(setRecords).catch(console.error)
  }, [])

  const canCreate = user?.role === "medecin" || user?.role === "infirmier" || user?.role === "admin"
  const isPatient = user?.role === "patient"

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const record = await patientsApi.create(form)
      setRecords([...records, record])
      setShowCreate(false)
      setForm({ nom: "", prenom: "", dateNaissance: "", sexe: "", telephone: "", adresse: "", profession: "", consentGiven: false })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Dossiers Patients</h1>
        {canCreate && <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>Nouveau dossier</button>}
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="card" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem", fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "1rem" }}>Nouveau dossier patient</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Nom</label>
              <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Prénom</label>
              <input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date de naissance</label>
              <input type="date" value={form.dateNaissance} onChange={(e) => setForm({ ...form, dateNaissance: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Sexe</label>
              <select value={form.sexe} onChange={(e) => setForm({ ...form, sexe: e.target.value })}>
                <option value="">--</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Téléphone</label>
              <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Profession</label>
              <input value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Adresse</label>
            <input value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={form.consentGiven} onChange={(e) => setForm({ ...form, consentGiven: e.target.checked })} />
              {" "}Consentement du patient obtenu
            </label>
          </div>
          <button type="submit" className="btn btn-primary">Créer le dossier</button>
        </form>
      )}

      <div className="patient-grid">
        {records.map((record) => (
          <div key={record.id} className="card patient-card" onClick={() => navigate(isPatient ? `/share/${record.id}` : `/patients/${record.id}`)}>
            <h3>{record.prenom} {record.nom}</h3>
            {record.dateNaissance && <p>Né(e) le {new Date(record.dateNaissance).toLocaleDateString("fr-FR")}</p>}
            {record.telephone && <p>{record.telephone}</p>}
            <span className={`consent-badge ${record.consentGiven ? "granted" : "denied"}`}>
              {record.consentGiven ? "✓ Consentement" : "✗ Pas de consentement"}
            </span>
          </div>
        ))}
        {records.length === 0 && <p className="empty-state">Aucun dossier patient pour le moment.</p>}
      </div>
    </div>
  )
}
