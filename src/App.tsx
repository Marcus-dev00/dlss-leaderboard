import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Header } from './components/Header'
import { SubmitCard } from './components/SubmitCard'
import { Leaderboard } from './components/Leaderboard'
import { HistoryModal } from './components/HistoryModal'
import { LoginPage } from './components/LoginPage'
import { UserStatsBar } from './components/UserStatsBar'
import { LeaderboardItem, Profile, Submission, TimeRange } from './types'
import { supabase } from './lib/supabase'
import { getStartOfWeek, getStartOfMonth } from './lib/dateUtils'
import { useAuth } from './context/AuthContext'

export const App: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth()
  const [timeRange, setTimeRange] = useState<TimeRange>('all')
  const [leaderboardItems, setLeaderboardItems] = useState<LeaderboardItem[]>([])
  const [loadingData, setLoadingData] = useState<boolean>(true)
  const [isRealtimeActive, setIsRealtimeActive] = useState<boolean>(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false)

  const submitSectionRef = useRef<HTMLDivElement>(null)

  // 获取排行榜数据
  const fetchLeaderboardData = useCallback(async () => {
    try {
      setLoadingData(true)

      // 1. 获取所有员工 Profile
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
      }

      const profiles = (profilesData || []) as Profile[]
      const profileMap = new Map<string, string>()
      profiles.forEach((p) => profileMap.set(p.id, p.name))

      // 2. 根据时间范围查询 submissions
      let query = supabase.from('submissions').select('*')

      if (timeRange === 'week') {
        const startOfWeek = getStartOfWeek()
        query = query.gte('created_at', startOfWeek)
      } else if (timeRange === 'month') {
        const startOfMonth = getStartOfMonth()
        query = query.gte('created_at', startOfMonth)
      }

      const { data: submissionsData, error: submissionsError } = await query

      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError)
      }

      const submissions = (submissionsData || []) as Submission[]

      // 3. 内存聚合
      const statsMap = new Map<string, { totalAmount: number; count: number; lastSubmittedAt: string | null }>()

      // 先初始化所有已有员工
      profiles.forEach((p) => {
        statsMap.set(p.id, { totalAmount: 0, count: 0, lastSubmittedAt: null })
      })

      submissions.forEach((sub) => {
        const current = statsMap.get(sub.user_id) || { totalAmount: 0, count: 0, lastSubmittedAt: null }
        const newTotal = current.totalAmount + sub.amount
        const newCount = current.count + 1
        const lastSubmitted = (!current.lastSubmittedAt || new Date(sub.created_at) > new Date(current.lastSubmittedAt))
          ? sub.created_at
          : current.lastSubmittedAt

        statsMap.set(sub.user_id, {
          totalAmount: newTotal,
          count: newCount,
          lastSubmittedAt: lastSubmitted
        })
      })

      // 4. 生成排行榜列表并按总人数倒序排列
      const rawList: LeaderboardItem[] = []

      statsMap.forEach((stats, userId) => {
        const name = profileMap.get(userId) || '员工'
        rawList.push({
          userId,
          name,
          totalAmount: stats.totalAmount,
          submissionCount: stats.count,
          lastSubmittedAt: stats.lastSubmittedAt,
          rank: 0
        })
      })

      // 排序规则：总人数倒序，相同则按提交时间靠前的优先
      rawList.sort((a, b) => {
        if (b.totalAmount !== a.totalAmount) {
          return b.totalAmount - a.totalAmount
        }
        if (b.submissionCount !== a.submissionCount) {
          return b.submissionCount - a.submissionCount
        }
        return (a.name || '').localeCompare(b.name || '')
      })

      // 赋予名次 (1-indexed)
      const rankedList = rawList.map((item, index) => ({
        ...item,
        rank: index + 1
      }))

      setLeaderboardItems(rankedList)
    } catch (err) {
      console.error('Fetch leaderboard failed:', err)
    } finally {
      setLoadingData(false)
    }
  }, [timeRange])

  // 初始加载及 Tab 切换加载
  useEffect(() => {
    if (user) {
      fetchLeaderboardData()
    }
  }, [user, fetchLeaderboardData])

  // 设置 Supabase Realtime 实时订阅
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('realtime_submissions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'submissions'
        },
        (_payload) => {
          fetchLeaderboardData()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (_payload) => {
          fetchLeaderboardData()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsRealtimeActive(true)
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsRealtimeActive(false)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchLeaderboardData])

  const handleFocusSubmit = () => {
    submitSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const input = document.getElementById('amount-input')
    input?.focus()
  }

  // 1. 如果还在检查登录状态
  if (authLoading) {
    return (
      <div className="splash-screen">
        <div className="splash-card">
          <div className="splash-spinner"></div>
          <p className="splash-text">正在加载系统...</p>
        </div>
      </div>
    )
  }

  // 2. 如果未登录，直接显示全屏登录 / 注册欢迎页
  if (!user || !profile) {
    return <LoginPage />
  }

  // 3. 已登录，渲染主界面
  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenAuth={() => {}}
        isRealtimeActive={isRealtimeActive}
      />

      {/* Main Page Body */}
      <main className="main-content">
        {/* Welcome Banner */}
        <div className="dashboard-hero">
          <div className="hero-text">
            <h2 className="hero-title">
              👋 欢迎回来，<span className="hero-name">{profile.name}</span>！
            </h2>
            <p className="hero-subtitle">
              今日继续加油！登记最新人数，向排行榜前列冲刺 🚀
            </p>
          </div>
        </div>

        {/* Quick Submit Form Card */}
        <div ref={submitSectionRef}>
          <SubmitCard
            onSubmitted={fetchLeaderboardData}
            onOpenAuth={() => {}}
          />
        </div>

        {/* Dynamic Leaderboard (All-time / Month / Week) */}
        <Leaderboard
          items={leaderboardItems}
          timeRange={timeRange}
          onChangeTimeRange={setTimeRange}
          loading={loadingData}
        />
      </main>

      {/* Persistent Bottom User Stats Bar */}
      <UserStatsBar
        items={leaderboardItems}
        timeRange={timeRange}
        onFocusSubmit={handleFocusSubmit}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onRecordDeleted={fetchLeaderboardData}
      />
    </div>
  )
}
