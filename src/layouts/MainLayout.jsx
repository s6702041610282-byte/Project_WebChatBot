import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PreviewBar from '../components/PreviewBar';

/** โครงหน้าที่ใช้ร่วมกันทุกหน้า: Navbar + เนื้อหา + Footer */
export default function MainLayout() {
  const { pathname } = useLocation();

  // เลื่อนกลับขึ้นด้านบนทุกครั้งที่เปลี่ยนหน้า
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main" id="main-content">
        <Outlet />
      </main>
      <Footer />
      <PreviewBar />
    </div>
  );
}
