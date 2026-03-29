import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_SUBJECTS = [
  'Математик', 'Монгол хэл', 'Физик', 'Хими', 'Түүх',
  'Газар зүй', 'Англи хэл', 'Биеийн тамир', 'Мэдээлэл зүй', 'Уран зохиол'
];

function emptyGrade(subject = '') {
  return { subject, exam1: 0, exam2: 0, attendance: 0, independent: 0, score: 0 };
}

function clamp(val, min, max) {
  const n = Number(val);
  return isNaN(n) ? min : Math.min(max, Math.max(min, n));
}

function calcScore(g) {
  return clamp(Number(g.exam1) + Number(g.exam2) + Number(g.attendance) + Number(g.independent), 0, 100);
}

export default function AddStudent({ onAdd, classes, showToast }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    lastName:  '',
    firstName: '',
    className: '',
    grades: DEFAULT_SUBJECTS.map(emptyGrade),
  });
  const [newSubject, setNewSubject] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFieldChange = (idx, field, value) => {
    const maxMap = { exam1: 30, exam2: 30, attendance: 20, independent: 20 };
    const updated = [...formData.grades];
    updated[idx] = { ...updated[idx], [field]: clamp(value, 0, maxMap[field]) };
    updated[idx].score = calcScore(updated[idx]);
    setFormData({ ...formData, grades: updated });
  };

  const addSubject = () => {
    const name = newSubject.trim();
    if (!name) return;
    if (formData.grades.some(g => g.subject.toLowerCase() === name.toLowerCase())) {
      showToast('Энэ хичээл аль хэдийн нэмэгдсэн байна', 'error');
      return;
    }
    setFormData({ ...formData, grades: [...formData.grades, emptyGrade(name)] });
    setNewSubject('');
  };

  const removeSubject = (idx) => {
    const updated = formData.grades.filter((_, i) => i !== idx);
    setFormData({ ...formData, grades: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lastName || !formData.firstName || !formData.className) {
      showToast('Овог, нэр болон ангийг оруулна уу!', 'error');
      return;
    }
    if (formData.grades.length === 0) {
      showToast('Дор хаяж нэг хичээл нэмэх хэрэгтэй', 'error');
      return;
    }
    setLoading(true);
    try {
      const fullName = `${formData.lastName} ${formData.firstName}`;
      await onAdd({ name: fullName, className: formData.className, grades: formData.grades });
      showToast(`${fullName} амжилттай бүртгэгдлээ`);
      navigate('/');
    } catch {
      showToast('Бүртгэхэд алдаа гарлаа', 'error');
    } finally {
      setLoading(false);
    }
  };

  const avg = formData.grades.length
    ? (formData.grades.reduce((s, g) => s + g.score, 0) / formData.grades.length).toFixed(1)
    : '0.0';

  return (
    <div className="form-container" style={{ maxWidth: 980 }}>
      <div className="form-header">
        <h2>Шинэ сурагч бүртгэх</h2>
        <p>Сурагчийн мэдээлэл болон хичээлийн дүнгүүдийг оруулна уу</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Овог / Нэр / Анги */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Овог</label>
            <input required name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Жишээ: Батын" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Нэр</label>
            <input required name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Жишээ: Болд" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Анги</label>
            <input required name="className" value={formData.className} onChange={handleChange} placeholder="Жишээ: 11А" list="class-options" />
            <datalist id="class-options">{classes.map(c => <option key={c} value={c} />)}</datalist>
          </div>
        </div>

        {(formData.lastName || formData.firstName) && (
          <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: '0.875rem', color: '#3730a3', fontWeight: 500 }}>
            Бүтэн нэр: <strong>{formData.lastName} {formData.firstName}</strong>
          </div>
        )}

        {/* Хичээлийн дүнгүүд */}
        <div className="form-group">
          <div className="section-label">
            Хичээлийн дүнгүүд &nbsp;·&nbsp; Дундаж нийт оноо: <strong>{avg}</strong> &nbsp;·&nbsp; {formData.grades.length} хичээл
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="exam-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Хичээл</th>
                  <th>Ш1 <span className="th-max">/30</span></th>
                  <th>Ш2 <span className="th-max">/30</span></th>
                  <th>Ирц <span className="th-max">/20</span></th>
                  <th>БД <span className="th-max">/20</span></th>
                  <th>Нийт</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {formData.grades.map((g, idx) => (
                  <tr key={idx}>
                    <td className="subject-name">{g.subject}</td>
                    {['exam1','exam2','attendance','independent'].map(field => (
                      <td key={field}>
                        <input
                          className="exam-input"
                          type="number"
                          min="0"
                          max={field === 'attendance' || field === 'independent' ? 20 : 30}
                          value={g[field]}
                          onChange={e => handleFieldChange(idx, field, e.target.value)}
                        />
                      </td>
                    ))}
                    <td>
                      <span className="score-pill" style={{
                        float: 'none', display: 'inline-block',
                        color: g.score >= 90 ? '#065f46' : g.score >= 75 ? '#1e40af' : '#92400e',
                        backgroundColor: g.score >= 90 ? '#d1fae5' : g.score >= 75 ? '#dbeafe' : '#fef3c7',
                      }}>{g.score}</span>
                    </td>
                    <td>
                      <button type="button" className="btn-remove-subject" onClick={() => removeSubject(idx)} title="Хасах">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Хичээл нэмэх */}
          <div className="add-subject-row">
            <input
              className="add-subject-input"
              type="text"
              placeholder="Шинэ хичээлийн нэр..."
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubject())}
            />
            <button type="button" className="btn btn-secondary" onClick={addSubject}>
              + Хичээл нэмэх
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>← Буцах</button>
          <button type="submit" className="btn btn-success btn-lg" style={{ flex: 1 }} disabled={loading}>
            {loading ? 'Хадгалж байна...' : 'Сурагч бүртгэх'}
          </button>
        </div>
      </form>
    </div>
  );
}
