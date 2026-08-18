import React, { useEffect, useState } from 'react'
import { X, Calendar, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react'
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

  const handleDelete = async (id: string, amount: number) => {
    if (!window.confirm(`确定要撤销这笔登记的 ${amount} 人记录吗？撤销后排行榜将重新统计。`)) {
      return
    }

    setDeletingId(id)
    setFeedback(null)
    try {
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', id)

      if (error) {
        setFeedback({ type: 'error', message: `删除失败: ${error.message}` })
      } else {
        setFeedback({ type: 'success', message: '已成功撤销该条提交记录' })
        setSubmissions((prev) => prev.filter((item) => item.id !== id))
        onRecordDeleted()
      }
    } catch (e: any) {
      setFeedback({ type: 'error', message: e?.message || '操作异常' })
    } finally {
      setDeletingId(null)
    }
  }

  if (!isOpen) return null

  const totalSum = submissions.reduce((acc, cur) => acc + cur.amount, 0)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container history-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <Calendar className="modal-icon" />
            <div>
              <h2 className="modal-title">{profile?.name} 的提交历史</h2>
              <p className="modal-subtitle">共 {submissions.length} 次登记，累计 {totalSum} 人</p>
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
              {submissions.map((sub) => (
                <div key={sub.id} className="history-item">
                  <div className="history-item-left">
                    <span className="history-amount">+{sub.amount} <small>人</small></span>
                    <div className="history-meta">
                      <span className="history-time">{formatTime(sub.created_at)}</span>
                      {sub.note && <span className="history-note">“{sub.note}”</span>}
                    </div>
                  </div>
                  <button
                    className="btn-delete-record"
                    onClick={() => handleDelete(sub.id, sub.amount)}
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
              ))}
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
