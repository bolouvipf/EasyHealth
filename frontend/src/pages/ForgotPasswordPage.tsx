import { useState, FormEvent } from "react"
import { Link } from "react-router-dom"
import { auth as authApi } from "../services/api"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [resetLink, setResetLink] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage("")
    setError("")
    setResetLink("")
    try {
      const res = await authApi.forgotPassword({ email })
      if (res.token) {
        const link = `${window.location.origin}/reset-password?token=${res.token}`
        setResetLink(link)
        setMessage("Mode développement — lien de réinitialisation généré ci-dessous")
      } else {
        setMessage(res.message || "Si cet email existe, un lien de réinitialisation a été envoyé.")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi")
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>EasyHealth</h1>
        <h2>Mot de passe oublié</h2>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}
        {resetLink && (
          <div className="alert alert-info">
            <p>Lien de réinitialisation :</p>
            <a href={resetLink} style={{ wordBreak: "break-all" }}>{resetLink}</a>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Envoyer le lien</button>
        </form>
        <p className="auth-link">
          <Link to="/login">Retour à la connexion</Link>
        </p>
      </div>
    </div>
  )
}
