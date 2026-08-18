import React from 'react'
import { Trophy, LogOut, History } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { LanguageSwitcher } from './LanguageSwitcher'

interface HeaderProps {
  onOpenHistory: () => void
}

export const Header: React.FC<HeaderProps> = ({ onOpenHistory }) => {
  const { profile, logout } = useAuth()
  const { t } = useLanguage()

  return (
    <header className="header">
      <div className="header-container">
        {/* Brand */}
        <div className="brand-box">
          <div className="brand-icon-wrapper">
            <Trophy className="brand-icon" />
          </div>
          <div className="brand-text-col">
            <div className="brand-title-row">
              <span className="brand-company">{t.brandName}</span>
              <span className="brand-sep">·</span>
              <h1 className="brand-title">{t.leaderboardTitle}</h1>
            </div>
            <span className="brand-studio-sub">{t.studioName}</span>
          </div>
        </div>

        {/* User Actions & Language Switcher */}
        <div className="header-actions">
          <LanguageSwitcher compact />

          {profile && (
            <>
              <div className="user-badge" title={profile.name}>
                <div className="user-avatar">
                  {profile.name.slice(0, 1)}
                </div>
                <span className="user-name">{profile.name}</span>
              </div>

              <button 
                className="btn-header-action" 
                onClick={onOpenHistory}
                title={t.history}
              >
                <History size={15} />
                <span>{t.history}</span>
              </button>

              <button 
                className="btn-header-action danger" 
                onClick={logout}
                title={t.logout}
              >
                <LogOut size={15} />
                <span>{t.logout}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
