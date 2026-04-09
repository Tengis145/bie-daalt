import { useState } from 'react';
import axios from 'axios';
import { SchoolIcon } from '../components/Icons';

function getLetterGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}
const LETTER_STYLE = {
  A: { color: '#065f46', bg: '#d1fae5' },
  B: { color: '#1e40af', bg: '#dbeafe' },
  C: { color: '#92400e', bg: '#fef3c7' },
  D: { color: '#7c2d12', bg: '#ffedd5' },
  F: { color: '#7f1d1d', bg: '#fee2e2' },
};

export default function StudentPortal() {
  const [email, setEmail]     = useState('');
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleLookup = async (e) => {
    e.preventDefault();
    setError('');
    setStudent(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) { setError('Gmail хаягаа оруулна уу'); return; }
    setLoading(true);
    try {
      const res = await axios.get(`/api/students/public/lookup?email=${encodeURIComponent(trimmed)}`);
      setStudent(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setLoading(false);
    }
  };

  const gradeDist = student ? { A: 0, B: 0, C: 0, D: 0, F: 0 } : null;
  if (student) {
    student.grades.forEach(g => { gradeDist[getLetterGrade(g.score)]++; });
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1e293b 0%,#334155 50%,#1e40af 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 12, padding: 10 }}>
          <SchoolIcon size={28} color="white" />
        </div>
        <div>
          <div style={{ color: 'white', fontWeight: 800, fontSize: '1.3rem', lineHeight: 1.2 }}>ЕБС Дүн Бүртгэл</div>
          <div style={{ color: 'rgba(255,255,255,.65)', fontSize: '0.82rem' }}>Сурагчийн дүн харах портал</div>
        </div>
      </div>

      {/* Lookup card */}
      <div style={{ background: 'white', borderRadius: 18, padding: '28px 28px', width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,.3)', marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 6px', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Дүнгээ харах</h2>
        <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: '#64748b' }}>
          Бүртгэлтэй Gmail хаягаа оруулснаар дүнгээ харна уу.
          Имэйл бүртгүүлэхийн тулд багш руугаа хандана уу.
        </p>
        <form onSubmit={handleLookup}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Gmail хаяг
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="email"
              placeholder="suraguud@gmail.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              style={{
                flex: 1, border: `1.5px solid ${error ? '#dc2626' : '#e2e8f0'}`,
                borderRadius: 10, padding: '10px 14px', fontSize: '0.9rem',
                outline: 'none', color: '#0f172a',
              }}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                background: '#2563eb', color: 'white', border: 'none',
                borderRadius: 10, padding: '10px 20px', fontWeight: 700,
                fontSize: '0.88rem', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, whiteSpace: 'nowrap',
              }}
            >
              {loading ? '...' : 'Хайх'}
            </button>
          </div>
          {error && (
            <div style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: 8, padding: '8px 12px', background: '#fee2e2', borderRadius: 8 }}>
              {error}
            </div>
          )}
        </form>
      </div>

      {/* Student result */}
      {student && (
        <div style={{ background: 'white', borderRadius: 18, width: '100%', maxWidth: 680, boxShadow: '0 20px 60px rgba(0,0,0,.3)', overflow: 'hidden' }}>
          {/* Hero */}
          <div style={{ background: 'linear-gradient(135deg,#1e40af,#2563eb)', padding: '20px 24px', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{student.name}</div>
                <div style={{ opacity: 0.8, fontSize: '0.85rem', marginTop: 4 }}>
                  Анги: {student.className}
                  {student.academicYear && ` · ${student.academicYear} · ${student.semester}-р улирал`}
                </div>
              </div>
              <div style={{ textAlign: 'center', background: 'rgba(255,255,255,.15)', borderRadius: 12, padding: '10px 16px' }}>
                <div style={{ fontSize: '0.7rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Дундаж</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1 }}>{student.average}</div>
                {(() => { const lg = getLetterGrade(parseFloat(student.average)); const ls = LETTER_STYLE[lg]; return (
                  <div style={{ marginTop: 4, display: 'inline-block', padding: '2px 12px', borderRadius: 20, fontWeight: 800, background: ls.bg, color: ls.color }}>{lg}</div>
                ); })()}
              </div>
            </div>
          </div>

          {/* Grade distribution */}
          {student.grades.length > 0 && (
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Үсгэн дүнгийн тархалт</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {Object.entries(gradeDist).map(([lg, cnt]) => {
                  const ls = LETTER_STYLE[lg];
                  return (
                    <div key={lg} style={{ flex: '1 1 50px', background: ls.bg, borderRadius: 8, padding: '8px 6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: ls.color }}>{lg}</div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: ls.color }}>{cnt}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grades table */}
          <div style={{ padding: '16px 24px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Хичээл тус бүрийн дүн</div>
            {student.grades.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', textAlign: 'center', padding: '20px 0' }}>Дүн оруулаагүй байна</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                      <th style={{ textAlign: 'left', padding: '6px 8px 10px 0', color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>Хичээл</th>
                      <th style={{ textAlign: 'center', padding: '6px 4px 10px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>Ш1<em style={{fontSize:'0.65rem',color:'#94a3b8'}}>/30</em></th>
                      <th style={{ textAlign: 'center', padding: '6px 4px 10px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>Ш2<em style={{fontSize:'0.65rem',color:'#94a3b8'}}>/30</em></th>
                      <th style={{ textAlign: 'center', padding: '6px 4px 10px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>Ирц<em style={{fontSize:'0.65rem',color:'#94a3b8'}}>/20</em></th>
                      <th style={{ textAlign: 'center', padding: '6px 4px 10px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>БД<em style={{fontSize:'0.65rem',color:'#94a3b8'}}>/20</em></th>
                      <th style={{ textAlign: 'center', padding: '6px 0 10px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>Нийт</th>
                      <th style={{ textAlign: 'center', padding: '6px 0 10px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>Үсгэн</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.grades.map((g, i) => {
                      const lg = getLetterGrade(g.score);
                      const ls = LETTER_STYLE[lg];
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '8px 8px 8px 0', fontWeight: 600, color: '#374151' }}>{g.subject}</td>
                          <td style={{ textAlign: 'center', color: '#64748b', padding: '8px 4px' }}>{g.exam1 ?? 0}</td>
                          <td style={{ textAlign: 'center', color: '#64748b', padding: '8px 4px' }}>{g.exam2 ?? 0}</td>
                          <td style={{ textAlign: 'center', color: '#64748b', padding: '8px 4px' }}>{g.attendance ?? 0}</td>
                          <td style={{ textAlign: 'center', color: '#64748b', padding: '8px 4px' }}>{g.independent ?? 0}</td>
                          <td style={{ textAlign: 'center', padding: '8px 0' }}>
                            <span style={{
                              display: 'inline-block', padding: '2px 10px', borderRadius: 20,
                              fontWeight: 700, fontSize: '0.82rem',
                              color: g.score >= 90 ? '#065f46' : g.score >= 75 ? '#1e40af' : '#92400e',
                              background: g.score >= 90 ? '#d1fae5' : g.score >= 75 ? '#dbeafe' : '#fef3c7',
                            }}>{g.score}</span>
                          </td>
                          <td style={{ textAlign: 'center', padding: '8px 0' }}>
                            <span style={{ display: 'inline-block', minWidth: 28, padding: '2px 8px', borderRadius: 6, fontWeight: 800, fontSize: '0.85rem', color: ls.color, background: ls.bg }}>{lg}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid #e2e8f0' }}>
                      <td colSpan={5} style={{ textAlign: 'right', padding: '10px 8px 4px', fontWeight: 700, color: '#374151', fontSize: '0.82rem' }}>Дундаж нийт оноо:</td>
                      <td style={{ textAlign: 'center', padding: '10px 0 4px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 20, fontWeight: 800, fontSize: '0.9rem', background: '#e0e7ff', color: '#3730a3' }}>{student.average}</span>
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 0 4px' }}>
                        {(() => { const lg = getLetterGrade(parseFloat(student.average)); const ls = LETTER_STYLE[lg]; return (
                          <span style={{ display: 'inline-block', minWidth: 28, padding: '3px 10px', borderRadius: 6, fontWeight: 900, fontSize: '0.9rem', color: ls.color, background: ls.bg }}>{lg}</span>
                        ); })()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          <div style={{ padding: '12px 24px 20px', textAlign: 'center' }}>
            <button
              onClick={() => { setStudent(null); setEmail(''); }}
              style={{ background: 'none', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 20px', fontSize: '0.82rem', color: '#64748b', cursor: 'pointer', fontWeight: 600 }}
            >
              ← Буцах
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 24, color: 'rgba(255,255,255,.4)', fontSize: '0.75rem', textAlign: 'center' }}>
        © 2024 ЕБС Дүн Бүртгэлийн Систем
      </div>
    </div>
  );
}
