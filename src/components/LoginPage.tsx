import React, { useState } from 'react'
import { Trophy, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { LanguageSwitcher } from './LanguageSwitcher'

export const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const trimmed = name.trim()
    if (!trimmed) {
      setErrorMessage(t.nameRequired)
      return
    }
    if (!password || password.length < 6) {
      setErrorMessage(t.pwdRequired)
      return
    }

    setLoading(true)
    const res = await login(trimmed, password)
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

        {/* Tab switch */}
        <div className="auth-tab-switch">
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setErrorMessage(null); }}
          >
            {t.loginTab}
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => { setActiveTab('register'); setErrorMessage(null); }}
          >
            {t.registerTab}
          </button>
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
                className="styled-input"
              />
            </div>
          </div>

          <div className="form-field">
            <div className="label-row">
              <label htmlFor="login-pwd" className="input-label">
                {t.pwdLabel}
              </label>
              <span className="pwd-hint">{t.pwdHint}</span>
            </div>
            <div className="input-box">
              <Lock size={18} className="field-icon" />
              <input
                id="login-pwd"
                type={showPassword ? 'text' : 'password'}
                placeholder={t.pwdPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
                className="styled-input"
              />
              <button
                type="button"
                className="pwd-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-login-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                <span>{activeTab === 'login' ? t.btnLogin : t.btnRegister}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
