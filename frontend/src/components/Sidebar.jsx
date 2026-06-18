import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Newspaper,
  CalendarDays,
  MessageSquare,
  Image,
  FileText,
  Users
} from 'lucide-react';

function Sidebar() {
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/blogs', label: 'Blogs', icon: Newspaper },
    { path: '/events', label: 'Events', icon: CalendarDays },
    { path: '/contacts', label: 'Contacts', icon: MessageSquare },
    { path: '/gallery', label: 'Gallery', icon: Image },
    { path: '/resources', label: 'Resources', icon: FileText },
    { path: '/admins', label: 'Admins', icon: Users }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>Admin Panel</h2>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? 'menu-link active' : 'menu-link'
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;