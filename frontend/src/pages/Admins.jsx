import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';

function Admins() {
  const [admins, setAdmins] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin'
  });

  const fetchAdmins = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admins');
      setAdmins(response.data);
    } catch (error) {
      console.log('Failed to fetch admins:', error);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);

      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'admin'
      });
      setShowPassword(false);

      fetchAdmins();
    } catch (error) {
      console.log('Failed to create admin:', error);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Are you sure you want to delete this admin?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admins/${id}`);
      fetchAdmins();
    } catch (error) {
      console.log('Failed to delete admin:', error);
    }
  };

  return (
    <div>
      <div className="module-header">
        <div>
          <h2>Admin Management</h2>
          <p>Manage admin users and roles.</p>
        </div>
      </div>

      <form className="module-form" onSubmit={handleSubmit}>
        <h3>Add New Admin</h3>

        <div className="form-grid">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ paddingRight: '44px', width: '100%' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>

        <button className="primary-button" type="submit" style={{ marginTop: '16px' }}>
          <Plus size={18} />
          Add Admin
        </button>
      </form>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td>{admin.name}</td>
                <td>{admin.email}</td>
                <td>
                  <span className={admin.role === 'super_admin' ? 'badge success' : 'badge info'}>
                    {admin.role}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="small-button delete" onClick={() => handleDelete(admin.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan="4">No admins found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Admins;