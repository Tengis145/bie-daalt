import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { SchoolIcon, EyeIcon, EyeOffIcon } from '../components/Icons';
import { getLetterGrade, LETTER_STYLE as LS } from '../utils/grades';

function PasswordInput({ name, value, onChange, placeholder, required }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{ paddingRight: 40 }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2, display: 'flex', alignItems: 'center' }}
        tabIndex={-1}
        aria-label={show ? 'Нууц үг нуух' : 'Нууц үг харуулах'}
      >
        {show ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
      </button>
    </div>
  );
}

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('teacher'); // 'teacher' | 'student'

  // Teacher login
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Student login
  const [stuData, setStuData]     = useState({ email: '', password: '' });
  const [student, setStudent]     = useState(null);
  const [stuErr,  setStuErr]      = useState('');
  const [stuLoad, setStuLoad]     = useState(false);

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
    setStudent(null);
    try {
      const res = await axios.post('/api/auth/student-login', stuData);
      setStudent(res.data.student);
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
    try {
      const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      const email   = payload.email;
      setStuData(d => ({ ...d, email }));
      setStuErr('');
      setStudent(null);
      setStuLoad(true);
      const res = await axios.get(`/api/students/public/lookup?email=${encodeURIComponent(email)}`);
      setStudent(res.data);
    } catch (err) {
      setStuErr(err.response?.data?.message || 'Google нэвтрэлт амжилтгүй болсон');
    } finally {
      setStuLoad(false);
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

          {/* Teacher login — always mounted, hidden when inactive */}
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

          {/* Student login — always mounted, hidden when inactive */}
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

              <p className="auth-footer">
                Бүртгэлгүй юу?{' '}<Link to="/register">Бүртгүүлэх</Link>
              </p>
              <p className="auth-footer" style={{ marginTop: 8 }}>
                <Link to="/change-password">Нууц үг солих</Link>
              </p>

              {/* Grade result */}
              {student && (
                <div style={{ marginTop: 24 }}>
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
          </div>
        </div>
      </div>
    </div>
  );
}
