import { BookOpen, ClipboardList, Compass, Home, ListTree, MonitorPlay, PenLine, PieChart, Scale } from 'lucide-react';

/**
 * เมนูหน้าต้อนรับ (ก่อนเข้าสู่ระบบ)
 * หากต้องการเปลี่ยนชื่อเมนูหรือเส้นทาง แก้ที่ไฟล์นี้ไฟล์เดียว
 */
export const publicMenu = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/syllabus', label: 'โครงสร้างรายวิชา', icon: ListTree },
  { path: '/criteria', label: 'สัดส่วนเนื้อหา', icon: PieChart },
  { path: '/guide', label: 'คู่มือ', icon: Compass }
];

/** หมวดการเรียนรู้ 4 หมวด (ต้องเข้าสู่ระบบ) */
export const learningCategories = [
  {
    path: '/content',
    label: 'บทเรียน',
    icon: BookOpen,
    description: 'ศึกษาแนวคิด หลักการ และขั้นตอนการออกแบบ ChatBot แบ่งเป็น 6 หัวข้อตามแผนการสอน'
  },
  {
    path: '/worksheets',
    label: 'กิจกรรม',
    icon: PenLine,
    description: 'ลงมือปฏิบัติ: ภารกิจออกแบบและสร้าง ChatBot ตามสถานการณ์จริง'
  },
  {
    path: '/quizzes',
    label: 'แบบทดสอบ',
    icon: ClipboardList,
    description: 'วัดความเข้าใจของตนเองทั้งก่อนเรียนและหลังเรียน'
  },
  {
    path: '/media',
    label: 'สื่อสอน',
    icon: MonitorPlay,
    description: 'คลิปวิดีโอสาธิตการสร้าง ChatBot ตั้งแต่ต้นจนตอบได้จริง'
  }
];

/** เมนูหลังเข้าสู่ระบบ */
export const learnerMenu = [
  { path: '/learn', label: 'หน้าหลัก', icon: Home },
  ...learningCategories,
  { path: '/guide', label: 'คู่มือ', icon: Compass }
];
