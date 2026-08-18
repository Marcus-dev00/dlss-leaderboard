import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, nameToInternalEmail } from '../lib/supabase'
import { Profile } from '../types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  login: (name: string, password: string) => Promise<{ success: boolean; error?: string; isNewUser?: boolean }>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const fetchProfile = async (userId: string, defaultName?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Fetch profile error:', error)
      }

      if (data) {
        setProfile(data as Profile)
      } else if (defaultName) {
        // 如果 profile 尚未创建，补充创建
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .upsert({ id: userId, name: defaultName.trim() })
          .select()
          .single()

        if (!insertError && newProfile) {
          setProfile(newProfile as Profile)
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }

  useEffect(() => {
    // 检查初始会话
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        }
      } catch (e) {
        console.error('Session init error:', e)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // 监听认证状态变更
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (name: string, password: string) => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      return { success: false, error: '请输入姓名' }
    }
    if (!password || password.length < 6) {
      return { success: false, error: '密码长度至少为 6 位' }
    }

    const email = nameToInternalEmail(trimmedName)

    try {
      // 1. 尝试直接登录
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (!signInError && signInData.user) {
        setUser(signInData.user)
        await fetchProfile(signInData.user.id, trimmedName)
        return { success: true, isNewUser: false }
      }

      // 2. 如果登录失败，判断是否需要自动注册
      if (signInError) {
        const msg = signInError.message.toLowerCase()
        const isCredentialsError = msg.includes('invalid login credentials') || msg.includes('user not found')

        if (isCredentialsError) {
          // 尝试注册
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name: trimmedName }
            }
          })

          if (signUpError) {
            // 如果注册提示用户已存在，说明是密码输错了
            if (signUpError.message.includes('User already registered') || signUpError.message.includes('already exists')) {
              return { success: false, error: '该姓名已注册，但密码错误，请核对密码！' }
            }
            return { success: false, error: signUpError.message }
          }

          if (signUpData.user) {
            setUser(signUpData.user)
            // 创建 profile 记录
            await fetchProfile(signUpData.user.id, trimmedName)
            return { success: true, isNewUser: true }
          }
        }

        return { success: false, error: signInError.message }
      }

      return { success: false, error: '登录失败，请稍后重试' }
    } catch (err: any) {
      return { success: false, error: err?.message || '网络连接异常' }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, refreshProfile }}>
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
