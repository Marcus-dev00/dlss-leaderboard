import React from 'react'
import { Plus, Trophy, Sparkles, Users } from 'lucide-react'
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
    <div className="user-stats-floating-island">
      <div className="user-stats-island-inner">
        {/* 员工身份胶囊 */}
        <div className="island-user-pill">
          <div className="island-avatar">{profile.name.slice(0, 1)}</div>
          <span className="island-name">{profile.name}</span>
        </div>

        <div className="island-divider"></div>

        {/* 个人战绩指标胶囊 */}
        <div className="island-metrics-row">
          <div className="island-badge rank" title={t.myRankLabel}>
            <Trophy size={13} className="island-icon gold" />
            <span className="island-badge-val">{myRank ? `#${myRank}` : '-'}</span>
          </div>

          <div className="island-badge points" title={t.myPointsLabel}>
            <Sparkles size={13} className="island-icon amber" />
            <span className="island-badge-val">{myPoints.toLocaleString()} <small>{t.pointsUnit}</small></span>
          </div>

          <div className="island-badge pax" title={t.myPaxLabel}>
            <Users size={13} className="island-icon stone" />
            <span className="island-badge-val">{myAmount.toLocaleString()} <small>{t.paxUnit}</small></span>
          </div>
        </div>

        {/* 快捷登记主操作 */}
        <button className="island-btn-record" onClick={onFocusSubmit} aria-label={t.btnRecord}>
          <Plus size={15} />
          <span>{t.btnRecord}</span>
        </button>
      </div>
    </div>
  )
}
