import { Link } from "react-router-dom"

const messages = [
  { code: "404", icon: "🩺", title: "Page en consultation", desc: "Cette page n'a pas été diagnostiquée sur notre serveur." },
  { code: "ERR_SITE_INTROUVABLE", icon: "💊", title: "Mauvaise prescription", desc: "L'URL que vous cherchez ne figure pas dans notre ordonnance." },
  { code: "STATUT_INCONNU", icon: "🫀", title: "Battement de page absent", desc: "Aucun pouls détecté sur cette adresse. Réessayez." },
  { code: "404", icon: "🏥", title: "Service des urgences", desc: "Page non admise. Veuillez vous diriger vers l'accueil." },
]

export default function NotFoundPage() {
  const m = messages[Math.floor(Math.random() * messages.length)]
  return (
    <div className="not-found-page">
      <div className="card not-found-card">
        <span className="not-found-icon">{m.icon}</span>
        <span className="not-found-code">{m.code}</span>
        <h1>{m.title}</h1>
        <p>{m.desc}</p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">Retour à l'accueil</Link>
          <Link to="/dashboard" className="btn btn-secondary">Tableau de bord</Link>
        </div>
      </div>
    </div>
  )
}
