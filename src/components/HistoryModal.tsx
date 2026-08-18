import React, { useEffect, useState } from 'react'
import { X, Calendar, Trash2, Clock, CheckCircle, AlertCircle, Flame, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
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
  const { t } = useLanguage()
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
    if (!window.confirm(t.confirmDelete)) {
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
        setFeedback({ type: 'error', message: `${error.message}` })
      } else {
        setFeedback({ type: 'success', message: 'Record deleted' })
        setSubmissions((prev) => prev.filter((item) => item.id !== sub.id))
        onRecordDeleted()
      }
    } catch (e: any) {
      setFeedback({ type: 'error', message: e?.message || 'Error' })
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
              <h2 className="modal-title">{profile?.name} - {t.historyTitle}</h2>
              <div className="modal-stats-subtitle">
                <span>{t.recordsCount(submissions.length)}</span>
                <span>·</span>
                <span>{totalPoints} {t.pointsUnit}</span>
                <span>·</span>
                <span>{totalPeople} {t.paxUnit}</span>
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label={t.btnClose}>
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
            </div>
          ) : submissions.length === 0 ? (
            <div className="history-empty">
              <Clock size={40} className="empty-history-icon" />
              <p>{t.noHistory}</p>
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
                        <span className="history-points">+{points} <small>{t.pointsUnit}</small></span>
                        <span className="history-amount-sub">({sub.amount}{t.paxUnit})</span>
                      </div>

                      <div className="history-meta">
                        <div className="history-type-row">
                          <span className={`channel-pill ${isOpp ? 'flame' : 'blue'}`}>
                            {isOpp ? <Flame size={12} /> : <Users size={12} />}
                            {isOpp ? 'OPP' : 'Standard'}
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
                      title="Delete"
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
            {t.btnClose}
          </button>
        </div>
      </div>
    </div>
  )
}
