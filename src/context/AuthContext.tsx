import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Profile } from '../types'

interface AuthContextType {
  user: { id: string } | null
  profile: Profile | null
  loading: boolean
  login: (name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'dlss_current_user_profile'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    // 从 localStorage 恢复会话并同步最新数据库信息
    const restoreSession = async () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved) as Profile
          if (parsed && parsed.id) {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', parsed.id)
              .maybeSingle()

            if (!error && data) {
              setProfile(data as Profile)
            } else {
              setProfile(parsed)
            }
          }
        }
      } catch (e) {
        console.error('Session restore error:', e)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  /**
   * 纯姓名免密极速登录/注册
   */
  const login = async (name: string) => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      return { success: false, error: '请输入员工姓名' }
    }

    try {
      // 1. 查询 profiles 表中该姓名是否已存在 (大小写不敏感)
      const { data: existingUsers, error: queryError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('name', trimmedName)

      if (queryError) {
        console.error('Query profile error:', queryError)
        return { success: false, error: `查询失败: ${queryError.message}` }
      }

      // 2. 如果员工已存在 -> 直接进入系统
      if (existingUsers && existingUsers.length > 0) {
        const validProfile = existingUsers[0] as Profile
        setProfile(validProfile)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(validProfile))
        return { success: true }
      }

      // 3. 如果员工不存在 -> 自动创建新员工档案
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          name: trimmedName
        })
        .select()
        .single()

      if (insertError) {
        console.error('Insert profile error:', insertError)
        return { success: false, error: `创建档案失败: ${insertError.message}` }
      }

      if (newProfile) {
        const createdProfile = newProfile as Profile
        setProfile(createdProfile)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(createdProfile))
        return { success: true }
      }

      return { success: false, error: '进入失败，请重试' }
    } catch (err: any) {
      return { success: false, error: err?.message || '网络连接异常' }
    }
  }

  const logout = async () => {
    localStorage.removeItem(STORAGE_KEY)
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (profile) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile.id)
        .maybeSingle()

      if (data) {
        setProfile(data as Profile)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user: profile ? { id: profile.id } : null,
        profile,
        loading,
        login,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
