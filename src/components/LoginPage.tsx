import React, { useState } from 'react'
import { Trophy, User, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { LanguageSwitcher } from './LanguageSwitcher'

export const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const trimmed = name.trim()
    if (!trimmed) {
      setErrorMessage(t.nameRequired)
      return
    }

    setLoading(true)
    const res = await login(trimmed)
    setLoading(false)

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to authenticate')
    }
  }

  return (
    <div className="login-screen">
      {/* 顶部语言切换 */}
      <div className="login-top-lang">
        <LanguageSwitcher />
      </div>

      <div className="login-centered-card">
        {/* Brand */}
        <div className="login-header-simple">
          <div className="login-logo-box">
            <Trophy className="login-logo-icon" />
          </div>
          <div className="login-brand-group">
            <h1 className="login-brand-name">{t.brandName}</h1>
            <p className="login-studio-sub">{t.studioName}</p>
          </div>
          <div className="login-badge-pill">{t.leaderboardTitle}</div>
        </div>

        <div className="login-intro-text">
          <p className="login-intro-subtitle">{t.loginSubtitle}</p>
        </div>

        {errorMessage && (
          <div className="auth-error-banner">
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-field">
            <label htmlFor="login-name" className="input-label">
              {t.nameLabel}
            </label>
            <div className="input-box">
              <User size={18} className="field-icon" />
              <input
                id="login-name"
                type="text"
                placeholder={t.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                disabled={loading}
                className="styled-input name-only-input"
                maxLength={30}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-login-submit name-only-btn"
            disabled={loading || !name.trim()}
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                <span>{t.btnEnter}</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
