import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { patients as patientsApi } from "../services/api"
import type { PatientRecord } from "../types"

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>()
  const [record, setRecord] = useState<PatientRecord | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<any>({})

  useEffect(() => {
    if (id) patientsApi.findOne(id).then(setRecord).catch(console.error)
  }, [id])

  if (!record) return <div className="loading">Chargement...</div>

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    try {
      const updated = await patientsApi.update(id, form)
      setRecord(updated)
      setEditing(false)
    } catch (err) {
      console.error(err)
    }
  }

  const fields = [
    { key: "nom", label: "Nom" },
    { key: "prenom", label: "Prénom" },
    { key: "dateNaissance", label: "Date de naissance", type: "date" },
    { key: "sexe", label: "Sexe" },
    { key: "groupeSanguin", label: "Groupe sanguin" },
    { key: "telephone", label: "Téléphone" },
    { key: "adresse", label: "Adresse" },
    { key: "profession", label: "Profession" },
    { key: "allergies", label: "Allergies" },
    { key: "antecedentsMedicaux", label: "Antécédents médicaux" },
    { key: "traitementsEnCours", label: "Traitements en cours" },
    { key: "notes", label: "Notes" },
  ]

  return (
    <div>
      <div className="page-header">
        <h1>Dossier de {record.prenom} {record.nom}</h1>
        <button className="btn btn-secondary" onClick={() => { setEditing(!editing); setForm(record) }}>
          {editing ? "Annuler" : "Modifier"}
        </button>
      </div>

      <div className="consent-banner">
        {record.consentGiven ? "✓ Consentement obtenu le " + (record.consentDate ? new Date(record.consentDate).toLocaleDateString("fr-FR") : "N/A") : "✗ Consentement non obtenu"}
      </div>

      {editing ? (
        <form onSubmit={handleUpdate} className="card">
          {fields.map(({ key, label, type }) => (
            <div className="form-group" key={key}>
              <label>{label}</label>
              <input type={type || "text"} value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
            </div>
          ))}
          <button type="submit" className="btn btn-primary">Enregistrer</button>
        </form>
      ) : (
        <div className="card patient-detail-grid">
          {fields.map(({ key, label }) => (
            <div className="detail-field" key={key}>
              <strong>{label} :</strong>
              <span>{(record as any)[key] || "—"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
