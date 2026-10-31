import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, FileSpreadsheet, Flag, KeyRound, Play, PlayCircle, Webhook } from 'lucide-react';
import { media } from '../data/media';

const LEARN_ICONS = [KeyRound, FileSpreadsheet, Webhook];

function youtubeId(url = '') {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}

/** เครื่องเล่นวิดีโอ: แสดงภาพปกก่อน กดแล้วค่อยโหลด YouTube (หน้าเว็บเปิดเร็วขึ้น) */
function Player({ item }) {
  const id = youtubeId(item.url);
  const [play, setPlay] = useState(false);
  const [poster, setPoster] = useState(`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`);
  const fallback = () => setPoster((p) => (p.includes('maxres') ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : ''));
  if (!id) return null;
  return (
    <div className="mx-screen">
      <span className="mx-screen__glow" aria-hidden="true" />
      <div className="mx-frame">
        {play ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button type="button" className="mx-poster" onClick={() => setPlay(true)} aria-label={`เล่นวิดีโอ ${item.title}`}>
            {poster && (
              <img src={poster} alt="" loading="lazy" onLoad={(e) => e.currentTarget.naturalWidth < 200 && fallback()} onError={fallback} />
            )}
            <span className="mx-play">
              <Play size={38} aria-hidden="true" />
            </span>
            <span className="mx-poster__label">
              <PlayCircle size={14} aria-hidden="true" /> กดเพื่อเล่นวิดีโอ
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

/** สื่อสอน — คลิปวิดีโอ (แก้ลิงก์ได้ที่ src/data/media.js) */
export default function TeachingMedia() {
  return (
    <div className="quest qx">
      <div className="qwrap">
        {media.map((item, k) => (
          <div key={item.url || k}>
            <section className="mx-hero" aria-labelledby={`mx-title-${k}`}>
              <span className="mx-hero__deco mx-hero__deco--1" aria-hidden="true" />
              <span className="mx-hero__deco mx-hero__deco--2" aria-hidden="true" />
              <div className="mx-hero__top">
                <div>
                  <span className="qx-chip">
                    <PlayCircle size={14} aria-hidden="true" /> สื่อสอน · คลิปวิดีโอ
                  </span>
                  <h1 id={`mx-title-${k}`}>ดูคลิป แล้วไปสร้างบอทกัน</h1>
                  <p>คลิปสาธิตการสร้างแชตบอตตั้งแต่ต้นจนตอบได้จริง ดูประกอบบทเรียนก่อนลงมือทำภารกิจ</p>
                </div>
              </div>

              <div className="mx-player">
                <Player item={item} />
                <aside className="mx-info">
                  <span className="mx-info__tag">
                    <PlayCircle size={13} aria-hidden="true" /> YouTube
                  </span>
                  <h2>{item.title}</h2>
                  {item.channel && (
                    <div className="mx-info__by">
                      <span aria-hidden="true">{item.channel.charAt(0)}</span>
                      <div>
                        <b>{item.channel}</b>
                        <small>ผู้จัดทำคลิป</small>
                      </div>
                    </div>
                  )}
                  <p>{item.desc}</p>
                  <a href={item.url} target="_blank" rel="noreferrer" className="qx-btn qx-btn--ghost">
                    เปิดดูใน YouTube <ExternalLink size={15} aria-hidden="true" />
                  </a>
                </aside>
              </div>
            </section>

            {item.learn?.length > 0 && (
              <>
                <h2 className="mx-subhead">ในคลิปนี้จะได้เห็น</h2>
                <ul className="mx-learn">
                  {item.learn.map((l, i) => {
                    const Icon = LEARN_ICONS[i % LEARN_ICONS.length];
                    return (
                      <li key={l.title} style={{ '--i': i }}>
                        <span>
                          <Icon size={22} aria-hidden="true" />
                        </span>
                        <b>{l.title}</b>
                        <p>{l.text}</p>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        ))}

        <div className="mx-watch">
          <div>
            <b>ดูจบแล้ว ลองลงมือเองเลย!</b>
            <p>ไปที่หน้ากิจกรรม ออกแบบบอทให้ร้าน CED Coffee แล้วเปิดให้ลูกค้าทดลองคุย</p>
          </div>
          <Link to="/worksheets" className="qx-btn qx-btn--main">
            <Flag size={16} aria-hidden="true" /> ไปที่กิจกรรม
          </Link>
        </div>
      </div>
    </div>
  );
}
