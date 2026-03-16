import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SchoolIcon } from '../components/Icons';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', formData);
      onLogin(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Нэвтрэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        {/* Left side */}
        <div className="auth-side">
          <div className="auth-side-logo">
            <div className="auth-side-logo-icon"><SchoolIcon size={22} color="white" /></div>
            <div>
              <div className="auth-side-logo-text">ЕБС Дүн Бүртгэл</div>
              <div className="auth-side-logo-sub">Ерөнхий боловсролын сургууль</div>
            </div>
          </div>
          <div className="auth-side-body">
            <h2 className="auth-side-title">Тавтай морил!</h2>
            <p className="auth-side-text">
              Сурагчдын дүн бүртгэлийн систем. Ангиар ангилах, дүн харах, графикаар дүн харуулах боломжтой.
            </p>
            <div className="auth-side-pills">
              <span className="auth-pill">📊 Дүн бүртгэл</span>
              <span className="auth-pill">📈 График</span>
              <span className="auth-pill">🏫 Ангиар харах</span>
              <span className="auth-pill">🔒 Аюулгүй</span>
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,.4)', fontSize: '0.75rem' }}>
            © 2024 ЕБС Систем
          </div>
        </div>

        {/* Right side */}
        <div className="auth-main">
          <h1 className="auth-main-title">Нэвтрэх</h1>
          <p className="auth-main-sub">Имэйл болон нууц үгээ оруулна уу</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Имэйл хаяг</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Нууц үг</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg btn-full"
              disabled={loading}
            >
              {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
            </button>
          </form>

          <p className="auth-footer">
            Бүртгэлгүй юу?{' '}
            <Link to="/register">Бүртгүүлэх</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
