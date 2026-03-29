import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function clamp(val, min, max) {
  const n = Number(val);
  return isNaN(n) ? min : Math.min(max, Math.max(min, n));
}
function calcScore(g) {
  return clamp(Number(g.exam1) + Number(g.exam2) + Number(g.attendance) + Number(g.independent), 0, 100);
}

export default function StudentDetail({ onUpdate, onDelete, showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [fetchError, setFetchError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editGrades, setEditGrades] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFetchError('');
    axios.get(`/api/students/${id}`)
      .then(res => setStudent(res.data))
      .catch(err => {
        console.error(err);
        setFetchError(err.response?.data?.message || 'Сурагчийн мэдээлэл авахад алдаа гарлаа');
      });
  }, [id]);

  if (fetchError) {
    return (
      <div className="loading-wrap">
        <p style={{ color: '#dc2626', fontWeight: 600 }}>{fetchError}</p>
        <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => navigate('/')}>
          ← Буцах
        </button>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="loading-wrap">
        <div className="spinner" />
        Сурагчийн мэдээлэл уншиж байна...
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm('Та энэ сурагчийн мэдээллийг устгахдаа итгэлтэй байна уу?')) {
      onDelete(id);
      navigate('/');
    }
  };

  const handleEditStart = () => {
    setEditGrades(student.grades.map(g => ({
      subject:     g.subject,
      exam1:       g.exam1       ?? 0,
      exam2:       g.exam2       ?? 0,
      attendance:  g.attendance  ?? 0,
      independent: g.independent ?? 0,
      score:       g.score       ?? 0,
    })));
    setEditing(true);
  };

  const handleFieldChange = (idx, field, value) => {
    const maxMap = { exam1: 30, exam2: 30, attendance: 20, independent: 20 };
    const updated = [...editGrades];
    updated[idx] = { ...updated[idx], [field]: clamp(value, 0, maxMap[field]) };
    updated[idx].score = calcScore(updated[idx]);
    setEditGrades(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await onUpdate(id, { grades: editGrades });
      setStudent(updated);
      setEditing(false);
      showToast('Дүн амжилттай хадгалагдлаа');
    } catch {
      showToast('Хадгалахад алдаа гарлаа', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = (score) =>
    score >= 90 ? '#059669' : score >= 75 ? '#3b82f6' : '#d97706';

  const initials = student.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const grades = editing ? editGrades : student.grades;

  // Totals for summary cards
  const totals = student.grades.length > 0 ? {
    exam1:       (student.grades.reduce((s, g) => s + (g.exam1 ?? 0), 0) / student.grades.length).toFixed(1),
    exam2:       (student.grades.reduce((s, g) => s + (g.exam2 ?? 0), 0) / student.grades.length).toFixed(1),
    attendance:  (student.grades.reduce((s, g) => s + (g.attendance ?? 0), 0) / student.grades.length).toFixed(1),
    independent: (student.grades.reduce((s, g) => s + (g.independent ?? 0), 0) / student.grades.length).toFixed(1),
  } : null;

  return (
    <div className="detail-container">
      {/* Hero */}
      <div className="detail-hero">
        <div className="hero-left">
          <div className="hero-avatar">{initials}</div>
          <div>
            <h1 className="hero-name">{student.name}</h1>
            <span className="hero-class">Анги: {student.className}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div className="hero-score">
            <div className="hero-score-label">Дундаж нийт</div>
            <div className="hero-score-value">{student.average}</div>
          </div>
          {totals && (
            <div className="hero-breakdown">
              <div className="hero-breakdown-row">
                <span>Шалгалт 1</span><strong>{totals.exam1}<em>/30</em></strong>
              </div>
              <div className="hero-breakdown-row">
                <span>Шалгалт 2</span><strong>{totals.exam2}<em>/30</em></strong>
              </div>
              <div className="hero-breakdown-row">
                <span>Ирц</span><strong>{totals.attendance}<em>/20</em></strong>
              </div>
              <div className="hero-breakdown-row">
                <span>Бие даалт</span><strong>{totals.independent}<em>/20</em></strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="detail-content">
        <div className="chart-box">
          <h3>Хичээл тус бүрийн нийт дүн</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart
              data={student.grades}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis dataKey="subject" type="category" width={75} tick={{ fontSize: 11, fill: '#374151' }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.12)' }}
                cursor={{ fill: 'transparent' }}
                formatter={(val) => [val, 'Нийт дүн']}
              />
              <Bar dataKey="score" name="Нийт дүн" radius={[0, 5, 5, 0]}>
                {student.grades.map((entry, i) => (
                  <Cell key={i} fill={getScoreColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grades-list">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Дүнгийн дэлгэрэнгүй</h3>
            {!editing ? (
              <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.82rem' }} onClick={handleEditStart}>
                Засах
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.82rem' }} onClick={() => setEditing(false)}>
                  Болих
                </button>
                <button className="btn btn-success" style={{ padding: '6px 14px', fontSize: '0.82rem' }} onClick={handleSave} disabled={saving}>
                  {saving ? 'Хадгалж...' : 'Хадгалах'}
                </button>
              </div>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="grades-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, padding: '6px 0 8px', borderBottom: '1px solid #e2e8f0' }}>Хичээл</th>
                  <th style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, padding: '6px 4px 8px', borderBottom: '1px solid #e2e8f0' }}>Ш1<em style={{fontSize:'0.65rem',color:'#94a3b8'}}>/30</em></th>
                  <th style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, padding: '6px 4px 8px', borderBottom: '1px solid #e2e8f0' }}>Ш2<em style={{fontSize:'0.65rem',color:'#94a3b8'}}>/30</em></th>
                  <th style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, padding: '6px 4px 8px', borderBottom: '1px solid #e2e8f0' }}>Ирц<em style={{fontSize:'0.65rem',color:'#94a3b8'}}>/20</em></th>
                  <th style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, padding: '6px 4px 8px', borderBottom: '1px solid #e2e8f0' }}>БД<em style={{fontSize:'0.65rem',color:'#94a3b8'}}>/20</em></th>
                  <th style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, padding: '6px 0 8px', borderBottom: '1px solid #e2e8f0' }}>Нийт</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g, i) => (
                  <tr key={i}>
                    <td className="subject-name" style={{ fontSize: '0.82rem' }}>{g.subject}</td>
                    {editing ? (
                      ['exam1','exam2','attendance','independent'].map(field => (
                        <td key={field} style={{ padding: '5px 4px', textAlign: 'center' }}>
                          <input
                            className="exam-input"
                            type="number" min="0"
                            max={field === 'attendance' || field === 'independent' ? 20 : 30}
                            value={g[field]}
                            onChange={e => handleFieldChange(i, field, e.target.value)}
                          />
                        </td>
                      ))
                    ) : (
                      ['exam1','exam2','attendance','independent'].map(field => (
                        <td key={field} style={{ textAlign: 'center', fontSize: '0.82rem', color: '#64748b', padding: '8px 4px' }}>
                          {(g[field] == null || g[field] === 0) ? <span style={{ color: '#cbd5e1' }}>—</span> : g[field]}
                        </td>
                      ))
                    )}
                    <td style={{ textAlign: 'center', padding: '8px 0' }}>
                      <span className="score-pill" style={{
                        float: 'none', display: 'inline-block',
                        color: g.score >= 90 ? '#065f46' : g.score >= 75 ? '#1e40af' : '#92400e',
                        backgroundColor: g.score >= 90 ? '#d1fae5' : g.score >= 75 ? '#dbeafe' : '#fef3c7',
                      }}>{g.score}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="detail-actions">
        <button onClick={() => navigate('/')} className="btn btn-secondary">← Буцах</button>
        <button onClick={handleDelete} className="btn btn-danger">Устгах</button>
      </div>
    </div>
  );
}
