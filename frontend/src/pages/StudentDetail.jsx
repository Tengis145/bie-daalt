import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function calcScore(exam1, exam2) {
  return Math.round((Number(exam1) + Number(exam2)) / 2);
}

export default function StudentDetail({ onUpdate, onDelete }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editGrades, setEditGrades] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get(`/api/students/${id}`)
      .then(res => setStudent(res.data))
      .catch(err => console.error(err));
  }, [id]);

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
      subject: g.subject,
      exam1: g.exam1 ?? g.score,
      exam2: g.exam2 ?? g.score,
      score: g.score,
    })));
    setEditing(true);
  };

  const handleExamChange = (idx, field, value) => {
    const updated = [...editGrades];
    let val = Number(value);
    if (val > 100) val = 100;
    if (val < 0) val = 0;
    updated[idx] = { ...updated[idx], [field]: val };
    updated[idx].score = calcScore(updated[idx].exam1, updated[idx].exam2);
    setEditGrades(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await onUpdate(id, { grades: editGrades });
      setStudent(updated);
      setEditing(false);
    } catch (err) {
      alert('Хадгалахад алдаа гарлаа');
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = (score) =>
    score >= 90 ? '#059669' : score >= 75 ? '#3b82f6' : '#d97706';

  const initials = student.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const grades = editing ? editGrades : student.grades;

  return (
    <div className="detail-container">
      {/* Hero card */}
      <div className="detail-hero">
        <div className="hero-left">
          <div className="hero-avatar">{initials}</div>
          <div>
            <h1 className="hero-name">{student.name}</h1>
            <span className="hero-class">Анги: {student.className}</span>
          </div>
        </div>
        <div className="hero-score">
          <div className="hero-score-label">Дундаж дүн</div>
          <div className="hero-score-value">{student.average}</div>
        </div>
      </div>

      {/* Content */}
      <div className="detail-content">
        <div className="chart-box">
          <h3>Хичээл тус бүрийн дүн</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart
              data={student.grades}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis
                dataKey="subject"
                type="category"
                width={90}
                tick={{ fontSize: 12, fill: '#374151' }}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.12)' }}
                cursor={{ fill: 'transparent' }}
              />
              <Bar dataKey="score" name="Оноо" radius={[0, 5, 5, 0]}>
                {student.grades.map((entry, i) => (
                  <Cell key={i} fill={getScoreColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grades-list">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>Хичээлүүд</h3>
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

          <table className="grades-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left', fontSize: '0.78rem', color: '#64748b', fontWeight: 600, paddingBottom: 8, borderBottom: '1px solid #e2e8f0' }}>Хичээл</th>
                <th style={{ textAlign: 'center', fontSize: '0.78rem', color: '#64748b', fontWeight: 600, paddingBottom: 8, borderBottom: '1px solid #e2e8f0' }}>Ш1</th>
                <th style={{ textAlign: 'center', fontSize: '0.78rem', color: '#64748b', fontWeight: 600, paddingBottom: 8, borderBottom: '1px solid #e2e8f0' }}>Ш2</th>
                <th style={{ textAlign: 'center', fontSize: '0.78rem', color: '#64748b', fontWeight: 600, paddingBottom: 8, borderBottom: '1px solid #e2e8f0' }}>Дүн</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g, i) => (
                <tr key={i}>
                  <td className="subject-name">{g.subject}</td>
                  {editing ? (
                    <>
                      <td style={{ textAlign: 'center', padding: '6px 4px' }}>
                        <input
                          className="exam-input"
                          type="number" min="0" max="100"
                          value={g.exam1}
                          onChange={(e) => handleExamChange(i, 'exam1', e.target.value)}
                        />
                      </td>
                      <td style={{ textAlign: 'center', padding: '6px 4px' }}>
                        <input
                          className="exam-input"
                          type="number" min="0" max="100"
                          value={g.exam2}
                          onChange={(e) => handleExamChange(i, 'exam2', e.target.value)}
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>{g.exam1 ?? '-'}</td>
                      <td style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>{g.exam2 ?? '-'}</td>
                    </>
                  )}
                  <td style={{ textAlign: 'center' }}>
                    <span
                      className="score-pill"
                      style={{
                        float: 'none',
                        display: 'inline-block',
                        color: g.score >= 90 ? '#065f46' : g.score >= 75 ? '#1e40af' : '#92400e',
                        backgroundColor: g.score >= 90 ? '#d1fae5' : g.score >= 75 ? '#dbeafe' : '#fef3c7',
                      }}
                    >
                      {g.score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="detail-actions">
        <button onClick={() => navigate('/')} className="btn btn-secondary">
          ← Буцах
        </button>
        <button onClick={handleDelete} className="btn btn-danger">
          Устгах
        </button>
      </div>
    </div>
  );
}
