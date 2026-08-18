import React, { useState } from 'react'
import { Trophy, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const LoginPage: React.FC = () => {
  const { login } = useAuth()
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
      setErrorMessage('请输入姓名')
      return
    }
    if (!password || password.length < 6) {
      setErrorMessage('密码至少 6 位')
      return
    }

    setLoading(true)
    const res = await login(trimmed, password)
    setLoading(false)

    if (!res.success) {
      setErrorMessage(res.error || '登录失败，请重试')
    }
  }

  return (
    <div className="login-screen">
      <div className="login-centered-card">
        {/* Brand */}
        <div className="login-header-simple">
          <div className="login-logo-box">
            <Trophy className="login-logo-icon" />
          </div>
          <h1 className="login-title-simple">人数排行榜</h1>
        </div>

        {/* Tab switch */}
        <div className="auth-tab-switch">
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setErrorMessage(null); }}
          >
            员工登录
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => { setActiveTab('register'); setErrorMessage(null); }}
          >
            首次注册
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
              员工姓名
            </label>
            <div className="input-box">
              <User size={18} className="field-icon" />
              <input
                id="login-name"
                type="text"
                placeholder="输入姓名"
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
                登录密码
              </label>
              <span className="pwd-hint">不少于 6 位</span>
            </div>
            <div className="input-box">
              <Lock size={18} className="field-icon" />
              <input
                id="login-pwd"
                type={showPassword ? 'text' : 'password'}
                placeholder="输入密码"
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
                <span>{activeTab === 'login' ? '登录' : '注册并进入'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
