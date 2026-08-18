import React, { useState } from 'react'
import { Trophy, Lock, User, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck, Zap, BarChart3, Users } from 'lucide-react'
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
      setErrorMessage('请输入您的员工姓名')
      return
    }
    if (!password || password.length < 6) {
      setErrorMessage('密码长度至少为 6 位字符')
      return
    }

    setLoading(true)
    const res = await login(trimmed, password)
    setLoading(false)

    if (!res.success) {
      setErrorMessage(res.error || '登录或注册失败，请检查后重试')
    }
  }

  return (
    <div className="login-screen">
      {/* Background Decorative Glows */}
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>
      <div className="bg-glow bg-glow-3"></div>

      <div className="login-container">
        {/* Left Side: Brand & Feature Highlights */}
        <div className="login-brand-panel">
          <div className="brand-header">
            <div className="brand-logo-large">
              <Trophy className="brand-trophy-icon" />
            </div>
            <div>
              <div className="brand-badge-pill">DLSS 团队业绩系统</div>
              <h1 className="login-main-title">人数登记排行榜</h1>
            </div>
          </div>

          <p className="login-description">
            实时记录团队每位成员的客户邀约与拓展人数。多周期排行公平透明，激发团队活力，冲刺更高目标！
          </p>

          {/* Feature Highlights Grid */}
          <div className="login-feature-list">
            <div className="feature-item">
              <div className="feature-icon-box blue">
                <Zap size={18} />
              </div>
              <div className="feature-text">
                <strong>实时数据同步</strong>
                <span>多人同时提交，榜单毫秒级无感更新</span>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box gold">
                <Trophy size={18} />
              </div>
              <div className="feature-text">
                <strong>三维排行榜单</strong>
                <span>支持总榜、月榜、周榜多维度比拼</span>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box green">
                <ShieldCheck size={18} />
              </div>
              <div className="feature-text">
                <strong>极简免密验证</strong>
                <span>输入姓名与密码即可秒级进入</span>
              </div>
            </div>
          </div>

          <div className="login-footer-stats">
            <div className="stat-pill">
              <Users size={15} />
              <span>全员 100+ 人协同</span>
            </div>
            <div className="stat-pill">
              <BarChart3 size={15} />
              <span>历史流水完整可溯</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <div className="login-card-panel">
          <div className="auth-card">
            <div className="auth-card-header">
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
              <p className="auth-card-subtitle">
                {activeTab === 'login' 
                  ? '输入您的姓名和密码登录系统' 
                  : '新员工首次使用输入姓名与密码即可建档'}
              </p>
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
                    placeholder="请输入您的中文或英文姓名"
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
                  <span className="pwd-hint">至少 6 位</span>
                </div>
                <div className="input-box">
                  <Lock size={18} className="field-icon" />
                  <input
                    id="login-pwd"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="请输入密码（请妥善牢记）"
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

              <div className="auth-smart-hint">
                <Sparkles size={16} className="hint-icon" />
                <span>
                  <strong>提示：</strong>首次输入姓名和密码将自动为您创建档案；老员工输入原密码即可直接登入。
                </span>
              </div>

              <button
                type="submit"
                className="btn-login-submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="submit-spinner"></span>
                ) : (
                  <>
                    <span>{activeTab === 'login' ? '登 录 系 统' : '注 册 并 进 入'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
