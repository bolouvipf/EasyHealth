import { Link } from "react-router-dom"
import "./LegalPage.css"

const steps = [
  {
    title: "1. Créer votre compte",
    body: (
      <>
        <p>
          Cliquez sur <strong>« Créer mon compte »</strong> depuis l'accueil. Renseignez votre nom,
          prénom, email et un mot de passe sécurisé (8 caractères minimum, avec majuscule,
          minuscule, chiffre et caractère spécial).
        </p>
        <p>Les patients sont activés immédiatement : vous pouvez vous connecter tout de suite.</p>
      </>
    ),
  },
  {
    title: "2. Compléter votre dossier",
    body: (
      <>
        <p>Dans votre tableau de bord, ajoutez vos informations de santé :</p>
        <ul>
          <li>Antécédents et traitements en cours ;</li>
          <li>Allergies (très important pour les urgences) ;</li>
          <li>Groupes sanguin et constantes utiles ;</li>
          <li>Comptes-rendus et examens si vous le souhaitez.</li>
        </ul>
        <p>Plus votre dossier est complet, plus le professionnel pourra vous soigner en sécurité.</p>
      </>
    ),
  },
  {
    title: "3. Partager par QR code",
    body: (
      <>
        <p>
          Lors d'une consultation, ouvrez la fonction de partage depuis votre dossier. Un{' '}
          <strong>code QR temporaire</strong> est généré, à usage unique et limité dans le temps
          (par exemple 1 heure).
        </p>
        <p>
          Le médecin le scanne avec son application : il accède à votre dossier le temps que vous
          avez autorisé, puis l'accès se ferme automatiquement.
        </p>
      </>
    ),
  },
  {
    title: "4. Garder le contrôle",
    body: (
      <>
        <p>Vous décidez à qui vous donnez votre code et pour combien de temps. Vous pouvez à tout moment :</p>
        <ul>
          <li>Consulter le <strong>journal d'audit</strong> qui liste chaque accès (qui, quand, quelle durée) ;</li>
          <li>Révoquer un accès en cours ;</li>
          <li>Ne jamais communiquer votre mot de passe, même à un soignant.</li>
        </ul>
      </>
    ),
  },
  {
    title: "5. Sécurité et bonnes pratiques",
    body: (
      <>
        <ul>
          <li>Utilisez un mot de passe unique et robuste pour EasyHealth ;</li>
          <li>Ne laissez pas votre code QR visible au-delà de la consultation ;</li>
          <li>Signalez tout accès inhabituel depuis le journal d'audit ;</li>
          <li>En cas de doute, contactez-nous à <strong>contact@easyhealth.bj</strong>.</li>
        </ul>
      </>
    ),
  },
  {
    title: "6. Vos droits",
    body: (
      <p>
        Conformément à l'APDP et au RGPD, vous pouvez accéder, corriger ou supprimer vos données à
        tout moment. Consultez notre <Link to="/privacy">politique de confidentialité</Link> pour en
        savoir plus.
      </p>
    ),
  },
]

export default function PatientGuidePage() {
  return (
    <div className="legal-page">
      <header className="legal-hero">
        <div className="container">
          <span className="eyebrow">Guide</span>
          <h1>Guide du patient</h1>
          <p>En quelques étapes, prends en main ton dossier de santé EasyHealth en toute sérénité.</p>
        </div>
      </header>

      <div className="legal-body">
        <div className="legal-card legal-section">
          {steps.map((s) => (
            <div key={s.title} className="legal-section">
              <h2>{s.title}</h2>
              {s.body}
            </div>
          ))}
        </div>

        <Link to="/register" className="legal-back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
          Créer mon compte
        </Link>
      </div>
    </div>
  )
}
