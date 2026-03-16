import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function StudentDetail({ onDelete }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);

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

  const getScoreColor = (score) =>
    score >= 90 ? '#059669' : score >= 75 ? '#3b82f6' : '#d97706';

  // First letters for avatar
  const initials = student.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

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
          <h3>Хичээлүүд</h3>
          <table className="grades-table">
            <tbody>
              {student.grades.map((g, i) => (
                <tr key={i}>
                  <td className="subject-name">{g.subject}</td>
                  <td>
                    <span
                      className="score-pill"
                      style={{
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
