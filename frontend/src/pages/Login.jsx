import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { SchoolIcon } from '../components/Icons';
import PasswordInput from '../components/PasswordInput';

export default function Login({ onLogin, onStudentLogin }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('teacher'); // 'teacher' | 'student'

  // Teacher login
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Student login
  const [stuData, setStuData] = useState({ email: '', password: '' });
  const [stuErr,  setStuErr]  = useState('');
  const [stuLoad, setStuLoad] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleStuChange = (e) => {
    setStuData({ ...stuData, [e.target.name]: e.target.value });
    setStuErr('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', formData);
      onLogin(res.data.token, res.data.user, res.data.refreshToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Нэвтрэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setStuLoad(true);
    setStuErr('');
    try {
      const res = await axios.post('/api/auth/student-login', stuData);
      onStudentLogin(res.data.student);
      navigate('/my-grades');
    } catch (err) {
      setStuErr(err.response?.data?.message || 'Нэвтрэхэд алдаа гарлаа');
    } finally {
      setStuLoad(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('/api/auth/google', { credential: credentialResponse.credential });
      onLogin(res.data.token, res.data.user, res.data.refreshToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Google нэвтрэлт амжилтгүй болсон');
    }
  };

  const handleStudentGoogle = async (credentialResponse) => {
    setStuLoad(true);
    setStuErr('');
    try {
      const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      const email   = payload.email;
      const res = await axios.get(`/api/students/public/lookup?email=${encodeURIComponent(email)}`);
      onStudentLogin(res.data);
      navigate('/my-grades');
    } catch (err) {
      setStuErr(err.response?.data?.message || 'Google нэвтрэлт амжилтгүй болсон');
    } finally {
      setStuLoad(false);
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
        <div className="auth-main" style={{ overflowY: 'auto', maxHeight: '90vh' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 24, border: '1.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
            <button
              onClick={() => { setTab('teacher'); setStudent(null); setStuErr(''); }}
              style={{ flex: 1, padding: '10px', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer', background: tab === 'teacher' ? '#4f46e5' : 'white', color: tab === 'teacher' ? 'white' : '#64748b', transition: 'all .15s' }}
            >
              Багш нэвтрэх
            </button>
            <button
              onClick={() => { setTab('student'); setError(''); }}
              style={{ flex: 1, padding: '10px', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer', background: tab === 'student' ? '#4f46e5' : 'white', color: tab === 'student' ? 'white' : '#64748b', transition: 'all .15s' }}
            >
              Сурагч дүн харах
            </button>
          </div>

          {/* Teacher login — always mounted so GoogleLogin initializes only once */}
          <div style={{ display: tab === 'teacher' ? 'block' : 'none' }}>
              <h1 className="auth-main-title">Нэвтрэх</h1>
              <p className="auth-main-sub">Имэйл болон нууц үгээ оруулна уу</p>
              {error && <div className="auth-error">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Имэйл хаяг</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" required />
                </div>
                <div className="form-group">
                  <label>Нууц үг</label>
                  <PasswordInput name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
                </div>
                <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
                  {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>эсвэл</span>
                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google нэвтрэлт амжилтгүй болсон')}
                  text="signin_with"
                  shape="rectangular"
                  logo_alignment="left"
                  width="320"
                />
              </div>

              <p className="auth-footer">
                Бүртгэлгүй юу?{' '}<Link to="/register">Бүртгүүлэх</Link>
              </p>
              <p className="auth-footer" style={{ marginTop: 8 }}>
                <Link to="/change-password">Нууц үг солих</Link>
              </p>
          </div>

          {/* Student login — always mounted so GoogleLogin initializes only once */}
          <div style={{ display: tab === 'student' ? 'block' : 'none' }}>
              <h1 className="auth-main-title">Нэвтрэх</h1>
              <p className="auth-main-sub">Имэйл болон нууц үгээ оруулна уу</p>

              {stuErr && <div className="auth-error">{stuErr}</div>}

              <form onSubmit={handleStudentLogin}>
                <div className="form-group">
                  <label>Имэйл хаяг</label>
                  <input
                    type="email"
                    name="email"
                    value={stuData.email}
                    onChange={handleStuChange}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Нууц үг</label>
                  <PasswordInput
                    name="password"
                    value={stuData.password}
                    onChange={handleStuChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={stuLoad}>
                  {stuLoad ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>эсвэл</span>
                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                  onSuccess={handleStudentGoogle}
                  onError={() => setStuErr('Google нэвтрэлт амжилтгүй болсон')}
                  text="signin_with"
                  shape="rectangular"
                  logo_alignment="left"
                  width="320"
                />
              </div>

              <p className="auth-footer" style={{ marginTop: 8, color: '#64748b', fontSize: '0.82rem' }}>
                Нэвтрэх мэдээллийг багшаасаа аваарай
              </p>
              <p className="auth-footer" style={{ marginTop: 4 }}>
                <Link to="/change-password">Нууц үг солих</Link>
              </p>

          </div>
        </div>
      </div>
    </div>
  );
}
