import { useState } from 'react';
import axios from 'axios';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('admin', JSON.stringify(response.data.admin));

      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit} autoComplete="off">
        <h1>Admin Login</h1>
        <p>Sign in to manage website content.</p>

        {error && <div className="error-message">{error}</div>}

        <label>Email</label>
        <div className="input-group">
          <Mail size={18} />
          <input
            type="email"
            name="email"
            placeholder="admin@gmail.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </div>

        <label>Password</label>
        <div className="input-group" style={{ display: 'flex', alignItems: 'center' }}>
          <Lock size={18} />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder=""
            value={formData.password}
            onChange={handleChange}
            style={{ flex: 1 }}
            autoComplete="new-password"
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', marginLeft: '8px', color: '#666' }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button type="submit" className="login-button">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;