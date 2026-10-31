import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Eye,
  Flag,
  Keyboard,
  Layers,
  Lock,
  PencilLine,
  Sparkles,
  TrendingUp,
  Trophy
} from 'lucide-react';
import QuizScene3D from '../components/quiz/QuizScene3D';
import { quizOrder, quizzes } from '../data/quizzes';
import { getAllResults } from '../utils/quizStorage';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../utils/progress';
import { journey } from '../utils/journey';

const META = {
  pretest: { icon: Flag, step: 'ด่าน 1', tone: 'sky', tagline: 'วัดพื้นฐานก่อนเริ่มผจญภัย' },
  posttest: { icon: Trophy, step: 'ด่าน 4', tone: 'royal', tagline: 'ด่านสุดท้าย พิสูจน์พลังความรู้' }
};

const TIPS = [
  { icon: Layers, title: 'ทีละข้อ อ่านง่าย', text: 'ข้อสอบเป็นการ์ดทีละใบ ปัดหรือกดลูกศรเพื่อเปลี่ยนข้อ' },
  { icon: Keyboard, title: 'คีย์ลัดเร็วทันใจ', text: 'กดเลข 1–4 เลือกคำตอบ กด ← → เปลี่ยนข้อได้ทันที' },
  { icon: Sparkles, title: 'โจทย์หลายแบบ', text: 'มีทั้งเลือกตอบและเรียงลำดับขั้นตอน ไม่น่าเบื่อแน่นอน' },
  { icon: Eye, title: 'ดูเฉลยหลังส่ง', text: 'ส่งแล้วเห็นคะแนน เฉลยทุกข้อ และเทียบก่อน–หลังเรียน' }
];

/** วงแหวนคะแนน */
function ScoreRing({ score, total }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const p = total ? score / total : 0;
  return (
    <div className="qx-ring" role="img" aria-label={`ได้ ${score} จาก ${total} คะแนน`}>
      <svg viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} className="qx-ring__bg" />
        <circle cx="55" cy="55" r={r} className="qx-ring__fg" style={{ strokeDasharray: c, '--off': c * (1 - p), '--full': c }} />
      </svg>
      <span>
        <b>{score}</b>/{total}
      </span>
    </div>
  );
}

/** หน้าแบบทดสอบ: ก่อนเรียน (ด่าน 1) และหลังเรียน (ด่าน 4) */
export default function Quizzes() {
  const { user } = useAuth();
  const { progress } = useProgress(user?.uid);
  const results = getAllResults();
  const j = journey(progress, results);
  const pre = results.pretest;
  const post = results.posttest;
  const gain = pre && post ? post.score - pre.score : null;

  const next = !pre
    ? { to: '/quizzes/pretest', label: 'เริ่มแบบทดสอบก่อนเรียน', icon: ArrowRight }
    : !j.done.lessons
      ? { to: '/content', label: 'ไปเรียนบทเรียนต่อ', icon: BookOpen }
      : !j.done.practice
        ? { to: '/worksheets', label: 'ไปทำภารกิจ CED Coffee', icon: Flag }
        : { to: '/quizzes/posttest', label: post ? 'ดูผลแบบทดสอบหลังเรียน' : 'เริ่มแบบทดสอบหลังเรียน', icon: Trophy };
  const NextIcon = next.icon;

  const reqs = [
    { ok: j.done.pre, text: 'ทำแบบทดสอบก่อนเรียน' },
    { ok: j.done.lessons, text: `เรียนบทเรียนครบ 6 พาร์ท (${Math.min(j.read, 6)}/6)` },
    { ok: j.done.practice, text: 'ผ่านภารกิจ CED Coffee' }
  ];

  return (
    <div className="quest qx">
      <div className="qwrap">
        {/* ---------- HERO ---------- */}
        <section className="qx-hero" aria-labelledby="qx-title">
          <span className="qx-hero__bubble qx-hero__bubble--1" aria-hidden="true" />
          <span className="qx-hero__bubble qx-hero__bubble--2" aria-hidden="true" />
          <div className="qx-hero__text">
            <span className="qx-chip">
              <Sparkles size={14} aria-hidden="true" /> Chatbot Quest · แบบทดสอบ
            </span>
            <h1 id="qx-title">
              พร้อม<span>วัดพลังความรู้</span>
              <br />
              แล้วหรือยัง?
            </h1>
            <p>ทำแบบทดสอบก่อนเรียนเพื่อรู้จุดเริ่มต้น แล้วกลับมาทำหลังเรียนเพื่อดูว่าเราเก่งขึ้นแค่ไหน</p>

            <ul className="qx-stats">
              <li>
                <small>ก่อนเรียน</small>
                <b>{pre ? `${pre.score}/${pre.total}` : '–'}</b>
              </li>
              <li>
                <small>หลังเรียน</small>
                <b>{post ? `${post.score}/${post.total}` : '–'}</b>
              </li>
              <li className={gain > 0 ? 'is-up' : ''}>
                <small>พัฒนาการ</small>
                <b>{gain === null ? '–' : `${gain >= 0 ? '+' : ''}${gain}`}</b>
              </li>
            </ul>

            <Link to={next.to} className="qx-btn qx-btn--main">
              {next.label} <NextIcon size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className="qx-hero__stage">
            <QuizScene3D />
            <span className="qx-hero__hint">แตะเครื่องหมาย ? เพื่อหมุน</span>
          </div>
        </section>

        {/* ---------- การ์ดแบบทดสอบ ---------- */}
        <div className="qx-cards">
          {quizOrder.map((id, idx) => {
            const quiz = quizzes[id];
            const r = results[id];
            const m = META[id];
            const locked = id === 'posttest' && !j.can.posttest;
            const Icon = locked ? Lock : m.icon;
            return (
              <article key={id} className={`qx-card qx-card--${m.tone} ${locked ? 'is-locked' : ''}`} style={{ '--i': idx }}>
                <header className="qx-card__head">
                  <span className="qx-card__icon">
                    <Icon size={28} aria-hidden="true" />
                  </span>
                  <div>
                    <span className="qx-card__step">{m.step}</span>
                    <h2>{quiz.title}</h2>
                    <small>{m.tagline}</small>
                  </div>
                  {r ? (
                    <ScoreRing score={r.score} total={r.total} />
                  ) : (
                    <span className="qx-card__new">{locked ? 'ล็อกอยู่' : 'ยังไม่ได้ทำ'}</span>
                  )}
                </header>

                <div className="qx-card__body">
                  <p>{quiz.description}</p>
                  <ul className="qx-card__chips">
                    <li>
                      <PencilLine size={15} aria-hidden="true" /> {quiz.questions.length} ข้อ
                    </li>
                    <li>
                      <Clock size={15} aria-hidden="true" /> 5 นาที
                    </li>
                    {quiz.modeLabel && (
                      <li>
                        <Layers size={15} aria-hidden="true" /> {quiz.modeLabel}
                      </li>
                    )}
                  </ul>

                  {id === 'posttest' && (
                    <ul className="qx-req" aria-label="เงื่อนไขปลดล็อก">
                      {reqs.map((q) => (
                        <li key={q.text} className={q.ok ? 'is-ok' : ''}>
                          <span>{q.ok ? <Check size={14} aria-hidden="true" /> : <Lock size={12} aria-hidden="true" />}</span>
                          {q.text}
                        </li>
                      ))}
                    </ul>
                  )}

                  {r && (
                    <p className="qx-card__last">
                      ทำล่าสุด {new Date(r.finishedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}

                  {locked ? (
                    <span className="qx-btn qx-btn--locked">
                      <Lock size={16} aria-hidden="true" /> ทำเงื่อนไขให้ครบเพื่อปลดล็อก
                    </span>
                  ) : (
                    <Link to={`/quizzes/${id}`} className={`qx-btn ${r ? 'qx-btn--ghost' : 'qx-btn--main'}`}>
                      {r ? <Eye size={16} aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}
                      {r ? 'ดูผลและเฉลย' : 'เริ่มทำแบบทดสอบ (ทำได้ครั้งเดียว)'}
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* ---------- พัฒนาการ ---------- */}
        <section className="qx-growth" aria-labelledby="qx-growth-title">
          <div className="qx-growth__head">
            <span className="qx-growth__icon">
              <TrendingUp size={22} aria-hidden="true" />
            </span>
            <div>
              <h2 id="qx-growth-title">พัฒนาการของฉัน</h2>
              <p>{pre && post ? 'เทียบคะแนนก่อนเรียนกับหลังเรียน' : 'ทำแบบทดสอบให้ครบทั้ง 2 ครั้ง แล้วกราฟจะแสดงพัฒนาการที่นี่'}</p>
            </div>
            {gain !== null && (
              <span className={`qx-gain ${gain > 0 ? 'is-up' : ''}`}>
                {gain >= 0 ? '+' : ''}
                {gain} คะแนน
              </span>
            )}
          </div>
          <div className={`qx-bars ${pre && post ? '' : 'is-ghost'}`}>
            {[
              ['ก่อนเรียน', pre, 'pre'],
              ['หลังเรียน', post, 'post']
            ].map(([label, r, k]) => (
              <div key={k} className={`qx-bars__row qx-bars__row--${k}`}>
                <span>{label}</span>
                <div className="qx-bars__track">
                  <i className={r ? 'is-real' : ''} style={{ width: `${r ? (r.score / r.total) * 100 : 70}%` }} />
                </div>
                <b>{r ? `${r.score}/${r.total}` : '–'}</b>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- เคล็ดลับ ---------- */}
        <ul className="qx-tips" aria-label="วิธีทำแบบทดสอบ">
          {TIPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} style={{ '--i': i }}>
              <span>
                <Icon size={20} aria-hidden="true" />
              </span>
              <b>{title}</b>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
