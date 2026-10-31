import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Hash, LogOut, Save, School, User } from 'lucide-react';
import AuthLayout, { Field } from '../components/AuthLayout';
import { useAuth } from '../contexts/AuthContext';
import { authErrorMessage } from '../services/authService';

const NAME_RE = /^[^\d<>@#$%^&*=+{}[\]|\\/:;"]+$/;

/**
 * กรอก/แก้ไขข้อมูลส่วนตัว: ชื่อ นามสกุล เลขที่ ห้อง
 * - setup: แสดงอัตโนมัติหลังเข้าสู่ระบบครั้งแรก (เช่นเข้าด้วย Google) จนกว่าจะกรอกชื่อ–นามสกุล
 * - หน้า /profile: แก้ไขภายหลังได้
 */
export default function Profile({ setup = false }) {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const s = user?.suggest || {};
  const [form, setForm] = useState({
    firstName: user?.firstName || (setup ? s.firstName : '') || '',
    lastName: user?.lastName || (setup ? s.lastName : '') || '',
    studentId: user?.studentId || '',
    classroom: user?.classroom || ''
  });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => {
    setStatus({ type: '', text: '' });
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const data = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      studentId: form.studentId.trim(),
      classroom: form.classroom.trim()
    };
    if (!data.firstName) return setStatus({ type: 'error', text: 'กรุณากรอกชื่อ' });
    if (!data.lastName) return setStatus({ type: 'error', text: 'กรุณากรอกนามสกุล' });
    if (!NAME_RE.test(data.firstName) || !NAME_RE.test(data.lastName))
      return setStatus({ type: 'error', text: 'ชื่อและนามสกุลต้องเป็นตัวอักษร ไม่มีตัวเลขหรือสัญลักษณ์' });
    setBusy(true);
    try {
      await updateProfile(data);
      if (!setup) setStatus({ type: 'ok', text: 'บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว' });
    } catch (err) {
      setStatus({ type: 'error', text: authErrorMessage(err) });
    }
    setBusy(false);
  };

  const onLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <AuthLayout
      mode="profile"
      back={!setup}
      title={setup ? 'อีกนิดเดียว! บอกชื่อของเราหน่อย' : 'ข้อมูลส่วนตัว'}
      subtitle={
        setup
          ? 'ครูจะใช้ชื่อ–นามสกุลนี้บันทึกคะแนนและความคืบหน้าของเรา กรอกให้ตรงกับชื่อจริงนะ'
          : 'แก้ไขชื่อ นามสกุล เลขที่ และห้องเรียนได้ที่นี่'
      }
      footer={
        <button type="button" className="auth-linkbtn" onClick={onLogout}>
          <LogOut size={15} aria-hidden="true" /> {setup ? 'ไม่ใช่บัญชีนี้? ออกจากระบบ' : 'ออกจากระบบ'}
        </button>
      }
    >
      <div className="who">
        {user?.photoURL ? (
          <img src={user.photoURL} alt="" className="who__pic" referrerPolicy="no-referrer" />
        ) : (
          <span className="who__pic who__pic--letter" aria-hidden="true">
            {(user?.email || '?').charAt(0).toUpperCase()}
          </span>
        )}
        <span className="who__text">
          <small>บัญชีอีเมล</small>
          <b>{user?.email}</b>
        </span>
      </div>

      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <div className="auth-form__row">
          <Field label="ชื่อ" icon={User} autoComplete="given-name" placeholder="เช่น สมใจ" value={form.firstName} onChange={set('firstName')} required autoFocus={setup} />
          <Field label="นามสกุล" icon={User} autoComplete="family-name" placeholder="เช่น ใจดี" value={form.lastName} onChange={set('lastName')} required />
        </div>
        <div className="auth-form__row">
          <Field label="เลขที่" icon={Hash} inputMode="numeric" placeholder="เช่น 12" value={form.studentId} onChange={set('studentId')} />
          <Field label="ห้อง" icon={School} placeholder="เช่น ปวช.1/1" value={form.classroom} onChange={set('classroom')} />
        </div>

        {status.text && (
          <p className={`auth-alert auth-alert--${status.type === 'ok' ? 'ok' : 'error'}`} role={status.type === 'ok' ? 'status' : 'alert'}>
            {status.type === 'ok' ? <CheckCircle2 size={18} aria-hidden="true" /> : <AlertCircle size={18} aria-hidden="true" />}
            {status.text}
          </p>
        )}

        <button type="submit" className="auth-submit" disabled={busy}>
          <Save size={18} aria-hidden="true" />
          {busy ? 'กำลังบันทึก…' : setup ? 'บันทึกแล้วเริ่มเรียน' : 'บันทึกข้อมูล'}
        </button>
      </form>
    </AuthLayout>
  );
}
