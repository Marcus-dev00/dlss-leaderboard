import React, { useState } from 'react'
import { Plus, Minus, Send, CheckCircle2, AlertCircle, Users, Flame } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { SubmissionType } from '../types'

interface SubmitCardProps {
  onSubmitted: () => void
}

export const SubmitCard: React.FC<SubmitCardProps> = ({ onSubmitted }) => {
  const { user } = useAuth()
  const [submissionType, setSubmissionType] = useState<SubmissionType>('standard')
  const [amount, setAmount] = useState<number>(1)
  const [note, setNote] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const pointRate = submissionType === 'opp' ? 10 : 8
  const calculatedPoints = (amount || 0) * pointRate

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    if (amount <= 0 || !Number.isInteger(amount)) {
      setFeedback({ type: 'error', message: '请输入大于 0 的有效人数' })
      return
    }

    setSubmitting(true)
    setFeedback(null)

    try {
      const { error } = await supabase.from('submissions').insert({
        user_id: user.id,
        amount: amount,
        type: submissionType,
        points: calculatedPoints,
        note: note.trim() || null
      })

      if (error) {
        setFeedback({ type: 'error', message: `提交失败: ${error.message}` })
      } else {
        try {
          confetti({
            particleCount: submissionType === 'opp' ? 60 : 40,
            spread: 50,
            origin: { y: 0.7 }
          })
        } catch (e) {
          // ignore
        }

        setFeedback({ 
          type: 'success', 
          message: `登记成功！${amount} 人 (+${calculatedPoints} 分)` 
        })
        setAmount(1)
        setNote('')
        onSubmitted()

        setTimeout(() => setFeedback(null), 3000)
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || '网络异常' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="submit-card">
      <div className="submit-card-header">
        <h2 className="submit-card-title">登记人数</h2>
      </div>

      {feedback && (
        <div className={`feedback-alert ${feedback.type}`}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="submit-form">
        {/* 渠道选择 */}
        <div className="channel-switch-segment">
          <button
            type="button"
            className={`channel-switch-btn ${submissionType === 'standard' ? 'active' : ''}`}
            onClick={() => setSubmissionType('standard')}
          >
            <Users size={16} />
            <span>普通登记 (8分/人)</span>
          </button>

          <button
            type="button"
            className={`channel-switch-btn opp ${submissionType === 'opp' ? 'active' : ''}`}
            onClick={() => setSubmissionType('opp')}
          >
            <Flame size={16} />
            <span>OPP 专场 (10分/人)</span>
          </button>
        </div>

        {/* 大号舒适人数输入与积分预览 */}
        <div className="amount-focus-area">
          <div className="stepper-wrapper-large">
            <button
              type="button"
              className="stepper-btn-large"
              onClick={() => setAmount((prev) => Math.max(1, prev - 1))}
              disabled={amount <= 1 || submitting}
              aria-label="减少1人"
            >
              <Minus size={20} />
            </button>
            <div className="amount-input-box">
              <input
                id="amount-input"
                type="number"
                min="1"
                step="1"
                value={amount || ''}
                onChange={(e) => setAmount(parseInt(e.target.value, 10) || 0)}
                className="amount-input-large"
                required
                disabled={submitting}
              />
              <span className="unit-label">人</span>
            </div>
            <button
              type="button"
              className="stepper-btn-large"
              onClick={() => setAmount((prev) => prev + 1)}
              disabled={submitting}
              aria-label="增加1人"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* 大号醒目积分卡片 */}
          <div className="points-display-card">
            <span className="points-display-label">本次获得</span>
            <div className="points-display-val">
              <span className="calc-text">+{calculatedPoints}</span>
              <span className="calc-unit">积分</span>
            </div>
          </div>
        </div>

        {/* 备注与提交按钮 */}
        <div className="submit-action-row">
          <input
            id="note-input"
            type="text"
            placeholder="填写备注（可选）"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="note-input-spacious"
            maxLength={40}
            disabled={submitting}
          />

          <button
            type="submit"
            className={`btn-submit-spacious ${submissionType === 'opp' ? 'opp' : ''}`}
            disabled={submitting}
          >
            {submitting ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                <Send size={16} />
                <span>确认提交 (+{calculatedPoints}分)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
