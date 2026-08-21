import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CameraIcon } from '../components/Icons';
import { getImageUrl } from '../utils/imageUrl';
import { useLanguage } from '../utils/language.jsx';

const CY = new Date().getFullYear();
const YEARS = [`${CY - 1}-${CY}`, `${CY}-${CY + 1}`];

const DEFAULT_SUBJECTS = [
  'Математик', 'Монгол хэл', 'Физик', 'Хими', 'Түүх',
  'Газар зүй', 'Англи хэл', 'Биеийн тамир', 'Мэдээлэл зүй', 'Уран зохиол'
];

function emptyGrade(subject = '') {
  return { subject, exam1: 0, exam2: 0, attendance: 0, independent: 0, score: 0 };
}
function clamp(val, min, max) { const n = Number(val); return isNaN(n) ? min : Math.min(max, Math.max(min, n)); }
function calcScore(g) { return clamp(Number(g.exam1)+Number(g.exam2)+Number(g.attendance)+Number(g.independent), 0, 100); }

export default function AddStudent({ onAdd, classes, showToast }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const fileRef  = useRef();
  const [formData, setFormData] = useState({
    lastName: '', firstName: '', className: '',
    academicYear: YEARS[0],
    semester: 1,
    email: '',
    password: '',
    grades: DEFAULT_SUBJECTS.map(emptyGrade),
  });
  const [newSubject,  setNewSubject]  = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUrl,     setPhotoUrl]     = useState('');
  const [uploading,    setUploading]    = useState(false);
  const [loading,      setLoading]      = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
      showToast(t('add_subjectAlreadyAdded'), 'error'); return;
    }
    setFormData({ ...formData, grades: [...formData.grades, emptyGrade(name)] });
    setNewSubject('');
  };

  const removeSubject = (idx) => {
    setFormData({ ...formData, grades: formData.grades.filter((_, i) => i !== idx) });
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast(t('add_fileTooLarge'), 'error'); return; }
    setPhotoPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await axios.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPhotoUrl(res.data.url);
      showToast(t('add_photoReady'));
    } catch { showToast(t('add_photoUploadError'), 'error'); setPhotoPreview(null); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lastName || !formData.firstName || !formData.className) {
      showToast(t('add_requiredFields'), 'error'); return;
    }
    if (formData.grades.length === 0) { showToast(t('add_atLeastOneSubject'), 'error'); return; }
    setLoading(true);
    try {
      const fullName = `${formData.lastName} ${formData.firstName}`;
      await onAdd({
        name: fullName, className: formData.className,
        academicYear: formData.academicYear, semester: Number(formData.semester),
        photo: photoUrl, email: formData.email.trim(),
        ...(formData.password ? { password: formData.password } : {}),
        grades: formData.grades,
      });
      showToast(t('add_registeredToast', { name: fullName }));
      navigate('/');
    } catch { showToast(t('add_registerError'), 'error'); }
    finally { setLoading(false); }
  };

  const avg = formData.grades.length
    ? (formData.grades.reduce((s, g) => s + g.score, 0) / formData.grades.length).toFixed(1) : '0.0';

  return (
    <div className="form-container" style={{ maxWidth: 980 }}>
      <div className="form-header">
        <h2>{t('add_pageTitle')}</h2>
        <p>{t('add_pageSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Photo + basic info */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 20, alignItems: 'flex-start' }}>
          {/* Photo upload */}
          <div style={{ flexShrink: 0 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.875rem' }}>{t('add_photo')}</label>
            <div className="student-photo-upload" onClick={() => fileRef.current?.click()}>
              {photoPreview ? (
                <img src={photoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: '#94a3b8' }}>
                  <CameraIcon size={24} color="#94a3b8" />
                  <span style={{ fontSize: '0.72rem' }}>{t('add_addPhoto')}</span>
                </div>
              )}
              {uploading && <div className="student-photo-overlay">{t('add_uploading')}</div>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoSelect} />
          </div>

          {/* Name + class + year */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>{t('add_lastName')}</label>
                <input required name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Батын" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>{t('add_firstName')}</label>
                <input required name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Болд" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>{t('classLabel')}</label>
                <input required name="className" value={formData.className} onChange={handleChange} placeholder="11А" list="class-options" />
                <datalist id="class-options">{classes.map(c => <option key={c} value={c} />)}</datalist>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>{t('add_academicYear')}</label>
                <select name="academicYear" value={formData.academicYear} onChange={handleChange} className="form-group select">
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>{t('add_semester')}</label>
                <select name="semester" value={formData.semester} onChange={handleChange}>
                  <option value={1}>{t('dash_semester1')}</option>
                  <option value={2}>{t('dash_semester2')}</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>{t('add_gmail')} <span style={{ color: '#94a3b8', fontWeight: 400 }}>{t('add_optional')}</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="student@gmail.com" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>{t('add_loginPassword')} <span style={{ color: '#94a3b8', fontWeight: 400 }}>{t('add_optional')}</span></label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={t('add_minChars')} />
              </div>
            </div>
          </div>
        </div>

        {(formData.lastName || formData.firstName) && (
          <div style={{ background:'#eef2ff', border:'1px solid #c7d2fe', borderRadius:8, padding:'10px 16px', marginBottom:20, fontSize:'0.875rem', color:'#3730a3', fontWeight:500 }}>
            {t('add_fullName')} <strong>{formData.lastName} {formData.firstName}</strong>
            &nbsp;·&nbsp; {formData.academicYear} {t('semesterOf', { semester: formData.semester })}
          </div>
        )}

        {/* Grades table */}
        <div className="form-group">
          <div className="section-label">
            {t('add_gradesTitle')} &nbsp;·&nbsp; {t('add_avgTotalScore')} <strong>{avg}</strong> &nbsp;·&nbsp; {formData.grades.length} {t('subjectsCountUnit')}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="exam-table">
              <thead>
                <tr>
                  <th style={{ textAlign:'left' }}>{t('subjectLabel')}</th>
                  <th>{t('thExam1')}<span className="th-max">/30</span></th>
                  <th>{t('thExam2')}<span className="th-max">/30</span></th>
                  <th>{t('thAttendance')}<span className="th-max">/20</span></th>
                  <th>{t('thIndependent')}<span className="th-max">/20</span></th>
                  <th>{t('totalLabel')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {formData.grades.map((g, idx) => (
                  <tr key={idx}>
                    <td className="subject-name">{g.subject}</td>
                    {['exam1','exam2','attendance','independent'].map(field => (
                      <td key={field}>
                        <input className="exam-input" type="number" min="0"
                          max={field==='attendance'||field==='independent'?20:30}
                          value={g[field]} onChange={e=>handleFieldChange(idx,field,e.target.value)} />
                      </td>
                    ))}
                    <td>
                      <span className="score-pill" style={{ float:'none', display:'inline-block',
                        color:g.score>=90?'#065f46':g.score>=75?'#1e40af':'#92400e',
                        backgroundColor:g.score>=90?'#d1fae5':g.score>=75?'#dbeafe':'#fef3c7' }}>
                        {g.score}
                      </span>
                    </td>
                    <td><button type="button" className="btn-remove-subject" onClick={()=>removeSubject(idx)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="add-subject-row">
            <input className="add-subject-input" type="text" placeholder={t('add_newSubjectPlaceholder')}
              value={newSubject} onChange={e=>setNewSubject(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addSubject())} />
            <button type="button" className="btn btn-secondary" onClick={addSubject}>{t('add_addSubjectBtn')}</button>
          </div>
        </div>

        <div style={{ display:'flex', gap:12, marginTop:8 }}>
          <button type="button" className="btn btn-secondary" onClick={()=>navigate('/')}>{t('backArrow')}</button>
          <button type="submit" className="btn btn-success btn-lg" style={{ flex:1 }} disabled={loading||uploading}>
            {loading ? t('saving') : t('add_registerBtn')}
          </button>
        </div>
      </form>
    </div>
  );
}
