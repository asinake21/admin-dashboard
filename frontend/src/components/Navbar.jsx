import { useEffect, useState, useRef } from 'react';
import { Bell, Search, UserCircle, LogOut, User, Check } from 'lucide-react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import axios from 'axios';

function Navbar() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const searchQuery = searchParams.get('search') || '';
  const isBlogsPage = location.pathname === '/blogs';

  const handleSearchChange = (e) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  // Retrieve admin info
  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      try {
        setAdmin(JSON.parse(adminData));
      } catch (e) {
        console.error('Failed to parse admin data:', e);
      }
    }
  }, []);

  // Fetch contact messages for notification count and preview
  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/contacts');
      // Set recent unread messages
      const allContacts = response.data || [];
      const unread = allContacts.filter(c => c.status === 'unread');
      setNotifications(unread);
      setUnreadCount(unread.length);
    } catch (error) {
      console.log('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 30 seconds for live updates
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotificationDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    navigate('/login');
  };

  const handleMarkAsRead = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await axios.patch(`http://localhost:5000/api/contacts/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.log('Failed to update contact:', error);
    }
  };

  return (
    <header className="navbar">
      <div>
        <h1>Admin Dashboard</h1>
        <p>Manage website content and modules</p>
      </div>

      <div className="navbar-actions">
        {isBlogsPage && (
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        )}

        {/* Notifications Icon Button */}
        <div className="nav-item-wrapper" ref={notificationRef}>
          <button 
            className="icon-button" 
            onClick={() => {
              setShowNotificationDropdown(!showNotificationDropdown);
              setShowProfileDropdown(false);
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showNotificationDropdown && (
            <div className="dropdown-menu notification-dropdown">
              <div className="dropdown-header">
                Notifications ({unreadCount})
              </div>
              <div className="dropdown-list">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map(item => (
                    <div 
                      key={item.id} 
                      className="dropdown-item-notification"
                      onClick={() => {
                        setShowNotificationDropdown(false);
                        navigate('/contacts');
                      }}
                    >
                      <div className="notification-title">
                        <span>{item.name}</span>
                        <button 
                          onClick={(e) => handleMarkAsRead(item.id, e)}
                          title="Mark as read"
                          style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            color: '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '2px'
                          }}
                        >
                          <Check size={14} />
                        </button>
                      </div>
                      <div className="notification-subject">{item.subject || 'New message'}</div>
                      <div className="notification-text">{item.message}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
                    No new notifications.
                  </div>
                )}
              </div>
              <div className="dropdown-footer">
                <Link to="/contacts" onClick={() => setShowNotificationDropdown(false)}>
                  View all messages
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="nav-item-wrapper" ref={profileRef}>
          <div 
            className="profile-box profile-trigger"
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowNotificationDropdown(false);
            }}
          >
            <UserCircle size={28} />
            <span>{admin?.name || 'Admin'}</span>
          </div>

          {showProfileDropdown && (
            <div className="dropdown-menu profile-dropdown">
              <div className="dropdown-user-info">
                <span className="user-name">{admin?.name || 'Admin User'}</span>
                <span className="user-email">{admin?.email || 'admin@example.com'}</span>
                <span className="badge info user-role">
                  {admin?.role || 'admin'}
                </span>
              </div>
              
              <button 
                className="dropdown-action-btn"
                onClick={() => {
                  setShowProfileDropdown(false);
                  navigate('/admins');
                }}
              >
                <User size={16} />
                Manage Admins
              </button>

              <button 
                className="dropdown-action-btn logout"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;