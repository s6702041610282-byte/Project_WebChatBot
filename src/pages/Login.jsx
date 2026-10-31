import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, LogIn } from 'lucide-react';
import AuthLayout, { Field } from '../components/AuthLayout';
import { useAuth } from '../contexts/AuthContext';
import { authErrorMessage } from '../services/authService';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** หน้าเข้าสู่ระบบ — อีเมล/รหัสผ่าน */
export default function Login() {
  const { isLoggedIn, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const goTo = location.state?.from || '/learn';

  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(''); // '' | 'email' | 'google'
  const set = (key) => (e) => {
    setError('');
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  if (isLoggedIn) return <Navigate to={goTo} replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const email = form.email.trim();
    if (!EMAIL_RE.test(email)) return setError('กรุณากรอกอีเมลให้ถูกต้อง');
    if (!form.password) return setError('กรุณากรอกรหัสผ่าน');

    setBusy('email');
    try {
      await login(email, form.password, remember);
      navigate(goTo, { replace: true });
    } catch (err) {
      setError(authErrorMessage(err));
      setBusy('');
    }
  };

  return (
    <AuthLayout
      mode="login"
      title="เข้าสู่ระบบบัญชีของคุณ"
      subtitle="เรียนต่อจากที่ค้างไว้ คะแนนและความคืบหน้าบันทึกให้อัตโนมัติ"
      footer={
        <>
          ยังไม่มีบัญชี?{' '}
          <Link to="/register" state={location.state}>
            สร้างบัญชีใหม่
          </Link>
          <Link to="/admin" className="auth-admin-link">
            สำหรับครู · มุม Admin
          </Link>
        </>
      }
    >
      {location.state?.from && <p className="auth-alert auth-alert--lock">กรุณาเข้าสู่ระบบก่อนเข้าใช้งานหน้านี้</p>}

      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <Field label="อีเมล" type="email" autoComplete="email" placeholder="กรอกอีเมล" value={form.email} onChange={set('email')} required />
        <Field
          label="รหัสผ่าน"
          aside={
            <Link to="/forgot-password" className="field__aside">
              ลืมรหัสผ่าน?
            </Link>
          }
          type="password"
          autoComplete="current-password"
          placeholder="กรอกรหัสผ่าน"
          value={form.password}
          onChange={set('password')}
          required
        />
        <label className="auth-remember">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> จดจำฉันไว้ในเครื่องนี้
        </label>

        {error && (
          <p className="auth-alert auth-alert--error" role="alert">
            <AlertCircle size={18} aria-hidden="true" /> {error}
          </p>
        )}

        <button type="submit" className="auth-submit" disabled={Boolean(busy)}>
          <LogIn size={18} aria-hidden="true" />
          {busy === 'email' ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </AuthLayout>
  );
}
