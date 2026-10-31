import { Info } from 'lucide-react';

/** แจ้งว่าบัญชีเก็บไว้ในเบราว์เซอร์เครื่องนี้ */
export default function DemoNotice({ children }) {
  return (
    <p className="auth-alert auth-alert--info" role="note">
      <Info size={18} aria-hidden="true" />
      <span>{children || 'บัญชีและคะแนนจะบันทึกไว้ในเบราว์เซอร์ของเครื่องนี้ ควรใช้เครื่องเดิมทุกครั้งที่เข้าเรียน'}</span>
    </p>
  );
}
