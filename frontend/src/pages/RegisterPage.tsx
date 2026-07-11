import { useState, FormEvent } from "react"
import { useNavigate, Link } from "react-router-dom"
import { auth as authApi } from "../services/api"

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", password: "", nom: "", prenom: "", role: "patient", telephone: "", professionalLicenseNumber: "", establishment: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    try {
      if (form.role !== "patient") {
        if (!form.professionalLicenseNumber.trim()) {
          setError("Le numéro d'enregistrement professionnel est requis.")
          return
        }
        if (!form.establishment.trim()) {
          setError("L'établissement est requis.")
          return
        }
      }
      const response = await authApi.register(form)
      if (response.user.role !== "patient" && response.user.professionalStatus === "pending") {
        setSuccess("Votre compte a été créé. Un administrateur doit valider votre inscription avant de pouvoir vous connecter.")
      } else {
        navigate("/dashboard")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur d'inscription")
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>EasyHealth</h1>
        <h2>Inscription</h2>
        {error && <div className="alert alert-error">{error}</div>}
        {success ? (
          <div>
            <div className="alert alert-success">{success}</div>
            <p className="auth-link">
              <Link to="/login">Se connecter</Link>
            </p>
          </div>
        ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nom</label>
              <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Prénom</label>
              <input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Mot de passe (8 caractères min)</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Rôle</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="patient">Patient</option>
              <option value="medecin">Médecin</option>
              <option value="infirmier">Infirmier</option>
              <option value="agent_communautaire">Agent communautaire</option>
              <option value="administratif">Administratif</option>
            </select>
          </div>
          <div className="form-group">
            <label>Téléphone</label>
            <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
          </div>
          {form.role !== "patient" && (
            <>
              <div className="form-group">
                <label>Numéro d'enregistrement professionnel *</label>
                <input
                  value={form.professionalLicenseNumber}
                  onChange={(e) => setForm({ ...form, professionalLicenseNumber: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Établissement *</label>
                <input
                  value={form.establishment}
                  onChange={(e) => setForm({ ...form, establishment: e.target.value })}
                  required
                  placeholder="Ex : CHU de Cotonou"
                />
              </div>
            </>
          )}
          <button type="submit" className="btn btn-primary btn-block">S'inscrire</button>
        </form>
        )}
        <p className="auth-link">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
