import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldIcon } from '../components/Icons';

export default function ChangePassword({ token }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword)
      return setError('Шинэ нууц үг таарахгүй байна');
    if (formData.newPassword.length < 6)
      return setError('Шинэ нууц үг дор хаяж 6 тэмдэгт байх ёстой');

    setLoading(true);
    try {
      await axios.post(
        '/api/auth/change-password',
        { currentPassword: formData.currentPassword, newPassword: formData.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Нууц үг амжилттай солигдлоо!');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Нууц үг солиход алдаа гарлаа');
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
            <div className="auth-side-logo-icon"><ShieldIcon size={22} color="white" /></div>
            <div>
              <div className="auth-side-logo-text">Аюулгүй байдал</div>
              <div className="auth-side-logo-sub">ЕБС Дүн Бүртгэлийн Систем</div>
            </div>
          </div>
          <div className="auth-side-body">
            <h2 className="auth-side-title">Нууц үг солих</h2>
            <p className="auth-side-text">
              Нууц үгийг тогтмол солих нь таны бүртгэлийн аюулгүй байдлыг хангана. Хамгийн багадаа 6 тэмдэгт ашиглана уу.
            </p>
            <div className="auth-side-pills">
              <span className="auth-pill">🔐 bcrypt шифрлэлт</span>
              <span className="auth-pill">🛡️ JWT токен</span>
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,.4)', fontSize: '0.75rem' }}>
            © 2024 ЕБС Систем
          </div>
        </div>

        {/* Right side */}
        <div className="auth-main">
          <h1 className="auth-main-title">Нууц үг солих</h1>
          <p className="auth-main-sub">Одоогийн болон шинэ нууц үгийг оруулна уу</p>

          {error   && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Одоогийн нууц үг</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Одоогийн нууц үгийг оруулна уу"
                required
              />
            </div>
            <div className="form-group">
              <label>Шинэ нууц үг</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Дор хаяж 6 тэмдэгт"
                required
              />
            </div>
            <div className="form-group">
              <label>Шинэ нууц үг давтах</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Шинэ нууц үгийг дахин оруулна уу"
                required
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                onClick={() => navigate('/')}
              >
                ← Буцах
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
                disabled={loading}
              >
                {loading ? 'Хадгалж байна...' : 'Нууц үг солих'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
