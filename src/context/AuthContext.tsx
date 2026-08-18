import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Profile } from '../types'

interface AuthContextType {
  user: { id: string } | null
  profile: Profile | null
  loading: boolean
  login: (name: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'dlss_current_user_profile'

/**
 * 使用浏览器原生 SHA-256 进行密码哈希，确保安全存储
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + '_dlss_salt_sec')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    // 从 localStorage 恢复会话并校验数据库
    const restoreSession = async () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved) as Profile
          if (parsed && parsed.id) {
            // 从数据库拉取最新 profile
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

  const login = async (name: string, password: string) => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      return { success: false, error: '请输入员工姓名' }
    }
    if (!password || password.length < 6) {
      return { success: false, error: '密码长度至少为 6 位' }
    }

    try {
      const pwdHash = await hashPassword(password)

      // 1. 查询 profiles 表中该姓名是否已存在
      const { data: existingUser, error: queryError } = await supabase
        .from('profiles')
        .select('*')
        .eq('name', trimmedName)
        .maybeSingle()

      if (queryError) {
        console.error('Query profile error:', queryError)
        return { success: false, error: `查询失败: ${queryError.message}` }
      }

      // 2. 如果员工已存在 -> 验证密码
      if (existingUser) {
        if (existingUser.password_hash && existingUser.password_hash !== pwdHash) {
          return { success: false, error: '该姓名已存在，但密码不匹配，请重新输入！' }
        }

        // 如果旧账号还没有 password_hash，则更新保存当前密码
        if (!existingUser.password_hash) {
          await supabase
            .from('profiles')
            .update({ password_hash: pwdHash })
            .eq('id', existingUser.id)
        }

        const validProfile = existingUser as Profile
        setProfile(validProfile)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(validProfile))
        return { success: true }
      }

      // 3. 如果员工不存在 -> 自动创建新员工档案（注册）
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          name: trimmedName,
          password_hash: pwdHash
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

      return { success: false, error: '注册失败，请稍后重试' }
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
