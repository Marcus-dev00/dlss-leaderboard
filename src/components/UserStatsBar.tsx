import React from 'react'
import { Plus } from 'lucide-react'
import { LeaderboardItem, TimeRange } from '../types'
import { useAuth } from '../context/AuthContext'

interface UserStatsBarProps {
  items: LeaderboardItem[]
  timeRange: TimeRange
  onFocusSubmit: () => void
}

export const UserStatsBar: React.FC<UserStatsBarProps> = ({ items, onFocusSubmit }) => {
  const { user, profile } = useAuth()

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
          <span className="stats-tag">排名：<strong>{myRank ? `第 ${myRank}` : '-'}</strong></span>
          <span className="sep">·</span>
          <span className="stats-tag">积分：<strong>{myPoints}</strong></span>
          <span className="sep">·</span>
          <span className="stats-tag">人数：<strong>{myAmount}</strong></span>
        </div>

        <button className="btn-stats-submit" onClick={onFocusSubmit}>
          <Plus size={15} />
          <span>登记</span>
        </button>
      </div>
    </div>
  )
}
