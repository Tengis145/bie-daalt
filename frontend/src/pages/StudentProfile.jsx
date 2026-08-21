import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLetterGrade, LETTER_STYLE } from '../utils/grades';
import { getImageUrl } from '../utils/imageUrl';
import { SchoolIcon, LogoutIcon, UserIcon, ChartIcon, TrophyIcon, BookIcon } from '../components/Icons';
import { useLanguage } from '../utils/language.jsx';

export default function StudentProfile({ student, onLogout, standalone = true }) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const { average, avgLetter, gradeDist, subjectCount } = useMemo(() => {
    const grades = student?.grades ?? [];
    const n = grades.length;
    const dist = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    let total = 0;
    for (const g of grades) {
      dist[getLetterGrade(g.score)]++;
      total += g.score ?? 0;
    }
    const avg = n > 0 ? (total / n).toFixed(1) : '0.0';
    return {
      average:      avg,
      avgLetter:    getLetterGrade(parseFloat(avg)),
      gradeDist:    dist,
      subjectCount: n,
    };
  }, [student?.grades]);

  if (!student) {
    return (
      <div className="loading-wrap">
        <p style={{ color: '#dc2626' }}>{t('sg_noData')}</p>
        <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => navigate('/login')}>
          {t('sg_backToLogin')}
        </button>
      </div>
    );
  }

  const initials = student.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const photoSrc = getImageUrl(student.photo);
  const avgStyle = LETTER_STYLE[avgLetter];

  const gradeColor = avg => parseFloat(avg) >= 90 ? '#059669' : parseFloat(avg) >= 75 ? '#3b82f6' : parseFloat(avg) >= 60 ? '#d97706' : '#dc2626';

  return (
    <div style={standalone ? { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f1f5f9' } : {}}>

      {standalone && (
        <header className="header">
          <div className="header-inner">
            <div className="logo">
              <div className="logo-icon-wrap"><SchoolIcon size={20} color="white" /></div>
              <div>
                <div className="logo-title">{t('appName')}</div>
                <div className="logo-sub">{t('appSubtitle')}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="user-badge" style={{ background: 'rgba(255,255,255,.15)' }}>
                {photoSrc
                  ? <img src={photoSrc} alt="" className="user-avatar-img" />
                  : <div className="user-avatar">{initials}</div>
                }
                <span className="user-name">{student.name}</span>
              </div>
              <button className="btn-logout" onClick={onLogout}>
                <LogoutIcon size={14} color="currentColor" />{t('logout')}
              </button>
            </div>
          </div>
        </header>
      )}

      <main className="main" style={standalone ? { flex: 1 } : {}}>
        <div className="page-header">
          <h1>{t('profile_title')}</h1>
          <p>{t('sp_subtitle')}</p>
        </div>

        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div className="profile-card">

            {/* Avatar */}
            <div className="profile-avatar-wrap">
              <div className="profile-avatar-ring">
                {photoSrc ? (
                  <img src={photoSrc} alt={student.name} className="profile-avatar-img" />
                ) : (
                  <div className="profile-avatar-placeholder">
                    <UserIcon size={44} color="#94a3b8" />
                  </div>
                )}
              </div>
            </div>

            {/* Student info */}
            <div className="profile-info">
              <h2 className="profile-name">{student.name}</h2>
              {student.email && <p className="profile-email">{student.email}</p>}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
                <span className="profile-role" style={{ background: '#e0e7ff', color: '#3730a3' }}>
                  {student.className}
                </span>
                {student.academicYear && (
                  <span className="profile-role" style={{ background: '#f0fdf4', color: '#166534' }}>
                    {student.academicYear}
                  </span>
                )}
                {student.semester && (
                  <span className="profile-role" style={{ background: '#fef3c7', color: '#92400e' }}>
                    {t('semesterOf', { semester: student.semester })}
                  </span>
                )}
              </div>
            </div>

            <div className="profile-divider" />

            {/* Stats */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 0 }}>
              <div className="stat-card" style={{ padding: '14px 12px', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6 }}>
                <div className="stat-icon indigo" style={{ width: 36, height: 36 }}>
                  <ChartIcon size={18} color="#4f46e5" />
                </div>
                <div>
                  <div className="stat-value" style={{ fontSize: '1.4rem', color: gradeColor(average) }}>{average}</div>
                  <div className="stat-label">{t('sp_avgShort', { letter: avgLetter })}</div>
                </div>
              </div>
              <div className="stat-card" style={{ padding: '14px 12px', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6 }}>
                <div className="stat-icon blue" style={{ width: 36, height: 36 }}>
                  <BookIcon size={18} color="#2563eb" />
                </div>
                <div>
                  <div className="stat-value" style={{ fontSize: '1.4rem' }}>{subjectCount}</div>
                  <div className="stat-label">{t('sp_subjectsCountLabel')}</div>
                </div>
              </div>
              <div className="stat-card" style={{ padding: '14px 12px', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6 }}>
                <div className="stat-icon green" style={{ width: 36, height: 36 }}>
                  <TrophyIcon size={18} color="#059669" />
                </div>
                <div>
                  <div className="stat-value" style={{ fontSize: '1.4rem', color: avgStyle.color }}>{avgLetter}</div>
                  <div className="stat-label">{t('sp_letterGradeLabel')}</div>
                </div>
              </div>
            </div>

            <div className="profile-divider" />

            {/* Grade distribution */}
            <div className="profile-perm-box">
              <h4>{t('sp_distTitle')}</h4>
              <div style={{ display: 'flex', gap: 8 }}>
                {['A','B','C','D','F'].map(g => {
                  const ls = LETTER_STYLE[g];
                  const count = gradeDist[g] || 0;
                  return (
                    <div key={g} style={{ flex: 1, textAlign: 'center', padding: '10px 4px', borderRadius: 10, background: ls.bg, border: `1.5px solid ${ls.color}33` }}>
                      <div style={{ fontWeight: 900, fontSize: '1rem', color: ls.color }}>{g}</div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="profile-divider" />

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/my-grades')}>
                {t('sp_backToGrades')}
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/change-password')}>
                {t('changePassword')}
              </button>
            </div>
          </div>
        </div>
      </main>

      {standalone && (
        <footer className="footer">
          © 2024 {t('appFullName')} · {t('footer')}
        </footer>
      )}
    </div>
  );
}
