import { useState } from 'react';
import axios from 'axios';

function getLetterGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
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
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleLookup = async (e) => {
    e.preventDefault();
    setError('');
    setStudent(null);
    if (!email.trim()) { setError('Gmail хаягаа оруулна уу'); return; }
    setLoading(true);
    try {
      const res = await axios.get(`/api/students/public/lookup?email=${encodeURIComponent(email.trim())}`);
      setStudent(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#eff6ff 0%,#f0fdf4 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 16px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.6rem' }}>📚</div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Дүн харах портал</h1>
        <p style={{ color: '#64748b', marginTop: 6, fontSize: '0.95rem' }}>Gmail хаягаараа нэвтрэн өөрийн дүнгийг харна уу</p>
      </div>

      {/* Lookup form */}
      <div style={{ width: '100%', maxWidth: 420, background: 'white', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,.08)', padding: '28px 28px 24px' }}>
        <form onSubmit={handleLookup}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: '#374151', marginBottom: 6 }}>Gmail хаяг</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="student@gmail.com"
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
          />
          {error && <div style={{ color: '#dc2626', fontSize: '0.82rem', marginBottom: 10, background: '#fee2e2', borderRadius: 6, padding: '7px 12px' }}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '11px', borderRadius: 8, background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', color: 'white', fontWeight: 700, fontSize: '0.95rem', border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Хайж байна...' : 'Дүн харах'}
          </button>
        </form>
      </div>

      {/* Result */}
      {student && (
        <div style={{ width: '100%', maxWidth: 700, marginTop: 28 }}>
          {/* Student info */}
          <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,.08)', padding: '24px 28px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>{student.name}</h2>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                  Анги: <strong>{student.className}</strong>
                  {student.academicYear && <> · {student.academicYear} · {student.semester}-р улирал</>}
                </p>
              </div>
              <div style={{ textAlign: 'center', background: '#f8fafc', borderRadius: 12, padding: '10px 20px' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginBottom: 2 }}>ДУНДАЖ</div>
                {(() => {
                  const avg = student.grades.length
                    ? (student.grades.reduce((s, g) => s + (g.score ?? 0), 0) / student.grades.length).toFixed(1)
                    : '0.0';
                  const lg = getLetterGrade(parseFloat(avg));
                  const ls = LETTER_STYLE[lg];
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e293b' }}>{avg}</span>
                      <span style={{ padding: '3px 10px', borderRadius: 8, fontWeight: 900, fontSize: '1.1rem', color: ls.color, background: ls.bg }}>{lg}</span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Grades table */}
          <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,.08)', padding: '24px 28px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>Дүнгийн дэлгэрэнгүй</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '8px 8px 10px 0', color: '#64748b', fontWeight: 600, fontSize: '0.78rem' }}>Хичээл</th>
                    <th style={{ textAlign: 'center', padding: '8px 6px 10px', color: '#64748b', fontWeight: 600, fontSize: '0.78rem' }}>Ш1<span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>/30</span></th>
                    <th style={{ textAlign: 'center', padding: '8px 6px 10px', color: '#64748b', fontWeight: 600, fontSize: '0.78rem' }}>Ш2<span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>/30</span></th>
                    <th style={{ textAlign: 'center', padding: '8px 6px 10px', color: '#64748b', fontWeight: 600, fontSize: '0.78rem' }}>Ирц<span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>/20</span></th>
                    <th style={{ textAlign: 'center', padding: '8px 6px 10px', color: '#64748b', fontWeight: 600, fontSize: '0.78rem' }}>БД<span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>/20</span></th>
                    <th style={{ textAlign: 'center', padding: '8px 6px 10px', color: '#64748b', fontWeight: 600, fontSize: '0.78rem' }}>Нийт</th>
                    <th style={{ textAlign: 'center', padding: '8px 0 10px', color: '#64748b', fontWeight: 600, fontSize: '0.78rem' }}>Үсгэн</th>
                  </tr>
                </thead>
                <tbody>
                  {student.grades.map((g, i) => {
                    const lg = getLetterGrade(g.score);
                    const ls = LETTER_STYLE[lg];
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 8px 10px 0', fontWeight: 600, color: '#1e293b' }}>{g.subject}</td>
                        <td style={{ textAlign: 'center', padding: '10px 6px', color: '#64748b' }}>{g.exam1 ?? 0}</td>
                        <td style={{ textAlign: 'center', padding: '10px 6px', color: '#64748b' }}>{g.exam2 ?? 0}</td>
                        <td style={{ textAlign: 'center', padding: '10px 6px', color: '#64748b' }}>{g.attendance ?? 0}</td>
                        <td style={{ textAlign: 'center', padding: '10px 6px', color: '#64748b' }}>{g.independent ?? 0}</td>
                        <td style={{ textAlign: 'center', padding: '10px 6px' }}>
                          <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 6, fontWeight: 700, fontSize: '0.85rem', color: ls.color, background: ls.bg }}>{g.score}</span>
                        </td>
                        <td style={{ textAlign: 'center', padding: '10px 0' }}>
                          <span style={{ display: 'inline-block', minWidth: 28, padding: '2px 8px', borderRadius: 6, fontWeight: 900, fontSize: '0.9rem', color: ls.color, background: ls.bg }}>{lg}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.78rem', marginTop: 16 }}>
            Дүн буруу байвал багшдаа хандана уу.
          </p>
        </div>
      )}

      <a href="/login" style={{ marginTop: 32, color: '#4f46e5', fontSize: '0.875rem', textDecoration: 'none' }}>← Багшийн нэвтрэх хэсэг</a>
    </div>
  );
}
