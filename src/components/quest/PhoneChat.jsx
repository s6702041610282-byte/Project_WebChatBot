import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import Robot from './art/Robot';
import Person from './art/Person';

/**
 * หน้าจอโทรศัพท์จำลองแชต LINE OA
 * messages: [{ id, from: 'bot'|'user', text, who?, person?: {kind, seed, mood}, tag?, kind? }]
 */
export default function PhoneChat({ design, messages, typing, onSend, onMenu, readOnly, status }) {
  const [text, setText] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const submit = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || readOnly) return;
    onSend?.(t);
    setText('');
  };

  const buttons = design.menu.filter((b) => b.label.trim()).slice(0, 6);
  const botHead = <Robot head size={30} color={design.avatar} acc={design.acc} />;

  return (
    <div className="phone">
      <header className="phone__head">
        <span className="phone__avatar">
          <Robot head size={36} color={design.avatar} acc={design.acc} live />
        </span>
        <div className="phone__who">
          <b>{design.name.trim() || 'ชื่อบอทของคุณ'}</b>
          <small>
            <i className="phone__dot" /> {status || 'LINE Official Account · ออนไลน์'}
          </small>
        </div>
      </header>

      <div className="phone__body" ref={listRef} aria-live="polite">
        {messages.length === 0 && <p className="phone__empty">ยังไม่มีข้อความ — ตั้งข้อความต้อนรับ หรือพิมพ์ทดลองถามได้เลย</p>}
        {messages.map((m) => (
          <div key={m.id} className={`bubble-row bubble-row--${m.from}`}>
            {m.from === 'bot' ? (
              <span className="bubble-row__ava">{botHead}</span>
            ) : (
              m.person && (
                <span className="bubble-row__ava">
                  <Person kind={m.person.kind} seed={m.person.seed} mood={m.person.mood} size={30} />
                </span>
              )
            )}
            <div className={`bubble bubble--${m.from} ${m.kind ? `bubble--${m.kind}` : ''}`}>
              {m.who && <span className="bubble__who">{m.who}</span>}
              {m.tag && <span className="bubble__tag">{m.tag}</span>}
              {m.text || <em className="bubble__empty">(บอทไม่ตอบ…)</em>}
            </div>
          </div>
        ))}
        {typing && (
          <div className="bubble-row bubble-row--bot">
            <span className="bubble-row__ava">{botHead}</span>
            <div className="bubble bubble--bot bubble--typing" aria-label="บอทกำลังพิมพ์">
              <i />
              <i />
              <i />
            </div>
          </div>
        )}
      </div>

      {buttons.length > 0 && (
        <div className={`phone__menu ${buttons.length > 4 ? 'phone__menu--six' : ''}`} aria-label="Rich Menu">
          {buttons.map((b) => (
            <button key={b.id} type="button" disabled={readOnly} onClick={() => onMenu?.(b)}>
              {b.label}
            </button>
          ))}
        </div>
      )}

      <form className="phone__input" onSubmit={submit}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={readOnly ? 'กำลังให้บริการลูกค้า…' : 'พิมพ์คำถามเพื่อทดลอง…'}
          disabled={readOnly}
          aria-label="พิมพ์ข้อความทดสอบ"
        />
        <button type="submit" disabled={readOnly || !text.trim()} aria-label="ส่งข้อความ">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
