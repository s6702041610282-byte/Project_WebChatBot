import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Hash, Lock, Mail, School, User, UserPlus } from 'lucide-react';
import AuthLayout, { Field } from '../components/AuthLayout';
import { useAuth } from '../contexts/AuthContext';
import { authErrorMessage } from '../services/authService';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** หน้าสมัครสมาชิก (นักเรียน) */
export default function Register() {
  const { isLoggedIn, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const goTo = location.state?.from || '/learn';

  const [form, setForm] = useState({ firstName: '', lastName: '', studentId: '', classroom: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const set = (key) => (e) => {
    setError('');
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  if (isLoggedIn) return <Navigate to={goTo} replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const data = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      studentId: form.studentId.trim(),
      classroom: form.classroom.trim()
    };
    if (!data.firstName) return setError('กรุณากรอกชื่อ');
    if (!data.lastName) return setError('กรุณากรอกนามสกุล');
    if (/\d/.test(data.firstName + data.lastName)) return setError('ชื่อและนามสกุลต้องไม่มีตัวเลข');
    if (!EMAIL_RE.test(data.email)) return setError('กรุณากรอกอีเมลให้ถูกต้อง');
    if (form.password.length < 6) return setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
    if (form.password !== form.confirm) return setError('ยืนยันรหัสผ่านไม่ตรงกัน');

    setBusy('email');
    try {
      await register({ ...data, password: form.password });
      navigate(goTo, { replace: true });
    } catch (err) {
      setError(authErrorMessage(err));
      setBusy('');
    }
  };


  return (
    <AuthLayout
      mode="register"
      title="สร้างบัญชีนักเรียน"
      subtitle="ใช้เวลาไม่ถึง 1 นาที แล้วเริ่มจากแบบทดสอบก่อนเรียนได้เลย"
      footer={
        <>
          มีบัญชีแล้ว?{' '}
          <Link to="/login" state={location.state}>
            เข้าสู่ระบบ
          </Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <div className="auth-form__row">
          <Field label="ชื่อ" icon={User} autoComplete="given-name" placeholder="เช่น สมใจ" value={form.firstName} onChange={set('firstName')} required />
          <Field label="นามสกุล" icon={User} autoComplete="family-name" placeholder="เช่น ใจดี" value={form.lastName} onChange={set('lastName')} required />
        </div>
        <div className="auth-form__row">
          <Field label="เลขที่" icon={Hash} inputMode="numeric" value={form.studentId} onChange={set('studentId')} />
          <Field label="ห้อง" icon={School} placeholder="เช่น ปวช.1/1" value={form.classroom} onChange={set('classroom')} />
        </div>
        <Field
          label="อีเมล"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={form.email}
          onChange={set('email')}
          required
        />
        <div className="auth-form__row">
          <Field
            label="รหัสผ่าน"
            icon={Lock}
            type="password"
            autoComplete="new-password"
            hint="อย่างน้อย 6 ตัวอักษร"
            value={form.password}
            onChange={set('password')}
            required
          />
          <Field
            label="ยืนยันรหัสผ่าน"
            icon={Lock}
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={set('confirm')}
            required
          />
        </div>

        {error && (
          <p className="auth-alert auth-alert--error" role="alert">
            <AlertCircle size={18} aria-hidden="true" /> {error}
          </p>
        )}

        <button type="submit" className="auth-submit" disabled={Boolean(busy)}>
          <UserPlus size={18} aria-hidden="true" />
          {busy === 'email' ? 'กำลังสร้างบัญชี…' : 'สมัครสมาชิก'}
        </button>
      </form>
    </AuthLayout>
  );
}
