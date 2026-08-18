/**
 * 获取本周一 00:00:00 的 ISO 字符串 (采用本地时间计算转换为 UTC ISO)
 */
export function getStartOfWeek(): string {
  const now = new Date()
  const day = now.getDay() // 0 是周日, 1 是周一...
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) // 调整到本周一
  const monday = new Date(now.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString()
}

/**
 * 获取本月 1 号 00:00:00 的 ISO 字符串
 */
export function getStartOfMonth(): string {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
  return firstDay.toISOString()
}

/**
 * 友好格式化时间
 */
export function formatTime(isoString: string): string {
  const d = new Date(isoString)
  const now = new Date()
  
  const isToday = d.toDateString() === now.toDateString()
  const pad = (n: number) => n.toString().padStart(2, '0')
  const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`

  if (isToday) {
    return `今天 ${timeStr}`
  }

  const month = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  return `${month}-${day} ${timeStr}`
}
