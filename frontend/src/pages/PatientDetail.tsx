import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { patients as patientsApi } from "../services/api"
import type { PatientRecord, ClinicalEntry } from "../types"

const entryTypeLabels: Record<string, string> = {
  CONSULTATION: "Consultation",
  NOTE: "Note",
  PRESCRIPTION: "Prescription",
  RESULTAT: "Résultat",
  ANTECEDENT: "Antécédent",
  ALLERGIE: "Allergie",
  TRAITEMENT: "Traitement",
}

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>()
  const [record, setRecord] = useState<PatientRecord | null>(null)
  const [entries, setEntries] = useState<ClinicalEntry[]>([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<any>({})
  const [entryForm, setEntryForm] = useState({ entryType: "NOTE", content: "" })
  const [showEntryForm, setShowEntryForm] = useState(false)

  useEffect(() => {
    if (!id) return
    patientsApi.findOne(id).then((r) => {
      setRecord(r)
      setForm(r)
    }).catch(console.error)
    patientsApi.getClinicalEntries(id).then(setEntries).catch(console.error)
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

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !entryForm.content.trim()) return
    try {
      const entry = await patientsApi.addClinicalEntry(id, entryForm)
      setEntries([...entries, entry])
      setEntryForm({ entryType: "NOTE", content: "" })
      setShowEntryForm(false)
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
  ]

  return (
    <div className="container">
      <div className="page-header">
        <h1>{record.prenom} {record.nom}</h1>
        <button className="btn btn-secondary" onClick={() => { setEditing(!editing); setForm(record) }}>
          {editing ? "Annuler" : "Modifier"}
        </button>
      </div>

      <div className={`consent-banner ${record.consentGiven ? "granted" : "denied"}`}>
        {record.consentGiven
          ? `✓ Consentement obtenu le ${record.consentDate ? new Date(record.consentDate).toLocaleDateString("fr-FR") : "N/A"}`
          : "✗ Consentement non obtenu"}
      </div>

      {editing ? (
        <form onSubmit={handleUpdate} className="card" style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "1rem", fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "1rem" }}>Modifier le dossier</h3>
          <div className="form-row">
            {fields.map(({ key, label, type }) => (
              <div className="form-group" key={key}>
                <label>{label}</label>
                <input type={type || "text"} value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
          </div>
          <button type="submit" className="btn btn-primary">Enregistrer</button>
        </form>
      ) : (
        <div className="card" style={{ marginBottom: "2rem" }}>
          <div className="patient-detail-grid">
            {fields.map(({ key, label }) => (
              <div className="detail-field" key={key}>
                <strong>{label}</strong>
                <span>{(record as any)[key] || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="clinical-entries">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2>Entrées cliniques</h2>
          <button className="btn btn-primary" onClick={() => setShowEntryForm(!showEntryForm)}>
            {showEntryForm ? "Annuler" : "Ajouter"}
          </button>
        </div>

        {showEntryForm && (
          <form onSubmit={handleAddEntry} className="card" style={{ marginBottom: "1rem" }}>
            <h4 style={{ marginBottom: "0.75rem", fontFamily: "var(--font-sans)", fontWeight: 500 }}>Nouvelle entrée</h4>
            <div className="form-group">
              <label>Type</label>
              <select value={entryForm.entryType} onChange={(e) => setEntryForm({ ...entryForm, entryType: e.target.value })}>
                {Object.entries(entryTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Contenu</label>
              <textarea value={entryForm.content} onChange={(e) => setEntryForm({ ...entryForm, content: e.target.value })} required placeholder="Notes, observations, prescription..." />
            </div>
            <button type="submit" className="btn btn-primary">Ajouter l'entrée</button>
          </form>
        )}

        {entries.length === 0 ? (
          <p className="empty-state" style={{ background: "var(--white)", borderRadius: "var(--radius-card)", border: "1px solid var(--border-mist)" }}>
            Aucune entrée clinique pour ce dossier.
          </p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="card clinical-entry">
              <div className="clinical-entry-header">
                <span className={`entry-type-badge ${entry.entryType}`}>{entryTypeLabels[entry.entryType] || entry.entryType}</span>
                <span className="entry-date">{new Date(entry.createdAt).toLocaleString("fr-FR")}</span>
              </div>
              <div className="entry-content">{entry.content}</div>
              {entry.metadata?.authorName && (
                <div className="entry-author" style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem", borderTop: "1px solid var(--border-mist)", paddingTop: "0.25rem" }}>
                  Par {entry.metadata.authorName}{entry.metadata?.hospital && ` — ${entry.metadata.hospital}`}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
