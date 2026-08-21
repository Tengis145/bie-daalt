import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CameraIcon, UserIcon } from '../components/Icons';
import { getImageUrl } from '../utils/imageUrl';
import { useLanguage } from '../utils/language.jsx';

export default function Profile({ currentUser, onUpdateUser, showToast }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const imgUrl = preview || getImageUrl(currentUser?.profileImage);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast(t('profile_fileTooLarge'), 'error');
      return;
    }
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) { showToast(t('profile_choosePhoto'), 'error'); return; }

    setUploading(true);
    try {
      // 1. Upload file
      const fd = new FormData();
      fd.append('image', file);
      const uploadRes = await axios.post('/api/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // 2. Save URL to user profile
      const profileRes = await axios.patch('/api/auth/profile', { profileImage: uploadRes.data.url });
      onUpdateUser(profileRes.data.user);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      showToast(t('profile_updated'));
    } catch (err) {
      showToast(err.response?.data?.message || t('profile_uploadError'), 'error');
    } finally {
      setUploading(false);
    }
  };

  const roleLabel = currentUser?.role === 'admin' ? t('roleAdmin') : t('roleTeacher');
  const roleBg    = currentUser?.role === 'admin' ? '#fef3c7' : '#dbeafe';
  const roleColor = currentUser?.role === 'admin' ? '#92400e' : '#1e40af';

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <div className="page-header">
        <h1>{t('profile_title')}</h1>
        <p>{t('profile_subtitle')}</p>
      </div>

      <div className="profile-card">
        {/* Avatar section */}
        <div className="profile-avatar-wrap">
          <div className="profile-avatar-ring">
            {imgUrl ? (
              <img src={imgUrl} alt="profile" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-placeholder">
                <UserIcon size={44} color="#94a3b8" />
              </div>
            )}
            <button className="profile-camera-btn" onClick={() => fileRef.current?.click()}>
              <CameraIcon size={14} color="white" />
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
        </div>

        {/* User info */}
        <div className="profile-info">
          <h2 className="profile-name">{currentUser?.username}</h2>
          <p className="profile-email">{currentUser?.email}</p>
          <span className="profile-role" style={{ background: roleBg, color: roleColor }}>
            {roleLabel}
          </span>
        </div>

        {/* Upload section */}
        {preview && (
          <div className="profile-upload-actions">
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 12px' }}>
              {t('profile_newPhotoSelected')}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-secondary"
                onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
              >
                {t('cancel')}
              </button>
              <button className="btn btn-success" style={{ flex: 1 }} onClick={handleUpload} disabled={uploading}>
                {uploading ? t('saving') : t('profile_savePhoto')}
              </button>
            </div>
          </div>
        )}

        {!preview && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button className="btn btn-secondary" onClick={() => fileRef.current?.click()}>
              <CameraIcon size={16} color="currentColor" />
              {t('profile_changePhoto')}
            </button>
          </div>
        )}

        <div className="profile-divider" />

        {/* Role info */}
        <div className="profile-perm-box">
          <h4>{t('profile_permTitle')}</h4>
          {currentUser?.role === 'admin' ? (
            <ul className="profile-perm-list">
              <li>✓ {t('profile_adminPerm1')}</li>
              <li>✓ {t('profile_adminPerm2')}</li>
              <li>✓ {t('profile_adminPerm3')}</li>
              <li>✓ {t('profile_adminPerm4')}</li>
            </ul>
          ) : (
            <ul className="profile-perm-list">
              <li>✓ {t('profile_teacherPerm1')}</li>
              <li>✓ {t('profile_teacherPerm2')}</li>
              <li>✗ {t('profile_teacherPerm3')}</li>
            </ul>
          )}
        </div>

        <div className="profile-divider" />
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/')}>
            {t('backArrow')}
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/change-password')}>
            {t('changePassword')}
          </button>
        </div>
      </div>
    </div>
  );
}
