import React, { useState } from 'react'
import { Plus, Minus, Send, Sparkles, CheckCircle2, AlertCircle, Flame, Users } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { SubmissionType } from '../types'

interface SubmitCardProps {
  onSubmitted: () => void
  onOpenAuth: () => void
}

const PRESET_AMOUNTS = [1, 2, 5, 10, 20, 50]

export const SubmitCard: React.FC<SubmitCardProps> = ({ onSubmitted, onOpenAuth }) => {
  const { user, profile } = useAuth()
  const [submissionType, setSubmissionType] = useState<SubmissionType>('standard')
  const [amount, setAmount] = useState<number>(1)
  const [note, setNote] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handlePresetSelect = (val: number) => {
    setAmount(val)
  }

  const pointRate = submissionType === 'opp' ? 10 : 8
  const calculatedPoints = (amount || 0) * pointRate

  const triggerCelebration = (isOpp: boolean) => {
    try {
      confetti({
        particleCount: isOpp ? 90 : 60,
        spread: isOpp ? 80 : 60,
        origin: { y: 0.7 },
        colors: isOpp 
          ? ['#f59e0b', '#ef4444', '#ec4899', '#fbbf24', '#8b5cf6'] 
          : ['#3b82f6', '#10b981', '#60a5fa', '#34d399']
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
        type: submissionType,
        points: calculatedPoints,
        note: note.trim() || null
      })

      if (error) {
        console.error('Submit error:', error)
        setFeedback({ type: 'error', message: `提交失败: ${error.message}` })
      } else {
        triggerCelebration(submissionType === 'opp')
        setFeedback({ 
          type: 'success', 
          message: `登记成功！${amount} 人 (${submissionType === 'opp' ? 'OPP 10分/人' : '普通 8分/人'})，斩获 +${calculatedPoints} 积分！` 
        })
        setAmount(1)
        setNote('')
        onSubmitted()

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
          <h2 className="card-title">快速登记人数 & 累积分数</h2>
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
        {/* 渠道类型选择：普通 8分 vs OPP 10分 */}
        <div className="channel-select-group">
          <span className="field-label">选择登记渠道 / 规则：</span>
          <div className="channel-toggle-grid">
            <button
              type="button"
              className={`channel-card ${submissionType === 'standard' ? 'active blue' : ''}`}
              onClick={() => setSubmissionType('standard')}
            >
              <div className="channel-badge blue">
                <Users size={16} />
                <span>普通渠道</span>
              </div>
              <div className="channel-rate">
                <strong>8 分</strong> <small>/ 每人</small>
              </div>
              <p className="channel-desc">常规客户邀约与日常拓展</p>
            </button>

            <button
              type="button"
              className={`channel-card ${submissionType === 'opp' ? 'active flame' : ''}`}
              onClick={() => setSubmissionType('opp')}
            >
              <div className="channel-badge flame">
                <Flame size={16} />
                <span>OPP 专场</span>
                <span className="bonus-tag">+25% 积分</span>
              </div>
              <div className="channel-rate text-gold">
                <strong>10 分</strong> <small>/ 每人</small>
              </div>
              <p className="channel-desc">通过 OPP 现场/专场拓展人数</p>
            </button>
          </div>
        </div>

        {/* 快捷选择人数 */}
        <div className="preset-row">
          <span className="preset-label">快捷人数：</span>
          <div className="preset-buttons">
            {PRESET_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                className={`preset-btn ${amount === val ? 'active' : ''}`}
                onClick={() => handlePresetSelect(val)}
              >
                +{val}人
              </button>
            ))}
          </div>
        </div>

        {/* 人数输入与积分实时预览 */}
        <div className="amount-input-row">
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

          {/* 实时积分核算卡片 */}
          <div className="points-calculator-preview">
            <span className="preview-label">预计获得积分</span>
            <div className="preview-math">
              <span className="math-people">{amount} 人</span>
              <span className="math-times">×</span>
              <span className="math-rate">{pointRate} 分/人</span>
              <span className="math-equals">=</span>
              <span className="preview-points-total">+{calculatedPoints} <small>分</small></span>
            </div>
          </div>
        </div>

        {/* 备注说明 */}
        <div className="note-input-group">
          <label htmlFor="note-input" className="field-label">备注说明（可选）</label>
          <input
            id="note-input"
            type="text"
            placeholder="例如：周二晚 OPP 招商场、市场拓展小组..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="note-input"
            maxLength={50}
            disabled={submitting}
          />
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          className={`btn-submit ${submissionType === 'opp' ? 'btn-submit-opp' : ''}`}
          disabled={submitting}
        >
          {submitting ? (
            <span className="loading-spinner"></span>
          ) : (
            <>
              <Send size={18} />
              <span>
                {user 
                  ? `确认登记 ${amount} 人 (获得 +${calculatedPoints} 积分)` 
                  : '登录并提交'}
              </span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
