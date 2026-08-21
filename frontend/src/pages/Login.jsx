import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { SchoolIcon } from '../components/Icons';
import PasswordInput from '../components/PasswordInput';
import { useLanguage } from '../utils/language.jsx';

export default function Login({ onLogin, onStudentLogin }) {
  const { toggleLanguage, language, t } = useLanguage();
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
      setError(err.response?.data?.message || t('loginError'));
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
      setStuErr(err.response?.data?.message || t('loginError'));
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
      setError(err.response?.data?.message || t('googleError'));
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
      setStuErr(err.response?.data?.message || t('googleError'));
    } finally {
      setStuLoad(false);
    }
  };

  // Single Google handler — dispatches based on active tab to avoid double initialize()
  const handleGoogleAny  = (cr) => tab === 'teacher' ? handleGoogleSuccess(cr) : handleStudentGoogle(cr);
  const handleGoogleError = ()  => tab === 'teacher' ? setError(t('googleError')) : setStuErr(t('googleError'));

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <button type="button" onClick={toggleLanguage} className="btn-language" aria-label={t('langToggleLabel')}>
          {language === 'mn' ? 'EN' : 'MN'}
        </button>
        {/* Left side */}
        <div className="auth-side">
          <div className="auth-side-logo">
            <div className="auth-side-logo-icon"><SchoolIcon size={22} color="white" /></div>
            <div>
              <div className="auth-side-logo-text">{t('appName')}</div>
              <div className="auth-side-logo-sub">{t('appSubtitle')}</div>
            </div>
          </div>
          <div className="auth-side-body">
            <h2 className="auth-side-title">{t('welcome')}</h2>
            <p className="auth-side-text">
              {t('loginSideText')}
            </p>
            <div className="auth-side-pills">
              <span className="auth-pill">{t('pillGrades')}</span>
              <span className="auth-pill">{t('pillCharts')}</span>
              <span className="auth-pill">{t('pillByClass')}</span>
              <span className="auth-pill">{t('pillSecure')}</span>
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,.4)', fontSize: '0.75rem' }}>
            {t('sideCopyright')}
          </div>
        </div>

        {/* Right side */}
        <div className="auth-main" style={{ overflowY: 'auto', maxHeight: '90vh' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 24, border: '1.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
            <button
              onClick={() => { setTab('teacher'); setStuErr(''); }}
              style={{ flex: 1, padding: '10px', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer', background: tab === 'teacher' ? '#4f46e5' : 'white', color: tab === 'teacher' ? 'white' : '#64748b', transition: 'all .15s' }}
            >
              {t('teacherLogin')}
            </button>
            <button
              onClick={() => { setTab('student'); setError(''); }}
              style={{ flex: 1, padding: '10px', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer', background: tab === 'student' ? '#4f46e5' : 'white', color: tab === 'student' ? 'white' : '#64748b', transition: 'all .15s' }}
            >
              {t('studentGrades')}
            </button>
          </div>

          {/* Teacher login — always mounted so GoogleLogin initializes only once */}
          <div style={{ display: tab === 'teacher' ? 'block' : 'none' }}>
              <h1 className="auth-main-title">{t('login')}</h1>
              <p className="auth-main-sub">{t('loginHint')}</p>
              {error && <div className="auth-error">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>{t('email')}</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" required />
                </div>
                <div className="form-group">
                  <label>{t('passwordLabel')}</label>
                  <PasswordInput name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
                </div>
                <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
                  {loading ? t('loggingIn') : t('login')}
                </button>
              </form>

              <p className="auth-footer">
                {t('registerPrompt')}{' '}<Link to="/register">{t('register')}</Link>
              </p>
              <p className="auth-footer" style={{ marginTop: 8 }}>
                <Link to="/change-password">{t('changePassword')}</Link>
              </p>
          </div>

          {/* Student login */}
          <div style={{ display: tab === 'student' ? 'block' : 'none' }}>
              <h1 className="auth-main-title">{t('login')}</h1>
              <p className="auth-main-sub">{t('loginHint')}</p>

              {stuErr && <div className="auth-error">{stuErr}</div>}

              <form onSubmit={handleStudentLogin}>
                <div className="form-group">
                  <label>{t('email')}</label>
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
                  <label>{t('passwordLabel')}</label>
                  <PasswordInput
                    name="password"
                    value={stuData.password}
                    onChange={handleStuChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={stuLoad}>
                  {stuLoad ? t('loggingIn') : t('login')}
                </button>
              </form>

              <p className="auth-footer" style={{ marginTop: 16, color: '#64748b', fontSize: '0.82rem' }}>
                {t('studentLoginHint')}
              </p>
              <p className="auth-footer" style={{ marginTop: 4 }}>
                <Link to="/change-password">{t('changePassword')}</Link>
              </p>
          </div>

          {/* Single GoogleLogin — shared between tabs to avoid double initialize() */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{t('orGoogle')}</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleAny}
              onError={handleGoogleError}
              text="signin_with"
              shape="rectangular"
              logo_alignment="left"
              width="320"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
