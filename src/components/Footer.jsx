import { Link } from 'react-router-dom';
import Logo from './Logo';
import { learnerMenu, publicMenu } from '../data/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function Footer() {
  const year = new Date().getFullYear();
  const { isLoggedIn } = useAuth();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__about">
          <Link to="/" className="footer__brand" aria-label="ChatBot Learning หน้าแรก">
            <Logo light />
          </Link>
          <p>
            พื้นที่การเรียนรู้ออนไลน์สำหรับนักเรียนและนักศึกษา ในหัวข้อการออกแบบและสร้าง ChatBot
            ตั้งแต่แนวคิดพื้นฐาน การวิเคราะห์ความต้องการของผู้ใช้งาน ไปจนถึงการออกแบบบทสนทนา
          </p>
        </div>

        <nav className="footer__nav" aria-label="เมนูรายวิชา">
          <h2 className="footer__heading">รายวิชา</h2>
          <ul>
            {publicMenu.map(({ path, label }) => (
              <li key={path}>
                <Link to={path}>{label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="footer__nav" aria-label="เมนูการเรียน">
          <h2 className="footer__heading">การเรียน</h2>
          <ul>
            {learnerMenu
              .filter((m) => m.path !== '/guide')
              .map(({ path, label }) => (
                <li key={path}>
                  <Link to={path}>{label}</Link>
                </li>
              ))}
            {!isLoggedIn && (
              <li>
                <Link to="/login">เข้าสู่ระบบ</Link>
              </li>
            )}
            <li>
              <Link to="/admin">สำหรับครู (Admin)</Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <p>© {year} ChatBot Learning · สงวนลิขสิทธิ์ · สื่อประกอบการเรียนการสอนเรื่องการออกแบบและสร้าง ChatBot</p>
        </div>
      </div>
    </footer>
  );
}
