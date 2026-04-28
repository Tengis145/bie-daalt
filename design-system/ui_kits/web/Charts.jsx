// БИЕ ДААЛТ — SVG Chart Components (no external dependency)
// Replaces Recharts with clean, animated SVG charts

function BarChartSVG({ data, height = 240, showLegend = true }) {
  // data: [{ label, short, e1, e2, att, ind, total }]
  const W = 500, H = height, padL = 28, padB = 28, padT = 10, padR = 8;
  const chartW = W - padL - padR;
  const chartH = H - padB - padT;
  const series = [
    { key:'e1',  name:'Шалгалт 1', color:'#4f46e5', max:30 },
    { key:'e2',  name:'Шалгалт 2', color:'#818cf8', max:30 },
    { key:'att', name:'Ирц',       color:'#06b6d4', max:20 },
    { key:'ind', name:'Бие даалт', color:'#059669', max:20 },
  ];
  const maxVal = 30;
  const groupW = chartW / data.length;
  const bw = Math.min(12, (groupW - 10) / series.length);
  const yTicks = [0, 10, 20, 30];

  function barH(val, max) { return (val / max) * chartH * 0.92; }

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H + (showLegend ? 20 : 0)}`} style={{ overflow:'visible', display:'block' }}>
        {/* Y grid */}
        {yTicks.map(v => {
          const y = padT + chartH - (v / maxVal) * chartH * 0.92;
          return (
            <g key={v}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e2e8f0" strokeWidth="1"/>
              <text x={padL - 4} y={y + 3} fontSize="9" fill="#94a3b8" textAnchor="end">{v}</text>
            </g>
          );
        })}
        {/* X axis */}
        <line x1={padL} y1={padT + chartH} x2={W - padR} y2={padT + chartH} stroke="#e2e8f0" strokeWidth="1.5"/>

        {/* Bars */}
        {data.map((d, i) => {
          const gx = padL + i * groupW;
          const cx = gx + groupW / 2;
          return (
            <g key={d.label || d.subject}>
              {series.map((s, si) => {
                const bh = barH(d[s.key], s.max);
                const x  = gx + (groupW - series.length * (bw + 2)) / 2 + si * (bw + 2);
                const y  = padT + chartH - bh;
                return (
                  <rect key={s.key} x={x} y={y} width={bw} height={bh}
                    fill={s.color} rx="2" opacity="0.9"/>
                );
              })}
              {/* Total score label above bars */}
              <text x={cx} y={padT + chartH - Math.max(...series.map(s => barH(d[s.key], s.max))) - 5}
                fontSize="9" fill="#64748b" textAnchor="middle" fontWeight="600">
                {d.total || ''}
              </text>
              {/* X label */}
              <text x={cx} y={padT + chartH + 16} fontSize="9" fill="#94a3b8" textAnchor="middle">
                {(d.short || d.label || '').slice(0, 7)}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        {showLegend && series.map((s, i) => (
          <g key={s.key} transform={`translate(${padL + i * 110}, ${H + 4})`}>
            <rect width="8" height="8" rx="2" fill={s.color} y="2"/>
            <text x="12" y="10" fontSize="9.5" fill="#64748b">{s.name}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function SingleBarChartSVG({ data, height = 200 }) {
  // data: [{ name, score }]  — for subject dashboard student ranking
  const W = 460, H = height, padL = 24, padB = 22, padT = 8, padR = 8;
  const chartW = W - padL - padR;
  const chartH = H - padB - padT;
  const maxVal = 100;
  const bw = Math.min(28, chartW / data.length - 6);

  function getColor(score) {
    if (score >= 90) return '#059669';
    if (score >= 75) return '#3b82f6';
    if (score >= 60) return '#d97706';
    return '#dc2626';
  }

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:'visible', display:'block' }}>
      {[0,25,50,75,100].map(v => {
        const y = padT + chartH - (v / maxVal) * chartH * 0.95;
        return (
          <g key={v}>
            <line x1={padL} y1={y} x2={W-padR} y2={y} stroke="#e2e8f0" strokeWidth="1"/>
            <text x={padL-4} y={y+3} fontSize="9" fill="#94a3b8" textAnchor="end">{v}</text>
          </g>
        );
      })}
      <line x1={padL} y1={padT+chartH} x2={W-padR} y2={padT+chartH} stroke="#e2e8f0" strokeWidth="1.5"/>
      {data.map((d, i) => {
        const bh = (d.score / maxVal) * chartH * 0.95;
        const x  = padL + i * (chartW / data.length) + (chartW / data.length - bw) / 2;
        const y  = padT + chartH - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} fill={getColor(d.score)} rx="3" opacity="0.9"/>
            <text x={x + bw/2} y={y - 4} fontSize="9" fill="#64748b" textAnchor="middle" fontWeight="600">{d.score}</text>
            <text x={x + bw/2} y={padT+chartH+14} fontSize="9" fill="#94a3b8" textAnchor="middle">
              {(d.name||'').slice(0,5)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

Object.assign(window, { BarChartSVG, SingleBarChartSVG });
