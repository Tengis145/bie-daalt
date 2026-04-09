import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { SchoolIcon } from '../components/Icons';

function getLetterGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}
const LS = {
  A: { color: '#065f46', bg: '#d1fae5' },
  B: { color: '#1e40af', bg: '#dbeafe' },
  C: { color: '#92400e', bg: '#fef3c7' },
  D: { color: '#7c2d12', bg: '#ffedd5' },
  F: { color: '#7f1d1d', bg: '#fee2e2' },
};

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('teacher'); // 'teacher' | 'student'

  // Teacher login
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Student lookup
  const [gmail, setGmail]       = useState('');
  const [student, setStudent]   = useState(null);
  const [lookupErr, setLookupErr] = useState('');
  const [looking, setLooking]   = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
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

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('/api/auth/google', { credential: credentialResponse.credential });
      onLogin(res.data.token, res.data.user, res.data.refreshToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Google нэвтрэлт амжилтгүй болсон');
    }
  };

  const lookupByEmail = async (email) => {
    setLookupErr('');
    setStudent(null);
    setLooking(true);
    try {
      const res = await axios.get(`/api/students/public/lookup?email=${encodeURIComponent(email.trim())}`);
      setStudent(res.data);
    } catch (err) {
      setLookupErr(err.response?.data?.message || 'Алдаа гарлаа');
    } finally {
      setLooking(false);
    }
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!gmail.trim()) { setLookupErr('Gmail хаягаа оруулна уу'); return; }
    await lookupByEmail(gmail.trim());
  };

  const handleStudentGoogle = (credentialResponse) => {
    try {
      const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      const email = payload.email;
      setGmail(email);
      lookupByEmail(email);
    } catch {
      setLookupErr('Google нэвтрэлт амжилтгүй болсон');
    }
  };

  const avg = student?.grades?.length
    ? (student.grades.reduce((s, g) => s + (g.score ?? 0), 0) / student.grades.length).toFixed(1)
    : null;

  return (
    <div className="auth-page">
      <div className="auth-wrapper" style={{ maxWidth: student ? 900 : undefined }}>
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
              onClick={() => { setTab('teacher'); setStudent(null); setLookupErr(''); }}
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

          {/* Teacher login */}
          {tab === 'teacher' && (
            <>
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
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
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
            </>
          )}

          {/* Student Gmail lookup */}
          {tab === 'student' && (
            <>
              <h1 className="auth-main-title">Дүн харах</h1>
              <p className="auth-main-sub">Gmail-ээр нэвтэрч өөрийн дүнгийг харна уу</p>

              {/* Google button */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <GoogleLogin
                  onSuccess={handleStudentGoogle}
                  onError={() => setLookupErr('Google нэвтрэлт амжилтгүй болсон')}
                  text="signin_with"
                  shape="rectangular"
                  logo_alignment="left"
                  width="320"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>эсвэл Gmail бичих</span>
                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              </div>

              <form onSubmit={handleLookup}>
                <div className="form-group">
                  <label>Gmail хаяг</label>
                  <input
                    type="email"
                    value={gmail}
                    onChange={e => { setGmail(e.target.value); setLookupErr(''); setStudent(null); }}
                    placeholder="student@gmail.com"
                    required
                  />
                </div>
                {lookupErr && <div className="auth-error">{lookupErr}</div>}
                <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={looking}>
                  {looking ? 'Хайж байна...' : 'Дүн харах'}
                </button>
              </form>

              {/* Result */}
              {student && (
                <div style={{ marginTop: 24 }}>
                  {/* Student header */}
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b' }}>{student.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
                        Анги: <strong>{student.className}</strong>
                        {student.academicYear && <> · {student.academicYear} · {student.semester}-р улирал</>}
                      </div>
                    </div>
                    {avg && (() => {
                      const lg = getLetterGrade(parseFloat(avg));
                      const ls = LS[lg];
                      return (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>ДУНДАЖ</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b' }}>{avg}</span>
                            <span style={{ padding: '2px 8px', borderRadius: 6, fontWeight: 900, fontSize: '1rem', color: ls.color, background: ls.bg }}>{lg}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Grades table */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                          <th style={{ textAlign: 'left', padding: '6px 6px 8px 0', color: '#64748b', fontWeight: 600 }}>Хичээл</th>
                          <th style={{ textAlign: 'center', padding: '6px 4px 8px', color: '#64748b', fontWeight: 600 }}>Ш1</th>
                          <th style={{ textAlign: 'center', padding: '6px 4px 8px', color: '#64748b', fontWeight: 600 }}>Ш2</th>
                          <th style={{ textAlign: 'center', padding: '6px 4px 8px', color: '#64748b', fontWeight: 600 }}>Ирц</th>
                          <th style={{ textAlign: 'center', padding: '6px 4px 8px', color: '#64748b', fontWeight: 600 }}>БД</th>
                          <th style={{ textAlign: 'center', padding: '6px 4px 8px', color: '#64748b', fontWeight: 600 }}>Нийт</th>
                          <th style={{ textAlign: 'center', padding: '6px 0 8px', color: '#64748b', fontWeight: 600 }}>Үсгэн</th>
                        </tr>
                      </thead>
                      <tbody>
                        {student.grades.map((g, i) => {
                          const lg = getLetterGrade(g.score);
                          const ls = LS[lg];
                          return (
                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '8px 6px 8px 0', fontWeight: 600, color: '#1e293b' }}>{g.subject}</td>
                              <td style={{ textAlign: 'center', padding: '8px 4px', color: '#64748b' }}>{g.exam1 ?? 0}</td>
                              <td style={{ textAlign: 'center', padding: '8px 4px', color: '#64748b' }}>{g.exam2 ?? 0}</td>
                              <td style={{ textAlign: 'center', padding: '8px 4px', color: '#64748b' }}>{g.attendance ?? 0}</td>
                              <td style={{ textAlign: 'center', padding: '8px 4px', color: '#64748b' }}>{g.independent ?? 0}</td>
                              <td style={{ textAlign: 'center', padding: '8px 4px' }}>
                                <span style={{ display: 'inline-block', padding: '1px 8px', borderRadius: 5, fontWeight: 700, color: ls.color, background: ls.bg }}>{g.score}</span>
                              </td>
                              <td style={{ textAlign: 'center', padding: '8px 0' }}>
                                <span style={{ display: 'inline-block', minWidth: 26, padding: '1px 7px', borderRadius: 5, fontWeight: 900, color: ls.color, background: ls.bg }}>{lg}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.72rem', marginTop: 12 }}>
                    Дүн буруу байвал багшдаа хандана уу.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
