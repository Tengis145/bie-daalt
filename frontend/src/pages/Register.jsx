import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SchoolIcon } from '../components/Icons';

export default function Register({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword)
      return setError('Нууц үг таарахгүй байна');
    if (formData.password.length < 6)
      return setError('Нууц үг дор хаяж 6 тэмдэгт байх ёстой');

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      onLogin(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Бүртгэлд алдаа гарлаа');
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
            <h2 className="auth-side-title">Шинэ бүртгэл үүсгэх</h2>
            <p className="auth-side-text">
              Багш, захирал болон бусад ажилтнууд системд бүртгүүлж сурагчдын дүнг удирдах боломжтой.
            </p>
            <div className="auth-side-pills">
              <span className="auth-pill">✅ Үнэгүй</span>
              <span className="auth-pill">🔐 Шифрлэлттэй</span>
              <span className="auth-pill">📱 Responsive</span>
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,.4)', fontSize: '0.75rem' }}>
            © 2024 ЕБС Систем
          </div>
        </div>

        {/* Right side */}
        <div className="auth-main">
          <h1 className="auth-main-title">Бүртгүүлэх</h1>
          <p className="auth-main-sub">Мэдээллээ оруулж шинэ бүртгэл үүсгэнэ үү</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Хэрэглэгчийн нэр</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="bagsh_bold"
                required
              />
            </div>
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
                placeholder="Дор хаяж 6 тэмдэгт"
                required
              />
            </div>
            <div className="form-group">
              <label>Нууц үг давтах</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Нууц үгийг дахин оруулна уу"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg btn-full"
              disabled={loading}
            >
              {loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
            </button>
          </form>

          <p className="auth-footer">
            Бүртгэлтэй юу?{' '}
            <Link to="/login">Нэвтрэх</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
