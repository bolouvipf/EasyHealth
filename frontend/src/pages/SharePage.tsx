import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { sharing as sharingApi, patients as patientsApi } from "../services/api"
import type { SharingCodeResponse } from "../types"

export default function SharePage() {
  const { id } = useParams<{ id: string }>()
  const [code, setCode] = useState<SharingCodeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [recordName, setRecordName] = useState("")

  useEffect(() => {
    if (id) patientsApi.findOne(id).then((r) => setRecordName(`${r.prenom} ${r.nom}`)).catch(console.error)
  }, [id])

  const generateCode = async () => {
    if (!id) return
    setLoading(true)
    try {
      const result = await sharingApi.generateCode({ patientRecordId: id, expiresInMinutes: 30 })
      setCode(result)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const copyToClipboard = () => {
    if (code) navigator.clipboard.writeText(code.code)
  }

  return (
    <div className="share-page">
      <h1>Partager mon dossier</h1>
      {recordName && <p className="share-patient-name">Dossier de : <strong>{recordName}</strong></p>}

      <div className="card share-card">
        <h2>Code de partage temporaire</h2>
        <p>Générez un code à 8 chiffres à donner à votre professionnel de santé.</p>
        <p className="share-info">Ce code expire dans 30 minutes et ne peut être utilisé qu'une seule fois.</p>

        {code ? (
          <div className="code-display">
            <div className="big-code">{code.code}</div>
            <p className="expires-at">Expire le {new Date(code.expiresAt).toLocaleTimeString("fr-FR")}</p>
            <div className="share-actions">
              <button className="btn btn-primary" onClick={copyToClipboard}>Copier le code</button>
              <button className="btn btn-secondary" onClick={generateCode}>Générer un nouveau code</button>
            </div>
          </div>
        ) : (
          <button className="btn btn-primary btn-block" onClick={generateCode} disabled={loading}>
            {loading ? "Génération..." : "Générer un code de partage"}
          </button>
        )}
      </div>

      <div className="card">
        <h3>Instructions</h3>
        <ol>
          <li>Générez un code de partage ci-dessus</li>
          <li>Communiquez ce code à 8 chiffres à votre médecin ou infirmier</li>
          <li>Le professionnel saisit le code sur son interface pour accéder à votre dossier</li>
          <li>Le code expire après 30 minutes ou après la première utilisation</li>
        </ol>
        <p className="share-note">En cas d'urgence, le personnel soignant peut accéder à votre dossier via un code d'urgence (fonctionnalité à venir).</p>
      </div>
    </div>
  )
}
