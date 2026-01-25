import React, { useState, useEffect } from 'react'
import { FaUsers, FaComment, FaSearch, FaBan, FaChartBar, FaSync, FaShieldAlt } from 'react-icons/fa'
import '../styles/Components.css'

const AdminPanel = ({ socket }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminToken, setAdminToken] = useState('')
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeChats: 0,
    searchingUsers: 0,
    reportedUsers: 0,
    blockedUsers: 0,
    uptime: 0
  })
  
  const [users, setUsers] = useState([])
  const [reportedUsers, setReportedUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (socket && isAuthenticated) {
      socket.emit('admin-connect', { token: adminToken })
      
      socket.on('admin-stats', handleStatsUpdate)
      socket.on('admin-users', handleUsersUpdate)
      socket.on('admin-reports', handleReportsUpdate)
      
      // Request initial data
      fetchAdminData()
      
      // Set up periodic updates
      const interval = setInterval(fetchAdminData, 10000)
      
      return () => {
        socket.off('admin-stats')
        socket.off('admin-users')
        socket.off('admin-reports')
        clearInterval(interval)
      }
    }
  }, [socket, isAuthenticated, adminToken])

  const fetchAdminData = () => {
    if (socket) {
      socket.emit('admin-get-stats')
      socket.emit('admin-get-users')
      socket.emit('admin-get-reports')
    }
  }

  const handleStatsUpdate = (data) => {
    setStats(data)
  }

  const handleUsersUpdate = (data) => {
    setUsers(data)
  }

  const handleReportsUpdate = (data) => {
    setReportedUsers(data)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    // In production, validate token with server
    if (adminToken === 'admin123' || adminToken.length > 10) {
      setIsAuthenticated(true)
    } else {
      alert('Invalid admin token')
    }
  }

  const banUser = (userId, reason) => {
    if (socket && window.confirm(`Ban user ${userId}? Reason: ${reason}`)) {
      socket.emit('admin-ban-user', { userId, reason })
    }
  }

  const warnUser = (userId) => {
    if (socket) {
      socket.emit('admin-warn-user', { userId })
      alert(`Warning sent to user ${userId}`)
    }
  }

  const clearReports = (userId) => {
    if (socket) {
      socket.emit('admin-clear-reports', { userId })
    }
  }

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }

  const filteredUsers = users.filter(user => 
    user.id.includes(searchQuery) || 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isAuthenticated) {
    return (
      <div className="admin-login-panel">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <FaShieldAlt size={40} />
            <h2>Admin Login</h2>
            <p>Enter admin token to access dashboard</p>
          </div>
          
          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="form-group">
              <label>Admin Token</label>
              <input
                type="password"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                placeholder="Enter secure token"
                required
              />
            </div>
            
            <button type="submit" className="admin-login-btn">
              Login as Admin
            </button>
          </form>
          
          <div className="admin-login-footer">
            <p>⚠️ Admin access is restricted to authorized personnel only</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-left">
          <h1><FaShieldAlt /> Admin Dashboard</h1>
          <p className="admin-subtitle">Real-time monitoring & moderation</p>
        </div>
        
        <div className="admin-header-right">
          <button 
            onClick={fetchAdminData}
            className="admin-refresh-btn"
          >
            <FaSync /> Refresh
          </button>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="admin-logout-btn"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-icon total-users">
            <FaUsers />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon active-chats">
            <FaComment />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeChats}</div>
            <div className="stat-label">Active Chats</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon searching">
            <FaSearch />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.searchingUsers}</div>
            <div className="stat-label">Searching</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon reported">
            <FaBan />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.reportedUsers}</div>
            <div className="stat-label">Reports</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon blocked">
            <FaBan />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.blockedUsers}</div>
            <div className="stat-label">Blocked</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon uptime">
            <FaChartBar />
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatUptime(stats.uptime)}</div>
            <div className="stat-label">Uptime</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="admin-search-section">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users by ID or username..."
          className="admin-search-input"
        />
      </div>

      {/* Users Table */}
      <div className="admin-section">
        <h2>Active Users ({users.length})</h2>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Status</th>
                <th>Age</th>
                <th>Interests</th>
                <th>Chat Mode</th>
                <th>Connected</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.slice(0, 20).map(user => (
                <tr key={user.id}>
                  <td className="user-id-cell">
                    <code>{user.id.substring(0, 8)}...</code>
                  </td>
                  <td className="username-cell">
                    {user.username}
                    {user.isPremium && <span className="premium-badge">PRO</span>}
                  </td>
                  <td>
                    <span className={`status-badge status-${user.status}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.age || '-'}</td>
                  <td>
                    <div className="user-interests">
                      {user.interests?.slice(0, 2).map(interest => (
                        <span key={interest} className="interest-tag small">
                          {interest}
                        </span>
                      ))}
                      {user.interests?.length > 2 && (
                        <span className="more-interests">+{user.interests.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`chat-mode-badge mode-${user.chatMode}`}>
                      {user.chatMode}
                    </span>
                  </td>
                  <td>
                    {Math.floor(user.connectedFor / 1000)}s
                  </td>
                  <td>
                    <div className="user-actions">
                      <button 
                        onClick={() => warnUser(user.id)}
                        className="action-btn warn-btn"
                        title="Send warning"
                      >
                        ⚠️
                      </button>
                      <button 
                        onClick={() => banUser(user.id, 'Admin action')}
                        className="action-btn ban-btn"
                        title="Ban user"
                      >
                        🚫
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reported Users */}
      <div className="admin-section">
        <h2>Reported Users ({reportedUsers.length})</h2>
        {reportedUsers.length === 0 ? (
          <div className="no-reports">
            <p>No reports pending</p>
          </div>
        ) : (
          <div className="reported-users-list">
            {reportedUsers.map(report => (
              <div key={report.id} className="reported-user-card">
                <div className="reported-user-info">
                  <div className="reported-user-header">
                    <span className="reported-user-id">
                      User: {report.userId.substring(0, 10)}...
                    </span>
                    <span className="report-count">
                      {report.reportCount} report(s)
                    </span>
                  </div>
                  
                  <div className="report-reasons">
                    <strong>Reasons:</strong>
                    <ul>
                      {report.reasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="reported-by">
                    <small>Reported by {report.reportedBy.length} users</small>
                  </div>
                </div>
                
                <div className="report-actions">
                  <button 
                    onClick={() => clearReports(report.userId)}
                    className="action-btn clear-btn"
                  >
                    Clear Reports
                  </button>
                  <button 
                    onClick={() => warnUser(report.userId)}
                    className="action-btn warn-btn"
                  >
                    Send Warning
                  </button>
                  <button 
                    onClick={() => banUser(report.userId, report.reasons.join(', '))}
                    className="action-btn ban-btn"
                  >
                    Ban User
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Controls */}
      <div className="admin-section system-controls">
        <h2>System Controls</h2>
        <div className="control-buttons">
          <button 
            className="control-btn emergency"
            onClick={() => {
              if (window.confirm('Are you sure you want to perform emergency shutdown?')) {
                socket.emit('admin-emergency-shutdown')
                alert('Emergency shutdown initiated')
              }
            }}
          >
            🚨 Emergency Shutdown
          </button>
          
          <button 
            className="control-btn maintenance"
            onClick={() => {
              socket.emit('admin-maintenance-mode', { enabled: true })
              alert('Maintenance mode enabled')
            }}
          >
            🔧 Enable Maintenance
          </button>
          
          <button 
            className="control-btn clear-cache"
            onClick={() => {
              socket.emit('admin-clear-cache')
              alert('Cache cleared')
            }}
          >
            🧹 Clear Cache
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="admin-footer">
        <p>Omegle Pro Admin Panel v1.0 • Last updated: {new Date().toLocaleTimeString()}</p>
        <p className="admin-warning">
          ⚠️ All actions are logged and monitored
        </p>
      </div>
    </div>
  )
}

export default AdminPanel