/**
 * สื่อสอน — คลิปวิดีโอ YouTube
 * ใส่ลิงก์ YouTube แบบปกติ (https://www.youtube.com/watch?v=... หรือ https://youtu.be/...) ได้ที่ url
 * learn = สิ่งที่จะได้เห็นในคลิป (แสดงเป็นการ์ดใต้วิดีโอ)
 */
export const media = [
  {
    title: 'วิธีการสร้าง ChatBot',
    channel: 'NATDANAI LOARUENG',
    desc: 'สาธิตการสร้างแชตบอต LINE สำหรับร้านอาหาร ด้วย Google Apps Script ตอบกลับด้วยการค้นหาคำสำคัญ (Keyword) และดึงข้อมูลเมนูจาก Google Sheets โดยไม่ต้องใช้บริการ AI ที่มีค่าใช้จ่าย',
    url: 'https://www.youtube.com/watch?v=2r5nMyucKus',
    learn: [
      {
        title: 'แยกหมวดคำถามด้วยคำสำคัญ',
        text: 'ทักทาย อาหาร เครื่องดื่มและของหวาน ข้อมูลร้าน และข้อความสำรอง (Fallback) เมื่อบอทไม่เข้าใจ'
      },
      {
        title: 'ดึงข้อมูลจาก Google Sheets',
        text: 'เก็บเมนูและข้อมูลร้านไว้ในชีต แก้ข้อมูลในชีตได้เลย บอทตอบตามข้อมูลล่าสุด'
      },
      {
        title: 'เชื่อมกับ LINE ผ่าน Webhook',
        text: 'รับข้อความจาก LINE แล้วส่งคำตอบกลับอัตโนมัติด้วย Google Apps Script'
      }
    ]
  }
];
