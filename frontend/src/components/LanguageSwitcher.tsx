import { useLanguage } from "../i18n/LanguageContext"

const LANGUAGES = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
]

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="lang-switcher">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          className={`lang-btn ${lang === l.code ? "active" : ""}`}
          onClick={() => setLang(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
