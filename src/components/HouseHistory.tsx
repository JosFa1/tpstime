import React, { useState } from 'react';
import './houseHistory.css';

const houses = [
  { key: 'hay', name: 'Hay', color: '#e9a800' },
  { key: 'maughan', name: 'Maughan', color: '#a477e5' },
  { key: 'lawson', name: 'Lawson', color: '#5baf78' },
  { key: 'stjohn', name: 'St. John', color: '#28a9b4' },
  { key: 'ellis', name: 'Ellis', color: '#528fea' },
  { key: 'brokaw', name: 'Brokaw', color: '#e36472' },
];
type Point = { publishedAt: string; scores: Record<string, number> };
const dateLabel = (date: string) => new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));

export default function HouseHistory({ history }: { history?: Point[] }) {
  const [activeHouse, setActiveHouse] = useState<string | null>(null);
  const [activePoint, setActivePoint] = useState<{ house: string; date: string; score: number } | null>(null);
  const points = (history ?? []).filter(p => Number.isFinite(Date.parse(p.publishedAt)) && p.scores && typeof p.scores === 'object');
  if (!points.length) return <section className="house-history"><h2>Points over time</h2><p>No published house points history is available yet.</p></section>;
  const values = points.flatMap(p => houses.map(h => p.scores[h.key]).filter(v => typeof v === 'number' && Number.isFinite(v) && v >= 0));
  if (!values.length) return <section className="house-history"><h2>Points over time</h2><p>No published house points history is available yet.</p></section>;
  const min = Math.min(0, ...values), max = Math.max(1, ...values);
  const first = Date.parse(points[0].publishedAt), last = Date.parse(points[points.length - 1].publishedAt);
  const x = (date: string) => first === last ? 50 : 50 + (Date.parse(date) - first) / (last - first) * 700;
  const y = (score: number) => 230 - (score - min) / (max - min) * 200;
  return <section className="house-history" aria-labelledby="house-history-title">
    <h2 id="house-history-title">Points over time</h2>
    <div className="house-history__legend">{houses.map(h => <button type="button" key={h.key} aria-label={`Highlight ${h.name}`} aria-pressed={activeHouse === h.key} onMouseEnter={() => { setActiveHouse(h.key); setActivePoint(null); }} onMouseLeave={() => setActiveHouse(null)} onFocus={() => { setActiveHouse(h.key); setActivePoint(null); }} onBlur={() => setActiveHouse(null)} onClick={() => setActiveHouse(h.key)}><i style={{ background: h.color }} />{h.name}</button>)}</div>
    <div className="house-history__readout" aria-live="polite">{activePoint ? <><strong>{activePoint.house}</strong> <span>{activePoint.score.toLocaleString()} points &middot; {dateLabel(activePoint.date)}</span></> : activeHouse ? <span>{houses.find(h => h.key === activeHouse)?.name}</span> : null}</div>
    <svg viewBox="0 0 780 260" role="group" aria-label="House points over time">
      {[0, .5, 1].map(f => <g key={f}><line x1="50" x2="750" y1={230 - f * 200} y2={230 - f * 200} stroke="var(--color-border)" /><text x="42" y={234 - f * 200} textAnchor="end" fill="var(--color-text-secondary)" fontSize="12">{Math.round(min + f * (max - min))}</text></g>)}
      {houses.map(h => {
        let drawing = false;
        const path = points.map(p => { const score = p.scores[h.key]; if (typeof score !== 'number' || !Number.isFinite(score) || score < 0) { drawing = false; return ''; } const command = drawing ? 'L' : 'M'; drawing = true; return `${command} ${x(p.publishedAt)} ${y(score)}`; }).join(' ');
        return <g key={h.key} className={`house-history__series${activeHouse && activeHouse !== h.key ? ' is-muted' : ''}${activeHouse === h.key ? ' is-active' : ''}`}>
          <path d={path} fill="none" stroke={h.color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" className="house-history__line" />
          <path d={path} fill="none" stroke="transparent" strokeWidth="16" strokeLinecap="round" onMouseEnter={() => { setActiveHouse(h.key); setActivePoint(null); }} onMouseLeave={() => setActiveHouse(null)} />
          {points.map((p, i) => typeof p.scores[h.key] === 'number' && Number.isFinite(p.scores[h.key]) && p.scores[h.key] >= 0 ? <g key={i} role="button" tabIndex={0} aria-label={`${h.name}: ${p.scores[h.key]} points, ${dateLabel(p.publishedAt)}`} onMouseEnter={() => { setActiveHouse(h.key); setActivePoint({ house: h.name, date: p.publishedAt, score: p.scores[h.key] }); }} onMouseLeave={() => { setActiveHouse(null); setActivePoint(null); }} onClick={() => { setActiveHouse(h.key); setActivePoint({ house: h.name, date: p.publishedAt, score: p.scores[h.key] }); }} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setActiveHouse(h.key); setActivePoint({ house: h.name, date: p.publishedAt, score: p.scores[h.key] }); } }} onFocus={() => { setActiveHouse(h.key); setActivePoint({ house: h.name, date: p.publishedAt, score: p.scores[h.key] }); }} onBlur={() => { setActiveHouse(null); setActivePoint(null); }}><circle cx={x(p.publishedAt)} cy={y(p.scores[h.key])} r="12" fill="transparent" /><circle className="house-history__dot" cx={x(p.publishedAt)} cy={y(p.scores[h.key])} r="3.5" fill={h.color} /></g> : null)}
        </g>;
      })}
    </svg>
    <div className="house-history__dates"><span>{dateLabel(points[0].publishedAt)}</span>{points.length > 1 && <span>{dateLabel(points[points.length - 1].publishedAt)}</span>}</div>

  </section>;
}
