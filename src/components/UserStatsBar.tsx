import React from 'react'
import { Trophy, Sparkles, Users, Plus } from 'lucide-react'
import { LeaderboardItem, TimeRange } from '../types'
import { useAuth } from '../context/AuthContext'

interface UserStatsBarProps {
  items: LeaderboardItem[]
  timeRange: TimeRange
  onFocusSubmit: () => void
}

export const UserStatsBar: React.FC<UserStatsBarProps> = ({ items, timeRange, onFocusSubmit }) => {
  const { user, profile } = useAuth()

  if (!user || !profile) return null

  const myItem = items.find((item) => item.userId === profile.id)
  const myRank = myItem?.rank ?? null
  const myPoints = myItem?.totalPoints ?? 0
  const myAmount = myItem?.totalAmount ?? 0
  const myOpp = myItem?.oppAmount ?? 0

  const rangeText = timeRange === 'all' ? '总榜' : timeRange === 'month' ? '月榜' : '周榜'

  return (
    <div className="user-stats-bar">
      <div className="user-stats-container">
        <div className="user-stats-left">
          <div className="user-stats-avatar">
            {profile.name.slice(0, 1)}
          </div>
          <div>
            <div className="user-stats-title">
              <span className="user-stats-name">{profile.name}</span>
              <span className="user-stats-range">（{rangeText}当前战绩）</span>
            </div>
            <div className="user-stats-metrics">
              <span className="metric-pill">
                <Trophy size={14} className="metric-icon gold" />
                当前排名：<strong>{myRank ? `第 ${myRank} 名` : '暂未上榜'}</strong>
              </span>
              <span className="metric-pill">
                <Sparkles size={14} className="metric-icon gold" />
                累计积分：<strong>{myPoints} 分</strong>
              </span>
              <span className="metric-pill">
                <Users size={14} className="metric-icon blue" />
                累计人数：<strong>{myAmount} 人</strong>
                {myOpp > 0 && <span className="stats-opp-sub">(OPP {myOpp}人)</span>}
              </span>
            </div>
          </div>
        </div>

        <button className="btn-stats-submit" onClick={onFocusSubmit}>
          <Plus size={16} />
          <span>立即登记人数与积分</span>
        </button>
      </div>
    </div>
  )
}
