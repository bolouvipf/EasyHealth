import { Link } from "react-router-dom"
import "./LegalPage.css"

const steps = [
  {
    title: "1. Créer et vérifier votre compte",
    body: (
      <>
        <p>
          Inscrivez-vous en sélectionnant votre rôle (médecin, infirmier, agent communautaire ou
          administratif). Renseignez votre <strong>numéro d'enregistrement professionnel</strong> et
          votre <strong>établissement</strong> — ces champs sont obligatoires.
        </p>
        <p>
          Votre compte reste <strong>« en attente »</strong> jusqu'à sa vérification par un
          administrateur. Vous ne pouvez pas vous connecter tant qu'il n'est pas activé.
        </p>
      </>
    ),
  },
  {
    title: "2. Votre tableau de bord",
    body: (
      <>
        <p>Une fois vérifié, vous accédez à votre espace professionnel :</p>
        <ul>
          <li>Liste des dossiers patients que vous êtes autorisé à consulter ;</li>
          <li>Historique de vos accès et consultations ;</li>
          <li>Outils de saisie (constantes, traitements, comptes-rendus).</li>
        </ul>
      </>
    ),
  },
  {
    title: "3. Scanner un code patient",
    body: (
      <>
        <p>
          Lors de la consultation, demandez au patient son <strong>code temporaire</strong>.
          Scannez-le avec l'application EasyHealth Pro : le dossier s'ouvre pour la durée que le
          patient a fixée (généralement 1 heure).
        </p>
        <p>Passé ce délai, l'accès se ferme automatiquement et ne peut plus être rouvert sans un nouveau code.</p>
      </>
    ),
  },
  {
    title: "4. Consulter le dossier",
    body: (
      <>
        <p>Le dossier débloqué vous présente les informations utiles au soin :</p>
        <ul>
          <li>Allergies et alertes (mises en avant) ;</li>
          <li>Antécédents, traitements en cours et examens ;</li>
          <li>Groupe sanguin et constantes.</li>
        </ul>
      </>
    ),
  },
  {
    title: "5. Journal d'audit",
    body: (
      <p>
        Chaque accès que vous effectuez est horodaté et tracé dans le journal d'audit, consultable
        par le patient et par l'administration. C'est la garantie de transparence et de
        responsabilité de la plateforme.
      </p>
    ),
  },
  {
    title: "6. Bonnes pratiques et conformité APDP",
    body: (
      <>
        <ul>
          <li>Ne scannez que des codes officiels fournis par le patient en consultation ;</li>
          <li>Limitez la durée d'accès au strict nécessaire ;</li>
          <li>Ne communiquez jamais vos identifiants professionnels ;</li>
          <li>Respectez la loi sur la protection des données (APDP / RGPD).</li>
        </ul>
        <p>
          Pour toute question, contactez <strong>contact@easyhealth.bj</strong> ou consultez la{' '}
          <Link to="/privacy">politique de confidentialité</Link>.
        </p>
      </>
    ),
  },
]

export default function ProGuidePage() {
  return (
    <div className="legal-page">
      <header className="legal-hero">
        <div className="container">
          <span className="eyebrow">Guide</span>
          <h1>Guide du professionnel</h1>
          <p>Inscription, vérification et accès sécurisé aux dossiers patients avec EasyHealth.</p>
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
          Créer mon compte professionnel
        </Link>
      </div>
    </div>
  )
}
