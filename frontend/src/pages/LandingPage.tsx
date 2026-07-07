import { Link } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { useEffect, useState } from "react"

const scrollTo = (id: string) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: "smooth" })
}

export default function LandingPage() {
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="landing">
      <nav className={`navbar landing-nav${scrolled ? " scrolled" : ""}`}>
        <div className="navbar-inner">
          <Link to="/" className="nav-brand">EasyHealth</Link>
          <div className="nav-links nav-links-center">
            <button className="nav-link-text" onClick={() => scrollTo("about")}>À propos</button>
            <button className="nav-link-text" onClick={() => scrollTo("features")}>Fonctionnalités</button>
          </div>
          <div className="nav-links">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary">Mon espace</Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">Se connecter</Link>
                <Link to="/register" className="btn btn-primary">S'inscrire</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">Dossier de Santé partagé — Bénin</span>
          <h1>La santé connectée pour tous</h1>
          <p className="hero-sub">
            EasyHealth connecte patients, médecins et établissements autour
            d'un registre médical sécurisé, interopérable et conforme aux normes APDP.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">Accéder à mon espace</Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">Créer un compte</Link>
                <Link to="/login" className="btn btn-secondary btn-lg">Se connecter</Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="trust-bar">
        <div className="trust-item">
          <span className="trust-num">100%</span>
          <span className="trust-label">Sécurisé</span>
        </div>
        <div className="trust-item">
          <span className="trust-num">6</span>
          <span className="trust-label">Profils utilisateurs</span>
        </div>
        <div className="trust-item">
          <span className="trust-num">24/7</span>
          <span className="trust-label">Disponible</span>
        </div>
        <div className="trust-item">
          <span className="trust-num">AES-256</span>
          <span className="trust-label">Chiffrement</span>
        </div>
      </section>

      <section className="section-about" id="about">
        <div className="about-grid">
          <div className="about-text">
            <span className="eyebrow">À propos</span>
            <h2>Qu'est-ce que EasyHealth ?</h2>
            <p>
              EasyHealth est un dossier de santé partagé (DSE) conçu pour le système de santé béninois.
              Il permet aux patients de centraliser leurs données médicales et aux professionnels de santé
              d'y accéder en toute sécurité, avec le consentement explicite du patient.
            </p>
            <p>
              Plus besoin de papiers égarés ou de diagnostics perdus. Votre historique médical,
              vos traitements, vos allergies — tout est accessible, partout, en un clic.
            </p>
          </div>
          <div className="about-img">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=60&auto=format&fit=crop"
              alt="Médecin consultant un dossier"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="section-features" id="features">
        <span className="eyebrow" style={{ textAlign: "center", display: "block" }}>Fonctionnalités</span>
        <h2>Tout ce dont vous avez besoin</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <h3>Dossier centralisé</h3>
            <p>Antécédents, traitements, allergies, examens — tout au même endroit, accessible en un clic.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/></svg>
            </div>
            <h3>Partage sécurisé</h3>
            <p>Codes temporaires à usage unique pour partager votre dossier avec un professionnel de santé.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            </div>
            <h3>Consentement tracé</h3>
            <p>Chaque accès à un dossier est horodaté et enregistré avec le consentement explicite du patient.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            </div>
            <h3>Journal d'audit</h3>
            <p>Transparence totale : tout accès est tracé, horodaté et consultable par l'administration.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
            <h3>RBAC strict</h3>
            <p>Six rôles utilisateurs avec des permissions granulaires — de patient à administrateur.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/></svg>
            </div>
            <h3>Interopérabilité FHIR</h3>
            <p>Standards ouverts pour échanger avec les systèmes hospitaliers existants au Bénin.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>EasyHealth — Dossier de Santé partagé | Bénin</p>
        <p className="footer-small">Conforme à la réglementation APDP · Chiffrement AES-256 · Open Source</p>
      </footer>
    </div>
  )
}
