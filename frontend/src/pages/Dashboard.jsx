import { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState({
    blogs: 0,
    events: 0,
    messages: 0,
    resources: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard Overview</h2>
        <p>Quick summary of website content.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Blogs</h3>
          <p>{stats.blogs}</p>
        </div>

        <div className="stat-card">
          <h3>Events</h3>
          <p>{stats.events}</p>
        </div>

        <div className="stat-card">
          <h3>Messages</h3>
          <p>{stats.messages}</p>
        </div>

        <div className="stat-card">
          <h3>Resources</h3>
          <p>{stats.resources}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;