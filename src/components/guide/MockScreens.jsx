import Mascot from '../Mascot';

/**
 * หน้าจอจำลองของเว็บไซต์สำหรับหน้า "คู่มือ"
 * วาดบนพื้นที่ 1000 × 625 px (ตำแหน่งทุกชิ้นเป็นพิกเซลคงที่ เพื่อให้ทัวร์ซูมได้แม่นยำ)
 * ข้อมูลในหน้าจอเป็นข้อมูลสมมติเพื่อประกอบคำอธิบายเท่านั้น
 */

const box = (x, y, w, h, extra = {}) => ({ left: x, top: y, width: w, height: h, ...extra });

const MENU = ['หน้าหลัก', 'บทเรียน', 'กิจกรรม', 'แบบทดสอบ', 'สื่อสอน', 'คู่มือ'];
const ACTIVE = { home: 0, content: 1, worksheets: 2, quizzes: 3, claw: 3, exam: 3, result: 3, media: 4 };

function MockNav({ screen }) {
  return (
    <>
      <div className="gs-nav" style={box(0, 0, 1000, 58)} />
      <div className="gs-logo" style={box(24, 15, 170, 28)}>
        <i />
        ChatBot <b>Learning</b>
      </div>
      {MENU.map((m, i) => (
        <span key={m} className={`gs-menu ${ACTIVE[screen] === i ? 'is-active' : ''}`} style={box(478 + i * 84, 18, 78, 22)}>
          {m}
        </span>
      ))}
    </>
  );
}

function PageHead({ title, sub }) {
  return (
    <>
      <div className="gs-head" style={box(0, 58, 1000, 140)} />
      <span className="gs-crumb" style={box(48, 82, 200, 16)}>
        Home › {title}
      </span>
      <div className="gs-head__icon" style={box(48, 108, 44, 44)} />
      <h3 className="gs-h1" style={box(104, 108, 400, 44)}>
        {title}
      </h3>
      <p className="gs-sub" style={box(48, 160, 500, 20)}>
        {sub}
      </p>
    </>
  );
}

function HomeScreen() {
  return (
    <>
      <div className="gs-hero-bg" style={box(0, 0, 1000, 395)} />
      <MockNav screen="home" />
      <span className="gs-pill" style={box(48, 92, 230, 28)}>
        ● ChatBot Design & Development
      </span>
      <h3 className="gs-hero-title" style={box(48, 132, 470, 130)}>
        การออกแบบและสร้าง
        <br />
        <b>ChatBot</b>
      </h3>
      <p className="gs-sub" style={box(48, 262, 430, 24)}>
        เรียนรู้ทีละขั้นตอน จากแนวคิดสู่การออกแบบ
      </p>
      <div className="gs-actions" style={box(48, 300, 316, 56)}>
        <span className="gs-link">◎ สำรวจบทเรียน</span>
        <span className="gs-btn">เริ่มเรียนรู้</span>
      </div>
      <div className="gs-mascot" style={box(640, 70, 260, 300)}>
        <Mascot size={210} followCursor={false} headset holdBubble />
      </div>
      {['บทเรียน', 'กิจกรรม', 'แบบทดสอบ', 'สื่อสอน'].map((t, i) => (
        <div key={t} className="gs-card" style={box(48 + i * 230, 418, 212, 164)}>
          <span className="gs-card__icon" />
          <b>{t}</b>
          <i className="gs-line" />
          <i className="gs-line gs-line--short" />
        </div>
      ))}
    </>
  );
}

function QuizzesScreen() {
  return (
    <>
      <MockNav screen="quizzes" />
      <PageHead title="แบบทดสอบ" sub="เล่นเกมเพื่อวัดความเข้าใจ ทั้งก่อนเรียนและหลังเรียน" />
      <div className="gs-path" style={box(48, 160, 580, 34)}>
        <span className="is-on">1 แบบทดสอบก่อนเรียน</span>
        <span>2 เรียนใบเนื้อหา</span>
        <span>3 แบบทดสอบหลังเรียน</span>
      </div>
      <div className="gs-qcard" style={box(48, 228, 440, 300)}>
        <span className="gs-card__icon" />
        <b>แบบทดสอบก่อนเรียน</b>
        <small>เกมตู้คีบกาชาปอง · 10 ข้อ</small>
        <i className="gs-line" />
        <i className="gs-line gs-line--short" />
        <span className="gs-btn gs-btn--sm">เริ่มเล่น</span>
      </div>
      <div className="gs-qcard is-locked" style={box(512, 228, 440, 300)}>
        <span className="gs-card__icon" />
        <b>แบบทดสอบหลังเรียน</b>
        <small>ข้อสอบ 3 รูปแบบ · 10 ข้อ</small>
        <i className="gs-line" />
        <i className="gs-line gs-line--short" />
        <span className="gs-lock">🔒 ล็อกอยู่</span>
      </div>
    </>
  );
}

const CAPS = ['#ff8fab', '#7dd3fc', '#fde047', '#86efac', '#c4b5fd', '#fdba74'];

function ClawScreen() {
  return (
    <>
      <MockNav screen="claw" />
      <span className="gs-chip" style={box(48, 80, 110, 32)}>
        ข้อที่ 3/10
      </span>
      <span className="gs-chip gs-chip--ok" style={box(166, 80, 80, 32)}>
        ถูก 2
      </span>
      <div className="gs-arcade" style={box(300, 80, 400, 520)}>
        <div className="gs-arcade__marquee">GACHA QUIZ</div>
        <div className="gs-arcade__glass">
          <div className="gs-arcade__rail" />
          <div className="gs-arcade__claw" />
          <div className="gs-arcade__pile">
            {Array.from({ length: 15 }, (_, i) => (
              <i key={i} style={{ background: CAPS[(i * 5) % CAPS.length], '--r': i < 8 ? 0 : 1 }} />
            ))}
          </div>
        </div>
        <div className="gs-arcade__panel">
          <span className="gs-round" />
          <span className="gs-grab">คีบ!</span>
          <span className="gs-round" />
        </div>
      </div>
      <div className="gs-mascot gs-mascot--small" style={box(96, 360, 150, 210)}>
        <Mascot size={120} followCursor={false} headset />
      </div>
    </>
  );
}

function ContentScreen() {
  const units = ['ความหมาย', 'หลักการทำงาน', 'ประโยชน์', 'ขั้นตอนสร้าง', 'User Needs', 'เตรียม FAQ'];
  return (
    <>
      <MockNav screen="content" />
      <PageHead title="ใบเนื้อหา" sub="เนื้อหาบทเรียนเรื่องการออกแบบและสร้าง ChatBot" />
      {units.map((u, i) => (
        <div key={u} className="gs-unit" style={box(48 + i * 182, 230, 170, 200)}>
          <span className="gs-unit__no">หัวข้อ {i + 1}</span>
          <b>{u}</b>
          <i className="gs-line" />
          <i className="gs-line gs-line--short" />
          <span className="gs-unit__btn">อ่านเนื้อหา</span>
        </div>
      ))}
      <p className="gs-note" style={box(48, 452, 600, 20)}>
        ภาพตัวอย่าง · เนื้อหาอยู่ระหว่างจัดทำ
      </p>
    </>
  );
}

function WorksheetsScreen() {
  const rows = [
    ['ใบงานที่ 1 วิเคราะห์ ChatBot รอบตัว', 'ส่งแล้ว', 'done'],
    ['ใบงานที่ 2 วิเคราะห์วัตถุประสงค์', 'ส่งแล้ว', 'done'],
    ['ใบงานที่ 3 วิเคราะห์ User Needs', 'กำลังทำ', 'doing'],
    ['ใบงานที่ 4 ออกแบบ Conversation Flow', 'ยังไม่เริ่ม', ''],
    ['ใบงานที่ 5 ออกแบบ ChatBot ต้นแบบ', 'ยังไม่เริ่ม', '']
  ];
  return (
    <>
      <MockNav screen="worksheets" />
      <PageHead title="กิจกรรม" sub="ลงมือปฏิบัติ: ภารกิจสร้าง ChatBot" />
      {rows.map(([t, s, c], i) => (
        <div key={t} className="gs-row" style={box(48, 230 + i * 70, 904, 58)}>
          <span className="gs-row__no">{i + 1}</span>
          <b>{t}</b>
          <span className={`gs-status ${c ? `is-${c}` : ''}`}>{s}</span>
        </div>
      ))}
    </>
  );
}

function ExamScreen() {
  const opts = ['เครื่องคิดเลขบนโทรศัพท์', 'ระบบตอบแชทร้านค้าออนไลน์', 'โปรแกรมตัดต่อวิดีโอ', 'สัญญาณไฟจราจร'];
  return (
    <>
      <MockNav screen="exam" />
      <div className="gs-rail" style={box(48, 90, 152, 440)}>
        <b>ตอบแล้ว 3/10</b>
        <div className="gs-rail__grid">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className={i < 3 ? 'is-done' : i === 3 ? 'is-current' : ''}>
              {String(i + 1).padStart(2, '0')}
            </span>
          ))}
        </div>
        <span className="gs-btn gs-btn--sm">ส่งคำตอบ</span>
      </div>
      <span className="gs-ghost" style={box(770, 58, 200, 120)}>
        04
      </span>
      <div className="gs-paper" style={box(230, 100, 722, 430)}>
        <span className="gs-tag">ปรนัย</span>
        <b>ข้อใดเป็นตัวอย่างการใช้ ChatBot ในชีวิตประจำวัน</b>
        <div className="gs-opts">
          {opts.map((o, i) => (
            <span key={o} className={i === 1 ? 'is-selected' : ''}>
              <i>{'กขคง'[i]}</i>
              {o}
            </span>
          ))}
        </div>
      </div>
      <span className="gs-navbtn" style={box(230, 548, 140, 44)}>
        ← ข้อก่อนหน้า
      </span>
      <span className="gs-btn gs-btn--nav" style={box(812, 548, 140, 44)}>
        ข้อถัดไป →
      </span>
    </>
  );
}

function ResultScreen() {
  return (
    <>
      <MockNav screen="result" />
      <div className="gs-result" style={box(48, 80, 904, 220)}>
        <div className="gs-mascot gs-mascot--result">
          <Mascot size={120} followCursor={false} headset />
        </div>
        <div>
          <small>แบบทดสอบหลังเรียน</small>
          <b>เยี่ยมมาก!</b>
          <span className="gs-stars">★ ★ ★</span>
        </div>
        <div className="gs-ring" style={{ '--p': 80 }}>
          <span>
            8<small>/10</small>
          </span>
        </div>
      </div>
      <div className="gs-compare" style={box(48, 320, 904, 120)}>
        <b>พัฒนาการของฉัน</b>
        <div>
          <span>ก่อนเรียน</span>
          <i style={{ '--w': '40%' }} className="is-pre" />
          <em>4/10</em>
        </div>
        <div>
          <span>หลังเรียน</span>
          <i style={{ '--w': '80%' }} />
          <em>8/10</em>
        </div>
      </div>
      {[0, 1].map((i) => (
        <div key={i} className="gs-row gs-row--review" style={box(48, 460 + i * 66, 904, 54)}>
          <span className={`gs-row__no ${i ? 'is-bad' : 'is-good'}`}>{i ? '✕' : '✓'}</span>
          <i className="gs-line" />
        </div>
      ))}
    </>
  );
}

function MediaScreen() {
  const types = ['สไลด์', 'อินโฟกราฟิก', 'วิดีโอ', 'แผนภาพ', 'คู่มือ', 'แหล่งเรียนรู้'];
  return (
    <>
      <MockNav screen="media" />
      <PageHead title="สื่อสอน" sub="สื่อประกอบการเรียนการสอน" />
      <div className="gs-filters" style={box(48, 214, 640, 34)}>
        <span className="is-on">ทั้งหมด</span>
        {types.slice(0, 5).map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      {types.map((t, i) => (
        <div key={t} className="gs-media" style={box(48 + (i % 3) * 306, 268 + Math.floor(i / 3) * 166, 292, 150)}>
          <span className={`gs-media__cover gs-media__cover--${i}`} />
          <b>{t}</b>
        </div>
      ))}
    </>
  );
}

/** หน้าจอโปรแกรมแก้โค้ด (VS Code จำลอง) */
export const CODE_LINE = { top: 70, height: 30 };

function CodeScreen({ code }) {
  const [from, to] = code.highlight;
  return (
    <>
      <div className="gs-code" style={box(0, 0, 1000, 625)} />
      <div className="gs-code__bar" style={box(0, 0, 1000, 36)}>
        <i />
        <i />
        <i />
        <span>{code.file} — WebChatbot — Visual Studio Code</span>
      </div>
      <div className="gs-code__tree" style={box(0, 36, 210, 589)}>
        <b>WEBCHATBOT</b>
        {['public', 'src', '· components', '· data', '  quizzes.js', '· pages', '· styles', '  variables.css', 'index.html', 'package.json'].map((f) => (
          <span key={f} className={code.file.endsWith(f.trim()) ? 'is-open' : ''}>
            {f}
          </span>
        ))}
      </div>
      <div className="gs-code__tab" style={box(210, 36, 790, 30)}>
        <span>{code.file.split('/').pop()}</span>
      </div>
      {code.lines.map((line, i) => (
        <div
          key={i}
          className={`gs-code__line ${i >= from && i <= to ? 'is-hl' : ''}`}
          style={box(210, CODE_LINE.top + i * CODE_LINE.height, 790, CODE_LINE.height)}
        >
          <span className="gs-code__no">{i + 1}</span>
          <code>{line}</code>
        </div>
      ))}
    </>
  );
}

const SCREENS = {
  home: HomeScreen,
  quizzes: QuizzesScreen,
  claw: ClawScreen,
  content: ContentScreen,
  worksheets: WorksheetsScreen,
  exam: ExamScreen,
  result: ResultScreen,
  media: MediaScreen,
  code: CodeScreen
};

export const SCREEN_URL = {
  home: 'chatbot-learning/',
  quizzes: 'chatbot-learning/quizzes',
  claw: 'chatbot-learning/quizzes/pretest',
  content: 'chatbot-learning/content',
  worksheets: 'chatbot-learning/worksheets',
  exam: 'chatbot-learning/quizzes/posttest',
  result: 'chatbot-learning/quizzes/posttest',
  media: 'chatbot-learning/media',
  code: 'Visual Studio Code'
};

export default function MockScreen({ screen, code }) {
  const Screen = SCREENS[screen] || HomeScreen;
  return (
    <div className={`gs-screen gs-screen--${screen}`}>
      <Screen code={code} />
    </div>
  );
}
