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
              <span className="brand-company">DLSS</span>
              <span className="brand-sep">·</span>
              <h1 className="brand-title">{t.leaderboardTitle}</h1>
            </div>
            <span className="brand-studio-sub">{t.studioName}</span>
          </div>
        </div>

        {/* Actions */}
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
                aria-label={t.history}
              >
                <History size={16} />
                <span className="header-btn-label">{t.history}</span>
              </button>

              <button 
                className="btn-header-action danger" 
                onClick={logout}
                title={t.logout}
                aria-label={t.logout}
              >
                <LogOut size={16} />
                <span className="header-btn-label">{t.logout}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
