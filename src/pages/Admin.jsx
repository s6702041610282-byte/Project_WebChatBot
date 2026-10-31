import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  ClipboardCheck,
  Flag,
  GraduationCap,
  Lock,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Sheet,
  TrendingUp,
  Trophy,
  Users
} from 'lucide-react';
import Robot from '../components/quest/art/Robot';
import { AuthError, callApi } from '../services/api';
import { ADMIN_PASSWORD } from '../services/config';
import { authErrorMessage } from '../services/authService';
import { journey } from '../utils/journey';
import { units } from '../data/course';
import { missions } from '../data/missions';

const KEY = 'chatbot-learning:admin';
const STEPS = [
  { label: 'ยังไม่ทำแบบทดสอบก่อนเรียน', short: 'ก่อนเรียน', icon: ClipboardCheck },
  { label: 'กำลังเรียนบทเรียน', short: 'บทเรียน', icon: BookOpen },
  { label: 'กำลังทำกิจกรรม', short: 'กิจกรรม', icon: Flag },
  { label: 'รอทำแบบทดสอบหลังเรียน', short: 'หลังเรียน', icon: GraduationCap },
  { label: 'เรียนครบทุกขั้น', short: 'ครบแล้ว', icon: Trophy }
];

const readToken = () => {
  try {
    return sessionStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
};
const saveToken = (t) => {
  try {
    if (t) sessionStorage.setItem(KEY, t);
    else sessionStorage.removeItem(KEY);
  } catch {
    /* ไม่เป็นไร */
  }
};

const OFFLINE = ['server-unreachable', 'network', 'server-outdated', 'server'];
const LOCAL = 'local';

/** ระบบหลังบ้านยังไม่พร้อม → รวบรวมข้อมูลนักเรียนที่ใช้งานบนเครื่องนี้ */
function localData() {
  const read = (k, d) => {
    try {
      return JSON.parse(localStorage.getItem(k) || 'null') || d;
    } catch {
      return d;
    }
  };
  const accounts = read('chatbot-learning:accounts', {});
  const students = Object.values(accounts)
    .filter((a) => a && a.uid && !a.adopted)
    .map((a) => {
      let first = a.firstName || '';
      let last = a.lastName || '';
      if (!first && a.displayName) {
        const parts = a.displayName.trim().split(/\s+/);
        first = parts[0] || '';
        last = parts.slice(1).join(' ');
      }
      const p = read(`chatbot-learning:quest:${a.uid}`, {});
      return {
        uid: a.uid,
        email: a.email,
        firstName: first,
        lastName: last,
        studentId: a.studentId || '',
        classroom: a.classroom || '',
        lastSeen: a.lastLogin || a.createdAt || '',
        progress: { xp: p.xp || 0, lessons: p.lessons || {}, missions: p.missions || {} },
        results: read(`chatbot-learning:quiz-results:${a.uid}`, {})
      };
    });
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return {
    local: true,
    students,
    sheetUrl: '',
    time: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  };
}

const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const fmt = (v, d = 1) => (v === null ? '–' : v.toFixed(d).replace(/\.0$/, ''));
const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);
const fullName = (s) => `${s.firstName} ${s.lastName}`.trim() || s.email;
const dayOf = (t) => String(t || '').slice(0, 10);

/** มุม Admin ของครู — ภาพรวมทั้งห้อง */
export default function Admin() {
  const [token, setToken] = useState(readToken);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (t) => {
    setBusy(true);
    setError('');
    if (t === LOCAL) {
      setData(localData());
      setBusy(false);
      return;
    }
    try {
      setData(await callApi('admin', { token: t }));
    } catch (err) {
      if (OFFLINE.includes(err.code)) {
        setData(localData());
        setBusy(false);
        return;
      }
      if (err.code === 'admin-expired') {
        saveToken('');
        setToken('');
      }
      setError(authErrorMessage(err));
    }
    setBusy(false);
  }, []);

  useEffect(() => {
    if (token) load(token);
  }, [token, load]);

  const signOut = () => {
    saveToken('');
    setToken('');
    setData(null);
  };

  return (
    <div className="quest admin">
      <div className="qwrap">
        {!token ? (
          <AdminGate
            onIn={(t) => {
              saveToken(t);
              setToken(t);
            }}
          />
        ) : (
          <Dashboard data={data} busy={busy} error={error} onRefresh={() => load(token)} onSignOut={signOut} />
        )}
      </div>
    </div>
  );
}

/* ---------- ใส่รหัส ---------- */
function AdminGate({ onIn }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!pw) return setError('กรุณาใส่รหัส Admin');
    setBusy(true);
    setError('');
    try {
      const r = await callApi('adminLogin', { password: pw });
      onIn(r.token);
    } catch (err) {
      // ระบบหลังบ้านยังไม่พร้อม → ตรวจรหัสในเครื่อง แล้วแสดงข้อมูลจากเครื่องนี้
      if (OFFLINE.includes(err.code)) {
        if (pw === ADMIN_PASSWORD) return onIn(LOCAL);
        setError(authErrorMessage(new AuthError('admin-wrong')));
      } else setError(authErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <section className="agate" aria-labelledby="agate-title">
      <div className="agate__art" aria-hidden="true">
        <span className="agate__ring" />
        <Robot size={150} mood="wave" acc="headset" live />
      </div>
      <form className="agate__form" onSubmit={submit} noValidate>
        <span className="agate__tag">
          <ShieldCheck size={14} aria-hidden="true" /> สำหรับครูผู้สอน
        </span>
        <h1 id="agate-title">มุม Admin</h1>
        <p>ดูภาพรวมการเรียนของนักเรียนทั้งห้อง ใส่รหัส Admin เพื่อเข้าใช้งาน</p>
        <label className="agate__field">
          <span>รหัส Admin</span>
          <span className="agate__box">
            <Lock size={18} aria-hidden="true" />
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              placeholder="••••••"
              value={pw}
              onChange={(e) => {
                setPw(e.target.value);
                setError('');
              }}
              autoFocus
            />
          </span>
        </label>
        {error && (
          <p className="agate__err" role="alert">
            <AlertCircle size={16} aria-hidden="true" /> {error}
          </p>
        )}
        <button type="submit" className="qbtn qbtn--primary qbtn--block" disabled={busy}>
          {busy ? 'กำลังตรวจสอบ…' : 'เข้าสู่มุม Admin'}
        </button>
      </form>
    </section>
  );
}

/* ---------- ภาพรวม ---------- */
function Dashboard({ data, busy, error, onRefresh, onSignOut }) {
  const [room, setRoom] = useState('all');
  const [openStep, setOpenStep] = useState(null);

  const all = useMemo(() => data?.students || [], [data]);
  const rooms = useMemo(() => [...new Set(all.map((s) => s.classroom || 'ไม่ระบุห้อง'))].sort((a, b) => a.localeCompare(b, 'th')), [all]);
  const list = room === 'all' ? all : all.filter((s) => (s.classroom || 'ไม่ระบุห้อง') === room);

  const st = useMemo(() => summarize(list), [list]);
  const byRoom = useMemo(() => rooms.map((r) => ({ room: r, ...summarize(all.filter((s) => (s.classroom || 'ไม่ระบุห้อง') === r)) })), [rooms, all]);

  if (!data) {
    return (
      <div className="adash__loading" role="status">
        {error ? (
          <>
            <p className="agate__err">
              <AlertCircle size={16} aria-hidden="true" /> {error}
            </p>
            <button type="button" className="qbtn qbtn--soft" onClick={onRefresh}>
              ลองอีกครั้ง
            </button>
          </>
        ) : (
          <>
            <span className="auth-loading__spinner" aria-hidden="true" /> กำลังโหลดข้อมูลนักเรียน…
          </>
        )}
      </div>
    );
  }

  return (
    <div className="adash">
      <header className="adash__head">
        <div>
          <span className="agate__tag">
            <ShieldCheck size={14} aria-hidden="true" /> มุม Admin
          </span>
          <h1>ภาพรวมทั้งห้อง</h1>
          <p>
            อัปเดตล่าสุด {data.time} · {data.local ? 'ข้อมูลจากเครื่องนี้' : 'ข้อมูลจาก Google Sheet'}
          </p>
        </div>
        <div className="adash__tools">
          <label className="adash__room">
            <span className="sr-only">เลือกห้อง</span>
            <select value={room} onChange={(e) => setRoom(e.target.value)}>
              <option value="all">ทุกห้อง ({all.length} คน)</option>
              {rooms.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="qbtn qbtn--soft qbtn--sm" onClick={onRefresh} disabled={busy}>
            <RefreshCw size={15} aria-hidden="true" className={busy ? 'spin' : ''} /> รีเฟรช
          </button>
          {data.sheetUrl && (
            <a className="qbtn qbtn--ghost qbtn--sm" href={data.sheetUrl} target="_blank" rel="noreferrer">
              <Sheet size={15} aria-hidden="true" /> เปิดชีต <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          )}
          <button type="button" className="qbtn qbtn--ghost qbtn--sm" onClick={onSignOut}>
            <LogOut size={15} aria-hidden="true" /> ออก
          </button>
        </div>
      </header>

      {error && (
        <p className="agate__err" role="alert">
          <AlertCircle size={16} aria-hidden="true" /> {error}
        </p>
      )}

      {data.local && (
        <p className="anote" role="note">
          <AlertCircle size={16} aria-hidden="true" />
          ตอนนี้แสดงเฉพาะนักเรียนที่สมัคร/เรียนบนเบราว์เซอร์เครื่องนี้ เมื่อเชื่อมต่อ Google Sheet แล้วจะเห็นข้อมูลนักเรียนทุกเครื่อง
        </p>
      )}

      {!list.length ? (
        <div className="adash__empty">
          <Robot size={110} mood="think" />
          <p>{data.local ? 'ยังไม่มีนักเรียนใช้งานบนเครื่องนี้' : 'ยังไม่มีนักเรียนสมัครเข้าใช้งาน'}</p>
        </div>
      ) : (
        <>
          {/* ตัวเลขหลัก */}
          <section className="atiles" aria-label="ตัวเลขสรุป">
            <Tile icon={Users} tone="blue" label="นักเรียนทั้งหมด" value={st.n} unit="คน" note={`เข้าใช้ใน 7 วัน ${st.active7} คน`} />
            <Tile icon={ClipboardCheck} tone="sky" label="เฉลี่ยก่อนเรียน" value={fmt(st.preAvg)} unit="/10" note={`ทำแล้ว ${st.preN} คน`} />
            <Tile icon={GraduationCap} tone="lav" label="เฉลี่ยหลังเรียน" value={fmt(st.postAvg)} unit="/10" note={`ทำแล้ว ${st.postN} คน`} />
            <Tile
              icon={TrendingUp}
              tone="good"
              label="พัฒนาการเฉลี่ย"
              value={st.gainAvg === null ? '–' : `${st.gainAvg >= 0 ? '+' : ''}${fmt(st.gainAvg)}`}
              unit="คะแนน"
              note={`จาก ${st.bothN} คนที่ทำครบ 2 ครั้ง`}
            />
            <Tile icon={Trophy} tone="gold" label="เรียนครบทุกขั้น" value={pct(st.steps[4].length, st.n)} unit="%" note={`${st.steps[4].length} จาก ${st.n} คน`} />
          </section>

          <div className="agrid">
            {/* ขั้นตอนปัจจุบัน */}
            <section className="qpanel apanel" aria-labelledby="a-steps">
              <h2 id="a-steps">นักเรียนอยู่ขั้นไหนบ้าง</h2>
              <p className="apanel__sub">แตะแต่ละแถวเพื่อดูรายชื่อ</p>
              <ul className="afunnel">
                {STEPS.map((s, i) => {
                  const people = st.steps[i];
                  const Icon = s.icon;
                  const open = openStep === i;
                  return (
                    <li key={s.short}>
                      <button
                        type="button"
                        className={`afunnel__row ${open ? 'is-open' : ''}`}
                        aria-expanded={open}
                        onClick={() => setOpenStep(open ? null : i)}
                        disabled={!people.length}
                      >
                        <span className={`afunnel__ic afunnel__ic--${i}`}>
                          <Icon size={16} aria-hidden="true" />
                        </span>
                        <span className="afunnel__label">{s.label}</span>
                        <span className="afunnel__bar" aria-hidden="true">
                          <i style={{ width: `${pct(people.length, st.n)}%` }} />
                        </span>
                        <b className="afunnel__n">{people.length} คน</b>
                      </button>
                      {open && (
                        <ul className="afunnel__names">
                          {people.map((p) => (
                            <li key={p.uid} title={p.email}>
                              {fullName(p)}
                              {p.studentId && <small> เลขที่ {p.studentId}</small>}
                              {room === 'all' && p.classroom && <small> · {p.classroom}</small>}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* ก่อน vs หลัง */}
            <section className="qpanel apanel" aria-labelledby="a-score">
              <h2 id="a-score">คะแนนก่อน–หลังเรียน</h2>
              <p className="apanel__sub">จำนวนนักเรียนในแต่ละช่วงคะแนน (เต็ม 10)</p>
              <div className="alegend" aria-hidden="true">
                <span>
                  <i className="sw sw--pre" /> ก่อนเรียน
                </span>
                <span>
                  <i className="sw sw--post" /> หลังเรียน
                </span>
              </div>
              <ScoreBands pre={st.preScores} post={st.postScores} />
            </section>

            {/* บทเรียน */}
            <section className="qpanel apanel" aria-labelledby="a-lessons">
              <h2 id="a-lessons">ผ่านบทเรียนแต่ละพาร์ท</h2>
              <ul className="ahbars">
                {units.map((u) => {
                  const n = list.filter((s) => s.progress.lessons?.[u.no]).length;
                  return (
                    <li key={u.no}>
                      <span className="ahbars__label">
                        <b>พาร์ท {u.no}</b> {u.short || u.title}
                      </span>
                      <span className="ahbars__bar" title={`${n} จาก ${st.n} คน`}>
                        <i style={{ width: `${pct(n, st.n)}%` }} />
                      </span>
                      <span className="ahbars__v">
                        {n}/{st.n}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* ภารกิจ */}
            <section className="qpanel apanel" aria-labelledby="a-missions">
              <h2 id="a-missions">ผลกิจกรรมภารกิจ</h2>
              <ul className="amissions">
                {missions.map((m) => {
                  const ms = list.map((s) => s.progress.missions?.[m.id] || {});
                  const tried = ms.filter((x) => x.attempts > 0);
                  const passed = ms.filter((x) => x.stars > 0);
                  const stars = avg(passed.map((x) => x.stars));
                  return (
                    <li key={m.id}>
                      <div className="amissions__top">
                        <b>
                          ภารกิจ {m.no} · {m.title}
                        </b>
                        <span>{pct(passed.length, st.n)}% ผ่าน</span>
                      </div>
                      <span className="ahbars__bar ahbars__bar--wide">
                        <i style={{ width: `${pct(passed.length, st.n)}%` }} />
                      </span>
                      <small>
                        ผ่าน {passed.length} · ลองแล้วยังไม่ผ่าน {tried.length - passed.length} · ดาวเฉลี่ย {fmt(stars)} · ตอบถูกเฉลี่ย{' '}
                        {fmt(avg(tried.map((x) => x.best || 0)), 0)}%
                      </small>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          {/* แยกตามห้อง */}
          {rooms.length > 1 && room === 'all' && (
            <section className="qpanel apanel" aria-labelledby="a-rooms">
              <h2 id="a-rooms">เปรียบเทียบแต่ละห้อง</h2>
              <div className="atable-wrap">
                <table className="atable">
                  <thead>
                    <tr>
                      <th scope="col">ห้อง</th>
                      <th scope="col">นักเรียน</th>
                      <th scope="col">ก่อนเรียน</th>
                      <th scope="col">หลังเรียน</th>
                      <th scope="col">พัฒนาการ</th>
                      <th scope="col">ผ่านภารกิจแรก</th>
                      <th scope="col">ครบทุกขั้น</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byRoom.map((r) => (
                      <tr key={r.room}>
                        <th scope="row">{r.room}</th>
                        <td>{r.n}</td>
                        <td>{fmt(r.preAvg)}</td>
                        <td>{fmt(r.postAvg)}</td>
                        <td className={r.gainAvg > 0 ? 'is-up' : ''}>{r.gainAvg === null ? '–' : `${r.gainAvg >= 0 ? '+' : ''}${fmt(r.gainAvg)}`}</td>
                        <td>{pct(r.practiceN, r.n)}%</td>
                        <td>{pct(r.steps[4].length, r.n)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function Tile({ icon: Icon, tone, label, value, unit, note }) {
  return (
    <div className={`atile atile--${tone}`}>
      <span className="atile__ic">
        <Icon size={18} aria-hidden="true" />
      </span>
      <span className="atile__label">{label}</span>
      <span className="atile__value">
        {value}
        <small>{unit}</small>
      </span>
      <span className="atile__note">{note}</span>
    </div>
  );
}

const BANDS = [
  [0, 3, '0–3'],
  [4, 5, '4–5'],
  [6, 7, '6–7'],
  [8, 10, '8–10']
];

/** แท่งคู่ ก่อน/หลัง ต่อช่วงคะแนน */
function ScoreBands({ pre, post }) {
  const count = (xs) => BANDS.map(([a, b]) => xs.filter((x) => x >= a && x <= b).length);
  const p1 = count(pre);
  const p2 = count(post);
  const max = Math.max(1, ...p1, ...p2);
  return (
    <div className="abands" role="table" aria-label="จำนวนนักเรียนตามช่วงคะแนน">
      {BANDS.map(([, , label], i) => (
        <div className="abands__col" role="row" key={label}>
          <div className="abands__bars">
            <span className="abands__bar abands__bar--pre" style={{ height: `${(p1[i] / max) * 100}%` }} title={`ก่อนเรียน ${p1[i]} คน`} role="cell">
              <em>{p1[i]}</em>
            </span>
            <span className="abands__bar abands__bar--post" style={{ height: `${(p2[i] / max) * 100}%` }} title={`หลังเรียน ${p2[i]} คน`} role="cell">
              <em>{p2[i]}</em>
            </span>
          </div>
          <span className="abands__label" role="rowheader">
            {label} คะแนน
          </span>
        </div>
      ))}
    </div>
  );
}

function summarize(list) {
  const steps = [[], [], [], [], []];
  const preScores = [];
  const postScores = [];
  const gains = [];
  let practiceN = 0;
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  let active7 = 0;
  list.forEach((s) => {
    const r = s.results || {};
    const p = { xp: 0, lessons: {}, missions: {}, ...s.progress };
    steps[journey(p, r).current].push(s);
    if (r.pretest) preScores.push(Number(r.pretest.score) || 0);
    if (r.posttest) postScores.push(Number(r.posttest.score) || 0);
    if (r.pretest && r.posttest) gains.push((Number(r.posttest.score) || 0) - (Number(r.pretest.score) || 0));
    if ((p.missions.coffee?.stars || 0) > 0) practiceN += 1;
    if (dayOf(s.lastSeen) >= weekAgo) active7 += 1;
  });
  steps.forEach((g) => g.sort((a, b) => String(a.studentId).localeCompare(String(b.studentId), 'th', { numeric: true })));
  return {
    n: list.length,
    steps,
    preScores,
    postScores,
    preN: preScores.length,
    postN: postScores.length,
    bothN: gains.length,
    preAvg: avg(preScores),
    postAvg: avg(postScores),
    gainAvg: avg(gains),
    practiceN,
    active7
  };
}
