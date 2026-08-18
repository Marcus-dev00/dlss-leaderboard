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
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false)

  const submitSectionRef = useRef<HTMLDivElement>(null)

  // 获取排行榜数据与积分统计
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
      const statsMap = new Map<string, {
        totalPoints: number
        totalAmount: number
        standardAmount: number
        oppAmount: number
        count: number
        lastSubmittedAt: string | null
      }>()

      // 先初始化已有员工
      profiles.forEach((p) => {
        statsMap.set(p.id, {
          totalPoints: 0,
          totalAmount: 0,
          standardAmount: 0,
          oppAmount: 0,
          count: 0,
          lastSubmittedAt: null
        })
      })

      submissions.forEach((sub) => {
        const current = statsMap.get(sub.user_id) || {
          totalPoints: 0,
          totalAmount: 0,
          standardAmount: 0,
          oppAmount: 0,
          count: 0,
          lastSubmittedAt: null
        }

        const isOpp = sub.type === 'opp'
        const itemPoints = sub.points || (sub.amount * (isOpp ? 10 : 8))

        const newTotalPoints = current.totalPoints + itemPoints
        const newTotalAmount = current.totalAmount + sub.amount
        const newStandardAmount = current.standardAmount + (isOpp ? 0 : sub.amount)
        const newOppAmount = current.oppAmount + (isOpp ? sub.amount : 0)
        const newCount = current.count + 1
        const lastSubmitted = (!current.lastSubmittedAt || new Date(sub.created_at) > new Date(current.lastSubmittedAt))
          ? sub.created_at
          : current.lastSubmittedAt

        statsMap.set(sub.user_id, {
          totalPoints: newTotalPoints,
          totalAmount: newTotalAmount,
          standardAmount: newStandardAmount,
          oppAmount: newOppAmount,
          count: newCount,
          lastSubmittedAt: lastSubmitted
        })
      })

      // 4. 生成排行榜列表并按总积分倒序排列
      const rawList: LeaderboardItem[] = []

      statsMap.forEach((stats, userId) => {
        const name = profileMap.get(userId) || '员工'
        rawList.push({
          userId,
          name,
          totalPoints: stats.totalPoints,
          totalAmount: stats.totalAmount,
          standardAmount: stats.standardAmount,
          oppAmount: stats.oppAmount,
          submissionCount: stats.count,
          lastSubmittedAt: stats.lastSubmittedAt,
          rank: 0
        })
      })

      // 排序规则：总积分倒序 -> 总人数倒序 -> 提交时间
      rawList.sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints
        }
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
        () => {
          fetchLeaderboardData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchLeaderboardData])

  const handleFocusSubmit = () => {
    submitSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const input = document.getElementById('amount-input')
    input?.focus()
  }

  // 1. 加载中
  if (authLoading) {
    return (
      <div className="splash-screen">
        <div className="splash-card">
          <div className="splash-spinner"></div>
          <p className="splash-text">加载中...</p>
        </div>
      </div>
    )
  }

  // 2. 未登录 -> 显示极简登录页
  if (!user || !profile) {
    return <LoginPage />
  }

  // 3. 已登录主界面
  return (
    <div className="app-container">
      {/* 极简顶栏 */}
      <Header onOpenHistory={() => setIsHistoryOpen(true)} />

      {/* 主内容区域 */}
      <main className="main-content">
        {/* 极简快速提交区 */}
        <div ref={submitSectionRef}>
          <SubmitCard onSubmitted={fetchLeaderboardData} />
        </div>

        {/* 极简排行榜 */}
        <Leaderboard
          items={leaderboardItems}
          timeRange={timeRange}
          onChangeTimeRange={setTimeRange}
          loading={loadingData}
        />
      </main>

      {/* 底部极简战绩栏 */}
      <UserStatsBar
        items={leaderboardItems}
        timeRange={timeRange}
        onFocusSubmit={handleFocusSubmit}
      />

      {/* 历史明细弹窗 */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onRecordDeleted={fetchLeaderboardData}
      />
    </div>
  )
}
