import { Link } from "react-router-dom"
import "./LegalPage.css"

const sections = [
  {
    title: "1. Responsable du traitement",
    body: (
      <p>
        Le responsable du traitement des données est <strong>EasyHealth</strong>, éditeur de la
        plateforme de Dossier de Santé Partagé au Bénin. Pour toute question relative à vos données,
        vous pouvez nous contacter à <strong>contact@easyhealth.bj</strong>.
      </p>
    ),
  },
  {
    title: "2. Données collectées",
    body: (
      <>
        <p>Nous collectons uniquement les données nécessaires au service :</p>
        <ul>
          <li>Identité : nom, prénom, email, rôle (patient ou professionnel de santé) ;</li>
          <li>Coordonnées : numéro de téléphone (facultatif) ;</li>
          <li>
            Données de santé : antécédents, traitements, allergies, examens et accès partagés,
            saisies ou générées dans le cadre de votre dossier ;
          </li>
          <li>
            Données professionnelles : numéro d'enregistrement, établissement et statut de
            vérification pour les professionnels ;
          </li>
          <li>Journaux techniques : connexions et accès, à des fins de sécurité et de traçabilité.</li>
        </ul>
      </>
    ),
  },
  {
    title: "3. Finalités du traitement",
    body: (
      <>
        <p>Vos données sont traitées pour :</p>
        <ul>
          <li>Créer et gérer votre compte ;</li>
          <li>Vous permettre de partager votre dossier avec les professionnels que vous autorisez ;</li>
          <li>Vérifier l'identité et les qualifications des professionnels de santé ;</li>
          <li>Assurer la sécurité, la traçabilité et l'amélioration du service.</li>
        </ul>
      </>
    ),
  },
  {
    title: "4. Base légale",
    body: (
      <p>
        Le traitement repose sur l'exécution du contrat vous liant à EasyHealth, sur votre
        consentement pour les données de santé sensibles, et sur notre intérêt légitime de
        sécuriser la plateforme. Il est effectué dans le respect de la loi n° 2017-07 du 24 avril 2017
        relative à la protection des données à caractère personnel au Bénin (APDP) et du RGPD.
      </p>
    ),
  },
  {
    title: "5. Partage des données",
    body: (
      <>
        <p>
          Vos données de santé ne sont jamais vendues. Elles ne sont partagées qu'avec les
          professionnels de santé que <strong>vous</strong> autorisez explicitement, via un code QR
          temporaire et à usage unique. Chaque partage fait l'objet d'une entrée dans le journal
          d'audit, consultable par vous.
        </p>
        <p>
          Certaines données techniques peuvent être confiées à des sous-traitants (hébergement,
          envoi d'emails) soumis à des obligations de confidentialité strictes.
        </p>
      </>
    ),
  },
  {
    title: "6. Hébergement et sécurité",
    body: (
      <p>
        Vos données sont hébergées sur des serveurs situés au Bénin. Elles sont chiffrées au repos
        (AES-256) et en transit (HTTPS/TLS). L'accès est protégé par authentification, gestion de
        rôles (RBAC) et journalisation de tous les accès.
      </p>
    ),
  },
  {
    title: "7. Conservation des données",
    body: (
      <p>
        Vos données sont conservées pendant la durée de votre compte, puis supprimées ou
        anonymisées selon les durées prévues par la réglementation en vigueur, sauf obligation
        légale de conservation.
      </p>
    ),
  },
  {
    title: "8. Vos droits",
    body: (
      <>
        <p>
          Conformément à la loi béninoise sur la protection des données et au RGPD, vous disposez
          des droits suivants :
        </p>
        <ul>
          <li>Droit d'accès, de rectification et de mise à jour de vos données ;</li>
          <li>Droit à l'effacement (« droit à l'oubli ») ;</li>
          <li>Droit de limitation et d'opposition au traitement ;</li>
          <li>Droit à la portabilité de vos données.</li>
        </ul>
        <p>
          Pour exercer ces droits, écrivez-nous à <strong>contact@easyhealth.bj</strong>. Vous pouvez
          également introduire une réclamation auprès de l'<strong>APDP</strong> (Autorité de
          Protection des Données à caractère Personnel).
        </p>
      </>
    ),
  },
  {
    title: "9. Cookies",
    body: (
      <p>
        EasyHealth utilise des cookies strictement nécessaires au fonctionnement de la session et à
        la sécurité (authentification, préférence de langue). Aucun cookie de suivi publicitaire
        n'est déposé sans votre consentement.
      </p>
    ),
  },
]

export default function PrivacyPolicyPage() {
  return (
    <div className="legal-page">
      <header className="legal-hero">
        <div className="container">
          <span className="eyebrow">Confiance</span>
          <h1>Politique de confidentialité</h1>
          <p>Comment EasyHealth collecte, protège et utilise vos données, conformément à l'APDP et au RGPD.</p>
          <p className="legal-updated">Dernière mise à jour : 11 juillet 2026</p>
        </div>
      </header>

      <div className="legal-body">
        <div className="legal-card legal-section">
          {sections.map((s) => (
            <div key={s.title} className="legal-section">
              <h2>{s.title}</h2>
              {s.body}
            </div>
          ))}
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
