import { useState } from "react"
import { Link } from "react-router-dom"
import "./LegalPage.css"

const faqs = [
  {
    q: "Qu'est-ce qu'EasyHealth ?",
    a: "EasyHealth est le Dossier de Santé Partagé du Bénin. Il réunit en un seul endroit sécurisé vos antécédents, traitements, allergies et examens, et permet aux professionnels de santé autorisés d'y accéder par un simple code temporaire.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Oui. Vos données sont chiffrées (AES-256), hébergées localement au Bénin et chaque accès est horodaté et tracé dans un journal d'audit. EasyHealth est conçu pour être conforme à l'APDP et au RGPD.",
  },
  {
    q: "Comment fonctionne le partage par code temporaire ?",
    a: "Vous générez depuis l'application un code temporaire, à usage unique et limité dans le temps (par exemple 1 heure). Vous décidez à qui vous le donnez et pour quelle durée. Passé ce délai, le code ne donne plus accès à rien.",
  },
  {
    q: "Qui peut accéder à mon dossier ?",
    a: "Uniquement les professionnels de santé que vous autorisez explicitement, et seulement pendant la durée que vous avez fixée. Tous les accès apparaissent dans votre journal d'audit, que vous pouvez consulter à tout moment.",
  },
  {
    q: "EasyHealth est-il gratuit ?",
    a: "Oui, l'application est gratuite pour les patients. Les professionnels et établissements disposent de fonctionnalités dédiées selon leur rôle.",
  },
  {
    q: "Comment un professionnel obtient-il un compte ?",
    a: "Le professionnel s'inscrit avec son numéro d'enregistrement et son établissement. Son compte reste « en attente » jusqu'à vérification par un administrateur, qui peut ensuite l'activer ou le rejeter.",
  },
  {
    q: "J'ai oublié mon mot de passe, que faire ?",
    a: "Sur l'écran de connexion, cliquez sur « Mot de passe oublié ». Un lien de réinitialisation sécurisé vous est envoyé par email. Le lien est valable une heure.",
  },
  {
    q: "Mes données quittent-elles le Bénin ?",
    a: "Non. Vos données de santé sont hébergées sur des serveurs situés au Bénin, conformément à la réglementation sur la protection des données personnelles.",
  },
  {
    q: "Puis-je supprimer mon compte et mes données ?",
    a: "Oui. Conformément au RGPD et à la loi béninoise sur la protection des données, vous disposez d'un droit d'accès, de rectification et de suppression. Contactez-nous à l'adresse indiquée dans la politique de confidentialité.",
  },
]

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="legal-page">
      <header className="legal-hero">
        <div className="container">
          <span className="eyebrow">Aide</span>
          <h1>Questions fréquentes</h1>
          <p>Tout ce que vous devez savoir sur EasyHealth, la sécurité et le partage de votre dossier.</p>
        </div>
      </header>

      <div className="legal-body">
        <div className="faq-list">
          {faqs.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={i} className={`faq-item ${isOpen ? "open" : ""}`}>
                <button
                  className="faq-q"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span>{item.q}</span>
                  <svg className="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="faq-a">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <Link to="/" className="legal-back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}
