// БИЕ ДААЛТ — Subject Dashboard (full analytics screen)
const { useState, useMemo } = React;

function SubjectDashboard({ onSelectStudent }) {
  const [selected, setSelected] = useState(null);

  const subjectNames = ['Математик','Монгол хэл','Физик','Хими','Англи хэл','Биологи','Газарзүй','Түүх'];

  const subjectStats = useMemo(() => subjectNames.map(name => {
    const rows = STUDENTS.map(s => {
      const g = s.grades.find(g => g.s === name);
      return g ? { student: s, score: calcScore(g), grade: g } : null;
    }).filter(Boolean);

    const scores  = rows.map(r => r.score);
    const avg     = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length*10)/10 : 0;
    const max     = scores.length ? Math.max(...scores) : 0;
    const min     = scores.length ? Math.min(...scores) : 0;
    const excellent = scores.filter(s => s >= 90).length;
    const good      = scores.filter(s => s >= 75 && s < 90).length;
    const below     = scores.filter(s => s < 75).length;
    const sorted    = [...rows].sort((a,b) => b.score - a.score);
    return { name, avg, max, min, excellent, good, below, total: scores.length, sorted, rows };
  }), []);



  const sel = selected != null ? subjectStats[selected] : null;

  return (
    <div style={{ maxWidth:1280, margin:'28px auto', padding:'0 24px' }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ margin:'0 0 4px', fontSize:'1.6rem', fontWeight:800, letterSpacing:'-0.03em', color:C.text }}>Хичээлийн дүн</h1>
        <p style={{ margin:0, color:C.textMuted, fontSize:'0.9rem' }}>Хичээл тус бүрийн аналитик · {STUDENTS.length} сурагч</p>
      </div>

      {/* Subject cards grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:18, marginBottom:24 }}>
        {subjectStats.map((s, i) => {
          const g = getLetterGrade(s.avg);
          const gs = LETTER_STYLE[g];
          const isActive = selected === i;
          return (
            <div key={s.name}
              onClick={() => setSelected(isActive ? null : i)}
              style={{ background:C.surface, borderRadius:12, padding:20, boxShadow: isActive ? `0 0 0 2px ${C.primary}, 0 4px 12px rgba(79,70,229,.15)` : '0 1px 3px rgba(0,0,0,.08)', cursor:'pointer', transition:'all .2s', border: isActive ? `2px solid ${C.primary}` : '2px solid transparent' }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,.1)'; e.currentTarget.style.transform='translateY(-2px)'; }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,.08)'; e.currentTarget.style.transform='none'; }}}>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <h3 style={{ margin:0, fontSize:'1rem', fontWeight:800, color:C.text }}>{s.name}</h3>
                <span style={{ fontSize:'1.4rem', fontWeight:900, padding:'4px 12px', borderRadius:50, background:gs.bg, color:gs.color, letterSpacing:'-0.04em' }}>{s.avg}</span>
              </div>

              {/* Distribution bar */}
              <div style={{ height:8, borderRadius:4, overflow:'hidden', background:C.bg, marginBottom:6, display:'flex' }}>
                <div style={{ height:'100%', width:`${(s.excellent/s.total)*100}%`, background:C.success, transition:'width .4s' }}></div>
                <div style={{ height:'100%', width:`${(s.good/s.total)*100}%`, background:C.info, transition:'width .4s' }}></div>
                <div style={{ height:'100%', width:`${(s.below/s.total)*100}%`, background:C.warning, transition:'width .4s' }}></div>
              </div>
              <div style={{ display:'flex', gap:10, fontSize:'0.7rem', color:C.textMuted, marginBottom:14 }}>
                <span style={{ color:C.success, fontWeight:600 }}>{s.excellent} шилдэг</span>
                <span style={{ color:C.info, fontWeight:600 }}>{s.good} сайн</span>
                <span style={{ color:C.warning, fontWeight:600 }}>{s.below} дунд</span>
              </div>

              {/* Min/avg/max */}
              <div style={{ display:'flex', borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, padding:'10px 0', marginBottom:12 }}>
                {[['Дундаж',s.avg],['Макс',s.max],['Мин',s.min]].map(([label,val],j) => (
                  <div key={label} style={{ flex:1, textAlign:'center', borderRight: j<2 ? `1px solid ${C.border}` : 'none' }}>
                    <div style={{ fontSize:'0.65rem', color:C.textFaint, fontWeight:500 }}>{label}</div>
                    <div style={{ fontSize:'1rem', fontWeight:800, color:C.text }}>{val}</div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign:'center', fontSize:'0.75rem', color: isActive ? C.primary : C.textMuted, fontWeight:600, paddingTop:2 }}>
                {isActive ? '▲ Хаах' : '▼ Дэлгэрэнгүй харах'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded detail panel */}
      {sel && (
        <div style={{ background:C.surface, borderRadius:16, boxShadow:'0 4px 6px -1px rgba(0,0,0,.08)', overflow:'hidden', marginBottom:28, border:`2px solid ${C.primaryLight}`, animation:'slideUp .2s ease' }}>
          {/* Hero */}
          <div style={{ background:'linear-gradient(135deg,#3730a3,#4f46e5,#6366f1)', padding:'22px 28px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
            <div>
              <h2 style={{ fontSize:'1.4rem', fontWeight:900, color:'white', margin:'0 0 4px', letterSpacing:'-0.03em' }}>{sel.name}</h2>
              <p style={{ color:'rgba(255,255,255,.75)', fontSize:'0.875rem', margin:0 }}>{sel.total} сурагчийн дүн</p>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              {[['Дундаж',sel.avg],['Хамгийн өндөр',sel.max],['Хамгийн бага',sel.min]].map(([label,val]) => (
                <div key={label} style={{ textAlign:'center', background:'rgba(255,255,255,.15)', borderRadius:10, padding:'10px 16px', minWidth:72 }}>
                  <div style={{ fontSize:'0.65rem', color:'rgba(255,255,255,.7)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</div>
                  <div style={{ fontSize:'1.5rem', fontWeight:900, color:'white', marginTop:2 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Body: chart + ranking */}
          <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr' }} className="subject-detail-body">
            {/* Chart */}
            <div style={{ padding:'22px 24px', borderRight:`1px solid ${C.border}` }}>
              <h3 style={{ margin:'0 0 16px', fontSize:'0.95rem', fontWeight:700, color:C.text }}>Сурагчдын оноо</h3>
              <SingleBarChartSVG data={sel.sorted.map(r => ({ name: r.student.name.split(' ')[0], score: r.score }))} height={200}/>
            </div>

            {/* Ranking */}
            <div style={{ padding:'22px 20px' }}>
              <h3 style={{ margin:'0 0 14px', fontSize:'0.95rem', fontWeight:700, color:C.text }}>Сурагчдын эрэмбэ</h3>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.8rem' }}>
                <thead>
                  <tr>
                    {[['#','center','28px'],['Нэр','left',''],['Оноо','center',''],['','center','36px']].map(([h,a,w])=>(
                      <th key={h} style={{ padding:'6px 4px', fontSize:'0.68rem', fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.04em', borderBottom:`2px solid ${C.border}`, textAlign:a, width:w||'auto' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sel.sorted.map((r, i) => {
                    const g = getLetterGrade(r.score);
                    const gs = LETTER_STYLE[g];
                    return (
                      <tr key={r.student.id} style={{ background: i===0?'#fafaf5':gs.rowBg }}>
                        <td style={{ padding:'7px 4px', borderBottom:`1px solid ${C.border}`, textAlign:'center', fontWeight:700, color: i===0?C.warning:C.textMuted }}>{i===0?'🥇':i+1}</td>
                        <td style={{ padding:'7px 4px', borderBottom:`1px solid ${C.border}`, fontWeight:500, color:C.text, cursor:'pointer' }}
                          onClick={() => onSelectStudent && onSelectStudent(r.student)}>
                          {r.student.name}
                        </td>
                        <td style={{ padding:'7px 4px', borderBottom:`1px solid ${C.border}`, textAlign:'center', fontWeight:700, color:C.text }}>{r.score}</td>
                        <td style={{ padding:'7px 4px', borderBottom:`1px solid ${C.border}`, textAlign:'center' }}>
                          <span style={{ padding:'2px 8px', borderRadius:9999, fontWeight:700, fontSize:'0.72rem', background:gs.bg, color:gs.color }}>{g}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { SubjectDashboard });
