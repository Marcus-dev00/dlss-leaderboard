import React from 'react'
import { Trophy, LogOut, History } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface HeaderProps {
  onOpenHistory: () => void
}

export const Header: React.FC<HeaderProps> = ({ onOpenHistory }) => {
  const { profile, logout } = useAuth()

  return (
    <header className="header">
      <div className="header-container">
        {/* Brand */}
        <div className="brand-box">
          <div className="brand-icon-wrapper">
            <Trophy className="brand-icon" />
          </div>
          <h1 className="brand-title">人数排行榜</h1>
        </div>

        {/* User Actions */}
        {profile && (
          <div className="header-actions">
            <div className="user-badge" title={`已登录：${profile.name}`}>
              <div className="user-avatar">
                {profile.name.slice(0, 1)}
              </div>
              <span className="user-name">{profile.name}</span>
            </div>

            <button 
              className="btn-header-action" 
              onClick={onOpenHistory}
              title="查看提交明细"
            >
              <History size={15} />
              <span>历史</span>
            </button>

            <button 
              className="btn-header-action danger" 
              onClick={logout}
              title="退出登录"
            >
              <LogOut size={15} />
              <span>退出</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
