import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_SUBJECTS = [
  'Математик', 'Монгол хэл', 'Физик', 'Хими', 'Түүх',
  'Газар зүй', 'Англи хэл', 'Биеийн тамир', 'Мэдээлэл зүй', 'Уран зохиол'
];

function calcScore(exam1, exam2) {
  return Math.round((Number(exam1) + Number(exam2)) / 2);
}

export default function AddStudent({ onAdd, classes }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    className: '',
    grades: DEFAULT_SUBJECTS.map(sub => ({ subject: sub, exam1: 0, exam2: 0, score: 0 }))
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleExamChange = (index, field, value) => {
    const newGrades = [...formData.grades];
    let val = Number(value);
    if (val > 100) val = 100;
    if (val < 0) val = 0;
    newGrades[index] = { ...newGrades[index], [field]: val };
    newGrades[index].score = calcScore(newGrades[index].exam1, newGrades[index].exam2);
    setFormData({ ...formData, grades: newGrades });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lastName || !formData.firstName || !formData.className)
      return alert('Овог, нэр болон ангийг оруулна уу!');

    setLoading(true);
    try {
      const fullName = `${formData.lastName} ${formData.firstName}`;
      await onAdd({
        name: fullName,
        className: formData.className,
        grades: formData.grades,
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const avg = (
    formData.grades.reduce((s, g) => s + g.score, 0) / formData.grades.length
  ).toFixed(1);

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>Шинэ сурагч бүртгэх</h2>
        <p>Сурагчийн мэдээлэл болон хичээлийн дүнгүүдийг оруулна уу</p>
      </div>

      <form onSubmit={handleSubmit}>

        {/* Овог / Нэр / Анги — 3 column */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Овог</label>
            <input
              required
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Жишээ: Батын"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Нэр</label>
            <input
              required
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Жишээ: Болд"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Анги</label>
            <input
              required
              name="className"
              value={formData.className}
              onChange={handleChange}
              placeholder="Жишээ: 11А"
              list="class-options"
            />
            <datalist id="class-options">
              {classes.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
        </div>

        {/* Нэр preview */}
        {(formData.lastName || formData.firstName) && (
          <div style={{
            background: '#eef2ff',
            border: '1px solid #c7d2fe',
            borderRadius: 8,
            padding: '10px 16px',
            marginBottom: 20,
            fontSize: '0.875rem',
            color: '#3730a3',
            fontWeight: 500,
          }}>
            Бүтэн нэр: <strong>{formData.lastName} {formData.firstName}</strong>
          </div>
        )}

        {/* Хичээлийн дүнгүүд */}
        <div className="form-group">
          <div className="section-label">
            Хичээлийн дүнгүүд &nbsp;·&nbsp; Дундаж: <strong>{avg}</strong>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="exam-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Хичээл</th>
                  <th>Шалгалт 1</th>
                  <th>Шалгалт 2</th>
                  <th>Дүн</th>
                </tr>
              </thead>
              <tbody>
                {formData.grades.map((g, idx) => (
                  <tr key={idx}>
                    <td className="subject-name">{g.subject}</td>
                    <td>
                      <input
                        className="exam-input"
                        type="number"
                        min="0" max="100"
                        value={g.exam1}
                        onChange={(e) => handleExamChange(idx, 'exam1', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="exam-input"
                        type="number"
                        min="0" max="100"
                        value={g.exam2}
                        onChange={(e) => handleExamChange(idx, 'exam2', e.target.value)}
                      />
                    </td>
                    <td>
                      <span className="score-pill" style={{
                        float: 'none',
                        display: 'inline-block',
                        color: g.score >= 90 ? '#065f46' : g.score >= 75 ? '#1e40af' : '#92400e',
                        backgroundColor: g.score >= 90 ? '#d1fae5' : g.score >= 75 ? '#dbeafe' : '#fef3c7',
                      }}>
                        {g.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            ← Буцах
          </button>
          <button
            type="submit"
            className="btn btn-success btn-lg"
            style={{ flex: 1 }}
            disabled={loading}
          >
            {loading ? 'Хадгалж байна...' : 'Сурагч бүртгэх'}
          </button>
        </div>
      </form>
    </div>
  );
}
