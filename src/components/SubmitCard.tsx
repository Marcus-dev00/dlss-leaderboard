import React, { useState } from 'react'
import { Plus, Minus, Send, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

interface SubmitCardProps {
  onSubmitted: () => void
  onOpenAuth: () => void
}

const PRESET_AMOUNTS = [1, 2, 5, 10, 20, 50]

export const SubmitCard: React.FC<SubmitCardProps> = ({ onSubmitted, onOpenAuth }) => {
  const { user, profile } = useAuth()
  const [amount, setAmount] = useState<number>(1)
  const [note, setNote] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handlePresetSelect = (val: number) => {
    setAmount(val)
  }

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']
      })
    } catch (e) {
      // ignore
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !profile) {
      onOpenAuth()
      return
    }

    if (amount <= 0 || !Number.isInteger(amount)) {
      setFeedback({ type: 'error', message: '请输入大于 0 的有效整数' })
      return
    }

    setSubmitting(true)
    setFeedback(null)

    try {
      const { error } = await supabase.from('submissions').insert({
        user_id: user.id,
        amount: amount,
        note: note.trim() || null
      })

      if (error) {
        console.error('Submit error:', error)
        setFeedback({ type: 'error', message: `提交失败: ${error.message}` })
      } else {
        triggerCelebration()
        setFeedback({ type: 'success', message: `成功登记 ${amount} 人！已累加到排行榜` })
        setAmount(1)
        setNote('')
        onSubmitted()

        // 3秒后自动清除成功提示
        setTimeout(() => {
          setFeedback(null)
        }, 3500)
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || '网络异常，请重试' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="submit-card">
      <div className="card-header">
        <div className="card-header-icon-box">
          <Sparkles className="card-header-icon" />
        </div>
        <div>
          <h2 className="card-title">快速登记人数</h2>
          <p className="card-subtitle">
            {profile ? `当前登记者：${profile.name}` : '请先登录，数据将实时计入总榜及本周/本月榜'}
          </p>
        </div>
      </div>

      {feedback && (
        <div className={`feedback-alert ${feedback.type}`}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="submit-form">
        {/* Preset quick buttons */}
        <div className="preset-row">
          <span className="preset-label">快捷选择：</span>
          <div className="preset-buttons">
            {PRESET_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                className={`preset-btn ${amount === val ? 'active' : ''}`}
                onClick={() => handlePresetSelect(val)}
              >
                +{val}
              </button>
            ))}
          </div>
        </div>

        {/* Input area with stepper */}
        <div className="amount-input-group">
          <label htmlFor="amount-input" className="field-label">本次提交人数</label>
          <div className="stepper-wrapper">
            <button
              type="button"
              className="stepper-btn"
              onClick={() => setAmount((prev) => Math.max(1, prev - 1))}
              disabled={amount <= 1 || submitting}
              aria-label="减少1"
            >
              <Minus size={18} />
            </button>
            <input
              id="amount-input"
              type="number"
              min="1"
              step="1"
              value={amount || ''}
              onChange={(e) => setAmount(parseInt(e.target.value, 10) || 0)}
              className="amount-input"
              required
              disabled={submitting}
            />
            <button
              type="button"
              className="stepper-btn"
              onClick={() => setAmount((prev) => prev + 1)}
              disabled={submitting}
              aria-label="增加1"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Optional note input */}
        <div className="note-input-group">
          <label htmlFor="note-input" className="field-label">备注说明（可选）</label>
          <input
            id="note-input"
            type="text"
            placeholder="例如：市场拓展、渠道邀约、上午场次..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="note-input"
            maxLength={50}
            disabled={submitting}
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="btn-submit"
          disabled={submitting}
        >
          {submitting ? (
            <span className="loading-spinner"></span>
          ) : (
            <>
              <Send size={18} />
              <span>{user ? `立即提交 (${amount} 人)` : '登录并提交'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
