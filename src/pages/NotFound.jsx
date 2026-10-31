import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

/** แสดงเฉพาะเมื่อพิมพ์ URL ที่ไม่มีอยู่จริง */
export default function NotFound() {
  return (
    <section className="not-found">
      <div className="container not-found__inner">
        <p className="not-found__code">404</p>
        <h1>ไม่พบหน้าที่คุณต้องการ</h1>
        <p>ที่อยู่ของหน้าอาจพิมพ์ไม่ถูกต้อง ลองกลับไปเริ่มที่หน้าแรก</p>
        <Link to="/" className="btn btn--primary">
          <Home size={18} aria-hidden="true" />
          กลับหน้า Home
        </Link>
      </div>
    </section>
  );
}
