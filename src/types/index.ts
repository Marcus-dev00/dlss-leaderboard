export interface Profile {
  id: string
  name: string
  password_hash?: string | null
  created_at: string
}

export interface Submission {
  id: string
  user_id: string
  amount: number
  note?: string | null
  created_at: string
}

export type TimeRange = 'all' | 'month' | 'week'

export interface LeaderboardItem {
  userId: string
  name: string
  totalAmount: number
  submissionCount: number
  lastSubmittedAt: string | null
  rank: number
}

export interface UserStats {
  rank: number | null
  totalAmount: number
  submissionCount: number
}
