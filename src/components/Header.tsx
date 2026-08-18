import { Trophy, LogOut, User as UserIcon, History } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface HeaderProps {
  onOpenHistory: () => void
  onOpenAuth: () => void
  isRealtimeActive: boolean
}

export const Header: React.FC<HeaderProps> = ({ onOpenHistory, onOpenAuth, isRealtimeActive }) => {
  const { user, profile, logout } = useAuth()

  return (
    <header className="header">
      <div className="header-container">
        {/* Brand Logo & Title */}
        <div className="brand-box">
          <div className="brand-icon-wrapper">
            <Trophy className="brand-icon" />
          </div>
          <div>
            <div className="brand-title-row">
              <h1 className="brand-title">人数登记排行榜</h1>
              <span className="brand-badge">DLSS</span>
            </div>
            <p className="brand-subtitle">实时累计 · 公开透明 · 团队协作</p>
          </div>
        </div>

        {/* Right side actions & user status */}
        <div className="header-actions">
          {/* Realtime sync indicator */}
          <div className={`realtime-badge ${isRealtimeActive ? 'active' : 'offline'}`} title={isRealtimeActive ? '已连接实时同步通道' : '正在连接实时同步...'}>
            <span className="pulse-dot"></span>
            <span className="realtime-text">{isRealtimeActive ? '实时更新中' : '同步中...'}</span>
          </div>

          {user && profile ? (
            <div className="user-profile-menu">
              <div className="user-badge" title={`已登录：${profile.name}`}>
                <div className="user-avatar">
                  {profile.name.slice(0, 1)}
                </div>
                <div className="user-info">
                  <span className="user-name">{profile.name}</span>
                  <span className="user-role">已登录员工</span>
                </div>
              </div>

              <button 
                className="btn-header-action" 
                onClick={onOpenHistory}
                title="查看我的提交流水"
              >
                <History size={16} />
                <span className="btn-text">提交历史</span>
              </button>

              <button 
                className="btn-header-action danger" 
                onClick={logout}
                title="退出登录"
              >
                <LogOut size={16} />
                <span className="btn-text">退出</span>
              </button>
            </div>
          ) : (
            <button className="btn-primary" onClick={onOpenAuth}>
              <UserIcon size={16} />
              <span>员工登录 / 登记</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
