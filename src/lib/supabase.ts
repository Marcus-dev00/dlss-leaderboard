import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hmfmbltxppdysjgrvaer.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_m_5w_-Lkcw1fnJAgxImBfg_7EFpYIoz'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
})

/**
 * 将员工姓名转换为 Supabase Auth 内部使用的有效邮箱格式
 * 采用十六进制编码，天然支持中文、英文及特殊符号，保证绝对合法且唯一
 */
export function nameToInternalEmail(name: string): string {
  const trimmed = name.trim()
  const hex = Array.from(new TextEncoder().encode(trimmed))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `emp_${hex}@internal.company`
}
