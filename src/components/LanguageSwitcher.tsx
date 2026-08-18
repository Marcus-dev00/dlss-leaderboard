import React from 'react'
import { Globe } from 'lucide-react'
import { useLanguage, Language } from '../context/LanguageContext'

interface LanguageSwitcherProps {
  compact?: boolean
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage()

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'zh', label: '中' },
    { code: 'ms', label: 'BM' }
  ]

  return (
    <div className={`language-switcher ${compact ? 'compact' : ''}`}>
      <Globe size={14} className="lang-icon" />
      <div className="lang-buttons">
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            className={`lang-btn ${language === lang.code ? 'active' : ''}`}
            onClick={() => setLanguage(lang.code)}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  )
}
