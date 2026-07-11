import { useState, useEffect, useRef } from "react"
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

function FloatingParticles() {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 20,
    duration: 15 + Math.random() * 20,
  }))

  return (
    <div className="particles-bg" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animationDelay: `-${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

function HeroSection({ user, scrollTo }: { user: any; scrollTo: (id: string) => void }) {
  const [animate, setAnimate] = useState(false)
  useEffect(() => { setAnimate(true) }, [])

  return (
    <section id="home" className="hero-section" aria-labelledby="hero-title">
      <FloatingParticles />
      <div className="hero-gradient-orb orb-1" aria-hidden="true" />
      <div className="hero-gradient-orb orb-2" aria-hidden="true" />
      <div className="hero-gradient-orb orb-3" aria-hidden="true" />

      <div className="hero-container">
        <div className="hero-content">
          <span className="hero-badge" style={{ animationDelay: "0.1s" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Dossier de Santé Partagé — Bénin
          </span>

          <h1 id="hero-title" className={animate ? "visible" : ""}>
            La santé <span className="highlight">connectée</span> pour tous
          </h1>

          <p className="hero-subtitle" style={{ animationDelay: "0.3s" }}>
            Votre dossier médical, sécurisé, accessible partout.
            Patients, médecins et établissements connectés en un scan.
          </p>

          <div className="hero-actions" style={{ animationDelay: "0.4s" }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              Créer mon compte
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Se connecter
            </Link>
          </div>

          <div className="hero-trust" style={{ animationDelay: "0.5s" }}>
            <span className="trust-label">Conforme APDP • Chiffrement AES-256 • Hébergement sécurisé</span>
            <div className="trust-badges">
              <span className="badge-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="2" />
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Sécurisé
              </span>
              <span className="badge-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                Interopérable
              </span>
              <span className="badge-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                Conforme APDP
              </span>
            </div>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <DoctorScanAnimation />
        </div>
      </div>

      <div className="scroll-indicator" onClick={() => scrollTo("demo")} aria-label="Découvrir la démo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}

function DoctorScanAnimation() {
  const [phase, setPhase] = useState(0)
  const [qrCode, setQrCode] = useState("")
  const [patientData, setPatientData] = useState<PatientData | null>(null)
  const [scanning, setScanning] = useState(false)

  const phases = [
    { label: "Médecin ouvre EasyHealth", icon: "📱" },
    { label: "Scan du code patient", icon: "📷" },
    { label: "Accès autorisé", icon: "✅" },
    { label: "Dossier accessible", icon: "📋" },
  ]

  useEffect(() => {
    const cycle = async () => {
      while (true) {
        for (let i = 0; i < phases.length; i++) {
          setPhase(i)
          if (i === 1) {
            setScanning(true)
            setQrCode("EH-" + Math.random().toString(36).substring(2, 10).toUpperCase())
            await new Promise(r => setTimeout(r, 1500))
            setScanning(false)
            setPatientData({
              name: "Marie KOUASSI",
              age: 34,
              bloodType: "O+",
              allergies: ["Pénicilline"],
              lastVisit: "2024-01-15",
            })
          }
          if (i === 3) {
            setPatientData(null)
          }
          await new Promise(r => setTimeout(r, 2500))
        }
      }
    }
    cycle()
  }, [])

  return (
    <div className="scan-animation">
      <div className="phone-mockup">
        <div className="phone-frame">
          <div className="phone-screen">
            {phase === 0 && (
              <div className="app-screen home-screen">
                <div className="app-header">
                  <div className="app-logo">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>EasyHealth</span>
                  </div>
                </div>
                <div className="app-body">
                  <div className="feature-cards">
                    <div className="feature-card">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <h4>Mon Dossier</h4>
                      <p>Antécédents, traitements, allergies</p>
                    </div>
                    <div className="feature-card">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <path d="M3.27 6.96L12 12.01l8.73-5.05" />
                        <path d="M12 22.08V12" />
                      </svg>
                      <h4>Partage Sécurisé</h4>
                      <p>Code QR temporaire unique</p>
                    </div>
                    <div className="feature-card">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="2" width="20" height="20" rx="2" />
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <h4>Journal d'Audit</h4>
                      <p>Traçabilité complète des accès</p>
                    </div>
                  </div>
                  <button className="scan-btn" onClick={() => {}}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                      <line x1="12" y1="3" x2="12" y2="21" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                    </svg>
                    <span>Scanner un code</span>
                  </button>
                </div>
              </div>
            )}

            {phase === 1 && (
              <div className="app-screen scanning-screen">
                <div className="scanner-overlay">
                  <div className="scanner-frame">
                    <div className="scanner-line" />
                    <div className="corner tl" />
                    <div className="corner tr" />
                    <div className="corner bl" />
                    <div className="corner br" />
                  </div>
                  <p className="scan-hint">Pointez vers le code QR du patient</p>
                  {scanning && (
                    <div className="scanning-pulse" />
                  )}
                </div>
                <div className="camera-feed">
                  <QRCodeDisplay code={qrCode} />
                </div>
              </div>
            )}

            {phase === 2 && (
              <div className="app-screen success-screen">
                <div className="success-icon">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h3>Accès autorisé</h3>
                <p>Dr. Pierre BOLOUVI — Médecin généraliste</p>
                <div className="access-badge">Niveau : Complet · Durée : 1h</div>
              </div>
            )}

            {phase === 3 && patientData && (
              <div className="app-screen patient-screen">
                <div className="patient-header">
                  <div className="patient-avatar">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="patient-info">
                    <h3>{patientData.name}</h3>
                    <p>{patientData.age} ans • Groupe sanguin {patientData.bloodType}</p>
                  </div>
                </div>
                <div className="patient-details">
                  <div className="detail-row">
                    <span className="detail-label">Allergies</span>
                    <span className="detail-value allergy">{patientData.allergies.join(", ")}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Dernière visite</span>
                    <span className="detail-value">{patientData.lastVisit}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Statut</span>
                    <span className="detail-value active">Dossier actif</span>
                  </div>
                </div>
                <div className="patient-actions">
                  <button className="btn btn-primary btn-sm">Nouvelle consultation</button>
                  <button className="btn btn-outline btn-sm">Voir l'historique</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="phone-indicator">
          <span className={`phase-dot ${phase === 0 ? "active" : ""}`} />
          <span className={`phase-dot ${phase === 1 ? "active" : ""}`} />
          <span className={`phase-dot ${phase === 2 ? "active" : ""}`} />
          <span className={`phase-dot ${phase === 3 ? "active" : ""}`} />
        </div>
      </div>
    </div>
  )
}

function DemoSection() {
  const [demoPhase, setDemoPhase] = useState(0)
  const [scanResult, setScanResult] = useState<PatientData | null>(null)
  const [scanning, setScanning] = useState(false)

  const handleScan = async () => {
    setScanning(true)
    await new Promise(r => setTimeout(r, 2000))
    setScanResult({
      name: "Jean DUPONT",
      age: 45,
      bloodType: "A+",
      allergies: ["Aucune connue"],
      conditions: ["Hypertension", "Diabète type 2"],
      medications: ["Amlodipine 5mg", "Metformine 500mg"],
      lastVisit: "2024-11-20",
    })
    setScanning(false)
  }

  const resetDemo = () => {
    setScanResult(null)
    setDemoPhase(0)
  }

  return (
    <section id="demo" className="demo-section" aria-labelledby="demo-title">
      <div className="container">
        <div className="section-header">
          <span className="eyebrow">Démonstration interactive</span>
          <h2 id="demo-title">Voyez EasyHealth en action</h2>
          <p className="section-subtitle">
            Scannez le code QR ci-dessous pour simuler l'accès au dossier d'un patient
          </p>
        </div>

        <div className="demo-grid">
          <div className="demo-phone">
            <div className="phone-frame interactive">
              <div className="phone-screen">
                {!scanResult ? (
                  <div className="demo-home">
                    <div className="app-header">
                      <div className="app-logo">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        <span>EasyHealth Pro</span>
                      </div>
                    </div>
                    <div className="app-body">
                      <div className="welcome-card">
                        <div className="welcome-icon">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                            <line x1="12" y1="3" x2="12" y2="21" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                          </svg>
                        </div>
                        <h3>Scanner un code patient</h3>
                        <p>Pointez la caméra vers le code QR du patient pour accéder à son dossier</p>
                        <button className="btn btn-primary btn-lg scan-trigger" onClick={handleScan} disabled={scanning}>
                          {scanning ? (
                            <>
                              <span className="spinner" />
                              Scan en cours...
                            </>
                          ) : (
                            <>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                                <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                                <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                                <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                                <line x1="12" y1="3" x2="12" y2="21" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                              </svg>
                              Lancer le scanner
                            </>
                          )}
                        </button>
                      </div>
                      <div className="demo-features">
                        <div className="mini-feature">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            <path d="M3.27 6.96L12 12.01l8.73-5.05" />
                            <path d="M12 22.08V12" />
                          </svg>
                          <span>Accès instantané</span>
                        </div>
                        <div className="mini-feature">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="M9 12l2 2 4-4" />
                          </svg>
                          <span>Consentement tracé</span>
                        </div>
                        <div className="mini-feature">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="M9 12l2 2 4-4" />
                          </svg>
                          <span>Conforme APDP</span>
                        </div>
                      </div>
</div>
              </div>
            ) : (
              <div className="demo-result">
                <div className="result-header">
                  <div className="success-animation">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <h3>Dossier débloqué</h3>
                  <p className="doctor-name">Dr. Pierre BOLOUVI — Médecin généraliste</p>
                </div>

                <div className="patient-profile">
                  <div className="profile-header">
                    <div className="avatar">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div>
                      <h4>Marie KOUASSI</h4>
                      <p>34 ans • Groupe sanguin O+</p>
                    </div>
                  </div>

                  <div className="info-grid">
                    <div className="info-item critical">
                      <span className="label">Allergies</span>
                      <span className="value allergy">Pénicilline</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Groupe sanguin</span>
                      <span className="value">O+</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Dernière visite</span>
                      <span className="value">15/01/2024</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Statut</span>
                      <span className="value active">Dossier actif</span>
                    </div>
                  </div>
                </div>

                <div className="result-actions">
                  <button className="btn btn-primary" onClick={() => alert("Nouvelle consultation ouverte")}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Nouvelle consultation
                  </button>
                  <button className="btn btn-outline" onClick={resetDemo}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                    Recommencer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="demo-qrcode">
          <div className="qrcode-card">
            <div className="qrcode-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <path d="M3.27 6.96L12 12.01l8.73-5.05" />
                <path d="M12 22.08V12" />
              </svg>
              <span>Code patient de démo</span>
            </div>
            <div className="qrcode-display" id="demo-qrcode">
              <svg viewBox="0 0 100 100" width="200" height="200">
                <rect width="100" height="100" fill="white" />
                <rect x="10" y="10" width="8" height="8" fill="#0f3e17" />
                <rect x="20" y="10" width="8" height="8" fill="#0f3e17" />
                <rect x="30" y="10" width="8" height="8" fill="#0f3e17" />
                <rect x="40" y="10" width="8" height="8" fill="#0f3e17" />
                <rect x="50" y="10" width="8" height="8" fill="#0f3e17" />
                <rect x="60" y="10" width="8" height="8" fill="#0f3e17" />
                <rect x="70" y="10" width="8" height="8" fill="#0f3e17" />
                <rect x="80" y="10" width="8" height="8" fill="#0f3e17" />
                <rect x="90" y="10" width="8" height="8" fill="#0f3e17" />
                <rect x="10" y="20" width="8" height="8" fill="#0f3e17" />
                <rect x="80" y="20" width="8" height="8" fill="#0f3e17" />
                <rect x="10" y="30" width="8" height="8" fill="#0f3e17" />
                <rect x="40" y="30" width="8" height="8" fill="#0f3e17" />
                <rect x="50" y="30" width="8" height="8" fill="#0f3e17" />
                <rect x="80" y="30" width="8" height="8" fill="#0f3e17" />
                <rect x="10" y="40" width="8" height="8" fill="#0f3e17" />
                <rect x="30" y="40" width="8" height="8" fill="#0f3e17" />
                <rect x="40" y="40" width="8" height="8" fill="#0f3e17" />
                <rect x="80" y="40" width="8" height="8" fill="#0f3e17" />
                <rect x="10" y="50" width="8" height="8" fill="#0f3e17" />
                <rect x="30" y="50" width="8" height="8" fill="#0f3e17" />
                <rect x="70" y="50" width="8" height="8" fill="#0f3e17" />
                <rect x="80" y="50" width="8" height="8" fill="#0f3e17" />
                <rect x="10" y="60" width="8" height="8" fill="#0f3e17" />
                <rect x="20" y="60" width="8" height="8" fill="#0f3e17" />
                <rect x="50" y="60" width="8" height="8" fill="#0f3e17" />
                <rect x="80" y="60" width="8" height="8" fill="#0f3e17" />
                <rect x="10" y="70" width="8" height="8" fill="#0f3e17" />
                <rect x="20" y="70" width="8" height="8" fill="#0f3e17" />
                <rect x="60" y="70" width="8" height="8" fill="#0f3e17" />
                <rect x="80" y="70" width="8" height="8" fill="#0f3e17" />
                <rect x="10" y="80" width="8" height="8" fill="#0f3e17" />
                <rect x="30" y="80" width="8" height="8" fill="#0f3e17" />
                <rect x="60" y="80" width="8" height="8" fill="#0f3e17" />
                <rect x="80" y="80" width="8" height="8" fill="#0f3e17" />
                <rect x="10" y="90" width="8" height="8" fill="#0f3e17" />
                <rect x="30" y="90" width="8" height="8" fill="#0f3e17" />
                <rect x="50" y="90" width="8" height="8" fill="#0f3e17" />
                <rect x="80" y="90" width="8" height="8" fill="#0f3e17" />
              </svg>
            </div>
            <p className="qrcode-caption">Scannez avec l'app EasyHealth Pro</p>
            <div className="qrcode-info">
              <div className="info-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <span>Valide 1 heure</span>
              </div>
              <div className="info-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <span>Usage unique</span>
              </div>
            </div>
          </div>

          <div className="scan-tip">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13a10.94 10.94 0 0 1-1.72 4.2" />
              <path d="M22 12h-4l-3 9L6 10l-2 7" />
            </svg>
            <span>Pointez la caméra de votre téléphone vers le code QR</span>
          </div>
        </div>
      </div>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: "Dossier Patient Unifié",
      desc: "Antécédents, traitements, allergies, examens — centralisés et accessibles en un clic.",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <path d="M3.27 6.96L12 12.01l8.73-5.05" />
          <path d="M12 22.08V12" />
        </svg>
      ),
      title: "Partage par QR Code",
      desc: "Codes temporaires à usage unique. Le patient contrôle qui accède à ses données et pour combien de temps.",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="20" height="20" rx="2" />
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      title: "Journal d'Audit Complet",
      desc: "Chaque accès est horodaté, tracé et consultable. Transparence totale pour le patient et l'administration.",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ),
      title: "Conforme APDP & RGPD",
      desc: "Hébergement local, chiffrement AES-256, consentement explicite tracé. Sécurité niveau santé.",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: "RBAC 6 Rôles",
      desc: "Patient, Médecin, Infirmier, Agent communautaire, Administratif, Admin — permissions granulaires.",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      ),
      title: "Interopérabilité FHIR",
      desc: "Standards ouverts HL7 FHIR R4 pour échanger avec les systèmes hospitaliers existants au Bénin.",
    },
  ]

  return (
    <section className="features-section" aria-labelledby="features-title">
      <div className="container">
        <div className="section-header">
          <span className="eyebrow">Fonctionnalités clés</span>
          <h2 id="features-title">Tout pour une santé connectée</h2>
          <p className="section-subtitle">
            Une plateforme complète, sécurisée et interopérable pour le système de santé béninois
          </p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <article key={i} className="feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
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
    <section className="cta-section" aria-labelledby="cta-title">
      <div className="cta-bg" aria-hidden="true">
        <div className="cta-orb" />
      </div>
      <div className="container">
        <div className="cta-content">
          <h2 id="cta-title">Prêt à rejoindre EasyHealth ?</h2>
          <p>Créez votre compte en quelques minutes et découvrez la santé connectée.</p>
          <div className="cta-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              Créer mon compte gratuit
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Déjà un compte ? Se connecter
            </Link>
          </div>
          <p className="cta-note">Gratuit pour les patients • Conforme APDP • Support béninois</p>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>EasyHealth</span>
            </Link>
            <p>Dossier de Santé Partagé pour le Bénin</p>
            <div className="social-links">
              <a href="#" aria-label="Twitter" className="social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="#" aria-label="GitHub" className="social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.804 2.807 1.28 3.499.98.077-.765.288-1.54.519-1.912-1.758-.199-3.61-.879-3.61-3.953 0-.873.312-1.587.823-2.147-.082-.202-.356-1.015.078-2.117 0 0 .672-.215 2.205.823.636-.178 1.307-.266 1.977-.266.67 0 1.34.088 1.977.265 1.535-1.038 2.207-.823 2.207-.823.436 1.102.162 1.915.079 2.117.51.56.823 1.277.823 2.147 0 3.074-1.851 3.854-3.616 3.947.283.247.535.729.535 1.474v2.136c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Navigation</h4>
            <nav>
              <ul>
                <li><Link to="/">Accueil</Link></li>
                <li><Link to="/register">S'inscrire</Link></li>
                <li><Link to="/login">Connexion</Link></li>
              </ul>
            </nav>
          </div>

          <div className="footer-links">
            <h4>Ressources</h4>
            <nav>
              <ul>
                <li><a href="#">Documentation API</a></li>
                <li><a href="#">Guide patient</a></li>
                <li><a href="#">Guide professionnel</a></li>
                <li><a href="#">FAQ</a></li>
              </ul>
            </nav>
          </div>

          <div className="footer-links">
            <h4>Légal</h4>
            <nav>
              <ul>
                <li><a href="#">Mentions légales</a></li>
                <li><a href="#">Politique de confidentialité</a></li>
                <li><a href="#">Conditions d'utilisation</a></li>
                <li><a href="#">Conformité APDP</a></li>
              </ul>
            </nav>
          </div>

          <div className="footer-contact">
            <h4>Contact</h4>
            <address>
              <p>Cotonou, Bénin</p>
              <p><a href="mailto:contact@easyhealth.bj">contact@easyhealth.bj</a></p>
              <p><a href="tel:+2290123456789">+229 01 23 45 67 89</a></p>
            </address>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 EasyHealth. Tous droits réservés.</p>
          <p className="footer-badges">
            <span className="badge">Conforme APDP</span>
            <span className="badge">AES-256</span>
            <span className="badge">Open Source</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

function QRCodeDisplay({ code }: { code: string }) {
  return (
    <div className="qrcode-animated">
      <svg viewBox="0 0 100 100" width="180" height="180">
        <rect width="100" height="100" fill="white" />
        <g fill="#0f3e17">
          <rect x="10" y="10" width="8" height="8" />
          <rect x="20" y="10" width="8" height="8" />
          <rect x="30" y="10" width="8" height="8" />
          <rect x="40" y="10" width="8" height="8" />
          <rect x="50" y="10" width="8" height="8" />
          <rect x="60" y="10" width="8" height="8" />
          <rect x="70" y="10" width="8" height="8" />
          <rect x="80" y="10" width="8" height="8" />
          <rect x="90" y="10" width="8" height="8" />
          <rect x="10" y="20" width="8" height="8" />
          <rect x="80" y="20" width="8" height="8" />
          <rect x="10" y="30" width="8" height="8" />
          <rect x="40" y="30" width="8" height="8" />
          <rect x="50" y="30" width="8" height="8" />
          <rect x="80" y="30" width="8" height="8" />
          <rect x="10" y="40" width="8" height="8" />
          <rect x="30" y="40" width="8" height="8" />
          <rect x="40" y="40" width="8" height="8" />
          <rect x="80" y="40" width="8" height="8" />
          <rect x="10" y="50" width="8" height="8" />
          <rect x="30" y="50" width="8" height="8" />
          <rect x="70" y="50" width="8" height="8" />
          <rect x="80" y="50" width="8" height="8" />
          <rect x="10" y="60" width="8" height="8" />
          <rect x="20" y="60" width="8" height="8" />
          <rect x="50" y="60" width="8" height="8" />
          <rect x="80" y="60" width="8" height="8" />
          <rect x="10" y="70" width="8" height="8" />
          <rect x="20" y="70" width="8" height="8" />
          <rect x="60" y="70" width="8" height="8" />
          <rect x="80" y="70" width="8" height="8" />
          <rect x="10" y="80" width="8" height="8" />
          <rect x="30" y="80" width="8" height="8" />
          <rect x="60" y="80" width="8" height="8" />
          <rect x="80" y="80" width="8" height="8" />
          <rect x="10" y="90" width="8" height="8" />
          <rect x="30" y="90" width="8" height="8" />
          <rect x="50" y="90" width="8" height="8" />
          <rect x="80" y="90" width="8" height="8" />
        </g>
        <text x="50" y="95" textAnchor="middle" fontSize="8" fill="#666" fontFamily="monospace">
          {code}
        </text>
      </svg>
    </div>
  )
}

export default function LandingPage() {
  const { user } = useAuth()
  const { lang } = useLanguage()

  const t = {
    fr: {
      heroTitle: "La santé connectée pour tous",
      heroSub: "Votre dossier médical, sécurisé, accessible partout. Patients, médecins et établissements connectés en un scan.",
      ctaRegister: "Créer mon compte",
      ctaLogin: "Se connecter",
      demoTitle: "Voyez EasyHealth en action",
      demoSub: "Scannez le code QR ci-dessous pour simuler l'accès au dossier d'un patient",
      featuresTitle: "Fonctionnalités clés",
      featuresSub: "Une plateforme complète, sécurisée et interopérable pour le système de santé béninois",
      ctaTitle: "Prêt à rejoindre EasyHealth ?",
      ctaSub: "Créez votre compte en quelques minutes et découvrez la santé connectée.",
    },
    en: {
      heroTitle: "Connected healthcare for everyone",
      heroSub: "Your medical record, secure, accessible anywhere. Patients, doctors and facilities connected in one scan.",
      ctaRegister: "Create my account",
      ctaLogin: "Sign in",
      demoTitle: "See EasyHealth in action",
      demoSub: "Scan the QR code below to simulate accessing a patient's record",
      featuresTitle: "Key features",
      featuresSub: "A complete, secure and interoperable platform for the Beninese health system",
      ctaTitle: "Ready to join EasyHealth?",
      ctaSub: "Create your account in minutes and discover connected healthcare.",
    },
  }[lang]

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="landing-page">
      <a href="#main-content" className="skip-link">Aller au contenu principal</a>

      <HeroSection user={user} scrollTo={scrollTo} />

      <main id="main-content">
        <DemoSection />
        <FeaturesSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  )
}