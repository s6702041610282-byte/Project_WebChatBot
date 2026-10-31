import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, KeyRound, Lock, Mail, Send, ShieldCheck } from 'lucide-react';
import AuthLayout, { Field } from '../components/AuthLayout';
import { authErrorMessage, confirmPasswordReset, requestPasswordReset } from '../services/authService';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** ลืมรหัสผ่าน — ระบบส่งรหัสยืนยัน 6 หลักไปที่อีเมล แล้วตั้งรหัสผ่านใหม่ */
export default function ForgotPassword() {
  const [step, setStep] = useState('email'); // email | code | done
  const [form, setForm] = useState({ email: '', code: '', password: '', confirm: '' });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => {
    setStatus({ type: '', text: '' });
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const sendCode = async (e) => {
    e?.preventDefault();
    if (!EMAIL_RE.test(form.email.trim())) return setStatus({ type: 'error', text: 'กรุณากรอกอีเมลให้ถูกต้อง' });
    setBusy(true);
    try {
      await requestPasswordReset(form.email.trim());
      setStep('code');
      setStatus({ type: 'ok', text: `ส่งรหัสยืนยัน 6 หลักไปที่ ${form.email.trim()} แล้ว (ดูในกล่องจดหมายหรือจดหมายขยะ)` });
    } catch (err) {
      setStatus({ type: 'error', text: authErrorMessage(err) });
    }
    setBusy(false);
  };

  const confirm = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(form.code.trim())) return setStatus({ type: 'error', text: 'รหัสยืนยันเป็นตัวเลข 6 หลัก' });
    if (form.password.length < 6) return setStatus({ type: 'error', text: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' });
    if (form.password !== form.confirm) return setStatus({ type: 'error', text: 'ยืนยันรหัสผ่านไม่ตรงกัน' });
    setBusy(true);
    try {
      await confirmPasswordReset({ email: form.email.trim(), code: form.code.trim(), password: form.password });
      setStep('done');
      setStatus({ type: 'ok', text: 'ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว กลับไปเข้าสู่ระบบได้เลย' });
    } catch (err) {
      setStatus({ type: 'error', text: authErrorMessage(err) });
    }
    setBusy(false);
  };

  const alert = status.text && (
    <p className={`auth-alert auth-alert--${status.type === 'ok' ? 'ok' : 'error'}`} role={status.type === 'ok' ? 'status' : 'alert'}>
      {status.type === 'ok' ? <CheckCircle2 size={18} aria-hidden="true" /> : <AlertCircle size={18} aria-hidden="true" />}
      {status.text}
    </p>
  );

  return (
    <AuthLayout
      title="ลืมรหัสผ่าน?"
      subtitle={step === 'email' ? 'กรอกอีเมลที่ใช้สมัคร ระบบจะส่งรหัสยืนยันไปให้' : 'กรอกรหัสยืนยันจากอีเมล แล้วตั้งรหัสผ่านใหม่'}
      mode="forgot"
      footer={<Link to="/login">กลับไปหน้าเข้าสู่ระบบ</Link>}
    >
      <ol className="reset-steps" aria-label="ขั้นตอน">
        <li className={step === 'email' ? 'is-now' : 'is-done'}>1 ส่งรหัสไปที่อีเมล</li>
        <li className={step === 'code' ? 'is-now' : step === 'done' ? 'is-done' : ''}>2 ตั้งรหัสผ่านใหม่</li>
      </ol>

      {step === 'email' && (
        <form className="auth-form" onSubmit={sendCode} noValidate>
          <Field label="อีเมลที่ใช้สมัคร" icon={Mail} type="email" autoComplete="email" placeholder="name@example.com" value={form.email} onChange={set('email')} required />
          {alert}
          <button type="submit" className="auth-submit" disabled={busy}>
            <Send size={18} aria-hidden="true" />
            {busy ? 'กำลังส่งรหัส…' : 'ส่งรหัสยืนยัน'}
          </button>
        </form>
      )}

      {step === 'code' && (
        <form className="auth-form" onSubmit={confirm} noValidate>
          {alert}
          <Field
            label="รหัสยืนยัน 6 หลัก"
            icon={ShieldCheck}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="••••••"
            value={form.code}
            onChange={set('code')}
            required
          />
          <div className="auth-form__row">
            <Field label="รหัสผ่านใหม่" icon={Lock} type="password" autoComplete="new-password" hint="อย่างน้อย 6 ตัวอักษร" value={form.password} onChange={set('password')} required />
            <Field label="ยืนยันรหัสผ่าน" icon={Lock} type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} required />
          </div>
          <button type="submit" className="auth-submit" disabled={busy}>
            <KeyRound size={18} aria-hidden="true" />
            {busy ? 'กำลังบันทึก…' : 'ตั้งรหัสผ่านใหม่'}
          </button>
          <button type="button" className="auth-linkbtn" onClick={sendCode} disabled={busy}>
            ไม่ได้รับอีเมล? ส่งรหัสอีกครั้ง
          </button>
        </form>
      )}

      {step === 'done' && (
        <div className="auth-form">
          {alert}
          <Link to="/login" className="auth-submit">
            ไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}
