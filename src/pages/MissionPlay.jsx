import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ClipboardList,
  FastForward,
  LayoutGrid,
  Lightbulb,
  ListChecks,
  Lock,
  MapPin,
  MessageCircle,
  Plus,
  RefreshCw,
  Rocket,
  RotateCcw,
  Star,
  Target,
  Trash2,
  Users,
  Wrench,
  X,
  XCircle
} from 'lucide-react';
import PhoneChat from '../components/quest/PhoneChat';
import QuestHeader from '../components/quest/QuestHeader';
import BotTip from '../components/quest/BotTip';
import MissionScene from '../components/quest/art/MissionScene';
import Person from '../components/quest/art/Person';
import Robot, { ROBOT_ACCS, ROBOT_COLORS } from '../components/quest/art/Robot';
import { missionById, missions, testTypes } from '../data/missions';
import { useAuth } from '../contexts/AuthContext';
import { checkRules, emptyDesign, pressMenu, reply, runSimulation, uid } from '../utils/botEngine';
import { isUnlocked, useProgress } from '../utils/progress';
import { getAllResults } from '../utils/quizStorage';
import { journey } from '../utils/journey';
import { logEvent } from '../services/sheetLogger';

const MOOD = { love: 'love', ok: 'happy', confused: 'confused', angry: 'angry' };
const MOOD_TEXT = { love: 'พอใจมาก', ok: 'พอใจ', confused: 'งง', angry: 'ไม่พอใจ' };

/* ---------- ช่องกรอกคำสำคัญแบบชิป ---------- */
function KeywordInput({ value, onChange, hints, min }) {
  const [draft, setDraft] = useState('');
  const [showHint, setShowHint] = useState(false);
  const add = (raw) => {
    const parts = raw
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => !value.includes(s));
    if (parts.length) onChange([...value, ...parts]);
  };
  const flush = () => {
    if (draft.trim()) add(draft);
    setDraft('');
  };
  return (
    <div className="kw">
      <div className="kw__box">
        {value.map((k) => (
          <span key={k} className="kw__chip">
            {k}
            <button type="button" aria-label={`ลบคำ ${k}`} onClick={() => onChange(value.filter((x) => x !== k))}>
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          placeholder={value.length ? 'เพิ่มคำ…' : 'พิมพ์คำสำคัญแล้วกด Enter'}
          onChange={(e) => {
            const v = e.target.value;
            if (v.includes(',')) {
              add(v);
              setDraft('');
            } else setDraft(v);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              flush();
            } else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={flush}
          aria-label="คำสำคัญ"
        />
      </div>
      <div className="kw__foot">
        <span className={value.length >= min ? 'is-ok' : ''}>
          {value.length >= min && <CheckCircle2 size={13} aria-hidden="true" />} {value.length}/{min} คำ
        </span>
        {hints && (
          <button type="button" className="kw__hintbtn" onClick={() => setShowHint((s) => !s)} aria-expanded={showHint}>
            <Lightbulb size={13} aria-hidden="true" /> {showHint ? 'ซ่อนคำใบ้' : 'ขอคำใบ้'}
          </button>
        )}
      </div>
      {showHint && hints && (
        <div className="kw__hints">
          {hints.map((h) => (
            <button key={h} type="button" disabled={value.includes(h)} onClick={() => add(h)}>
              + {h}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- 1. รับโจทย์ ---------- */
function Brief({ mission: m, onStart, hasDraft }) {
  return (
    <div className="qsplit">
      <section className="qpanel brief">
        <div className="brief__art">
          <MissionScene id={m.id} title={`ภาพสถานการณ์ ${m.title}`} />
        </div>
        <div className="brief__body">
          <span className="qdetail__no">สถานการณ์ · ภารกิจที่ {m.no}</span>
          <h2 className="brief__title">{m.title}</h2>
          <p className="qdetail__place">
            <MapPin size={14} aria-hidden="true" /> {m.place}
          </p>

          <div className="dialog">
            <Person kind={m.owner.kind} seed={m.no} mood="neutral" size={56} title={m.owner.name} />
            <div className="dialog__bubble">
              <b>{m.owner.name}</b>
              <p>{m.problem}</p>
              <p className="dialog__want">“{m.want}”</p>
            </div>
          </div>

          <div className="persona">
            <Person kind={m.persona} seed={m.no + 3} mood="happy" size={44} />
            <div>
              <b>ผู้ใช้งานหลัก (User Persona)</b>
              <p>{m.users}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="qstack">
        <section className="qpanel">
          <div className="qpanel__head">
            <h2>
              <ClipboardList size={18} aria-hidden="true" /> ข้อมูลจริงที่บอทต้องรู้
            </h2>
          </div>
          <ol className="facts">
            {m.facts.map((f) => (
              <li key={f.key}>
                <b>{f.label}</b>
                <p>{f.info}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="qpanel">
          <div className="qpanel__head">
            <h2>
              <Target size={18} aria-hidden="true" /> เกณฑ์ผ่านภารกิจ
            </h2>
          </div>
          <ul className="checklist">
            <li>ตั้งชื่อบอท + ข้อความต้อนรับ</li>
            <li>
              FAQ ครบ {m.facts.length} หัวข้อ หัวข้อละ ≥ {m.rules.minKeywords} คำสำคัญ
            </li>
            <li>Rich Menu ≥ {m.rules.minMenu} ปุ่ม และข้อความ Fallback</li>
            {m.rules.maxAnswer > 0 && <li>คำตอบไม่เกิน {m.rules.maxAnswer} ตัวอักษร (ผู้สูงอายุอ่านยาวไม่ไหว)</li>}
            <li>
              ลูกค้า {m.customers.length} คน ตอบถูก ≥ {m.rules.passPercent}%
            </li>
          </ul>
          <div className="types">
            {Object.entries(testTypes).map(([n, t]) => (
              <span key={n}>
                <i>{n}</i> {t}
              </span>
            ))}
          </div>
        </section>

        <BotTip>อ่านข้อมูลจริงให้ครบก่อน แล้วคิดว่าลูกค้า “พิมพ์คำว่าอะไร” เวลาถามแต่ละเรื่อง</BotTip>

        <button type="button" className="qbtn qbtn--primary qbtn--block" onClick={onStart}>
          {hasDraft ? 'ออกแบบบอทต่อ' : 'รับภารกิจ · เริ่มออกแบบ'} <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/* ---------- สตูดิโอบอท: ตัวอย่างบอทแบบโต้ตอบได้ ---------- */
const POKES = [
  { mood: 'love', say: 'ชอบชุดนี้จัง!' },
  { mood: 'cheer', say: 'พร้อมช่วยลูกค้าแล้ว!' },
  { mood: 'wave', say: 'สวัสดีค่า~' },
  { mood: 'happy', say: 'แตะอีกทีสิ' }
];

function BotStudio({ design, ready }) {
  const [n, setN] = useState(0);
  const [on, setOn] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const tap = () => {
    setN((x) => x + 1);
    setOn(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOn(false), 1600);
  };
  const idle = on ? POKES[(n - 1) % POKES.length] : null;
  const greet = design.greeting.trim();
  const say = idle ? idle.say : greet ? (greet.length > 54 ? `${greet.slice(0, 54)}…` : greet) : ready ? 'พร้อมแล้ว!' : 'ตั้งชื่อและข้อความต้อนรับให้หน่อยนะ';
  return (
    <div className="studio">
      <button type="button" className="studio__stage" onClick={tap} aria-label="แตะบอทเพื่อเล่นด้วย">
        <span className="studio__ring" aria-hidden="true" />
        {[0, 1, 2, 3, 4].map((k) => (
          <i key={k} className="studio__spark" style={{ '--k': k }} aria-hidden="true" />
        ))}
        <span className="studio__say" key={say}>
          {say}
        </span>
        <span className={`studio__bot ${idle ? 'is-pop' : ''}`} key={n}>
          <Robot live size={150} color={design.avatar} acc={design.acc} mood={idle ? idle.mood : ready ? 'wave' : 'think'} />
        </span>
        <span className="studio__pedestal" aria-hidden="true" />
      </button>
      <div className="studio__tag">
        <b>{design.name.trim() || 'บอทของฉัน'}</b>
        <small>
          {ROBOT_COLORS[design.avatar]?.label} · {ROBOT_ACCS[design.acc] || 'ไม่มี'}
        </small>
      </div>
      <p className="studio__hint">แตะที่บอทเพื่อเล่นด้วย</p>
    </div>
  );
}

/* ---------- 2. ออกแบบ + ทดลองแชต ---------- */
function Designer({ mission, design, setDesign, rules, tab, setTab, onLaunch }) {
  const [chat, setChat] = useState([]);
  const [typing, setTyping] = useState(false);
  const timer = useRef(null);

  const reset = () => setChat(design.greeting.trim() ? [{ id: uid('g'), from: 'bot', text: design.greeting.trim() }] : []);
  useEffect(reset, [design.greeting]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(timer.current), []);

  const labelOf = (key) => mission.facts.find((f) => f.key === key)?.label || '—';
  const botSay = (res) => {
    setTyping(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setTyping(false);
      setChat((c) => [
        ...c,
        {
          id: uid('b'),
          from: 'bot',
          text: res.text,
          kind: res.kind === 'fallback' ? 'fallback' : '',
          tag: res.kind === 'faq' ? `จับคู่: ${labelOf(res.faq.key)}${res.hits ? ` (${res.hits.join(', ')})` : ''}` : res.kind === 'fallback' ? 'Fallback' : ''
        }
      ]);
    }, 500);
  };
  const me = { kind: mission.persona, seed: mission.no + 3, mood: 'neutral' };
  const send = (text) => {
    setChat((c) => [...c, { id: uid('u'), from: 'user', text, person: me }]);
    botSay(reply(design, text));
  };
  const menu = (btn) => {
    setChat((c) => [...c, { id: uid('u'), from: 'user', text: btn.label, tag: 'กดปุ่มเมนู', person: me }]);
    botSay(pressMenu(design, btn));
  };

  const set = (patch) => setDesign((d) => ({ ...d, ...patch }));
  const setFaq = (id, patch) => setDesign((d) => ({ ...d, faqs: d.faqs.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));
  const addFaq = (key = '') => setDesign((d) => ({ ...d, faqs: [...d.faqs, { id: uid('f'), key, keywords: [], answer: '' }] }));
  const delFaq = (id) =>
    setDesign((d) => ({ ...d, faqs: d.faqs.filter((f) => f.id !== id), menu: d.menu.map((b) => (b.faqId === id ? { ...b, faqId: '' } : b)) }));
  const setBtn = (id, patch) => setDesign((d) => ({ ...d, menu: d.menu.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));

  const usedKeys = new Set(design.faqs.map((f) => f.key));
  const okCount = rules.filter((r) => r.ok).length;
  const maxA = mission.rules.maxAnswer;
  const ok = (...ids) => ids.every((k) => rules.find((r) => r.id === k)?.ok ?? true);

  const tabs = [
    { id: 'bot', label: 'ตั้งค่าบอท', icon: Bot, ok: ok('name', 'greeting') },
    { id: 'faq', label: 'คำถาม–คำตอบ (FAQ)', icon: MessageCircle, ok: ok('faq', 'kw', 'short') },
    { id: 'menu', label: 'Rich Menu & Fallback', icon: LayoutGrid, ok: ok('menu', 'fallback') }
  ];

  return (
    <>
      <section className="qpanel checks" aria-label="เช็กลิสต์เงื่อนไขภารกิจ">
        <span className="checks__score">
          <ListChecks size={16} aria-hidden="true" /> ผ่านเงื่อนไข {okCount}/{rules.length}
        </span>
        <ul className="checks__list">
          {rules.map((r) => (
            <li key={r.id} className={r.ok ? 'is-ok' : ''}>
              {r.ok ? <CheckCircle2 size={14} aria-hidden="true" /> : <XCircle size={14} aria-hidden="true" />} {r.label}
              {r.value && <em>{r.value}</em>}
            </li>
          ))}
        </ul>
        <button type="button" className="qbtn qbtn--primary" onClick={onLaunch}>
          <Rocket size={17} aria-hidden="true" /> เปิดใช้งานจริง
        </button>
      </section>

      <div className="qsplit qsplit--phone">
        <section className="qpanel editor">
          <div className="qtabs" role="tablist" aria-label="ส่วนออกแบบ">
            {tabs.map(({ id, label, icon: Icon, ok: done }) => (
              <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'is-on' : ''} onClick={() => setTab(id)}>
                <Icon size={16} aria-hidden="true" /> {label}
                <i className={done ? 'is-ok' : ''} aria-label={done ? 'ครบแล้ว' : 'ยังไม่ครบ'} />
              </button>
            ))}
          </div>

          {tab === 'bot' && (
            <div className="botlab">
              <BotStudio design={design} ready={ok('name', 'greeting')} />
              <div className="dform">
                <label className="qfield">
                  <span>ชื่อบอท</span>
                  <input value={design.name} maxLength={40} placeholder={`เช่น ${mission.title} Bot`} onChange={(e) => set({ name: e.target.value })} />
                </label>
                <div className="qfield">
                  <span>สีของบอท</span>
                  <div className="avatars" role="radiogroup" aria-label="สีของบอท">
                    {Object.entries(ROBOT_COLORS).map(([key, c]) => (
                      <button
                        key={key}
                        type="button"
                        role="radio"
                        aria-checked={design.avatar === key}
                        className={design.avatar === key ? 'is-on' : ''}
                        onClick={() => set({ avatar: key })}
                        title={c.label}
                        style={{ '--sw': c.main }}
                      >
                        <Robot head size={40} color={key} acc={design.acc} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="qfield">
                  <span>เครื่องประดับ</span>
                  <div className="avatars avatars--acc" role="radiogroup" aria-label="เครื่องประดับของบอท">
                    {Object.entries(ROBOT_ACCS).map(([key, label]) => (
                      <button key={key} type="button" role="radio" aria-checked={design.acc === key} className={design.acc === key ? 'is-on' : ''} onClick={() => set({ acc: key })}>
                        <Robot head size={40} color={design.avatar} acc={key} />
                        <small>{label}</small>
                      </button>
                    ))}
                  </div>
                </div>
                <label className="qfield">
                  <span>ข้อความต้อนรับ (Greeting Message)</span>
                  <textarea rows={4} value={design.greeting} placeholder="บอกชื่อสถานที่ · บอทช่วยอะไรได้ · วิธีใช้เมนู" onChange={(e) => set({ greeting: e.target.value })} />
                </label>
                <BotTip>
                  ข้อความต้อนรับที่ดีบอก <b>ชื่อสถานที่</b> + <b>บอทช่วยอะไรได้</b> + <b>ให้กดเมนูหรือพิมพ์ถาม</b> ใช้น้ำเสียงให้เหมาะกับผู้ใช้: {mission.users}
                </BotTip>
              </div>
            </div>
          )}

          {tab === 'faq' && (
            <div className="dform">
              <div className="qfield">
                <span>เลือกหัวข้อ (Intent) เพื่อสร้าง FAQ</span>
                <div className="factpick">
                  {mission.facts.map((f) => (
                    <button key={f.key} type="button" disabled={usedKeys.has(f.key)} onClick={() => addFaq(f.key)}>
                      {usedKeys.has(f.key) ? <CheckCircle2 size={14} aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />} {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {design.faqs.length === 0 && <p className="empty">กดหัวข้อด้านบนเพื่อสร้าง FAQ ข้อแรก</p>}

              {design.faqs.map((f, i) => {
                const fact = mission.facts.find((x) => x.key === f.key);
                const len = f.answer.trim().length;
                return (
                  <div key={f.id} className="faqcard">
                    <div className="faqcard__top">
                      <span className="faqcard__no">FAQ {i + 1}</span>
                      <select value={f.key} onChange={(e) => setFaq(f.id, { key: e.target.value })} aria-label="หัวข้อ (Intent)">
                        <option value="">— เลือกหัวข้อ —</option>
                        {mission.facts.map((x) => (
                          <option key={x.key} value={x.key}>
                            {x.label}
                          </option>
                        ))}
                      </select>
                      <button type="button" className="icon-btn" onClick={() => delFaq(f.id)} aria-label={`ลบ FAQ ${i + 1}`}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {fact && <p className="faqcard__info">ข้อมูลจริง: {fact.info}</p>}
                    <div className="faqcard__grid">
                      <div className="qfield">
                        <span>คำสำคัญ (คำที่ลูกค้าน่าจะพิมพ์)</span>
                        <KeywordInput value={f.keywords} onChange={(keywords) => setFaq(f.id, { keywords })} hints={fact?.hintKw} min={mission.rules.minKeywords} />
                      </div>
                      <label className="qfield">
                        <span>
                          ข้อความตอบกลับ
                          <em className={`faqcard__len ${maxA && len > maxA ? 'is-bad' : ''}`}>
                            {len}
                            {maxA ? `/${maxA}` : ''} ตัวอักษร
                          </em>
                        </span>
                        <textarea rows={3} value={f.answer} placeholder="เขียนคำตอบจากข้อมูลจริงให้ครบถ้วน สุภาพ" onChange={(e) => setFaq(f.id, { answer: e.target.value })} />
                      </label>
                    </div>
                  </div>
                );
              })}
              <button type="button" className="qbtn qbtn--soft" onClick={() => addFaq('')}>
                <Plus size={16} aria-hidden="true" /> เพิ่ม FAQ
              </button>
            </div>
          )}

          {tab === 'menu' && (
            <div className="dform">
              <div className="qfield">
                <span>Rich Menu (ปุ่มลัดด้านล่างแชต) — ตั้งชื่อปุ่ม แล้วเลือกคำตอบที่จะแสดง</span>
                <div className="menugrid">
                  {design.menu.map((b, i) => (
                    <div key={b.id} className="menuslot">
                      <div className="menuslot__top">
                        <span>ปุ่ม {i + 1}</span>
                        {design.menu.length > 1 && (
                          <button
                            type="button"
                            className="icon-btn icon-btn--sm"
                            onClick={() => setDesign((d) => ({ ...d, menu: d.menu.filter((x) => x.id !== b.id) }))}
                            aria-label={`ลบปุ่ม ${i + 1}`}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      <input value={b.label} maxLength={18} placeholder="ชื่อปุ่ม" onChange={(e) => setBtn(b.id, { label: e.target.value })} aria-label={`ชื่อปุ่ม ${i + 1}`} />
                      <select value={b.faqId} onChange={(e) => setBtn(b.id, { faqId: e.target.value })} aria-label={`คำตอบของปุ่ม ${i + 1}`}>
                        <option value="">กดแล้วตอบ…</option>
                        {design.faqs.map((f, j) => (
                          <option key={f.id} value={f.id}>
                            FAQ {j + 1} · {labelOf(f.key)}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                  {design.menu.length < 6 && (
                    <button
                      type="button"
                      className="menuslot menuslot--add"
                      onClick={() => setDesign((d) => ({ ...d, menu: [...d.menu, { id: uid('m'), label: '', faqId: '' }] }))}
                    >
                      <Plus size={18} aria-hidden="true" /> เพิ่มปุ่ม
                    </button>
                  )}
                </div>
              </div>

              <label className="qfield">
                <span>ข้อความ Fallback (ตอบเมื่อบอทไม่เข้าใจคำถาม)</span>
                <textarea rows={3} value={design.fallback} placeholder="ขอโทษอย่างสุภาพ + แนะนำให้กดเมนู หรือช่องทางติดต่อเจ้าหน้าที่" onChange={(e) => set({ fallback: e.target.value })} />
              </label>
              <BotTip>Fallback ช่วยไม่ให้ลูกค้าเข้าใจว่าบอทตอบได้ทุกเรื่อง และบอกทางไปต่อเสมอ</BotTip>
            </div>
          )}
        </section>

        <aside className="phonecol" aria-label="ทดลองแชต">
          <div className="phonecol__head">
            <b>
              <MessageCircle size={16} aria-hidden="true" /> ทดลองแชต
            </b>
            <button type="button" className="qbtn qbtn--ghost qbtn--sm" onClick={reset}>
              <RefreshCw size={14} aria-hidden="true" /> เริ่มใหม่
            </button>
          </div>
          <PhoneChat design={design} messages={chat} typing={typing} onSend={send} onMenu={menu} />
          <div className="phonecol__try">
            <span>ลองถาม:</span>
            {[mission.customers[0].msg, mission.customers.find((c) => c.type === 3)?.msg].filter(Boolean).map((q) => (
              <button key={q} type="button" onClick={() => send(q)}>
                {q}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}

/* ---------- 3. เปิดใช้งานจริง (จำลอง) ---------- */
function LiveRun({ mission, design, result, onDone }) {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState('ask');
  const [fast, setFast] = useState(false);
  const [msgs, setMsgs] = useState(() => (design.greeting.trim() ? [{ id: 'g', from: 'bot', text: design.greeting.trim() }] : []));
  const rows = result.rows;
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (step >= rows.length) {
      const t = setTimeout(() => doneRef.current(), fast ? 600 : 1400);
      return () => clearTimeout(t);
    }
    const r = rows[step];
    const k = fast ? 0.45 : 1;
    let t;
    if (phase === 'ask') {
      t = setTimeout(() => {
        setMsgs((m) => [
          ...m,
          {
            id: `u${step}`,
            from: 'user',
            who: r.customer.name,
            person: { kind: r.customer.kind, seed: r.customer.seed, mood: 'neutral' },
            text: r.ask,
            tag: r.customer.menu ? 'กดปุ่มเมนู' : ''
          }
        ]);
        setPhase('typing');
      }, 1500 * k);
    } else if (phase === 'typing') {
      t = setTimeout(() => {
        setMsgs((m) => [...m, { id: `b${step}`, from: 'bot', text: r.answer, kind: r.ok ? 'good' : 'bad' }]);
        setPhase('answer');
      }, 1900 * k);
    } else {
      t = setTimeout(() => {
        setStep((s) => s + 1);
        setPhase('ask');
      }, 2300 * k);
    }
    return () => clearTimeout(t);
  }, [step, phase, fast, rows]);

  const served = rows.slice(0, phase === 'answer' ? step + 1 : step);
  const good = served.filter((r) => r.ok).length;
  const sat = served.length ? Math.round((good / served.length) * 100) : 100;
  const cur = rows[Math.min(step, rows.length - 1)];
  const answered = phase === 'answer' && step < rows.length;

  return (
    <div className="qsplit qsplit--phone">
      <section className="qpanel live" aria-label="เปิดใช้งานจริงกับลูกค้า">
        <div className="qpanel__head">
          <h2>
            <span className="live__dot" aria-hidden="true" /> เปิดใช้งานจริง · ลูกค้าเริ่มทักแชต
          </h2>
          <button type="button" className="qbtn qbtn--ghost qbtn--sm" onClick={() => setFast((f) => !f)} aria-pressed={fast}>
            <FastForward size={14} aria-hidden="true" /> {fast ? 'ความเร็วปกติ' : 'เร่งความเร็ว x2'}
          </button>
        </div>

        <div className="live__stage">
          <MissionScene id={mission.id} />
          <div className="live__bot">
            <Robot head live size={58} color={design.avatar} acc={design.acc} mood={answered ? (cur.ok ? 'cheer' : 'sad') : phase === 'typing' ? 'think' : 'happy'} />
            <span>{design.name.trim() || 'บอท'}</span>
            {phase === 'typing' && step < rows.length && (
              <i className="live__typing" aria-hidden="true">
                <b />
                <b />
                <b />
              </i>
            )}
          </div>
          {step < rows.length && (
            <div className="live__cust" key={step}>
              <div className={`live__ava mood-${answered ? cur.mood : 'wait'}`}>
                <Person kind={cur.customer.kind} seed={cur.customer.seed} mood={answered ? MOOD[cur.mood] : 'neutral'} size={92} />
                {answered && (
                  <span className={`live__fx fx-${cur.mood}`} aria-hidden="true">
                    {(cur.mood === 'love' ? '♥♥♥' : cur.mood === 'ok' ? '✓✦✦' : cur.mood === 'confused' ? '??' : '!!').split('').map((ch, k) => (
                      <em key={k} style={{ '--k': k }}>
                        {ch}
                      </em>
                    ))}
                  </span>
                )}
              </div>
              <div className="live__talk">
                <div className="live__who">
                  <b>{cur.customer.name}</b>
                  <span>
                    ทดสอบแบบ {cur.customer.type} · {testTypes[cur.customer.type]}
                  </span>
                </div>
                <p className="live__say">{cur.customer.menu ? `กดปุ่ม “${cur.ask}”` : `“${cur.ask}”`}</p>
                {answered && (
                  <p className={`live__verdict ${cur.ok ? 'is-good' : 'is-bad'}`}>
                    {cur.ok ? <CheckCircle2 size={15} aria-hidden="true" /> : <XCircle size={15} aria-hidden="true" />} {MOOD_TEXT[cur.mood]} — {cur.note}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="live__line">
          <span className="live__linelabel">แถวลูกค้า</span>
          <ol className="live__queue" aria-label="คิวลูกค้า">
            {rows.map((r, i) => {
              const done = i < step || (i === step && phase === 'answer');
              const now = i === step && !done;
              return (
                <li key={i} className={`${done ? (r.ok ? 'is-good' : 'is-bad') : ''} ${now ? 'is-now' : ''} ${i > step ? 'is-wait' : ''}`} title={r.customer.name}>
                  <Person kind={r.customer.kind} seed={r.customer.seed} mood={done ? MOOD[r.mood] : 'neutral'} size={44} />
                  {done && <i className="live__badge">{r.ok ? <Check size={11} /> : <X size={11} />}</i>}
                  <small>{now ? 'กำลังคุย' : r.customer.name}</small>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="live__meters">
          <div className="meter">
            <span>ความพึงพอใจของลูกค้า</span>
            <div className="qbar qbar--lg">
              <i className={sat >= 80 ? 'is-good' : sat >= 50 ? 'is-warn' : 'is-bad'} style={{ width: `${sat}%` }} />
            </div>
            <b>{sat}%</b>
          </div>
          <div className="live__nums">
            <span className="is-good">
              <CheckCircle2 size={16} aria-hidden="true" /> ตอบถูก {good}
            </span>
            <span className="is-bad">
              <XCircle size={16} aria-hidden="true" /> พลาด {served.length - good}
            </span>
            <span>
              <Users size={16} aria-hidden="true" /> บริการแล้ว {served.length}/{rows.length} คน
            </span>
          </div>
        </div>
      </section>

      <aside className="phonecol">
        <PhoneChat design={design} messages={msgs} typing={phase === 'typing'} readOnly status="กำลังให้บริการลูกค้า" />
      </aside>
    </div>
  );
}

/* ---------- 4. ผลการประเมิน ---------- */
function Result({ mission, result, xp, onFix, onReplay, nextId }) {
  const navigate = useNavigate();
  const pass = result.pass;
  return (
    <div className="qsplit qsplit--result">
      <section className={`qpanel verdict ${pass ? 'is-pass' : 'is-fail'}`} aria-labelledby="verdict-title">
        {pass && (
          <div className="confetti" aria-hidden="true">
            {Array.from({ length: 18 }).map((_, i) => (
              <i key={i} style={{ '--i': i }} />
            ))}
          </div>
        )}
        <Robot mood={pass ? 'cheer' : 'sad'} size={120} className="verdict__bot" />
        <h2 id="verdict-title">{pass ? 'ผ่านภารกิจ!' : 'ยังไม่ผ่าน ลองแก้บอทอีกนิด'}</h2>
        <p>
          {pass
            ? `${mission.owner.name} ประทับใจมาก ลูกค้าได้คำตอบทันใจ`
            : result.rulesOk
              ? 'ลูกค้าบางคนไม่ได้คำตอบที่ต้องการ ความพึงพอใจลดลง ต้องกลับไปปรับปรุง'
              : 'บอทยังขาดส่วนประกอบสำคัญตามเงื่อนไขของภารกิจ'}
        </p>
        <div className="verdict__stars" aria-label={`ได้ ${result.stars} จาก 3 ดาว`}>
          {[0, 1, 2].map((i) => (
            <Star key={i} size={36} className={i < result.stars ? 'is-on' : ''} style={{ animationDelay: `${0.2 + i * 0.2}s` }} />
          ))}
        </div>
        <div className="verdict__nums">
          <div className="ring" style={{ '--p': result.percent, '--c': result.percent >= mission.rules.passPercent ? '#2f9e44' : '#e03131' }}>
            <b>{result.percent}%</b>
            <small>ตอบถูก</small>
          </div>
          <dl>
            <div>
              <dt>ลูกค้าพอใจ</dt>
              <dd>
                {result.correct}/{result.total} คน
              </dd>
            </div>
            <div>
              <dt>เกณฑ์ผ่าน</dt>
              <dd>≥ {mission.rules.passPercent}%</dd>
            </div>
            <div>
              <dt>ได้รับ</dt>
              <dd className="verdict__xp">+{xp} XP</dd>
            </div>
          </dl>
        </div>
        <div className="verdict__actions">
          {pass &&
            (nextId ? (
              <button type="button" className="qbtn qbtn--primary qbtn--block" onClick={() => navigate(`/quest/${nextId}`)}>
                ภารกิจถัดไป <ArrowRight size={16} aria-hidden="true" />
              </button>
            ) : (
              <Link to="/worksheets" className="qbtn qbtn--primary qbtn--block">
                กลับหน้ากิจกรรม <ArrowRight size={16} aria-hidden="true" />
              </Link>
            ))}
          {pass && mission.id === 'coffee' && (
            <Link to="/quizzes/posttest" className="qbtn qbtn--soft qbtn--block">
              ปลดล็อกแล้ว: แบบทดสอบหลังเรียน <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}
          <button type="button" className={`qbtn ${pass ? 'qbtn--ghost' : 'qbtn--primary'} qbtn--block`} onClick={onFix}>
            <Wrench size={16} aria-hidden="true" /> กลับไปแก้บอท
          </button>
          <button type="button" className="qbtn qbtn--ghost qbtn--block" onClick={onReplay}>
            <RotateCcw size={16} aria-hidden="true" /> เปิดใช้งานอีกครั้ง
          </button>
        </div>
      </section>

      <div className="qstack">
        {result.issues.length > 0 && (
          <section className="qpanel issues" aria-labelledby="issues-title">
            <div className="qpanel__head">
              <h2 id="issues-title">
                <Wrench size={18} aria-hidden="true" /> ข้อเสนอแนะ: สิ่งที่ต้องแก้ ({result.issues.length})
              </h2>
            </div>
            <ul>
              {result.issues.slice(0, 8).map((i) => (
                <li key={i.id}>
                  <b>{i.text}</b>
                  <small>
                    <Lightbulb size={13} aria-hidden="true" /> {i.tip}
                  </small>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="qpanel" aria-labelledby="log-title">
          <div className="qpanel__head">
            <h2 id="log-title">
              <ListChecks size={18} aria-hidden="true" /> ผลการทดสอบกับลูกค้า
            </h2>
            <span className="qpanel__meta">
              ถูก {result.correct} · พลาด {result.total - result.correct}
            </span>
          </div>
          <ul className="rlog">
            {result.rows.map((r, i) => (
              <li key={i} className={r.ok ? 'is-good' : 'is-bad'}>
                <Person kind={r.customer.kind} seed={r.customer.seed} mood={MOOD[r.mood]} size={36} />
                <div>
                  <b>
                    {r.customer.name}: “{r.ask}”
                  </b>
                  <small>
                    แบบ {r.customer.type} {testTypes[r.customer.type]} · {r.note}
                  </small>
                </div>
                {r.ok ? <CheckCircle2 size={18} aria-label="ผ่าน" /> : <XCircle size={18} aria-label="ไม่ผ่าน" />}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

/* ---------- หน้าเล่นภารกิจ ---------- */
export default function MissionPlay() {
  const { missionId } = useParams();
  const mission = missionById(missionId);
  if (!mission) return <Navigate to="/learn" replace />;
  return <Mission key={mission.id} mission={mission} />;
}

const STEPS = ['รับโจทย์', 'ออกแบบและทดลองแชต', 'เปิดใช้งานจริง', 'ผลการประเมิน'];

function Mission({ mission }) {
  const { user } = useAuth();
  const { progress, saveDesign, recordRun } = useProgress(user?.uid);
  const index = missions.indexOf(mission);
  const saved = progress.missions[mission.id]?.design;

  const [stage, setStage] = useState(saved ? 'design' : 'brief');
  const [tab, setTab] = useState('bot');
  const [design, setDesign] = useState(() => {
    const d = saved || emptyDesign(mission);
    return { ...d, avatar: ROBOT_COLORS[d.avatar] ? d.avatar : 'blue', acc: ROBOT_ACCS[d.acc] ? d.acc : 'none' };
  });
  const [result, setResult] = useState(null);
  const [xp, setXp] = useState(0);
  const [runKey, setRunKey] = useState(0);

  const rules = useMemo(() => checkRules(mission, design), [mission, design]);

  // บันทึกแบบร่างอัตโนมัติ
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return undefined;
    }
    const t = setTimeout(() => saveDesign(mission.id, design), 400);
    return () => clearTimeout(t);
  }, [design, mission.id, saveDesign]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stage]);

  const j = journey(progress, getAllResults());
  if (!j.can.practice) {
    return (
      <div className="quest">
        <div className="qwrap">
          <section className="qpanel gate">
            <Robot mood="think" size={120} />
            <h1>{j.done.pre ? 'เรียนบทเรียนให้ครบก่อนนะ' : 'ทำแบบทดสอบก่อนเรียนก่อนนะ'}</h1>
            <p>ภารกิจลงมือปฏิบัติจะปลดล็อกเมื่อทำแบบทดสอบก่อนเรียน และผ่านบทเรียนครบ 6 พาร์ท</p>
            <Link to={j.done.pre ? '/content' : '/quizzes/pretest'} className="qbtn qbtn--primary">
              {j.done.pre ? `ไปที่บทเรียน (ผ่านแล้ว ${j.read}/6)` : 'ไปทำแบบทดสอบก่อนเรียน'} <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </section>
        </div>
      </div>
    );
  }

  if (!isUnlocked(progress, index)) {
    return (
      <div className="quest">
        <div className="qwrap">
          <section className="qpanel qlocked">
            <Lock size={36} aria-hidden="true" />
            <h1>ภารกิจนี้ยังล็อกอยู่</h1>
            <p>ผ่านภารกิจที่ {mission.no - 1} ก่อน แล้วค่อยกลับมานะ</p>
            <Link to="/worksheets" className="qbtn qbtn--primary">
              <ArrowLeft size={16} aria-hidden="true" /> กลับหน้ากิจกรรม
            </Link>
          </section>
        </div>
      </div>
    );
  }

  const launch = () => {
    saveDesign(mission.id, design);
    setResult(runSimulation(mission, design));
    setRunKey((k) => k + 1);
    setStage('live');
  };
  const finish = () => {
    const gained = recordRun(mission.id, result);
    setXp(gained);
    logEvent('mission', {
      missionId: mission.id,
      missionTitle: mission.title,
      attempt: (progress.missions[mission.id]?.attempts || 0) + 1,
      percent: result.percent,
      correct: result.correct,
      total: result.total,
      pass: result.pass,
      stars: result.stars,
      xp: gained,
      botName: design.name,
      faqCount: design.faqs.length,
      menuCount: design.menu.filter((b) => b.label.trim()).length,
      issues: result.issues.map((i) => i.text).join(' | ')
    });
    setStage('result');
  };

  const stepNo = { brief: 0, design: 1, live: 2, result: 3 }[stage];
  const headStage = stage === 'brief' ? 0 : stage === 'design' ? (tab === 'bot' ? 1 : 2) : 3;

  return (
    <div className="quest">
      <div className="qwrap">
        <QuestHeader progress={progress} stage={headStage} title={`ภารกิจที่ ${mission.no}: ${mission.title}`} desc={`${mission.tagline} · ${mission.place}`} />

        <nav className="qsub" aria-label="ขั้นตอนภารกิจ">
          <Link to="/worksheets" className="qsub__back">
            <ArrowLeft size={15} aria-hidden="true" /> กิจกรรม
          </Link>
          <ol>
            {STEPS.map((s, i) => {
              const can = (i === 0 || i === 1) && stage !== 'live';
              const cls = i < stepNo ? 'is-done' : i === stepNo ? 'is-now' : '';
              return (
                <li key={s} className={cls} aria-current={i === stepNo ? 'step' : undefined}>
                  {can && i !== stepNo ? (
                    <button type="button" onClick={() => setStage(i === 0 ? 'brief' : 'design')}>
                      <em>{i + 1}</em> {s}
                    </button>
                  ) : (
                    <span>
                      <em>{i + 1}</em> {s}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {stage === 'brief' && <Brief mission={mission} hasDraft={Boolean(saved)} onStart={() => setStage('design')} />}
        {stage === 'design' && <Designer mission={mission} design={design} setDesign={setDesign} rules={rules} tab={tab} setTab={setTab} onLaunch={launch} />}
        {stage === 'live' && result && <LiveRun key={runKey} mission={mission} design={design} result={result} onDone={finish} />}
        {stage === 'result' && result && (
          <Result mission={mission} result={result} xp={xp} nextId={missions[index + 1]?.id} onFix={() => setStage('design')} onReplay={launch} />
        )}
      </div>
    </div>
  );
}
