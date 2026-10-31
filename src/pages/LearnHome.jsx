import { Suspense, lazy, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowDown, ArrowRight, BookOpen, Check, ClipboardCheck, Lock, Rocket, Trophy } from 'lucide-react';
import { missions } from '../data/missions';
import { lessons } from '../data/lessons';
import { useAuth } from '../contexts/AuthContext';
import { getAllResults } from '../utils/quizStorage';
import { XP_PER_LEVEL, courseProgress, levelOf, passedCount, useProgress } from '../utils/progress';
import { journey } from '../utils/journey';

const HeroBot3D = lazy(() => import('../components/quest/HeroBot3D'));

/** หน้าหลักหลังเข้าสู่ระบบ — Hero 3 มิติ · เส้นทางการเรียน 4 ขั้น · ลงมือปฏิบัติ */
export default function LearnHome() {
  const { user } = useAuth();
  const { hash } = useLocation();
  const { progress } = useProgress(user?.uid);
  const results = getAllResults();
  const j = journey(progress, results);

  const passed = passedCount(progress);
  const nextLesson = lessons.find((l) => !progress.lessons[l.no]);

  useEffect(() => {
    const id = (hash || '').replace('#', '');
    if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 150);
  }, [hash]);

  const cta = [
    { to: '/quizzes/pretest', label: 'เริ่มทำแบบทดสอบก่อนเรียน', note: 'ขั้นแรก: วัดพื้นฐาน 10 ข้อ ใช้เวลาประมาณ 5 นาที' },
    { to: '/content', label: `เรียนต่อ: พาร์ท ${nextLesson?.no || 1}`, note: `บทเรียน 6 พาร์ท · ผ่านแล้ว ${j.read}/6 พาร์ท` },
    { to: '/worksheets', label: 'ลงมือปฏิบัติ: สร้างแชตบอต', note: 'นำความรู้ไปสร้างบอทให้ร้าน CED Coffee' },
    { to: '/quizzes/posttest', label: 'ทำแบบทดสอบหลังเรียน', note: 'ขั้นสุดท้าย: วัดผลหลังเรียน 10 ข้อ' },
    { to: '/content', label: 'ทบทวนบทเรียน', note: 'เรียนครบทุกขั้นแล้ว เก่งมาก!' }
  ][j.current];

  const steps = [
    {
      icon: ClipboardCheck,
      title: 'แบบทดสอบก่อนเรียน',
      desc: 'วัดพื้นฐานความรู้ 10 ข้อ',
      done: j.done.pre,
      open: true,
      status: results.pretest ? `ได้ ${results.pretest.score}/${results.pretest.total} คะแนน` : 'เริ่มที่นี่',
      to: '/quizzes/pretest',
      lock: ''
    },
    {
      icon: BookOpen,
      title: 'บทเรียน 6 พาร์ท',
      desc: 'เรียนทีละพาร์ท พร้อมเช็กความเข้าใจ',
      done: j.done.lessons,
      open: j.can.lessons,
      status: `ผ่านแล้ว ${j.read}/6 พาร์ท`,
      pct: (j.read / 6) * 100,
      to: '/content',
      lock: 'ทำแบบทดสอบก่อนเรียนก่อน'
    },
    {
      icon: Rocket,
      title: 'ลงมือปฏิบัติ',
      desc: 'ออกแบบและสร้างบอทตามสถานการณ์',
      done: j.done.practice,
      open: j.can.practice,
      status: `ผ่านแล้ว ${passed}/${missions.length} ภารกิจ`,
      pct: (passed / missions.length) * 100,
      to: '/worksheets',
      lock: 'เรียนให้ครบ 6 พาร์ทก่อน'
    },
    {
      icon: Trophy,
      title: 'แบบทดสอบหลังเรียน',
      desc: 'วัดผลหลังเรียนและดูพัฒนาการ',
      done: j.done.post,
      open: j.can.posttest,
      status: results.posttest ? `ได้ ${results.posttest.score}/${results.posttest.total} คะแนน` : 'ขั้นสุดท้าย',
      to: '/quizzes/posttest',
      lock: 'ผ่านภารกิจ CED Coffee ก่อน'
    }
  ];

  return (
    <div className="quest">
      <div className="qwrap">
        {/* ---------- Hero 3 มิติ ---------- */}
        <section className="qhero" aria-labelledby="hero-title">
          <div className="qhero__text">
            <span className="qhero__eyebrow">CHATBOT QUEST · ปวช.1 · 60 นาที</span>
            <h1 id="hero-title">
              การออกแบบ
              <br />
              และสร้าง<span>แชตบอต</span>
            </h1>
            <p className="qhero__lead">
              เรียนรู้ว่าแชตบอตคืออะไร ทำงานอย่างไร แล้วลงมือออกแบบบอทให้ร้านค้า วิทยาลัย และโรงพยาบาลจริง ผ่านภารกิจแบบเกม
            </p>
            <div className="qhero__cta">
              <Link to={cta.to} className="qbtn qbtn--primary qbtn--lg">
                {cta.label} <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <a href="#journey" className="qbtn qbtn--ghost qbtn--lg">
                ดูเส้นทางการเรียน <ArrowDown size={18} aria-hidden="true" />
              </a>
            </div>
            <p className="qhero__note">{cta.note}</p>

            <dl className="qhero__stats">
              <div>
                <dt>เลเวล</dt>
                <dd>{levelOf(progress.xp)}</dd>
              </div>
              <div>
                <dt>XP</dt>
                <dd>
                  {progress.xp % XP_PER_LEVEL}/{XP_PER_LEVEL}
                </dd>
              </div>
              <div>
                <dt>ความคืบหน้า</dt>
                <dd>{courseProgress(progress)}%</dd>
              </div>
            </dl>
          </div>

          <div className="qhero__stage">
            <Suspense fallback={<div className="hero3d hero3d--loading" aria-hidden="true" />}>
              <HeroBot3D />
            </Suspense>
            <span className="qhero__hint">คลิกที่บิทเพื่อทักทาย</span>
          </div>
        </section>

        {/* ---------- เส้นทางการเรียน 4 ขั้น ---------- */}
        <section id="journey" className="journey" aria-labelledby="journey-title">
          <div className="sec-head">
            <h2 id="journey-title">เส้นทางการเรียน</h2>
            <p>ทำตามลำดับ ขั้นถัดไปจะปลดล็อกเมื่อทำขั้นก่อนหน้าเสร็จ</p>
          </div>
          <ol className="journey__list">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const state = s.done ? 'is-done' : i === j.current ? 'is-now' : s.open ? 'is-open' : 'is-locked';
              return (
                <li key={s.title} className={`jcard ${state}`}>
                  <div className="jcard__top">
                    <span className="jcard__icon">{s.done ? <Check size={22} aria-hidden="true" /> : s.open ? <Icon size={22} aria-hidden="true" /> : <Lock size={20} aria-hidden="true" />}</span>
                    <span className="jcard__no">ขั้นที่ {i + 1}</span>
                    {i === j.current && <span className="jcard__now">ทำขั้นนี้</span>}
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  {s.pct != null && (
                    <span className="qbar qbar--thin" aria-hidden="true">
                      <i style={{ width: `${s.pct}%` }} />
                    </span>
                  )}
                  <div className="jcard__foot">
                    <small>{s.open ? s.status : s.lock}</small>
                    {s.open && (
                      <Link to={s.to} className={`qbtn qbtn--sm ${i === j.current ? 'qbtn--primary' : 'qbtn--soft'}`}>
                        {s.done ? 'ทบทวน' : 'ไปเลย'} <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

      </div>
    </div>
  );
}
