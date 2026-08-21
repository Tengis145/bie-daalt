import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { SchoolIcon } from '../components/Icons';
import { useLanguage } from '../utils/language.jsx';

export default function Register({ onLogin }) {
  const { t } = useLanguage();
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

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('/api/auth/google', { credential: credentialResponse.credential });
      onLogin(res.data.token, res.data.user, res.data.refreshToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || t('reg_googleRegisterFail'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword)
      return setError(t('reg_passwordMismatch'));
    if (formData.password.length < 6)
      return setError(t('reg_tooShortError'));

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      onLogin(res.data.token, res.data.user, res.data.refreshToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || t('reg_registerError'));
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
              <div className="auth-side-logo-text">{t('appName')}</div>
              <div className="auth-side-logo-sub">{t('appSubtitle')}</div>
            </div>
          </div>
          <div className="auth-side-body">
            <h2 className="auth-side-title">{t('reg_sideTitle')}</h2>
            <p className="auth-side-text">
              {t('reg_sideText')}
            </p>
            <div className="auth-side-pills">
              <span className="auth-pill">{t('reg_pillFree')}</span>
              <span className="auth-pill">{t('reg_pillEncrypted')}</span>
              <span className="auth-pill">{t('reg_pillResponsive')}</span>
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,.4)', fontSize: '0.75rem' }}>
            {t('sideCopyright')}
          </div>
        </div>

        {/* Right side */}
        <div className="auth-main">
          <h1 className="auth-main-title">{t('register')}</h1>
          <p className="auth-main-sub">{t('reg_subtitle')}</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t('mt_username')}</label>
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
              <label>{t('email')}</label>
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
              <label>{t('passwordLabel')}</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('add_minChars')}
                required
              />
            </div>
            <div className="form-group">
              <label>{t('reg_confirmPassword')}</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t('reg_confirmPasswordPlaceholder')}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg btn-full"
              disabled={loading}
            >
              {loading ? t('reg_registering') : t('register')}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{t('reg_orPlain')}</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError(t('reg_googleRegisterFail'))}
              text="signup_with"
              shape="rectangular"
              logo_alignment="left"
              width="320"
            />
          </div>

          <p className="auth-footer">
            {t('reg_haveAccount')}{' '}
            <Link to="/login">{t('login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
