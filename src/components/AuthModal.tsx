import React, { useState } from 'react'
import { X, User, Sparkles, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth()
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!name.trim()) {
      setErrorMsg('请输入您的姓名')
      return
    }

    setSubmitting(true)
    const res = await login(name)
    setSubmitting(false)

    if (res.success) {
      onClose()
      setName('')
    } else {
      setErrorMsg(res.error || '登录失败，请重试')
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container auth-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <div className="auth-icon-badge">
              <Sparkles className="auth-icon" />
            </div>
            <div>
              <h2 className="modal-title">员工登记 / 进入</h2>
              <p className="modal-subtitle">输入姓名即可快速进入系统</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="关闭">
            <X size={20} />
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="modal-feedback error">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="auth-name" className="field-label">员工姓名</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                id="auth-name"
                type="text"
                placeholder="例如：Dylan, Marcus"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                disabled={submitting}
                className="form-input"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              取消
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <span className="loading-spinner"></span>
              ) : (
                '进入系统'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
