import { useState, useEffect, useMemo } from "react"
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

const scrollTo = (id: string) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: "smooth" })
}

function QrCode({ value, size = 180 }: { value: string; size?: number }) {
  const cells = 25
  const grid = useMemo(() => {
    let seed = 0
    for (const ch of value) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    const m: boolean[][] = Array.from({ length: cells }, () =>
      Array.from({ length: cells }, () => rand() > 0.5)
    )
    const placeFinder = (r: number, c: number) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          const edge = i === 0 || i === 6 || j === 0 || j === 6
          const inner = i >= 2 && i <= 4 && j >= 2 && j <= 4
          m[r + i][c + j] = edge || inner
        }
      }
    }
    placeFinder(0, 0)
    placeFinder(0, cells - 7)
    placeFinder(cells - 7, 0)
    return m
  }, [value])

  const cell = size / cells
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="qr-svg" role="img" aria-label="QR code">
      <rect width={size} height={size} fill="#ffffff" rx={10} />
      <g fill="#0f3e2e">
        {grid.map((row, r) =>
          row.map((on, c) =>
            on ? <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} /> : null
          )
        )}
      </g>
    </svg>
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
            établissements réunis en un seul scan.
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
              <QrCode value="EASYHEALTH" size={130} />
              <span>Dossier de santé sécurisé</span>
            </div>
            <img
              src="/doctor-hero.png"
              alt="Médecin scannant le QR code d'un patient avec EasyHealth"
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
  const [qrCode, setQrCode] = useState("")
  const [patient, setPatient] = useState<PatientData | null>(null)

  const phases = ["Accueil", "Scan en cours", "Accès autorisé", "Dossier ouvert"]

  useEffect(() => {
    let active = true
    const run = async () => {
      while (active) {
        for (let i = 0; i < phases.length; i++) {
          if (!active) return
          setPhase(i)
          if (i === 1) {
            setQrCode("EH-" + Math.random().toString(36).slice(2, 10).toUpperCase())
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
              <p>Code QR temporaire à usage unique</p>
            </div>
            <div className="home-card">
              <h4>Journal d'audit</h4>
              <p>Traçabilité de chaque accès</p>
            </div>
          </div>
        )}

        {phase === 1 && (
          <div className="screen-pad scan-pad">
            <div className="scanner">
              <div className="scanner-line" />
              <QrCode value={qrCode || "EASYHEALTH"} size={150} />
            </div>
            <p className="scan-hint">Scan du code patient…</p>
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
    <section id="demo" className="section demo">
      <div className="container">
        <div className="demo-visual">
          <DoctorScanAnimation />
        </div>
        <header className="section-head">
          <span className="eyebrow">Démonstration</span>
          <h2>Voyez EasyHealth en action</h2>
          <p>Scannez le code pour simuler l'accès au dossier d'un patient.</p>
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
                  {loading ? "Scan en cours…" : "Lancer le scanner"}
                </button>
                <p className="hint">Le patient contrôle l'accès et sa durée.</p>
              </div>
            )}
          </div>

          <div className="demo-card qr-card">
            <div className="card-label">Code patient de démo</div>
            <QrCode value="EASYHEALTH-DEMO" size={200} />
            <p className="hint">Valide 1 heure · Usage unique</p>
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
      title: "Partage par QR code",
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
    <section className="section features">
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
          <a href="#">Documentation API</a>
          <a href="#">Guide patient</a>
          <a href="#">FAQ</a>
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
