import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Check, X } from 'lucide-react';
import { optionLetters } from '../../data/quizzes';

/**
 * หน้าต่างคำถามกลางจอ (แสดงหลังคีบแคปซูลได้)
 * @param {object} question   ข้อสอบ { question, options, answer, explanation }
 * @param {number} number     ลำดับข้อที่กำลังตอบ
 * @param {number} total      จำนวนข้อทั้งหมด
 * @param {number|null} chosen  ตัวเลือกที่ผู้เรียนตอบแล้ว (null = ยังไม่ตอบ)
 * @param {(i:number) => void} onAnswer
 * @param {() => void} onNext
 * @param {boolean} isLast    เป็นข้อสุดท้ายหรือไม่
 */
export default function QuestionModal({ question, number, total, chosen, onAnswer, onNext, isLast }) {
  const firstRef = useRef(null);
  const nextRef = useRef(null);
  const answered = chosen !== null;
  const correct = answered && chosen === question.answer;

  // ล็อกการเลื่อนหน้าขณะเปิดหน้าต่างคำถาม
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (answered) nextRef.current?.focus();
    else firstRef.current?.focus();
  }, [answered]);

  // แสดงผ่าน portal ที่ <body> เพื่อให้อยู่เหนือ Navbar เสมอ
  return createPortal(
    <div className="qmodal" role="dialog" aria-modal="true" aria-labelledby="qmodal-title">
      <div className="qmodal__card">
        <div className="qmodal__head">
          <span className="qmodal__count">
            คำถามข้อที่ {number} จาก {total}
          </span>
          <div className="qmodal__bar" aria-hidden="true">
            <span style={{ width: `${(number / total) * 100}%` }} />
          </div>
        </div>

        <h2 id="qmodal-title" className="qmodal__question">
          {question.question}
        </h2>

        <div className="qmodal__options">
          {question.options.map((opt, i) => {
            const isAnswer = answered && i === question.answer;
            const isWrong = answered && i === chosen && !correct;
            const state = !answered ? '' : isAnswer ? 'is-answer' : isWrong ? 'is-wrong' : 'is-dim';
            return (
              <button
                key={i}
                ref={i === 0 ? firstRef : undefined}
                type="button"
                className={`qmodal__option ${state}`}
                onClick={() => onAnswer(i)}
                disabled={answered}
              >
                <span className="qmodal__letter">{optionLetters[i]}</span>
                <span className="qmodal__text">{opt}</span>
                {isAnswer && <Check className="qmodal__icon" size={20} strokeWidth={3} aria-label="คำตอบที่ถูก" />}
                {isWrong && <X className="qmodal__icon" size={20} strokeWidth={3} aria-label="คำตอบของคุณ" />}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className={`qmodal__feedback ${correct ? 'is-correct' : 'is-wrong'}`} role="status">
            <div className="qmodal__feedback-text">
              <strong>{correct ? 'ถูกต้อง' : 'ยังไม่ถูก'}</strong>
              <p>{question.explanation}</p>
            </div>
            <button type="button" ref={nextRef} className="qmodal__next" onClick={onNext}>
              {isLast ? 'ดูผลคะแนน' : 'คีบข้อต่อไป'}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
