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
          <span className="user-stats-name">{profile.name}</span>
          <span className="sep">·</span>
          <span className="stats-tag">{t.myRankLabel}：<strong>{myRank ? `#${myRank}` : '-'}</strong></span>
          <span className="sep">·</span>
          <span className="stats-tag">{t.myPointsLabel}：<strong>{myPoints}</strong></span>
          <span className="sep">·</span>
          <span className="stats-tag">{t.myPaxLabel}：<strong>{myAmount}</strong></span>
        </div>

        <button className="btn-stats-submit" onClick={onFocusSubmit}>
          <Plus size={15} />
          <span>{t.btnRecord}</span>
        </button>
      </div>
    </div>
  )
}
