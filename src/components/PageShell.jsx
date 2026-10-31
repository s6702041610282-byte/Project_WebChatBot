import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ChatBackdrop from './ChatBackdrop';

/**
 * โครงหน้ามาตรฐานสำหรับหน้าย่อย (ใบเนื้อหา ใบงาน แบบทดสอบ สื่อสอน)
 * - ส่วนหัวแสดงชื่อหน้า
 * - children คือพื้นที่เนื้อหาหลัก หากยังไม่มีเนื้อหาจะแสดงพื้นที่ว่างที่เตรียมไว้
 */
export default function PageShell({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="page">
      <section className="page-header">
        <ChatBackdrop variant="header" />
        <div className="container">
          <nav className="breadcrumb" aria-label="ตำแหน่งของหน้า">
            <Link to="/">Home</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">{title}</span>
          </nav>

          <div className="page-header__title-row">
            {Icon && (
              <span className="page-header__icon" aria-hidden="true">
                <Icon size={26} />
              </span>
            )}
            <h1 className="page-header__title">{title}</h1>
          </div>
          {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        </div>
      </section>

      <section className="page-body">
        <div className="container">
          {children ?? (
            <div className="page-empty">
              <p>พื้นที่นี้เตรียมไว้สำหรับเพิ่มเนื้อหาในขั้นตอนถัดไป</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
