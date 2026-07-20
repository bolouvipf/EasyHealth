import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { useLanguage } from "../i18n/LanguageContext"
import "./LandingPage.css"

interface PatientData {
  name: string
  age: number
  bloodType: string
  allergies: string[]
  conditions?: string[]
  medications?: string[]
  lastVisit: string
}

function FloatingNav({ scrollTo }: { scrollTo: (id: string) => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav className={`landing-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="container landing-nav-inner">
        <Link to="/" className="landing-nav-brand">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          EasyHealth
        </Link>

        <div className={`landing-nav-links ${mobileOpen ? "open" : ""}`}>
          <button className="nav-link-btn" onClick={() => { scrollTo("features"); setMobileOpen(false) }}>Fonctionnalités</button>
          <button className="nav-link-btn" onClick={() => { scrollTo("demo"); setMobileOpen(false) }}>Démo</button>
          <Link to="/faq" onClick={() => setMobileOpen(false)}>FAQ</Link>
          <Link to="/guide-patient" onClick={() => setMobileOpen(false)}>Guide patient</Link>
          <Link to="/guide-pro" onClick={() => setMobileOpen(false)}>Guide pro</Link>
          <Link to="/forgot-password" className="nav-link-muted" onClick={() => setMobileOpen(false)}>Mot de passe oublié</Link>
          <div className="landing-nav-cta">
            <Link to="/login" className="btn btn-ghost btn-sm" onClick={() => setMobileOpen(false)}>Connexion</Link>
            <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMobileOpen(false)}>S'inscrire</Link>
          </div>
        </div>

        <button
          className="landing-nav-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileOpen ? (
              <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
            ) : (
              <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
            )}
          </svg>
        </button>
      </div>
    </nav>
  )
}

function HeroSection({ scrollTo }: { scrollTo: (id: string) => void }) {
  const [animate, setAnimate] = useState(false)
  useEffect(() => {
    setAnimate(true)
  }, [])

  return (
    <section id="home" className="hero">
      <div className="container hero-inner">
        <div className={`hero-text ${animate ? "is-visible" : ""}`}>
          <span className="pill">
            <span className="dot" />
            Dossier de Santé Partagé — Bénin
          </span>
          <h1>
            La santé <span className="accent">connectée</span> pour tous
          </h1>
          <p className="lead">
            Votre dossier médical, sécurisé et accessible partout. Patients, médecins et
            établissements connectés en toute simplicité.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary">
              Créer mon compte
            </Link>
            <Link to="/login" className="btn btn-ghost">
              Se connecter
            </Link>
          </div>
          <ul className="hero-trust">
            <li>Conforme APDP</li>
            <li>Chiffrement AES-256</li>
            <li>Hébergement local</li>
          </ul>
        </div>

        <div className={`hero-visual ${animate ? "is-visible" : ""}`}>
          <div className="hero-media">
            <div className="hero-fallback">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Dossier de santé sécurisé</span>
            </div>
            <img
              src="/doctor-hero.png"
              alt="Médecin consultant le dossier patient"
              className="hero-img"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function DoctorScanAnimation() {
  const [phase, setPhase] = useState(0)
  const [code, setCode] = useState("")
  const [patient, setPatient] = useState<PatientData | null>(null)

  const phases = ["Accueil", "Code généré", "Accès autorisé", "Dossier ouvert"]

  useEffect(() => {
    let active = true
    const run = async () => {
      while (active) {
        for (let i = 0; i < phases.length; i++) {
          if (!active) return
          setPhase(i)
          if (i === 1) {
            setCode("EH-" + Math.random().toString(36).slice(2, 10).toUpperCase())
            await new Promise((r) => setTimeout(r, 1600))
            setPatient({
              name: "Marie KOUASSI",
              age: 34,
              bloodType: "O+",
              allergies: ["Pénicilline"],
              lastVisit: "15/01/2024",
            })
          }
          if (i === 3) setPatient(null)
          await new Promise((r) => setTimeout(r, 2400))
        }
      }
    }
    run()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="phone">
      <div className="phone-notch" />
      <div className="phone-screen">
        <div className="app-bar">
          <div className="app-brand">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>EasyHealth</span>
          </div>
        </div>

        {phase === 0 && (
          <div className="screen-pad">
            <div className="home-card">
              <h4>Mon dossier</h4>
              <p>Antécédents, traitements, allergies</p>
            </div>
            <div className="home-card">
              <h4>Partage sécurisé</h4>
              <p>Code temporaire à usage unique</p>
            </div>
            <div className="home-card">
              <h4>Journal d'audit</h4>
              <p>Traçabilité de chaque accès</p>
            </div>
          </div>
        )}

        {phase === 1 && (
          <div className="screen-pad center">
            <div className="big-code-display">{code || "EH-XXXXXXXX"}</div>
            <p className="scan-hint">Code de partage généré</p>
          </div>
        )}

        {phase === 2 && (
          <div className="screen-pad center">
            <div className="check">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h3>Accès autorisé</h3>
            <p className="muted">Dr. Pierre BOLOUVI · Médecin généraliste</p>
          </div>
        )}

        {phase === 3 && patient && (
          <div className="screen-pad">
            <div className="patient-head">
              <div className="avatar">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <strong>{patient.name}</strong>
                <p className="muted">{patient.age} ans · {patient.bloodType}</p>
              </div>
            </div>
            <div className="kv">
              <span>Allergies</span>
              <b className="warn">{patient.allergies.join(", ")}</b>
            </div>
            <div className="kv">
              <span>Dernière visite</span>
              <b>{patient.lastVisit}</b>
            </div>
          </div>
        )}
      </div>

      <div className="phone-dots">
        {phases.map((_, i) => (
          <span key={i} className={i === phase ? "on" : ""} />
        ))}
      </div>
    </div>
  )
}

function DemoSection() {
  const [scan, setScan] = useState<PatientData | null>(null)
  const [loading, setLoading] = useState(false)

  const runScan = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1800))
    setScan({
      name: "Jean DUPONT",
      age: 45,
      bloodType: "A+",
      allergies: ["Aucune connue"],
      conditions: ["Hypertension", "Diabète type 2"],
      medications: ["Amlodipine 5mg", "Metformine 500mg"],
      lastVisit: "20/11/2024",
    })
    setLoading(false)
  }

  return (
    <section id="demo" className="section demo" data-anchor="demo">
      <div className="container">
        <div className="demo-visual">
          <DoctorScanAnimation />
        </div>
        <header className="section-head">
          <span className="eyebrow">Démonstration</span>
          <h2>Voyez EasyHealth en action</h2>
          <p>Utilisez la démo pour simuler l'accès au dossier d'un patient.</p>
        </header>

        <div className="demo-grid">
          <div className="demo-card">
            <div className="card-label">Application professionnelle</div>
            {scan ? (
              <div className="result">
                <div className="result-top">
                  <div className="check small">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <div>
                    <strong>Dossier débloqué</strong>
                    <p className="muted">Dr. Pierre BOLOUVI</p>
                  </div>
                </div>
                <div className="profile">
                  <div className="avatar">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <strong>{scan.name}</strong>
                    <p className="muted">{scan.age} ans · {scan.bloodType}</p>
                  </div>
                </div>
                <div className="tags">
                  {scan.allergies.map((a) => (
                    <span key={a} className="tag warn">{a}</span>
                  ))}
                  {scan.conditions?.map((c) => (
                    <span key={c} className="tag">{c}</span>
                  ))}
                </div>
                <button className="btn btn-ghost full" onClick={() => setScan(null)}>
                  Recommencer
                </button>
              </div>
            ) : (
              <div className="demo-idle">
                <button className="btn btn-primary full" onClick={runScan} disabled={loading}>
                  {loading ? "Vérification…" : "Accéder à la démo"}
                </button>
                <p className="hint">Le patient contrôle l'accès et sa durée.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    {
      title: "Dossier patient unifié",
      desc: "Antécédents, traitements et allergies centralisés et accessibles en un clic.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      title: "Partage par code temporaire",
      desc: "Codes temporaires à usage unique. Le patient décide qui accède et pour combien de temps.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 7V5a2 2 0 0 1 2-2h2" />
          <path d="M17 3h2a2 2 0 0 1 2 2v2" />
          <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
          <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
          <line x1="12" y1="3" x2="12" y2="21" />
          <line x1="3" y1="12" x2="21" y2="12" />
        </svg>
      ),
    },
    {
      title: "Journal d'audit complet",
      desc: "Chaque accès est horodaté et consultable. Transparence totale.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="16" y2="17" />
        </svg>
      ),
    },
    {
      title: "Conforme APDP & RGPD",
      desc: "Hébergement local, chiffrement AES-256, consentement tracé.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ),
    },
    {
      title: "RBAC 6 rôles",
      desc: "Patient, Médecin, Infirmier, Agent, Administratif, Admin — permissions granulaires.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      title: "Interopérabilité FHIR",
      desc: "Standards HL7 FHIR R4 pour échanger avec les systèmes hospitaliers.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4" />
        </svg>
      ),
    },
  ]

  return (
    <section id="features" className="section features">
      <div className="container">
        <header className="section-head">
          <span className="eyebrow">Fonctionnalités</span>
          <h2>Tout pour une santé connectée</h2>
          <p>Une plateforme complète, sécurisée et interopérable pour le Bénin.</p>
        </header>
        <div className="feature-grid">
          {features.map((f) => (
            <article key={f.title} className="feature">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="section cta">
      <div className="container cta-inner">
        <h2>Prêt à rejoindre EasyHealth ?</h2>
        <p>Créez votre compte en quelques minutes et découvrez la santé connectée.</p>
        <div className="cta-actions">
          <Link to="/register" className="btn btn-primary">
            Créer mon compte
          </Link>
          <Link to="/login" className="btn btn-ghost">
            Se connecter
          </Link>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Link to="/" className="brand">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>EasyHealth</span>
          </Link>
          <p>Dossier de Santé Partagé pour le Bénin.</p>
        </div>
        <nav className="footer-col">
          <h4>Navigation</h4>
          <Link to="/">Accueil</Link>
          <Link to="/register">S'inscrire</Link>
          <Link to="/login">Connexion</Link>
        </nav>
        <nav className="footer-col">
          <h4>Ressources</h4>
          <a href="https://easyhealth-api.onrender.com/api/v1/docs" target="_blank" rel="noreferrer">Documentation API</a>
          <Link to="/guide-patient">Guide patient</Link>
          <Link to="/guide-pro">Guide professionnel</Link>
          <Link to="/faq">FAQ</Link>
        </nav>
        <nav className="footer-col">
          <h4>Légal</h4>
          <Link to="/privacy">Politique de confidentialité</Link>
          <Link to="/privacy">Mentions légales</Link>
          <Link to="/privacy">Conformité APDP</Link>
        </nav>
        <div className="footer-col">
          <h4>Contact</h4>
          <p>Cotonou, Bénin</p>
          <a href="mailto:contact@easyhealth.bj">contact@easyhealth.bj</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2024 EasyHealth. Tous droits réservés.</span>
        <span className="badges">
          <span className="badge">Conforme APDP</span>
          <span className="badge">AES-256</span>
        </span>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  const { user } = useAuth()
  const { lang } = useLanguage()

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="landing">
      <a href="#main" className="skip">Aller au contenu</a>
      <FloatingNav scrollTo={scrollTo} />
      <HeroSection scrollTo={scrollTo} />
      <main id="main">
        <DemoSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
