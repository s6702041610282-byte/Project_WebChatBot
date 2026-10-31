import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Profile from '../pages/Profile';

/** หน้าที่ต้องเข้าสู่ระบบก่อน — ถ้ายังไม่เข้าสู่ระบบจะพาไปหน้า Login แล้วกลับมาหน้าเดิมหลังเข้าสู่ระบบ */
export default function ProtectedRoute() {
  const { isLoggedIn, loading, needProfile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading" role="status">
        <span className="auth-loading__spinner" aria-hidden="true" />
        กำลังตรวจสอบการเข้าสู่ระบบ...
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // เข้าสู่ระบบครั้งแรก (เช่นด้วย Google) ต้องกรอกชื่อ–นามสกุลก่อนเข้าเรียน
  if (needProfile) return <Profile setup />;

  return <Outlet />;
}
