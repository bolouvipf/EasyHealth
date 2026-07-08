import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import * as nodemailer from "nodemailer"

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)
  private transporter: nodemailer.Transporter | null = null

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>("SMTP_HOST")
    const port = this.config.get<number>("SMTP_PORT")
    const user = this.config.get<string>("SMTP_USER")
    const pass = this.config.get<string>("SMTP_PASS")

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: port || 587,
        secure: (port || 587) === 465,
        auth: { user, pass },
      })
      this.logger.log("Transporter SMTP initialisé")
    } else {
      this.logger.warn("SMTP non configuré — les emails ne seront pas envoyés")
    }
  }

  async sendPasswordReset(email: string, token: string) {
    const resetLink = `${this.config.get("FRONTEND_URL", "https://easy-health-wine.vercel.app")}/reset-password?token=${token}`

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.config.get("SMTP_FROM", "noreply@easyhealth.bj"),
          to: email,
          subject: "EasyHealth — Réinitialisation de votre mot de passe",
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
              <h2>EasyHealth</h2>
              <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
              <p>Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe (valable 1 heure) :</p>
              <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#166534;color:#fff;text-decoration:none;border-radius:6px;">
                Réinitialiser mon mot de passe
              </a>
              <p style="margin-top:1rem;color:#666;font-size:0.875rem;">
                Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
              </p>
            </div>
          `,
        })
        this.logger.log(`Email de réinitialisation envoyé à ${email}`)
      } catch (err) {
        this.logger.error(`Échec d'envoi à ${email} : ${err}`)
      }
    }

    this.logger.log(`Token de réinitialisation pour ${email}: ${token}`)
  }
}
