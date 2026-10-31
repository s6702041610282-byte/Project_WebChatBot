# ChatBot Learning

เว็บไซต์ประกอบการเรียนการสอนหัวข้อ **“การออกแบบและสร้าง ChatBot”**
สร้างด้วย React + Vite, React Router DOM, CSS3 และ Lucide React

> **เวอร์ชันนี้ (0.1.0)** มีโครงสร้างเว็บไซต์ครบ 5 เมนู และออกแบบหน้า Home ฉบับสมบูรณ์
> หน้าใบเนื้อหา ใบงาน แบบทดสอบ และสื่อสอน มีเพียงโครงหน้า (Navbar, ชื่อหน้า, Footer) และพื้นที่ว่างสำหรับเพิ่มเนื้อหาในขั้นตอนถัดไป
> ยังไม่มีระบบล็อกอินและยังไม่เชื่อมต่อฐานข้อมูลหรือ API ใด ๆ

---

## สิ่งที่ต้องมีในเครื่อง

- [Node.js](https://nodejs.org/) เวอร์ชัน 18 ขึ้นไป (แนะนำ LTS)
- [Visual Studio Code](https://code.visualstudio.com/)

ตรวจสอบว่าติดตั้ง Node.js แล้วด้วยคำสั่ง

```bash
node -v
npm -v
```

## วิธีติดตั้งและเปิดใน VS Code

1. แตกไฟล์ `WebChatbot.zip` ไว้ในตำแหน่งที่ต้องการ
2. เปิด VS Code → เมนู **File → Open Folder…** → เลือกโฟลเดอร์ `WebChatbot`
3. เปิด Terminal ใน VS Code (**Terminal → New Terminal** หรือกด <kbd>Ctrl</kbd> + <kbd>`</kbd>)
4. ติดตั้งแพ็กเกจ (ทำครั้งแรกครั้งเดียว)

   ```bash
   npm install
   ```

5. รันเว็บไซต์ในโหมดพัฒนา

   ```bash
   npm run dev
   ```

   เบราว์เซอร์จะเปิด `http://localhost:5173` ให้อัตโนมัติ เมื่อแก้ไขโค้ดแล้วบันทึก หน้าเว็บจะอัปเดตทันที

### คำสั่งอื่น ๆ

| คำสั่ง | หน้าที่ |
| --- | --- |
| `npm run dev` | รันเว็บไซต์ในโหมดพัฒนา |
| `npm run build` | สร้างไฟล์สำหรับนำขึ้นเว็บจริงไว้ในโฟลเดอร์ `dist/` |
| `npm run preview` | เปิดดูผลลัพธ์จาก `npm run build` |

---

## โครงสร้างโปรเจกต์

```
WebChatbot/
├── public/
│   └── favicon.svg              ไอคอนเว็บไซต์
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           แถบเมนูด้านบน (รองรับมือถือ)
│   │   ├── Footer.jsx           ส่วนท้ายเว็บไซต์
│   │   ├── Logo.jsx             โลโก้ ChatBot Learning
│   │   ├── HeroIllustration.jsx ภาพประกอบหน้าต่างแชทในหน้า Home
│   │   └── PageShell.jsx        โครงหน้ามาตรฐานของหน้าย่อย
│   ├── data/
│   │   └── navigation.js        รายการเมนูหลักทั้ง 5 เมนู (ใช้ร่วมกันทุกที่)
│   ├── layouts/
│   │   └── MainLayout.jsx       Navbar + เนื้อหา + Footer
│   ├── pages/
│   │   ├── Home.jsx             หน้าแรก
│   │   ├── ContentSheets.jsx    ใบเนื้อหา (โครงว่าง)
│   │   ├── Worksheets.jsx       ใบงาน (โครงว่าง)
│   │   ├── Quizzes.jsx          แบบทดสอบ (หน้ารวมก่อน/หลังเรียน)
│   │   ├── QuizPlay.jsx         หน้าเล่นเกมตู้คีบกาชาปอง
│   │   ├── TeachingMedia.jsx    สื่อสอน (โครงว่าง)
│   │   └── NotFound.jsx         แสดงเมื่อพิมพ์ URL ผิดเท่านั้น
│   ├── styles/
│   │   ├── variables.css        สี ฟอนต์ ระยะห่าง เงา (แก้ธีมที่นี่)
│   │   ├── global.css           สไตล์พื้นฐาน ปุ่ม โลโก้
│   │   ├── navbar.css
│   │   ├── footer.css
│   │   ├── home.css
│   │   └── page.css             สไตล์หน้าย่อยและหน้า 404
│   ├── App.jsx                  กำหนดเส้นทาง (Routes)
│   └── main.jsx                 จุดเริ่มต้นของแอป
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## เส้นทางของแต่ละหน้า

| เมนู | URL | ไฟล์ |
| --- | --- | --- |
| Home | `/` | `src/pages/Home.jsx` |
| ใบเนื้อหา | `/content` | `src/pages/ContentSheets.jsx` |
| ใบงาน | `/worksheets` | `src/pages/Worksheets.jsx` |
| แบบทดสอบ | `/quizzes` | `src/pages/Quizzes.jsx` |
| สื่อสอน | `/media` | `src/pages/TeachingMedia.jsx` |
| คู่มือ | `/guide` | `src/pages/Guide.jsx` |

---

## การแก้ไขและพัฒนาต่อ

### เปลี่ยนชื่อเมนู คำอธิบาย หรือไอคอน
แก้ที่ `src/data/navigation.js` ไฟล์เดียว ระบบจะอัปเดตทั้ง Navbar, Footer และการ์ดหมวดหมู่ในหน้า Home
ไอคอนเลือกได้จาก [lucide.dev/icons](https://lucide.dev/icons)

### เปลี่ยนโทนสีหรือฟอนต์
แก้ตัวแปรใน `src/styles/variables.css` เช่น `--color-blue-500`, `--color-violet-500`, `--gradient-brand`, `--font-heading`

### แบบทดสอบ (เกมตู้คีบกาชาปอง)
- หน้า `/quizzes` รวมแบบทดสอบก่อนเรียนและหลังเรียน ส่วนหน้าเล่นอยู่ที่ `/quizzes/pretest` และ `/quizzes/posttest`
- แบบทดสอบหลังเรียนจะล็อกจนกว่าจะทำแบบทดสอบก่อนเรียนเสร็จ
- **ก่อนเรียน** = เกมตู้คีบกาชาปอง (`mode: 'claw'`), **หลังเรียน** = ข้อสอบทีละข้อ (`mode: 'exam'`) อยู่ที่ `src/components/quiz/ExamQuiz.jsx` และ `src/styles/exam.css`
- ข้อสอบหลังเรียนรองรับ 4 รูปแบบ กำหนดด้วย `type` ในแต่ละข้อ
  - `choice` ปรนัย 4 ตัวเลือก (`options`, `answer`)
  - `order` เรียงลำดับ — ใส่ `items` ตามลำดับที่ถูก ระบบสลับให้อัตโนมัติ
  - `classify` ปฏิบัติจำแนกประเภท — `categories` และ `items` ที่มี `answer` เป็น id ของประเภท
  - `flow` ปฏิบัติออกแบบบทสนทนา — `script` (บทพูด) และ `slots` (ตัวเลือกในแต่ละช่องพร้อม `answer`)
- การตรวจคะแนนทุกรูปแบบอยู่ที่ `src/utils/quizGrading.js` (ข้อละ 1 คะแนน ต้องถูกทั้งข้อ)
- **แก้ไขหรือเพิ่มข้อสอบ** ที่ `src/data/quizzes.js` แต่ละข้อมี `question`, `options` (4 ข้อ เรียง ก ข ค ง), `answer` (0 = ก … 3 = ง) และ `explanation`
- ตู้มีแคปซูล 20 ลูกเรียงเต็มพื้นตู้ (แก้จำนวนต่อแถวได้ที่ `pileSetup()` ใน `src/pages/QuizPlay.jsx`) คีบลูกไหนได้ ระบบจะสุ่มคำถามที่ยังไม่ได้ตอบขึ้นกลางจอ (`src/components/quiz/QuestionModal.jsx`) เล่นครบ 10 ข้อจบเกม
- ตัวเกมอยู่ที่ `src/components/quiz/ClawMachine.jsx` ส่วนหน้าตาอยู่ที่ `src/styles/quiz.css`
- ผลคะแนนตอนนี้บันทึกใน localStorage ของเบราว์เซอร์ (`src/utils/quizStorage.js`) จึงเห็นเฉพาะเครื่องที่เล่น หากต้องการให้ครูดูคะแนนนักเรียนทุกคน ต้องเชื่อมฐานข้อมูลเพิ่มในขั้นตอนถัดไป

### หน้าคู่มือ (`/guide`)
- ทัวร์แบบเลื่อนหน้าจอ เลือกบทบาท นักเรียน / ครูผู้สอน แล้วหน้าจอจำลองจะซูมไปยังส่วนที่กำลังอธิบาย
- แก้ข้อความแต่ละขั้น คำถามที่พบบ่อย และกรอบที่จะซูม (`target`) ได้ที่ `src/data/guideTours.js`
- หน้าจอจำลองอยู่ที่ `src/components/guide/MockScreens.jsx` ส่วนการซูมอยู่ที่ `src/components/guide/TourStage.jsx` และสไตล์อยู่ที่ `src/styles/guide.css`

### เพิ่มเนื้อหาในหน้าย่อย
แต่ละหน้าใช้ `<PageShell>` ถ้าไม่ส่งเนื้อหาเข้าไป จะแสดงพื้นที่ว่างที่เตรียมไว้ เมื่อต้องการเพิ่มเนื้อหา ให้ใส่ไว้ระหว่างแท็ก เช่น

```jsx
// src/pages/ContentSheets.jsx
export default function ContentSheets() {
  return (
    <PageShell title="ใบเนื้อหา" subtitle="..." icon={BookOpen}>
      {/* ใส่เนื้อหาที่นี่ */}
    </PageShell>
  );
}
```

### เพิ่มหน้าย่อยใหม่ (ไม่อยู่ในเมนูหลัก)
1. สร้างไฟล์ใน `src/pages/`
2. เพิ่ม `<Route path="/ชื่อเส้นทาง" element={<หน้าใหม่ />} />` ใน `src/App.jsx` (ภายใน `<Route element={<MainLayout />}>`)

---

## การนำขึ้นเว็บไซต์ (Deploy)

รัน `npm run build` แล้วนำโฟลเดอร์ `dist/` ไปวางบนบริการโฮสติ้ง เช่น Netlify, Vercel หรือ GitHub Pages
เว็บไซต์ใช้ `BrowserRouter` จึงต้องตั้งค่าให้ทุกเส้นทางชี้ไปที่ `index.html` (เช่น Netlify ใช้ไฟล์ `_redirects` ที่มีบรรทัด `/* /index.html 200`) มิฉะนั้นการรีเฟรชหน้าย่อยจะขึ้น 404

---

## ระบบเข้าสู่ระบบ

### โครงหน้าเว็บ
- **ก่อนเข้าสู่ระบบ:** Home · โครงสร้างรายวิชา · เกณฑ์ · คู่มือ · ปุ่มเข้าสู่ระบบ
- **หลังเข้าสู่ระบบ:** หน้าเรียน · ใบเนื้อหา · ใบงาน · แบบทดสอบ · สื่อสอน · คู่มือ · เมนูโปรไฟล์/ออกจากระบบ
- หน้าใบเนื้อหา ใบงาน แบบทดสอบ สื่อสอน และหน้าเรียน ต้องเข้าสู่ระบบก่อน

### บัญชีผู้ใช้จริง (เก็บบน Google Sheet)
- บัญชี ความคืบหน้า แบบร่างบอท และคะแนน เก็บบน Google Sheet ผ่าน Apps Script (`apps-script/Code.gs`)
  ออกจากระบบ/เปลี่ยนเครื่องแล้วเข้าด้วยบัญชีเดิม ข้อมูลยังอยู่ครบ
- สมัครด้วยอีเมล: กรอกชื่อ นามสกุล เลขที่ ห้อง อีเมล รหัสผ่าน (รหัสผ่านแฮชพร้อม salt ที่เซิร์ฟเวอร์)
- แก้ชื่อ นามสกุล เลขที่ ห้อง ภายหลังได้ที่ `/profile`
- ลืมรหัสผ่าน: ระบบส่งรหัสยืนยัน 6 หลักไปที่อีเมล (ใช้ MailApp ของบัญชีครู)
- ชีตระบบ `ระบบ_บัญชี` `ระบบ_เซสชัน` `ระบบ_ความคืบหน้า` — ห้ามแก้หัวตาราง

#### ติดตั้งระบบหลังบ้าน
1. เปิด Apps Script ของชีต → วางโค้ด `apps-script/Code.gs` แทนทั้งหมด
2. เลือกฟังก์ชัน `setup` → Run → อนุญาตสิทธิ์
3. Deploy → Manage deployments → ✏️ → Version: **New version** → Deploy (Execute as: Me · Anyone)

### มุม Admin ของครู (`/admin`)
- รหัสเริ่มต้น `123456` — เปลี่ยนได้ที่ `ADMIN_PASSWORD` ใน Code.gs แล้ว Deploy ใหม่
- ดูภาพรวมทั้งห้อง: คะแนนก่อน/หลังเรียน พัฒนาการ ขั้นตอนที่นักเรียนอยู่ บทเรียน และภารกิจ

### แก้ข้อมูลรายวิชา / เกณฑ์
ไฟล์ `src/data/course.js` (เกณฑ์ตอนนี้เป็น **ข้อมูลตัวอย่าง** — แก้ตัวเลขแล้วเปลี่ยน `isSample` เป็น `false`)
