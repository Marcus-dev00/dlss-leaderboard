import React, { useState, useMemo } from 'react'
import { Trophy, Medal, Award, Flame, Search, Crown, Users, TrendingUp, Calendar } from 'lucide-react'
import { LeaderboardItem, TimeRange } from '../types'
import { useAuth } from '../context/AuthContext'

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
  const [searchQuery, setSearchQuery] = useState('')

  // 过滤后的榜单
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items
    const query = searchQuery.trim().toLowerCase()
    return items.filter((item) => item.name.toLowerCase().includes(query))
  }, [items, searchQuery])

  // 总计数据
  const totalStats = useMemo(() => {
    const totalAmount = items.reduce((sum, item) => sum + item.totalAmount, 0)
    const activeMembers = items.filter((item) => item.totalAmount > 0).length
    const topPerformer = items[0]?.name || '-'
    const maxAmount = items[0]?.totalAmount || 0
    return { totalAmount, activeMembers, topPerformer, maxAmount }
  }, [items])

  // 前三名
  const top1 = items[0]
  const top2 = items[1]
  const top3 = items[2]
  const restList = filteredItems.slice(searchQuery ? 0 : 3)

  const maxScore = items.length > 0 ? Math.max(1, items[0].totalAmount) : 1

  return (
    <div className="leaderboard-card">
      {/* Tab Switcher and Controls */}
      <div className="leaderboard-nav">
        <div className="tab-group">
          <button
            className={`tab-btn ${timeRange === 'all' ? 'active' : ''}`}
            onClick={() => onChangeTimeRange('all')}
          >
            <Trophy size={16} />
            <span>累计总榜</span>
          </button>
          <button
            className={`tab-btn ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => onChangeTimeRange('month')}
          >
            <Calendar size={16} />
            <span>本月榜</span>
          </button>
          <button
            className={`tab-btn ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => onChangeTimeRange('week')}
          >
            <Flame size={16} />
            <span>本周榜</span>
          </button>
        </div>

        {/* Search input */}
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="搜索员工姓名..."
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

      {/* Summary KPI Pills */}
      <div className="kpi-banner">
        <div className="kpi-item">
          <div className="kpi-icon-box blue">
            <TrendingUp size={16} />
          </div>
          <div>
            <span className="kpi-label">
              {timeRange === 'all' ? '总登记人数' : timeRange === 'month' ? '本月登记' : '本周登记'}
            </span>
            <div className="kpi-value">{totalStats.totalAmount.toLocaleString()} <span className="kpi-unit">人</span></div>
          </div>
        </div>

        <div className="kpi-item">
          <div className="kpi-icon-box green">
            <Users size={16} />
          </div>
          <div>
            <span className="kpi-label">已提交员工</span>
            <div className="kpi-value">{totalStats.activeMembers} <span className="kpi-unit">人</span></div>
          </div>
        </div>

        <div className="kpi-item">
          <div className="kpi-icon-box gold">
            <Crown size={16} />
          </div>
          <div>
            <span className="kpi-label">当前榜首</span>
            <div className="kpi-value text-gold">{totalStats.topPerformer}</div>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="leaderboard-loading">
          <div className="skeleton-podium"></div>
          <div className="skeleton-list">
            <div className="skeleton-row"></div>
            <div className="skeleton-row"></div>
            <div className="skeleton-row"></div>
          </div>
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="empty-leaderboard">
          <div className="empty-icon-wrap">
            <Trophy size={48} className="empty-icon" />
          </div>
          <h3 className="empty-title">暂无登记数据</h3>
          <p className="empty-desc">
            {timeRange === 'week' ? '本周还没有员工登记人数，快来抢占第一名吧！' :
             timeRange === 'month' ? '本月还没有员工登记人数，快来抢占第一名吧！' :
             '还没有任何登记记录，立即在上方提交人数！'}
          </p>
        </div>
      )}

      {/* Top 3 Podium (Only shown when not searching and items >= 1) */}
      {!loading && !searchQuery && items.length > 0 && (
        <div className="podium-container">
          {/* Top 2 (Silver) */}
          <div className={`podium-item silver ${top2 ? 'has-user' : 'empty'}`}>
            {top2 ? (
              <>
                <div className="podium-avatar-wrapper">
                  <div className="podium-badge silver">2</div>
                  <div className="podium-avatar silver-glow">
                    {top2.name.slice(0, 1)}
                  </div>
                </div>
                <div className="podium-name" title={top2.name}>{top2.name}</div>
                <div className="podium-score">
                  <span className="score-num">{top2.totalAmount}</span>
                  <span className="score-unit">人</span>
                </div>
                <div className="podium-count">{top2.submissionCount} 次提交</div>
                <div className="podium-stand silver-stand">
                  <Medal size={22} className="stand-icon silver-icon" />
                  <span className="stand-label">亚军</span>
                </div>
              </>
            ) : (
              <div className="podium-stand silver-stand empty-stand">
                <span className="stand-label">虚位以待</span>
              </div>
            )}
          </div>

          {/* Top 1 (Gold) */}
          <div className={`podium-item gold ${top1 ? 'has-user' : 'empty'}`}>
            {top1 ? (
              <>
                <div className="crown-badge">
                  <Crown size={28} className="crown-icon" />
                </div>
                <div className="podium-avatar-wrapper">
                  <div className="podium-badge gold">1</div>
                  <div className="podium-avatar gold-glow">
                    {top1.name.slice(0, 1)}
                  </div>
                </div>
                <div className="podium-name" title={top1.name}>{top1.name}</div>
                <div className="podium-score gold-text">
                  <span className="score-num">{top1.totalAmount}</span>
                  <span className="score-unit">人</span>
                </div>
                <div className="podium-count">{top1.submissionCount} 次提交</div>
                <div className="podium-stand gold-stand">
                  <Trophy size={24} className="stand-icon gold-icon" />
                  <span className="stand-label">冠军</span>
                </div>
              </>
            ) : (
              <div className="podium-stand gold-stand empty-stand">
                <span className="stand-label">虚位以待</span>
              </div>
            )}
          </div>

          {/* Top 3 (Bronze) */}
          <div className={`podium-item bronze ${top3 ? 'has-user' : 'empty'}`}>
            {top3 ? (
              <>
                <div className="podium-avatar-wrapper">
                  <div className="podium-badge bronze">3</div>
                  <div className="podium-avatar bronze-glow">
                    {top3.name.slice(0, 1)}
                  </div>
                </div>
                <div className="podium-name" title={top3.name}>{top3.name}</div>
                <div className="podium-score">
                  <span className="score-num">{top3.totalAmount}</span>
                  <span className="score-unit">人</span>
                </div>
                <div className="podium-count">{top3.submissionCount} 次提交</div>
                <div className="podium-stand bronze-stand">
                  <Award size={22} className="stand-icon bronze-icon" />
                  <span className="stand-label">季军</span>
                </div>
              </>
            ) : (
              <div className="podium-stand bronze-stand empty-stand">
                <span className="stand-label">虚位以待</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rankings List (4th and beyond, or search results) */}
      {!loading && filteredItems.length > 0 && (
        <div className="ranking-table-container">
          <div className="ranking-table-header">
            <span className="th-rank">排名</span>
            <span className="th-name">员工</span>
            <span className="th-progress">占比</span>
            <span className="th-count">提交次数</span>
            <span className="th-amount">累计人数</span>
          </div>

          <div className="ranking-list">
            {(searchQuery ? filteredItems : restList).map((item) => {
              const isCurrentUser = profile && item.userId === profile.id
              const percentage = Math.round((item.totalAmount / maxScore) * 100) || 0

              return (
                <div
                  key={item.userId}
                  className={`ranking-row ${isCurrentUser ? 'current-user-row' : ''}`}
                >
                  {/* Rank number */}
                  <div className="td-rank">
                    <span className={`rank-number rank-${item.rank}`}>
                      {item.rank <= 3 ? (
                        item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : '🥉'
                      ) : (
                        `#${item.rank}`
                      )}
                    </span>
                  </div>

                  {/* User info */}
                  <div className="td-name">
                    <div className="avatar-circle">
                      {item.name.slice(0, 1)}
                    </div>
                    <div className="name-box">
                      <span className="employee-name">{item.name}</span>
                      {isCurrentUser && <span className="me-tag">我</span>}
                    </div>
                  </div>

                  {/* Visual Progress bar */}
                  <div className="td-progress">
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Submissions count */}
                  <div className="td-count">
                    <span className="count-tag">{item.submissionCount} 次</span>
                  </div>

                  {/* Total Amount */}
                  <div className="td-amount">
                    <span className="amount-num">{item.totalAmount}</span>
                    <span className="amount-unit"> 人</span>
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
