import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import AuthArt from './AuthArt';

const SAY = { login: 'สวัสดี! ยินดีต้อนรับ', register: 'มาเป็นเพื่อนกันนะ!', forgot: 'ไม่เป็นไร ช่วยได้!', profile: 'อีกนิดเดียว!' };

/**
 * โครงหน้าเข้าสู่ระบบ / สมัครสมาชิก / ลืมรหัสผ่าน / ข้อมูลส่วนตัว
 * - ซ้าย: ฟอร์มพื้นขาว เรียบ อ่านง่าย
 * - ขวา: วงกลมใหญ่ น้องบอทลอย ลูกแก้วไอคอน และใบไม้ไหว (เคลื่อนไหวตลอด)
 */
export default function AuthLayout({ mode = 'login', title, subtitle, children, footer, back = true }) {
  const mood = mode === 'register' ? 'cheer' : mode === 'forgot' ? 'think' : mode === 'profile' ? 'love' : 'wave';
  return (
    <div className="auth">
      <div className="auth__bg" aria-hidden="true">
        <span className="auth__blob auth__blob--1" />
        <span className="auth__blob auth__blob--2" />
        <span className="auth__blob auth__blob--3" />
      </div>

      <div className="auth-shell">
        <main className="auth-main">
          <div className="auth-main__top">
            {back && (
              <Link to="/" className="auth-main__back">
                <ArrowLeft size={15} aria-hidden="true" /> หน้าแรก
              </Link>
            )}
          </div>

          <div className="auth-main__body">
            <h1 className="auth-main__title">{title}</h1>
            {subtitle && <p className="auth-main__sub">{subtitle}</p>}
            {children}
            {footer && <div className="auth-main__footer">{footer}</div>}
          </div>
        </main>

        <AuthArt mood={mood} bubble={SAY[mode] || SAY.login} />
      </div>
    </div>
  );
}

/** ช่องกรอกพร้อมป้ายชื่อ (ช่องรหัสผ่านมีปุ่มแสดง/ซ่อน) · aside = ลิงก์ด้านขวาของป้าย เช่น "ลืมรหัสผ่าน?" */
export function Field({ label, icon: Icon, hint, aside, type = 'text', ...props }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <label className="field">
      <span className="field__label">
        {label}
        {aside}
      </span>
      <span className="field__box">
        {Icon && <Icon size={18} aria-hidden="true" />}
        <input type={isPassword && show ? 'text' : type} {...props} />
        {isPassword && (
          <button
            type="button"
            className="field__eye"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </span>
      {hint && <small className="field__hint">{hint}</small>}
    </label>
  );
}

/** เส้นคั่น "หรือ" */
export function Divider({ children = 'หรือ' }) {
  return (
    <div className="auth-divider" role="separator">
      <span>{children}</span>
    </div>
  );
}
