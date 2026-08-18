import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Header } from './components/Header'
import { SubmitCard } from './components/SubmitCard'
import { Leaderboard } from './components/Leaderboard'
import { HistoryModal } from './components/HistoryModal'
import { AuthModal } from './components/AuthModal'
import { UserStatsBar } from './components/UserStatsBar'
import { LeaderboardItem, Profile, Submission, TimeRange } from './types'
import { supabase } from './lib/supabase'
import { getStartOfWeek, getStartOfMonth } from './lib/dateUtils'
import { useAuth } from './context/AuthContext'

export const App: React.FC = () => {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState<TimeRange>('all')
  const [leaderboardItems, setLeaderboardItems] = useState<LeaderboardItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [isRealtimeActive, setIsRealtimeActive] = useState<boolean>(false)
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false)

  const submitSectionRef = useRef<HTMLDivElement>(null)

  // 获取排行榜数据
  const fetchLeaderboardData = useCallback(async () => {
    try {
      setLoading(true)

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
        const name = profileMap.get(userId) || '未命名员工'
        // 只有当有提交或者属于已有 profile 时列入
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
      setLoading(false)
    }
  }, [timeRange])

  // 初始加载及 Tab 切换加载
  useEffect(() => {
    fetchLeaderboardData()
  }, [fetchLeaderboardData])

  // 设置 Supabase Realtime 实时订阅
  useEffect(() => {
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
          // 有任何新增/删除/修改，立刻重新拉取最新数据
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
  }, [fetchLeaderboardData])

  const handleFocusSubmit = () => {
    if (!user) {
      setIsAuthOpen(true)
    } else {
      submitSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      const input = document.getElementById('amount-input')
      input?.focus()
    }
  }

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        isRealtimeActive={isRealtimeActive}
      />

      {/* Main Page Body */}
      <main className="main-content">
        {/* Quick Submit Form Card */}
        <div ref={submitSectionRef}>
          <SubmitCard
            onSubmitted={fetchLeaderboardData}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        </div>

        {/* Dynamic Leaderboard (All-time / Month / Week) */}
        <Leaderboard
          items={leaderboardItems}
          timeRange={timeRange}
          onChangeTimeRange={setTimeRange}
          loading={loading}
        />
      </main>

      {/* Persistent Bottom User Stats Bar */}
      <UserStatsBar
        items={leaderboardItems}
        timeRange={timeRange}
        onFocusSubmit={handleFocusSubmit}
      />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onRecordDeleted={fetchLeaderboardData}
      />
    </div>
  )
}
