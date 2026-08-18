import React, { createContext, useContext, useState, useEffect } from 'react'

export type Language = 'en' | 'zh' | 'ms'

export interface Translations {
  // Brand
  brandName: string
  studioName: string
  leaderboardTitle: string
  
  // Login Page
  loginTab: string
  registerTab: string
  nameLabel: string
  namePlaceholder: string
  pwdLabel: string
  pwdHint: string
  pwdPlaceholder: string
  btnLogin: string
  btnRegister: string
  nameRequired: string
  pwdRequired: string

  // Header & Navigation
  history: string
  logout: string

  // Submit Card
  submitTitle: string
  standardChannel: string
  oppChannel: string
  paxUnit: string
  earnedPoints: string
  pointsUnit: string
  notePlaceholder: string
  btnSubmit: string
  submitSuccess: (amount: number, points: number) => string
  submitFail: string
  invalidAmount: string

  // Leaderboard
  tabAll: string
  tabMonth: string
  tabWeek: string
  totalPointsLabel: string
  totalPaxLabel: string
  searchPlaceholder: string
  noData: string
  rankTh: string
  employeeTh: string
  progressTh: string
  paxTh: string
  pointsTh: string
  meTag: string

  // User Stats Bar
  myRankLabel: string
  myPointsLabel: string
  myPaxLabel: string
  btnRecord: string

  // History Modal
  historyTitle: string
  recordsCount: (count: number) => string
  noHistory: string
  btnClose: string
  confirmDelete: string
}

const translations: Record<Language, Translations> = {
  en: {
    brandName: 'DLSS',
    studioName: 'Diamond Life Style Studio',
    leaderboardTitle: 'Leaderboard',

    loginTab: 'Login',
    registerTab: 'Register',
    nameLabel: 'Employee Name',
    namePlaceholder: 'Enter your name',
    pwdLabel: 'Password',
    pwdHint: 'Min 6 characters',
    pwdPlaceholder: 'Enter password',
    btnLogin: 'Login',
    btnRegister: 'Register & Enter',
    nameRequired: 'Please enter employee name',
    pwdRequired: 'Password must be at least 6 characters',

    history: 'History',
    logout: 'Logout',

    submitTitle: 'Record Count',
    standardChannel: 'Standard (8 pts/pax)',
    oppChannel: 'OPP Session (10 pts/pax)',
    paxUnit: 'pax',
    earnedPoints: 'You will get',
    pointsUnit: 'Pts',
    notePlaceholder: 'Note (optional)',
    btnSubmit: 'Confirm Submit',
    submitSuccess: (amount, points) => `Successfully recorded ${amount} pax (+${points} pts)`,
    submitFail: 'Submission failed',
    invalidAmount: 'Please enter a valid number greater than 0',

    tabAll: 'All-Time',
    tabMonth: 'Monthly',
    tabWeek: 'Weekly',
    totalPointsLabel: 'Total Pts',
    totalPaxLabel: 'Total Pax',
    searchPlaceholder: 'Search name...',
    noData: 'No records found',
    rankTh: 'Rank',
    employeeTh: 'Employee',
    progressTh: 'Progress',
    paxTh: 'Pax',
    pointsTh: 'Points',
    meTag: 'Me',

    myRankLabel: 'Rank',
    myPointsLabel: 'Pts',
    myPaxLabel: 'Pax',
    btnRecord: 'Record',

    historyTitle: 'Submission History',
    recordsCount: (count) => `${count} records`,
    noHistory: 'No submission records yet',
    btnClose: 'Close',
    confirmDelete: 'Are you sure you want to delete this record?'
  },

  zh: {
    brandName: 'DLSS',
    studioName: 'Diamond Life Style Studio',
    leaderboardTitle: '人数排行榜',

    loginTab: '员工登录',
    registerTab: '首次注册',
    nameLabel: '员工姓名',
    namePlaceholder: '输入您的姓名',
    pwdLabel: '登录密码',
    pwdHint: '不少于 6 位',
    pwdPlaceholder: '输入密码',
    btnLogin: '登录',
    btnRegister: '注册并进入',
    nameRequired: '请输入员工姓名',
    pwdRequired: '密码至少 6 位',

    history: '历史',
    logout: '退出',

    submitTitle: '登记人数',
    standardChannel: '普通登记 (8分/人)',
    oppChannel: 'OPP 专场 (10分/人)',
    paxUnit: '人',
    earnedPoints: '本次获得',
    pointsUnit: '积分',
    notePlaceholder: '填写备注（可选）',
    btnSubmit: '确认提交',
    submitSuccess: (amount, points) => `登记成功！${amount} 人 (+${points} 分)`,
    submitFail: '提交失败',
    invalidAmount: '请输入大于 0 的有效人数',

    tabAll: '总榜',
    tabMonth: '月榜',
    tabWeek: '周榜',
    totalPointsLabel: '总积分',
    totalPaxLabel: '总人数',
    searchPlaceholder: '搜索姓名...',
    noData: '暂无登记数据',
    rankTh: '排名',
    employeeTh: '员工',
    progressTh: '进度',
    paxTh: '人数',
    pointsTh: '积分',
    meTag: '我',

    myRankLabel: '排名',
    myPointsLabel: '积分',
    myPaxLabel: '人数',
    btnRecord: '登记',

    historyTitle: '我的提交历史',
    recordsCount: (count) => `${count} 条记录`,
    noHistory: '暂无提交记录',
    btnClose: '关闭',
    confirmDelete: '确定删除这条记录吗？'
  },

  ms: {
    brandName: 'DLSS',
    studioName: 'Diamond Life Style Studio',
    leaderboardTitle: 'Papan Pendahulu',

    loginTab: 'Log Masuk',
    registerTab: 'Daftar Akaun',
    nameLabel: 'Nama Pekerja',
    namePlaceholder: 'Masukkan nama anda',
    pwdLabel: 'Kata Laluan',
    pwdHint: 'Min 6 aksara',
    pwdPlaceholder: 'Masukkan kata laluan',
    btnLogin: 'Log Masuk',
    btnRegister: 'Daftar & Masuk',
    nameRequired: 'Sila masukkan nama pekerja',
    pwdRequired: 'Kata laluan sekurang-kurangnya 6 aksara',

    history: 'Sejarah',
    logout: 'Log Keluar',

    submitTitle: 'Daftar Bilangan',
    standardChannel: 'Biasa (8 mata/org)',
    oppChannel: 'Sesi OPP (10 mata/org)',
    paxUnit: 'org',
    earnedPoints: 'Mata Diperoleh',
    pointsUnit: 'Mata',
    notePlaceholder: 'Nota (pilihan)',
    btnSubmit: 'Sahkan & Hantar',
    submitSuccess: (amount, points) => `Berjaya daftar ${amount} orang (+${points} mata)`,
    submitFail: 'Penyerahan gagal',
    invalidAmount: 'Sila masukkan bilangan lebih daripada 0',

    tabAll: 'Semua',
    tabMonth: 'Bulanan',
    tabWeek: 'Mingguan',
    totalPointsLabel: 'Jumlah Mata',
    totalPaxLabel: 'Jumlah Orang',
    searchPlaceholder: 'Cari nama...',
    noData: 'Tiada rekod data',
    rankTh: 'Ked.',
    employeeTh: 'Pekerja',
    progressTh: 'Kemajuan',
    paxTh: 'Orang',
    pointsTh: 'Mata',
    meTag: 'Saya',

    myRankLabel: 'Ked.',
    myPointsLabel: 'Mata',
    myPaxLabel: 'Orang',
    btnRecord: 'Daftar',

    historyTitle: 'Sejarah Penyerahan',
    recordsCount: (count) => `${count} rekod`,
    noHistory: 'Tiada rekod penyerahan lagi',
    btnClose: 'Tutup',
    confirmDelete: 'Adakah anda pasti ingin memadamkan rekod ini?'
  }
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('dlss_lang')
    if (saved === 'zh' || saved === 'en' || saved === 'ms') {
      return saved
    }
    return 'en' // 首次进入默认英文
  })

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('dlss_lang', lang)
  }

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : (language === 'ms' ? 'ms' : 'en')
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
