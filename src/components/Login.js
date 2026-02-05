import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simple validation
    if (!username.trim() || !password.trim()) {
      setError('გთხოვთ შეავსოთ ყველა ველი');
      setIsLoading(false);
      return;
    }

    // Check credentials
    if (username === 'SmartHome' && password === 'SmartHome123') {
      localStorage.setItem('isAuthenticated', 'true');
      setIsLoading(false);
      navigate('/admin'); // Use navigate instead of window.location.href
    } else {
      setError('მომხმარებლის სახელი ან პაროლი არასწორია');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">SmartHome Admin</h1>
          <p className="login-subtitle">შესვლა ადმინ პანელში</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="label">მომხმარებელი</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="შეიყვანეთ მომხმარებელი"
              disabled={isLoading}
              autoComplete="username"
              className="input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="label">პაროლი</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="შეიყვანეთ პაროლი"
              disabled={isLoading}
              autoComplete="current-password"
              className="input"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'შესვლა...' : 'შესვლა'}
          </button>
        </form>

        <div className="login-footer">
          <span className="footer-text">დაცული კავშირი</span>
        </div>
      </div>
    </div>
  );
}

export default Login;