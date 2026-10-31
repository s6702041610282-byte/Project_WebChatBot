import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Check, RotateCcw, Star, TrendingUp, X } from 'lucide-react';
import Mascot from '../Mascot';
import { QUESTION_TYPES, describeAnswer, describeCorrect, isCorrect, scoreQuiz, typeOf } from '../../utils/quizGrading';
import { getResult } from '../../utils/quizStorage';

function resultMessage(percent) {
  if (percent >= 80) return { title: 'เยี่ยมมาก!', text: 'เข้าใจเนื้อหาได้ดีมาก พร้อมลุยต่อแล้ว' };
  if (percent >= 50) return { title: 'ทำได้ดี!', text: 'มีพื้นฐานที่ดี ทบทวนข้อที่พลาดอีกนิดจะยิ่งเก่งขึ้น' };
  return { title: 'เริ่มต้นได้ดี!', text: 'ไม่เป็นไรเลย ใบเนื้อหาจะช่วยให้เข้าใจมากขึ้นแน่นอน' };
}

/**
 * สรุปผลหลังทำแบบทดสอบครบทุกข้อ
 * @param {object}   quiz     ข้อมูลแบบทดสอบ
 * @param {number[]} answers  ลำดับตัวเลือกที่ผู้เรียนเลือกในแต่ละข้อ
 * @param {() => void} onRetry
 */
export default function QuizResult({ quiz, answers, onRetry }) {
  const total = quiz.questions.length;
  const score = scoreQuiz(quiz, answers);
  const percent = Math.round((score / total) * 100);
  const stars = percent >= 80 ? 3 : percent >= 50 ? 2 : 1;
  const msg = resultMessage(percent);
  const pre = quiz.id === 'posttest' ? getResult('pretest') : null;

  return (
    <div className="quiz-result">
      <section className="quiz-result__hero">
        <div className="quiz-result__mascot" aria-hidden="true">
          <Mascot size={150} headset />
        </div>

        <div className="quiz-result__summary">
          <p className="quiz-result__label">{quiz.title}</p>
          <h2 className="quiz-result__title">{msg.title}</h2>

          <div className="quiz-result__stars" aria-label={`ได้ ${stars} ดาว จาก 3 ดาว`}>
            {[1, 2, 3].map((n) => (
              <Star key={n} size={34} className={n <= stars ? 'is-on' : ''} aria-hidden="true" />
            ))}
          </div>

          <div className="score-ring" style={{ '--p': percent }}>
            <div className="score-ring__inner">
              <strong>
                {score}
                <span>/{total}</span>
              </strong>
              <small>{percent}%</small>
            </div>
          </div>

          <p className="quiz-result__text">{msg.text}</p>
        </div>
      </section>

      {pre && (
        <section className="quiz-compare" aria-label="เปรียบเทียบคะแนนก่อนเรียนและหลังเรียน">
          <h3>
            <TrendingUp size={20} aria-hidden="true" /> พัฒนาการของฉัน
          </h3>
          <div className="quiz-compare__bars">
            <div className="quiz-compare__row">
              <span>ก่อนเรียน</span>
              <div className="quiz-compare__track">
                <div className="quiz-compare__fill quiz-compare__fill--pre" style={{ width: `${(pre.score / pre.total) * 100}%` }} />
              </div>
              <b>
                {pre.score}/{pre.total}
              </b>
            </div>
            <div className="quiz-compare__row">
              <span>หลังเรียน</span>
              <div className="quiz-compare__track">
                <div className="quiz-compare__fill" style={{ width: `${percent}%` }} />
              </div>
              <b>
                {score}/{total}
              </b>
            </div>
          </div>
          <p className="quiz-compare__note">
            {score > pre.score
              ? `คะแนนเพิ่มขึ้น ${score - pre.score} คะแนน เก่งขึ้นมาก!`
              : score === pre.score
                ? 'คะแนนเท่ากับก่อนเรียน ลองทบทวนใบเนื้อหาอีกครั้งนะ'
                : 'คะแนนลดลงเล็กน้อย ลองทบทวนข้อที่พลาดแล้วทำใหม่อีกครั้ง'}
          </p>
        </section>
      )}

      <div className="quiz-result__actions">
        {quiz.id === 'pretest' ? (
          <Link to="/content" className="btn btn--cta">
            <BookOpen size={18} aria-hidden="true" />
            ไปเรียนบทเรียน
          </Link>
        ) : (
          <Link to="/quizzes" className="btn btn--cta">
            กลับหน้าแบบทดสอบ
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        )}
        <button type="button" className="btn btn--outline" onClick={onRetry}>
          <RotateCcw size={18} aria-hidden="true" />
          {quiz.mode === 'exam' ? 'ทำอีกครั้ง' : 'เล่นอีกครั้ง'}
        </button>
      </div>
      {quiz.id === 'pretest' && (
        <p className="quiz-result__unlock">แบบทดสอบหลังเรียนปลดล็อกแล้ว ทำได้เมื่อเรียนครบทุกหัวข้อและทำใบสั่งงานแล้ว</p>
      )}

      <section className="quiz-review">
        <h3>ทบทวนคำตอบ</h3>
        <ol>
          {quiz.questions.map((q, i) => {
            const ok = isCorrect(q, answers[i]);
            return (
              <li key={q.id} className={`quiz-review__item ${ok ? 'is-correct' : 'is-wrong'}`}>
                <span className="quiz-review__icon" aria-hidden="true">
                  {ok ? <Check size={16} /> : <X size={16} />}
                </span>
                <div>
                  <p className="quiz-review__q">
                    {i + 1}. {q.question}
                    {typeOf(q) !== 'choice' && <span className="quiz-review__type">{QUESTION_TYPES[typeOf(q)].label}</span>}
                  </p>
                  <p className="quiz-review__a">
                    คำตอบของคุณ: {describeAnswer(q, answers[i])}
                    {!ok && (
                      <>
                        <br />
                        คำตอบที่ถูก: {describeCorrect(q)}
                      </>
                    )}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
