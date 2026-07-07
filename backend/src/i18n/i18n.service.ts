import { Injectable } from "@nestjs/common"
import fr from "./translations/fr.json"
import en from "./translations/en.json"

type Translations = Record<string, any>

@Injectable()
export class I18nService {
  private readonly translations: Map<string, Translations> = new Map([
    ["fr", fr as Translations],
    ["en", en as Translations],
  ])
  private readonly fallbackLang = "fr"

  private resolve(obj: any, key: string): string | undefined {
    const parts = key.split(".")
    let current = obj
    for (const part of parts) {
      if (current == null || typeof current !== "object") return undefined
      current = current[part]
    }
    return typeof current === "string" ? current : undefined
  }

  t(key: string, lang?: string, params?: Record<string, string | number>): string {
    const locale = lang && this.translations.has(lang) ? lang : this.fallbackLang
    const translations = this.translations.get(locale) ?? this.translations.get(this.fallbackLang) ?? {}
    let message = this.resolve(translations, key) ?? key
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        message = message.replace(`{${k}}`, String(v))
      }
    }
    return message
  }

  getTranslations(lang?: string): Translations {
    const locale = lang && this.translations.has(lang) ? lang : this.fallbackLang
    return this.translations.get(locale) ?? this.translations.get(this.fallbackLang) ?? {}
  }

  supportedLanguages(): string[] {
    return Array.from(this.translations.keys())
  }
}
