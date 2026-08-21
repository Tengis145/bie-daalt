import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldIcon } from '../components/Icons';
import PasswordInput from '../components/PasswordInput';
import { useLanguage } from '../utils/language.jsx';

export default function ChangePassword({ token, currentUser, showToast }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: currentUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword)
      return setError(t('cp_mismatchError'));
    if (formData.newPassword.length < 6)
      return setError(t('cp_tooShortError'));

    setLoading(true);
    try {
      await axios.post('/api/auth/change-password', {
        email: formData.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setSuccess(t('cp_successMsg'));
      showToast?.(t('cp_successMsg'));
      setFormData({ email: currentUser?.email || '', currentPassword: '', newPassword: '', confirmPassword: '' });
      timerRef.current = setTimeout(() => navigate(token ? '/' : '/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || t('cp_changeError'));
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
              <div className="auth-side-logo-text">{t('cp_sideTitle')}</div>
              <div className="auth-side-logo-sub">{t('appFullName')}</div>
            </div>
          </div>
          <div className="auth-side-body">
            <h2 className="auth-side-title">{t('changePassword')}</h2>
            <p className="auth-side-text">
              {t('cp_sideText')}
            </p>
            <div className="auth-side-pills">
              <span className="auth-pill">{t('cp_pillEncryption')}</span>
              <span className="auth-pill">{t('cp_pillJwt')}</span>
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,.4)', fontSize: '0.75rem' }}>
            {t('sideCopyright')}
          </div>
        </div>

        {/* Right side */}
        <div className="auth-main">
          <h1 className="auth-main-title">{t('changePassword')}</h1>
          <p className="auth-main-sub">{t('cp_subtitle')}</p>

          {error   && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <form onSubmit={handleSubmit}>
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
              <label>{t('cp_currentPassword')}</label>
              <PasswordInput
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder={t('cp_currentPasswordPlaceholder')}
                required
              />
            </div>
            <div className="form-group">
              <label>{t('cp_newPassword')}</label>
              <PasswordInput
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder={t('add_minChars')}
                required
              />
            </div>
            <div className="form-group">
              <label>{t('cp_confirmNewPassword')}</label>
              <PasswordInput
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t('cp_confirmNewPasswordPlaceholder')}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                onClick={() => navigate(token ? '/' : '/login')}
              >
                {t('backArrow')}
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
                disabled={loading}
              >
                {loading ? t('saving') : t('changePassword')}
              </button>
            </div>
          </form>

          <p className="auth-footer" style={{ marginTop: 20 }}>
            <Link to="/login">{t('cp_backToLogin')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
