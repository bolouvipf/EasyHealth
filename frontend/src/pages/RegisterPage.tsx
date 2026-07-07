import { useState, FormEvent } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", password: "", nom: "", prenom: "", role: "patient", telephone: "", professionalLicenseNumber: "" })
  const [error, setError] = useState("")
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await register(form)
      navigate("/patients")
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
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
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
            <div className="form-group">
              <label>Numéro d'enregistrement professionnel</label>
              <input value={form.professionalLicenseNumber} onChange={(e) => setForm({ ...form, professionalLicenseNumber: e.target.value })} />
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-block">S'inscrire</button>
        </form>
        <p className="auth-link">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
