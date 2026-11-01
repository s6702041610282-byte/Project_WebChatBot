import { Link, useLocation } from 'react-router-dom';
import { Presentation, ShieldCheck, X } from 'lucide-react';
import { setPreview, usePreview } from '../utils/preview';

/** แถบแจ้งโหมดพรีเซนต์ (แสดงทุกหน้าขณะ Admin เปิดโหมดนี้) */
export default function PreviewBar() {
  const on = usePreview();
  const { pathname } = useLocation();
  if (!on) return null;
  return (
    <div className="pvbar" role="status">
      <span className="pvbar__tag">
        <Presentation size={15} aria-hidden="true" /> โหมดพรีเซนต์
      </span>
      <span className="pvbar__text">ปลดล็อกทุกหน้า · ไม่บันทึกข้อมูลขึ้นระบบ</span>
      <span className="pvbar__actions">
        {pathname !== '/admin' && (
          <Link to="/admin" className="pvbar__btn">
            <ShieldCheck size={14} aria-hidden="true" /> มุม Admin
          </Link>
        )}
        <button type="button" className="pvbar__btn pvbar__btn--off" onClick={() => setPreview(false)}>
          <X size={14} aria-hidden="true" /> ปิดโหมดพรีเซนต์
        </button>
      </span>
    </div>
  );
}
