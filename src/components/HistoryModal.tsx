import React, { useEffect, useState } from 'react'
import { X, Calendar, Trash2, Clock, CheckCircle, AlertCircle, Flame, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Submission } from '../types'
import { formatTime } from '../lib/dateUtils'

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
  onRecordDeleted: () => void
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, onRecordDeleted }) => {
  const { user, profile } = useAuth()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchHistory = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setSubmissions(data as Submission[])
      }
    } catch (e) {
      console.error('Fetch history error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && user) {
      fetchHistory()
      setFeedback(null)
    }
  }, [isOpen, user])

  const handleDelete = async (sub: Submission) => {
    const points = sub.points || (sub.amount * (sub.type === 'opp' ? 10 : 8))
    if (!window.confirm(`确定要撤销这笔登记（${sub.amount}人 / ${points}分）吗？撤销后排行榜将重新统计。`)) {
      return
    }

    setDeletingId(sub.id)
    setFeedback(null)
    try {
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', sub.id)

      if (error) {
        setFeedback({ type: 'error', message: `删除失败: ${error.message}` })
      } else {
        setFeedback({ type: 'success', message: '已成功撤销该条提交记录' })
        setSubmissions((prev) => prev.filter((item) => item.id !== sub.id))
        onRecordDeleted()
      }
    } catch (e: any) {
      setFeedback({ type: 'error', message: e?.message || '操作异常' })
    } finally {
      setDeletingId(null)
    }
  }

  if (!isOpen) return null

  const totalPeople = submissions.reduce((acc, cur) => acc + cur.amount, 0)
  const totalPoints = submissions.reduce((acc, cur) => {
    const p = cur.points || (cur.amount * (cur.type === 'opp' ? 10 : 8))
    return acc + p
  }, 0)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container history-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <Calendar className="modal-icon" />
            <div>
              <h2 className="modal-title">{profile?.name} 的提交明细流水</h2>
              <div className="modal-stats-subtitle">
                <span>共 {submissions.length} 次登记</span>
                <span>·</span>
                <span className="text-gold">累计 {totalPoints} 积分</span>
                <span>·</span>
                <span>{totalPeople} 人</span>
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="关闭">
            <X size={20} />
          </button>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`modal-feedback ${feedback.type}`}>
            {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Content */}
        <div className="history-content">
          {loading ? (
            <div className="history-loading">
              <div className="loading-spinner"></div>
              <span>加载中...</span>
            </div>
          ) : submissions.length === 0 ? (
            <div className="history-empty">
              <Clock size={40} className="empty-history-icon" />
              <p>您还没有任何提交记录</p>
            </div>
          ) : (
            <div className="history-list">
              {submissions.map((sub) => {
                const isOpp = sub.type === 'opp'
                const points = sub.points || (sub.amount * (isOpp ? 10 : 8))

                return (
                  <div key={sub.id} className="history-item">
                    <div className="history-item-left">
                      <div className="history-score-col">
                        <span className="history-points">+{points} <small>分</small></span>
                        <span className="history-amount-sub">({sub.amount}人)</span>
                      </div>

                      <div className="history-meta">
                        <div className="history-type-row">
                          <span className={`channel-pill ${isOpp ? 'flame' : 'blue'}`}>
                            {isOpp ? <Flame size={12} /> : <Users size={12} />}
                            {isOpp ? 'OPP 专场 (10分/人)' : '普通渠道 (8分/人)'}
                          </span>
                          <span className="history-time">{formatTime(sub.created_at)}</span>
                        </div>
                        {sub.note && <span className="history-note">“{sub.note}”</span>}
                      </div>
                    </div>

                    <button
                      className="btn-delete-record"
                      onClick={() => handleDelete(sub)}
                      disabled={deletingId === sub.id}
                      title="撤销此条记录"
                    >
                      {deletingId === sub.id ? (
                        <span className="mini-spinner"></span>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
