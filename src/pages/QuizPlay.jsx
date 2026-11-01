import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, Clock, ListChecks, Lock, PencilLine, RotateCcw, ShieldCheck, Sparkles, X } from 'lucide-react';
import QuizDeck from '../components/quiz/QuizDeck';
import Robot from '../components/quest/art/Robot';
import { quizzes } from '../data/quizzes';
import { clearResult, getAllResults, getResult, saveResult } from '../utils/quizStorage';
import { describeAnswer, describeCorrect, isCorrect, scoreQuiz } from '../utils/quizGrading';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../utils/progress';
import { journey } from '../utils/journey';
import { logEvent } from '../services/sheetLogger';

const mmss = (s) => `${Math.floor(s / 60)} นาที ${s % 60} วินาที`;

/* ---------- ผลการทดสอบ + เฉลยทีละข้อ ---------- */
function Result({ quiz, answers, seconds, onRetake }) {
  const total = quiz.questions.length;
  const score = scoreQuiz(quiz, answers);
  const pct = Math.round((score / total) * 100);
  const pre = quiz.id === 'posttest' ? getResult('pretest') : null;
  const [open, setOpen] = useState(null);
  const verdict =
    pct >= 80 ? { mood: 'cheer', title: 'ยอดเยี่ยมมาก!' } : pct >= 50 ? { mood: 'happy', title: 'ทำได้ดี!' } : { mood: 'think', title: 'ไม่เป็นไร เริ่มต้นจากตรงนี้' };

  return (
    <div className="qz-result">
      <section className="qpanel qz-score">
        <Robot mood={verdict.mood} size={120} />
        <span className="qhero__eyebrow">{quiz.title}</span>
        <h1>{verdict.title}</h1>
        <div className="qz-score__row">
          <div className="ring ring--lg" style={{ '--p': pct, '--c': pct >= 80 ? '#2f9e44' : pct >= 50 ? '#3b5bdb' : '#f08c00' }}>
            <b>
              {score}/{total}
            </b>
            <small>คะแนน</small>
          </div>
          <dl>
            <div>
              <dt>ตอบถูก</dt>
              <dd>{pct}%</dd>
            </div>
            {seconds != null && (
              <div>
                <dt>ใช้เวลา</dt>
                <dd>{mmss(seconds)}</dd>
              </div>
            )}
            {pre && (
              <div>
                <dt>ก่อนเรียน</dt>
                <dd>
                  {pre.score}/{pre.total}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {pre && (
          <div className="qz-compare" aria-label="เปรียบเทียบคะแนนก่อนและหลังเรียน">
            {[
              ['ก่อนเรียน', pre.score, pre.total, 'is-pre'],
              ['หลังเรียน', score, total, 'is-post']
            ].map(([label, s, t, cls]) => (
              <div key={label} className={`qz-compare__row ${cls}`}>
                <span>{label}</span>
                <div className="qbar qbar--lg">
                  <i style={{ width: `${(s / t) * 100}%` }} />
                </div>
                <b>{s}</b>
              </div>
            ))}
            <p className="qz-compare__gain">
              {score > pre.score ? `พัฒนาขึ้น +${score - pre.score} คะแนน เก่งมาก!` : score === pre.score ? 'คะแนนเท่ากับก่อนเรียน ลองทบทวนบทเรียนอีกครั้งนะ' : 'คะแนนลดลงเล็กน้อย ลองทบทวนข้อที่พลาดแล้วทำใหม่'}
            </p>
          </div>
        )}

        <p className="qz-score__note">
          {quiz.id === 'pretest' ? 'แบบทดสอบก่อนเรียนไม่นำมาคิดคะแนน ใช้ดูพื้นฐานของตัวเอง — ต่อไปไปเรียนบทเรียนกันเลย' : 'บันทึกผลแล้ว ดูเฉลยและคำอธิบายแต่ละข้อได้ทางขวา'}
        </p>
        <div className="qz-score__actions">
          {quiz.id === 'pretest' ? (
            <Link to="/content" className="qbtn qbtn--primary qbtn--lg">
              <BookOpen size={18} aria-hidden="true" /> ไปเรียนบทเรียน
            </Link>
          ) : (
            <Link to="/learn" className="qbtn qbtn--primary qbtn--lg">
              กลับหน้าหลัก <ArrowRight size={18} aria-hidden="true" />
            </Link>
          )}
          {onRetake ? (
            <button type="button" className="qbtn qbtn--ghost qbtn--lg" onClick={onRetake}>
              <RotateCcw size={16} aria-hidden="true" /> ทำใหม่ (โหมดพรีเซนต์)
            </button>
          ) : (
            <Link to="/quizzes" className="qbtn qbtn--ghost qbtn--lg">
              <Lock size={16} aria-hidden="true" /> ส่งแล้ว ทำได้ครั้งเดียว
            </Link>
          )}
        </div>
      </section>

      <section className="qpanel qz-review" aria-labelledby="review-title">
        <div className="qpanel__head">
          <h2 id="review-title">
            <ListChecks size={18} aria-hidden="true" /> เฉลยทีละข้อ
          </h2>
          <span className="qpanel__meta">
            ถูก {score} · ผิด {total - score}
          </span>
        </div>
        <ol>
          {quiz.questions.map((q, k) => {
            const ok = isCorrect(q, answers[k]);
            const isOpen = open === k;
            return (
              <li key={q.id} className={ok ? 'is-good' : 'is-bad'}>
                <button type="button" className="qz-review__q" onClick={() => setOpen(isOpen ? null : k)} aria-expanded={isOpen}>
                  <span className="qz-review__mark">{ok ? <Check size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}</span>
                  <span className="qz-review__text">
                    <small>ข้อ {k + 1}</small>
                    {q.question}
                  </span>
                  <ChevronDown size={18} className="qz-review__chev" aria-hidden="true" />
                </button>
                {isOpen && (
                  <div className="qz-review__body">
                    <p>
                      <b>คำตอบของคุณ:</b> {describeAnswer(q, answers[k])}
                    </p>
                    {!ok && (
                      <p>
                        <b>คำตอบที่ถูก:</b> {describeCorrect(q)}
                      </p>
                    )}
                    {q.explanation && <p className="qz-review__exp">{q.explanation}</p>}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

/** หน้าทำแบบทดสอบ — /quizzes/:quizId */
export default function QuizPlay() {
  const { quizId } = useParams();
  const quiz = quizzes[quizId];
  const { user, isPreview: preview } = useAuth();
  const { progress } = useProgress(user?.uid);
  // ทำได้ครั้งเดียว: ถ้าเคยส่งแล้ว เปิดมาจะเห็นผลและเฉลยทันที
  const saved = quiz ? getResult(quiz.id) : null;
  const [stage, setStage] = useState(saved ? 'done' : 'intro');
  const [run, setRun] = useState(0);
  const [final, setFinal] = useState(saved ? { answers: saved.answers || [], seconds: saved.seconds ?? null } : { answers: [], seconds: null });

  if (!quiz) {
    return (
      <div className="quest">
        <div className="qwrap">
          <section className="qpanel gate">
            <h1>ไม่พบแบบทดสอบนี้</h1>
            <Link to="/quizzes" className="qbtn qbtn--primary">
              กลับหน้าแบบทดสอบ
            </Link>
          </section>
        </div>
      </div>
    );
  }

  const j = journey(progress, getAllResults());
  const locked = quiz.id === 'posttest' && !j.can.posttest;
  const total = quiz.questions.length;
  const kinds = [...new Set(quiz.questions.map((q) => (q.type === 'order' ? 'เรียงลำดับ' : 'ปรนัย 4 ตัวเลือก')))];

  const finish = (answers, seconds) => {
    const already = getResult(quiz.id);
    if (already) {
      // ส่งไปแล้ว (เช่นเปิดไว้หลายแท็บ) — ไม่บันทึกทับ แสดงผลเดิม
      setFinal({ answers: already.answers || [], seconds: already.seconds ?? null });
      setStage('done');
      return;
    }
    const score = scoreQuiz(quiz, answers);
    saveResult(quiz.id, { score, total, answers, seconds, finishedAt: new Date().toISOString() });
    logEvent('quiz', {
      quizId: quiz.id,
      quizTitle: quiz.title,
      score,
      total,
      percent: Math.round((score / total) * 100),
      seconds,
      perQuestion: quiz.questions.map((q, k) => (isCorrect(q, answers[k]) ? 1 : 0))
    });
    setFinal({ answers, seconds });
    setStage('done');
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="quest">
      <div className="qwrap">
        <nav className="qsub" aria-label="ตำแหน่งของหน้า">
          <Link to="/quizzes" className="qsub__back">
            <ArrowLeft size={15} aria-hidden="true" /> แบบทดสอบทั้งหมด
          </Link>
          {stage === 'play' && <span className="qz-title">{quiz.title}</span>}
        </nav>

        {locked && (
          <section className="qpanel gate">
            <Robot mood="think" size={120} />
            <h1>ยังทำแบบทดสอบหลังเรียนไม่ได้</h1>
            <p>
              {!j.done.pre ? 'ต้องทำแบบทดสอบก่อนเรียนให้เสร็จก่อน' : !j.done.lessons ? 'ต้องเรียนบทเรียนให้ครบ 6 พาร์ทก่อน' : 'ต้องผ่านภารกิจ CED Coffee ในหน้ากิจกรรมก่อน'} แล้วจะปลดล็อกอัตโนมัติ
            </p>
            <Link to={!j.done.pre ? '/quizzes/pretest' : !j.done.lessons ? '/content' : '/worksheets'} className="qbtn qbtn--primary">
              {!j.done.pre ? 'ไปทำแบบทดสอบก่อนเรียน' : !j.done.lessons ? 'ไปที่บทเรียน' : 'ไปที่กิจกรรม'} <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </section>
        )}

        {!locked && stage === 'intro' && (
          <section className="qpanel qz-intro">
            <div className="qz-intro__art" aria-hidden="true">
              <div className="qz-intro__cards">
                <span />
                <span />
                <span>
                  <b>ข้อ 1</b>
                  <i />
                  <i />
                  <i />
                </span>
              </div>
              <Robot mood="wave" size={130} />
            </div>
            <div className="qz-intro__body">
              <span className="qhero__eyebrow">{quiz.id === 'pretest' ? 'ขั้นที่ 1 · ก่อนเริ่มเรียน' : 'ขั้นที่ 4 · หลังเรียน'}</span>
              <h1>{quiz.title}</h1>
              <p>{quiz.description}</p>
              <ul className="qz-intro__meta">
                <li>
                  <PencilLine size={16} aria-hidden="true" /> {total} ข้อ · {kinds.join(' / ')}
                </li>
                <li>
                  <Clock size={16} aria-hidden="true" /> แนะนำ 5 นาที
                </li>
                <li>
                  <Sparkles size={16} aria-hidden="true" /> ทีละข้อ ย้อนไปแก้ได้ก่อนกดส่ง
                </li>
                <li className="qz-intro__once">
                  <ShieldCheck size={16} aria-hidden="true" /> ทำได้ครั้งเดียว ส่งแล้วแก้ไม่ได้
                </li>
              </ul>
              <ol className="qz-intro__how">
                <li>อ่านโจทย์ทีละข้อบนการ์ด แล้วเลือกคำตอบ</li>
                <li>กด “ข้อถัดไป” หรือปัดการ์ดเพื่อเลื่อนข้อ</li>
                <li>ตรวจให้ครบแล้วกด “ส่งคำตอบ” ดูคะแนนและเฉลย (ส่งได้ครั้งเดียว)</li>
              </ol>
              <button
                type="button"
                className="qbtn qbtn--primary qbtn--lg"
                onClick={() => {
                  setRun((r) => r + 1);
                  setStage('play');
                  window.scrollTo({ top: 0 });
                }}
              >
                เริ่มทำแบบทดสอบ <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </section>
        )}

        {!locked && stage === 'play' && <QuizDeck key={run} quiz={quiz} onFinish={finish} />}

        {!locked && stage === 'done' && (
          <Result
            quiz={quiz}
            answers={final.answers}
            seconds={final.seconds}
            onRetake={
              preview
                ? () => {
                    clearResult(quiz.id);
                    setFinal({ answers: [], seconds: null });
                    setStage('intro');
                    window.scrollTo({ top: 0 });
                  }
                : undefined
            }
          />
        )}

      </div>
    </div>
  );
}

