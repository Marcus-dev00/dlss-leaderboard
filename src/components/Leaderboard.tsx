import React, { useState, useMemo } from 'react'
import { Trophy, Medal, Award, Flame, Search, Crown, Users, Calendar, Sparkles } from 'lucide-react'
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
    const totalPoints = items.reduce((sum, item) => sum + item.totalPoints, 0)
    const totalAmount = items.reduce((sum, item) => sum + item.totalAmount, 0)
    const totalOppAmount = items.reduce((sum, item) => sum + item.oppAmount, 0)
    const activeMembers = items.filter((item) => item.totalPoints > 0).length
    const topPerformer = items[0]?.name || '-'
    const topPoints = items[0]?.totalPoints || 0
    return { totalPoints, totalAmount, totalOppAmount, activeMembers, topPerformer, topPoints }
  }, [items])

  // 前三名
  const top1 = items[0]
  const top2 = items[1]
  const top3 = items[2]
  const restList = filteredItems.slice(searchQuery ? 0 : 3)

  const maxPoints = items.length > 0 ? Math.max(1, items[0].totalPoints) : 1

  return (
    <div className="leaderboard-card">
      {/* Tab Switcher and Search */}
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

      {/* KPI Summary Banner */}
      <div className="kpi-banner">
        <div className="kpi-item">
          <div className="kpi-icon-box gold">
            <Sparkles size={18} />
          </div>
          <div>
            <span className="kpi-label">
              {timeRange === 'all' ? '累计总积分' : timeRange === 'month' ? '本月总积分' : '本周总积分'}
            </span>
            <div className="kpi-value text-gold">
              {totalStats.totalPoints.toLocaleString()} <span className="kpi-unit">分</span>
            </div>
          </div>
        </div>

        <div className="kpi-item">
          <div className="kpi-icon-box blue">
            <Users size={18} />
          </div>
          <div>
            <span className="kpi-label">登记总人数</span>
            <div className="kpi-value">
              {totalStats.totalAmount.toLocaleString()} <span className="kpi-unit">人</span>
              {totalStats.totalOppAmount > 0 && (
                <span className="opp-tag-kpi">
                  🔥 OPP {totalStats.totalOppAmount}人
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="kpi-item">
          <div className="kpi-icon-box green">
            <Crown size={18} />
          </div>
          <div>
            <span className="kpi-label">当前榜首冠军</span>
            <div className="kpi-value text-gold">
              {totalStats.topPerformer} {totalStats.topPoints > 0 && <small className="kpi-unit">({totalStats.topPoints}分)</small>}
            </div>
          </div>
        </div>
      </div>

      {/* Rules Notice Badge */}
      <div className="points-rule-notice">
        <span className="rule-badge">计分规则</span>
        <span>🔹 普通登记：<strong>1人 = 8分</strong></span>
        <span className="rule-divider">·</span>
        <span>🔥 OPP 专场：<strong>1人 = 10分</strong> (享 25% 积分加成)</span>
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
            {timeRange === 'week' ? '本周还没有员工登记人数与积分，快来抢占第一名吧！' :
             timeRange === 'month' ? '本月还没有员工登记人数与积分，快来抢占第一名吧！' :
             '还没有任何登记记录，立即在上方登记人数与积分！'}
          </p>
        </div>
      )}

      {/* Top 3 Podium */}
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
                  <span className="score-num">{top2.totalPoints}</span>
                  <span className="score-unit">分</span>
                </div>
                <div className="podium-people-sub">
                  共 {top2.totalAmount} 人 
                  {top2.oppAmount > 0 && <span className="podium-opp-pill">🔥{top2.oppAmount}</span>}
                </div>
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
                  <span className="score-num">{top1.totalPoints}</span>
                  <span className="score-unit">分</span>
                </div>
                <div className="podium-people-sub">
                  共 {top1.totalAmount} 人 
                  {top1.oppAmount > 0 && <span className="podium-opp-pill">🔥OPP {top1.oppAmount}人</span>}
                </div>
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
                  <span className="score-num">{top3.totalPoints}</span>
                  <span className="score-unit">分</span>
                </div>
                <div className="podium-people-sub">
                  共 {top3.totalAmount} 人
                  {top3.oppAmount > 0 && <span className="podium-opp-pill">🔥{top3.oppAmount}</span>}
                </div>
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

      {/* Rankings List */}
      {!loading && filteredItems.length > 0 && (
        <div className="ranking-table-container">
          <div className="ranking-table-header">
            <span className="th-rank">排名</span>
            <span className="th-name">员工</span>
            <span className="th-progress">积分比重</span>
            <span className="th-breakdown">人数构成 (普通/OPP)</span>
            <span className="th-amount">总积分</span>
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
                  {/* Rank */}
                  <div className="td-rank">
                    <span className={`rank-number rank-${item.rank}`}>
                      {item.rank <= 3 ? (
                        item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : '🥉'
                      ) : (
                        `#${item.rank}`
                      )}
                    </span>
                  </div>

                  {/* User */}
                  <div className="td-name">
                    <div className="avatar-circle">
                      {item.name.slice(0, 1)}
                    </div>
                    <div className="name-box">
                      <span className="employee-name">{item.name}</span>
                      {isCurrentUser && <span className="me-tag">我</span>}
                    </div>
                  </div>

                  {/* Points Progress */}
                  <div className="td-progress">
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* People Breakdown */}
                  <div className="td-breakdown">
                    <span className="breakdown-total">共 {item.totalAmount} 人</span>
                    <div className="breakdown-pills">
                      {item.standardAmount > 0 && (
                        <span className="breakdown-pill blue">
                          普 {item.standardAmount}
                        </span>
                      )}
                      {item.oppAmount > 0 && (
                        <span className="breakdown-pill flame">
                          🔥OPP {item.oppAmount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Total Points */}
                  <div className="td-amount">
                    <span className="points-num">{item.totalPoints}</span>
                    <span className="points-unit"> 分</span>
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
