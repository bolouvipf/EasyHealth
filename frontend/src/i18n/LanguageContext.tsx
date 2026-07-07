import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import fr from "./fr.json"
import en from "./en.json"

type Translations = Record<string, any>

const STORAGE_KEY = "easyhealth_lang"

const translations: Record<string, Translations> = { fr, en }

interface LanguageContextType {
  lang: string
  setLang: (lang: string) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function resolve(obj: any, key: string): string | undefined {
  const parts = key.split(".")
  let current = obj
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined
    current = current[part]
  }
  return typeof current === "string" ? current : undefined
}

function interpolate(message: string, params?: Record<string, string | number>): string {
  if (!params) return message
  let result = message
  for (const [k, v] of Object.entries(params)) {
    result = result.replace(`{${k}}`, String(v))
  }
  return result
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || navigator.language?.substring(0, 2) || "fr"
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((newLang: string) => {
    if (translations[newLang]) setLangState(newLang)
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict = translations[lang] ?? translations["fr"] ?? {}
      const message = resolve(dict, key) ?? key
      return interpolate(message, params)
    },
    [lang],
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error("useLanguage must be used within LanguageProvider")
  return context
}
