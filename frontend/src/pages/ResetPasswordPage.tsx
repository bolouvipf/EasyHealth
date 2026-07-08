import { useState, FormEvent } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { auth as authApi } from "../services/api"

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const tokenFromUrl = searchParams.get("token") || ""
  const [token, setToken] = useState(tokenFromUrl)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage("")
    setError("")
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }
    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères")
      return
    }
    try {
      const res = await authApi.resetPassword({ token, newPassword })
      setMessage(res.message || "Mot de passe réinitialisé avec succès")
      setSuccess(true)
      setTimeout(() => navigate("/login"), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la réinitialisation")
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>EasyHealth</h1>
        <h2>Réinitialisation du mot de passe</h2>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}
        {success ? (
          <p className="auth-link">Redirection vers la connexion...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Token de réinitialisation</label>
              <input type="text" value={token} onChange={(e) => setToken(e.target.value)} required placeholder="Collez le token reçu par email" />
            </div>
            <div className="form-group">
              <label>Nouveau mot de passe</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} placeholder="Min. 8 caractères, majuscule, chiffre, spécial" />
            </div>
            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} placeholder="Retaper le mot de passe" />
            </div>
            <button type="submit" className="btn btn-primary btn-block">Réinitialiser</button>
          </form>
        )}
        <p className="auth-link">
          <Link to="/login">Retour à la connexion</Link>
        </p>
      </div>
    </div>
  )
}
