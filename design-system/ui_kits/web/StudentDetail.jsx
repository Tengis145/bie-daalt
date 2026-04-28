// БИЕ ДААЛТ — Student Detail Screen (v3: SVG charts + rich hero + print)
const { useMemo } = React;

function StudentDetail({ student, onBack }) {
  const scores = useMemo(() => student.grades.map(g => ({
    subject: g.s,
    short: g.s.length > 7 ? g.s.slice(0,6)+'…' : g.s,
    e1: g.e1, e2: g.e2, att: g.att, ind: g.ind,
    total: calcScore(g),
  })), [student]);

  const avg   = calcAvg(student);
  const grade = getLetterGrade(avg);
  const gs    = LETTER_STYLE[grade];

  const compAvg = useMemo(() => {
    const n = scores.length;
    return {
      e1:  Math.round(scores.reduce((a,g)=>a+g.e1, 0)/n*10)/10,
      e2:  Math.round(scores.reduce((a,g)=>a+g.e2, 0)/n*10)/10,
      att: Math.round(scores.reduce((a,g)=>a+g.att,0)/n*10)/10,
      ind: Math.round(scores.reduce((a,g)=>a+g.ind,0)/n*10)/10,
    };
  }, [scores]);

  const dist = useMemo(() => {
    const d = {A:0,B:0,C:0,D:0,F:0};
    scores.forEach(s => { d[getLetterGrade(s.total)]++; });
    return d;
  }, [scores]);

  return (
    <div style={{ maxWidth:980, margin:'28px auto', padding:'0 24px' }}>
      {/* Back */}
      <button onClick={onBack} style={{ display:'inline-flex', alignItems:'center', gap:8, background:'none', border:'none', color:C.primary, fontWeight:600, fontSize:'0.875rem', cursor:'pointer', fontFamily:'inherit', marginBottom:20, padding:0 }} className="no-print">
        <ArrowLeftIcon size={16} color={C.primary}/> Жагсаалт руу буцах
      </button>

      {/* ── Hero ── */}
      <div style={{ background:'linear-gradient(135deg,#3730a3,#4f46e5,#6366f1)', borderRadius:16, padding:'28px 32px', marginBottom:20, boxShadow:'0 8px 24px rgba(79,70,229,.3)' }} className="no-print">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:18 }}>
            <div style={{ width:64, height:64, background:'rgba(255,255,255,.2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem', fontWeight:800, color:'white', flexShrink:0 }}>
              {student.name.charAt(0)}
            </div>
            <div>
              <h1 style={{ fontSize:'1.5rem', fontWeight:800, color:'white', margin:'0 0 8px', letterSpacing:'-0.03em' }}>{student.name}</h1>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                <span style={{ background:'rgba(255,255,255,.2)', color:'rgba(255,255,255,.9)', borderRadius:50, padding:'3px 12px', fontSize:'0.8rem', fontWeight:600 }}>{student.className} анги</span>
                <span style={{ background:'rgba(255,255,255,.15)', color:'rgba(255,255,255,.8)', borderRadius:50, padding:'3px 10px', fontSize:'0.78rem', fontWeight:500 }}>{student.year}</span>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <div style={{ textAlign:'center', background:'rgba(255,255,255,.15)', borderRadius:12, padding:'16px 24px' }}>
              <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,.7)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Дундаж</div>
              <div style={{ fontSize:'2.8rem', fontWeight:900, color:'white', lineHeight:1, marginTop:4, letterSpacing:'-0.04em' }}>{avg}</div>
            </div>
            <div style={{ textAlign:'center', background:'rgba(255,255,255,.15)', borderRadius:12, padding:'16px 20px' }}>
              <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,.7)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Үсгэн</div>
              <div style={{ fontSize:'2.8rem', fontWeight:900, color:'white', lineHeight:1, marginTop:4 }}>{grade}</div>
            </div>
            {/* Mini progress bars */}
            <div style={{ background:'rgba(255,255,255,.15)', borderRadius:12, padding:'14px 18px', minWidth:180 }}>
              {[['Шалгалт 1','e1',30,'#818cf8'],['Шалгалт 2','e2',30,'#a5b4fc'],['Ирц','att',20,'#67e8f9'],['Бие даалт','ind',20,'#6ee7b7']].map(([label,key,max,color]) => (
                <div key={key} style={{ marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', marginBottom:3 }}>
                    <span style={{ color:'rgba(255,255,255,.75)', fontWeight:500 }}>{label}</span>
                    <strong style={{ color:'white', fontWeight:700 }}>{compAvg[key]}<span style={{ fontSize:'0.62rem', color:'rgba(255,255,255,.55)', fontWeight:400 }}>/{max}</span></strong>
                  </div>
                  <div style={{ height:5, background:'rgba(255,255,255,.2)', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${(compAvg[key]/max)*100}%`, background:color, borderRadius:3 }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grade distribution pills */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }} className="no-print">
        {Object.entries(dist).map(([g, count]) => {
          const s = LETTER_STYLE[g];
          return (
            <div key={g} style={{ background:s.bg, borderRadius:10, padding:'10px 16px', textAlign:'center', flex:1, minWidth:70 }}>
              <div style={{ fontSize:'1.3rem', fontWeight:900, color:s.color }}>{count}</div>
              <div style={{ fontSize:'0.7rem', fontWeight:700, color:s.color }}>{g} дүн</div>
            </div>
          );
        })}
      </div>

      {/* Chart + Table */}
      <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:18 }} className="detail-grid">
        <div style={{ background:C.surface, borderRadius:12, padding:22, boxShadow:'0 1px 3px rgba(0,0,0,.08)' }}>
          <h3 style={{ margin:'0 0 16px', fontSize:'0.95rem', fontWeight:700, color:C.text }}>Хичээл тус бүрийн дүн</h3>
          <BarChartSVG data={scores} height={240}/>
        </div>
        <div style={{ background:C.surface, borderRadius:12, padding:22, boxShadow:'0 1px 3px rgba(0,0,0,.08)' }}>
          <h3 style={{ margin:'0 0 14px', fontSize:'0.95rem', fontWeight:700, color:C.text }}>Дүнгийн дэлгэрэнгүй</h3>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.82rem' }}>
            <thead>
              <tr>
                {[['Хичээл','left'],['Нийт','center'],['Үсгэн','center']].map(([h,a])=>(
                  <th key={h} style={{ padding:'7px 0', fontSize:'0.68rem', fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.04em', borderBottom:`2px solid ${C.border}`, textAlign:a }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scores.map(sc => {
                const g = getLetterGrade(sc.total);
                const s = LETTER_STYLE[g];
                return (
                  <tr key={sc.subject} style={{ background:s.rowBg }}>
                    <td style={{ padding:'8px 0', borderBottom:`1px solid ${C.border}`, fontWeight:500, color:C.text }}>{sc.subject}</td>
                    <td style={{ padding:'8px 4px', borderBottom:`1px solid ${C.border}`, textAlign:'center', fontWeight:700 }}>
                      {sc.total}
                      <MiniBar value={sc.total} max={100} color={s.color}/>
                    </td>
                    <td style={{ padding:'8px 0', borderBottom:`1px solid ${C.border}`, textAlign:'center' }}>
                      <span style={{ padding:'3px 10px', borderRadius:9999, fontWeight:700, fontSize:'0.75rem', background:s.bg, color:s.color }}>{g}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display:'flex', justifyContent:'flex-end', gap:12, marginTop:20 }} className="no-print">
        <Btn variant="secondary" onClick={onBack}><ArrowLeftIcon size={15} color={C.textMuted}/> Буцах</Btn>
        <Btn variant="primary" onClick={()=>window.print()}><PrintIcon size={15} color="#fff"/> Хэвлэх</Btn>
      </div>

      {/* Print Report Card */}
      <div className="print-report">
        <div className="print-school">МОНГОЛ УЛСЫН ЕРӨНХИЙ БОЛОВСРОЛЫН СУРГУУЛЬ</div>
        <div className="print-title">СУРАГЧИЙН ДҮН МЭДЭЭ</div>
        <div className="print-meta">
          <div><strong>Сурагчийн нэр:</strong> {student.name}</div>
          <div><strong>Анги:</strong> {student.className}</div>
          <div><strong>Хичээлийн жил:</strong> {student.year}</div>
          <div><strong>Улирал:</strong> 1-р улирал</div>
          <div><strong>Дундаж оноо:</strong> {avg}</div>
          <div><strong>Үсгэн дүн:</strong> {grade}</div>
        </div>
        <table className="print-table">
          <thead>
            <tr>
              <th style={{ width:24 }}>№</th>
              <th style={{ textAlign:'left' }}>Хичээлийн нэр</th>
              <th>Ш1 /30</th><th>Ш2 /30</th><th>Ирц /20</th><th>БД /20</th>
              <th>Нийт /100</th><th>Үсгэн</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((sc,i) => (
              <tr key={sc.subject}>
                <td>{i+1}</td>
                <td style={{ textAlign:'left' }}>{sc.subject}</td>
                <td>{sc.e1}</td><td>{sc.e2}</td><td>{sc.att}</td><td>{sc.ind}</td>
                <td><strong>{sc.total}</strong></td>
                <td><strong>{getLetterGrade(sc.total)}</strong></td>
              </tr>
            ))}
            <tr>
              <td colSpan={6} style={{ textAlign:'right', fontWeight:'bold' }}>Дундаж оноо:</td>
              <td><strong>{avg}</strong></td><td><strong>{grade}</strong></td>
            </tr>
          </tbody>
        </table>
        <div className="print-footer">
          <div className="print-sign">Багшийн гарын үсэг: _______________<br/><br/>Огноо: _______________</div>
          <div className="print-sign">Эцэг/эхийн гарын үсэг: _______________<br/><br/>Огноо: _______________</div>
          <div className="print-sign">Захирлын гарын үсэг: _______________<br/><br/>Тамга:</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StudentDetail });
