import React from 'react'
import { Plus } from 'lucide-react'
import { LeaderboardItem, TimeRange } from '../types'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

interface UserStatsBarProps {
  items: LeaderboardItem[]
  timeRange: TimeRange
  onFocusSubmit: () => void
}

export const UserStatsBar: React.FC<UserStatsBarProps> = ({ items, onFocusSubmit }) => {
  const { user, profile } = useAuth()
  const { t } = useLanguage()

  if (!user || !profile) return null

  const myItem = items.find((item) => item.userId === profile.id)
  const myRank = myItem?.rank ?? null
  const myPoints = myItem?.totalPoints ?? 0
  const myAmount = myItem?.totalAmount ?? 0

  return (
    <div className="user-stats-bar">
      <div className="user-stats-container">
        <div className="user-stats-left">
          <div className="user-stats-user-pill">
            <div className="user-avatar-mini">{profile.name.slice(0, 1)}</div>
            <span className="user-stats-name">{profile.name}</span>
          </div>

          <div className="user-stats-metrics-group">
            <div className="stats-tag">
              <span className="stats-tag-label">{t.myRankLabel}</span>
              <span className="stats-tag-val"><strong>{myRank ? `#${myRank}` : '-'}</strong></span>
            </div>
            <div className="stats-tag">
              <span className="stats-tag-label">{t.myPointsLabel}</span>
              <span className="stats-tag-val"><strong className="text-gold">{myPoints.toLocaleString()}</strong></span>
            </div>
            <div className="stats-tag">
              <span className="stats-tag-label">{t.myPaxLabel}</span>
              <span className="stats-tag-val"><strong>{myAmount.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>

        <button className="btn-stats-submit" onClick={onFocusSubmit} aria-label={t.btnRecord}>
          <Plus size={15} />
          <span>{t.btnRecord}</span>
        </button>
      </div>
    </div>
  )
}
