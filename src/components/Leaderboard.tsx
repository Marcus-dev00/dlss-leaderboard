import React, { useState, useMemo } from 'react'
import { Trophy, Medal, Award, Crown, Search } from 'lucide-react'
import { LeaderboardItem, TimeRange } from '../types'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

interface LeaderboardProps {
  items: LeaderboardItem[]
  timeRange: TimeRange
  onChangeTimeRange: (range: TimeRange) => void
  loading: boolean
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  items,
  timeRange,
  onChangeTimeRange,
  loading
}) => {
  const { profile } = useAuth()
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')

  // 过滤后的榜单
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items
    const query = searchQuery.trim().toLowerCase()
    return items.filter((item) => item.name.toLowerCase().includes(query))
  }, [items, searchQuery])

  // 总计数据
  const totalStats = useMemo(() => {
    const totalPoints = items.reduce((sum, item) => sum + item.totalPoints, 0)
    const totalAmount = items.reduce((sum, item) => sum + item.totalAmount, 0)
    return { totalPoints, totalAmount }
  }, [items])

  // 前三名
  const top1 = items[0]
  const top2 = items[1]
  const top3 = items[2]
  const restList = filteredItems.slice(searchQuery ? 0 : 3)

  const maxPoints = items.length > 0 ? Math.max(1, items[0].totalPoints) : 1

  return (
    <div className="leaderboard-card">
      {/* 顶部控制栏：Tab + 汇总 + 搜索 */}
      <div className="leaderboard-nav">
        <div className="tab-group">
          <button
            className={`tab-btn ${timeRange === 'all' ? 'active' : ''}`}
            onClick={() => onChangeTimeRange('all')}
          >
            {t.tabAll}
          </button>
          <button
            className={`tab-btn ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => onChangeTimeRange('month')}
          >
            {t.tabMonth}
          </button>
          <button
            className={`tab-btn ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => onChangeTimeRange('week')}
          >
            {t.tabWeek}
          </button>
        </div>

        {/* 简洁汇总指示 */}
        <div className="compact-stats-pill">
          <span className="stats-metric-text">{t.totalPointsLabel}: <strong>{totalStats.totalPoints.toLocaleString()}</strong></span>
          <span className="dot-sep">·</span>
          <span className="stats-metric-text">{t.totalPaxLabel}: <strong>{totalStats.totalAmount.toLocaleString()}</strong></span>
        </div>

        {/* 搜索 */}
        <div className="search-box">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>
              ×
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="leaderboard-loading">
          <div className="skeleton-podium"></div>
          <div className="skeleton-row"></div>
          <div className="skeleton-row"></div>
        </div>
      )}

      {/* 空状态 */}
      {!loading && items.length === 0 && (
        <div className="empty-leaderboard">
          <Trophy size={36} className="empty-icon" />
          <p className="empty-title">{t.noData}</p>
        </div>
      )}

      {/* 极简前三名领奖台 */}
      {!loading && !searchQuery && items.length > 0 && (
        <div className="podium-container">
          {/* 亚军 2nd */}
          <div className={`podium-item silver ${top2 ? 'has-user' : 'empty'}`}>
            {top2 ? (
              <>
                <div className="podium-avatar silver">
                  {top2.name.slice(0, 1)}
                  <span className="rank-tag silver">2</span>
                </div>
                <div className="podium-name" title={top2.name}>{top2.name}</div>
                <div className="podium-score">
                  <span>{top2.totalPoints.toLocaleString()}</span>
                  <small>{t.pointsUnit}</small>
                </div>
                <div className="podium-sub">{top2.totalAmount.toLocaleString()} {t.paxUnit}</div>
                <div className="podium-stand silver-stand">
                  <Medal size={18} className="stand-icon" />
                </div>
              </>
            ) : (
              <div className="podium-stand silver-stand empty-stand"></div>
            )}
          </div>

          {/* 冠军 1st */}
          <div className={`podium-item gold ${top1 ? 'has-user' : 'empty'}`}>
            {top1 ? (
              <>
                <Crown size={22} className="crown-icon-clean" />
                <div className="podium-avatar gold">
                  {top1.name.slice(0, 1)}
                  <span className="rank-tag gold">1</span>
                </div>
                <div className="podium-name" title={top1.name}>{top1.name}</div>
                <div className="podium-score gold">
                  <span>{top1.totalPoints.toLocaleString()}</span>
                  <small>{t.pointsUnit}</small>
                </div>
                <div className="podium-sub">{top1.totalAmount.toLocaleString()} {t.paxUnit}</div>
                <div className="podium-stand gold-stand">
                  <Trophy size={20} className="stand-icon" />
                </div>
              </>
            ) : (
              <div className="podium-stand gold-stand empty-stand"></div>
            )}
          </div>

          {/* 季军 3rd */}
          <div className={`podium-item bronze ${top3 ? 'has-user' : 'empty'}`}>
            {top3 ? (
              <>
                <div className="podium-avatar bronze">
                  {top3.name.slice(0, 1)}
                  <span className="rank-tag bronze">3</span>
                </div>
                <div className="podium-name" title={top3.name}>{top3.name}</div>
                <div className="podium-score">
                  <span>{top3.totalPoints.toLocaleString()}</span>
                  <small>{t.pointsUnit}</small>
                </div>
                <div className="podium-sub">{top3.totalAmount.toLocaleString()} {t.paxUnit}</div>
                <div className="podium-stand bronze-stand">
                  <Award size={18} className="stand-icon" />
                </div>
              </>
            ) : (
              <div className="podium-stand bronze-stand empty-stand"></div>
            )}
          </div>
        </div>
      )}

      {/* 极简排名列表 */}
      {!loading && filteredItems.length > 0 && (
        <div className="ranking-table-container">
          <div className="ranking-table-header">
            <span className="th-rank">{t.rankTh}</span>
            <span className="th-name">{t.employeeTh}</span>
            <span className="th-progress">{t.progressTh}</span>
            <span className="th-people">{t.paxTh}</span>
            <span className="th-amount">{t.pointsTh}</span>
          </div>

          <div className="ranking-list">
            {(searchQuery ? filteredItems : restList).map((item) => {
              const isCurrentUser = profile && item.userId === profile.id
              const percentage = Math.round((item.totalPoints / maxPoints) * 100) || 0

              return (
                <div
                  key={item.userId}
                  className={`ranking-row ${isCurrentUser ? 'current-user-row' : ''}`}
                >
                  <div className="td-rank">
                    <span className="rank-num">#{item.rank}</span>
                  </div>

                  <div className="td-name">
                    <div className="avatar-circle">
                      {item.name.slice(0, 1)}
                    </div>
                    <span className="employee-name">{item.name}</span>
                    {isCurrentUser && <span className="me-tag">{t.meTag}</span>}
                  </div>

                  <div className="td-progress">
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="td-people">
                    <span className="people-count">{item.totalAmount.toLocaleString()} {t.paxUnit}</span>
                    {item.oppAmount > 0 && (
                      <span className="opp-count-tag">OPP {item.oppAmount}</span>
                    )}
                  </div>

                  <div className="td-amount">
                    <span className="points-num">{item.totalPoints.toLocaleString()}</span>
                    <span className="points-unit">{t.pointsUnit}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
