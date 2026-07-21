import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { patients as patientsApi } from "../services/api"
import type { PatientRecord, ClinicalEntry, Specialty } from "../types"

const entryTypeLabels: Record<string, string> = {
  CONSULTATION: "Consultation",
  NOTE: "Note",
  PRESCRIPTION: "Prescription",
  RESULTAT: "Résultat",
  ANTECEDENT: "Antécédent",
  ALLERGIE: "Allergie",
  TRAITEMENT: "Traitement",
}

const specialtyLabels: Record<string, string> = {
  generale: "Générale",
  neurologie: "Neurologie",
  cardiologie: "Cardiologie",
}

const specialtyColors: Record<string, string> = {
  generale: "var(--primary)",
  neurologie: "#7c3aed",
  cardiologie: "#dc2626",
}

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>()
  const [record, setRecord] = useState<PatientRecord | null>(null)
  const [entries, setEntries] = useState<ClinicalEntry[]>([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<any>({})
  const [entryForm, setEntryForm] = useState({ entryType: "NOTE", content: "", specialty: "generale" })
  const [showEntryForm, setShowEntryForm] = useState(false)
  const [activeSpecialty, setActiveSpecialty] = useState<string | null>(null)
  const [expandedSpecialties, setExpandedSpecialties] = useState<Set<string>>(new Set())

  const [loadingEntries, setLoadingEntries] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoadingEntries(true)
    patientsApi.findOne(id).then((r) => {
      setRecord(r)
      setForm(r)
    }).catch(console.error)
    patientsApi.getClinicalEntries(id).then(setEntries).catch(console.error).finally(() => setLoadingEntries(false))
  }, [id])

  if (!record) return <div className="loading"><div className="spinner"></div>Chargement du dossier...</div>

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
      setEntryForm({ entryType: "NOTE", content: "", specialty: "generale" })
      setShowEntryForm(false)
    } catch (err) {
      console.error(err)
    }
  }

  const toggleSpecialty = (s: string) => {
    setExpandedSpecialties((prev) => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s)
      else next.add(s)
      return next
    })
  }

  const groupedBySpecialty = entries.reduce<Record<string, ClinicalEntry[]>>((acc, entry) => {
    const s = entry.specialty || "generale"
    if (!acc[s]) acc[s] = []
    acc[s].push(entry)
    return acc
  }, {})

  const specialtyOrder = ["generale", "neurologie", "cardiologie"]

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
              <label>Spécialité</label>
              <select value={entryForm.specialty} onChange={(e) => setEntryForm({ ...entryForm, specialty: e.target.value })}>
                {Object.entries(specialtyLabels).map(([key, label]) => (
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

        {loadingEntries ? (
          <div className="loading"><div className="spinner"></div>Chargement des entrées...</div>
        ) : entries.length === 0 ? (
          <p className="empty-state" style={{ background: "var(--white)", borderRadius: "var(--radius-card)", border: "1px solid var(--border-mist)" }}>
            Aucune entrée clinique pour ce dossier.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {specialtyOrder.map((s) => {
              const groupEntries = groupedBySpecialty[s]
              if (!groupEntries?.length) return null
              const isExpanded = expandedSpecialties.has(s)
              const isDefaultOpen = s === "generale"

              return (
                <div key={s} className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <button
                    onClick={() => toggleSpecialty(s)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem 1rem",
                      border: "none",
                      background: isDefaultOpen ? "var(--primary)" : "var(--bg-secondary, #f5f5f5)",
                      color: isDefaultOpen ? "#fff" : "var(--text)",
                      cursor: "pointer",
                      fontWeight: 500,
                      fontSize: "0.9rem",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: specialtyColors[s] || "var(--primary)",
                        display: "inline-block",
                      }} />
                      {specialtyLabels[s] || s}
                      <span style={{ opacity: 0.7, fontWeight: 400, fontSize: "0.8rem" }}>
                        ({groupEntries.length})
                      </span>
                    </span>
                    <span style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                      ▼
                    </span>
                  </button>
                  {(isExpanded || isDefaultOpen) && (
                    <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {groupEntries.map((entry) => (
                        <div key={entry.id} className="clinical-entry" style={{ borderBottom: "1px solid var(--border-mist)", paddingBottom: "0.75rem" }}>
                          <div className="clinical-entry-header">
                            <span className={`entry-type-badge ${entry.entryType}`}>{entryTypeLabels[entry.entryType] || entry.entryType}</span>
                            <span className="entry-date">{new Date(entry.createdAt).toLocaleString("fr-FR")}</span>
                          </div>
                          <div className="entry-content">{entry.content}</div>
                          {entry.metadata?.authorName && (
                            <div className="entry-author" style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                              Par {entry.metadata.authorName}{entry.metadata?.hospital && ` — ${entry.metadata.hospital}`}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
