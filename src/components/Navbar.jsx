import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Cloud, CloudOff, ListTree, LogIn, LogOut, Menu, Scale, Star, UserRound, X } from 'lucide-react';
import Logo from './Logo';
import { learnerMenu, publicMenu } from '../data/navigation';
import { useAuth } from '../contexts/AuthContext';
import { levelOf, useProgress } from '../utils/progress';
import { useSyncStatus } from '../services/cloudSync';

/** อักษรย่อสำหรับรูปโปรไฟล์ */
/** หน้าที่พื้นหลังสว่าง — ให้แถบเมนูทึบตั้งแต่ด้านบน */
const LIGHT_PAGES = ['/login', '/register', '/forgot-password', '/profile', '/admin', '/criteria', '/syllabus', '/learn', '/content', '/worksheets', '/media', '/quest', '/quizzes', '/guide'];
const isLight = (path) => LIGHT_PAGES.some((p) => path === p || path.startsWith(`${p}/`));
/** หน้าในเกม Chatbot Quest — แถบเมนูสีขาว */
const QUEST_PAGES = ['/login', '/register', '/forgot-password', '/profile', '/admin', '/learn', '/content', '/worksheets', '/media', '/quest', '/quizzes', '/guide'];
const isQuest = (path) => QUEST_PAGES.some((p) => path === p || path.startsWith(`${p}/`));

const initialOf = (name = '') => name.trim().charAt(0).toUpperCase() || '?';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const sync = useSyncStatus();
  const profileRef = useRef(null);
  const menu = isLoggedIn ? learnerMenu : publicMenu;
  const { progress } = useProgress(user?.uid);

  // ปิดเมนูเมื่อเปลี่ยนหน้า
  useEffect(() => {
    setOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // เพิ่มเงาให้ Navbar เมื่อเลื่อนหน้าลง
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ปิดเมนูด้วยปุ่ม Esc หรือคลิกนอกเมนูโปรไฟล์
  useEffect(() => {
    if (!open && !profileOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setProfileOpen(false);
      }
    };
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onClick);
    };
  }, [open, profileOpen]);

  const handleLogout = async () => {
    const wasPreview = user?.preview;
    await logout();
    navigate(wasPreview ? '/admin' : '/');
  };

  return (
    <>
      <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''} ${isLight(pathname) ? 'navbar--solid' : ''} ${isQuest(pathname) ? 'navbar--quest' : ''}`}>
        <div className="container navbar__inner">
          <Link to={isLoggedIn ? '/learn' : '/'} className="navbar__brand" aria-label="ChatBot Learning หน้าแรก">
            <Logo />
          </Link>

          <div className="navbar__right">
            <nav id="main-navigation" className={`navbar__nav ${open ? 'is-open' : ''}`} aria-label="เมนูหลัก">
              <ul className="navbar__list">
                {menu.map(({ path, label, icon: Icon }) => (
                  <li key={path}>
                    <NavLink
                      to={path}
                      end={path === '/'}
                      className={({ isActive }) => `navbar__link ${isActive ? 'is-active' : ''}`}
                    >
                      <Icon size={17} aria-hidden="true" />
                      <span>{label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>

              {/* ปุ่มบัญชีในเมนูมือถือ */}
              <div className="navbar__mobile-account">
                {isLoggedIn ? (
                  <>
                    <Link to="/profile" className="navbar__link">
                      <UserRound size={17} aria-hidden="true" /> ข้อมูลส่วนตัว
                    </Link>
                    <Link to="/syllabus" className="navbar__link">
                      <ListTree size={17} aria-hidden="true" /> โครงสร้างรายวิชา
                    </Link>
                    <Link to="/criteria" className="navbar__link">
                      <Scale size={17} aria-hidden="true" /> สัดส่วนเนื้อหา
                    </Link>
                    <button type="button" className="navbar__link navbar__logout" onClick={handleLogout}>
                      <LogOut size={17} aria-hidden="true" /> {user.preview ? 'ปิดโหมดพรีเซนต์' : `ออกจากระบบ (${user.displayName})`}
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="btn btn--cta navbar__login-mobile">
                    <LogIn size={18} aria-hidden="true" /> เข้าสู่ระบบ
                  </Link>
                )}
              </div>
            </nav>

            {isLoggedIn && (
              <Link to="/learn" className="navbar__xp" title="ระดับและคะแนนประสบการณ์">
                <Star size={15} aria-hidden="true" />
                <span>
                  Lv {levelOf(progress.xp)} · <b>{progress.xp}</b> XP
                </span>
              </Link>
            )}

            {isLoggedIn ? (
              <div className="profile" ref={profileRef}>
                <button
                  type="button"
                  className="profile__btn"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  onClick={() => setProfileOpen((v) => !v)}
                >
                  <span className="profile__avatar" aria-hidden="true">
                    {user.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" /> : initialOf(user.displayName)}
                  </span>
                  <span className="profile__name">{user.displayName}</span>
                  <ChevronDown size={16} aria-hidden="true" />
                </button>
                {profileOpen && (
                  <div className="profile__menu" role="menu">
                    <div className="profile__info">
                      <b>{user.displayName}</b>
                      <span>
                        {[user.studentId && `เลขที่ ${user.studentId}`, user.classroom && `ห้อง ${user.classroom}`]
                          .filter(Boolean)
                          .join(' · ') || user.email || (user.preview ? 'Admin' : 'นักเรียน')}
                      </span>
                      {user.preview ? (
                        <em className="profile__sync profile__sync--local">
                          <CloudOff size={13} aria-hidden="true" /> โหมดพรีเซนต์ ไม่บันทึกขึ้นระบบ
                        </em>
                      ) : (
                      <em className={`profile__sync profile__sync--${sync}`}>
                        {sync === 'offline' || sync === 'local' ? <CloudOff size={13} aria-hidden="true" /> : <Cloud size={13} aria-hidden="true" />}
                        {sync === 'saving' ? 'กำลังบันทึกขึ้นระบบ…' : sync === 'offline' ? 'ยังไม่ได้บันทึก (ออฟไลน์)' : sync === 'local' ? 'บันทึกในเครื่องนี้' : 'บันทึกบนระบบแล้ว'}
                      </em>
                      )}
                    </div>
                    <Link to="/profile" role="menuitem">
                      <UserRound size={16} aria-hidden="true" /> ข้อมูลส่วนตัว
                    </Link>
                    <Link to="/syllabus" role="menuitem">
                      <ListTree size={16} aria-hidden="true" /> โครงสร้างรายวิชา
                    </Link>
                    <Link to="/criteria" role="menuitem">
                      <Scale size={16} aria-hidden="true" /> สัดส่วนเนื้อหา
                    </Link>
                    <button type="button" role="menuitem" className="profile__logout" onClick={handleLogout}>
                      <LogOut size={16} aria-hidden="true" /> {user.preview ? 'ปิดโหมดพรีเซนต์' : 'ออกจากระบบ'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="navbar__login">
                <LogIn size={17} aria-hidden="true" />
                เข้าสู่ระบบ
              </Link>
            )}

            <button
              type="button"
              className="navbar__toggle"
              aria-label={open ? 'ปิดเมนู' : 'เปิดเมนู'}
              aria-expanded={open}
              aria-controls="main-navigation"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>
      {/* ฉากหลังจาง ๆ เมื่อเปิดเมนูบนมือถือ (คลิกเพื่อปิด) */}
      {open && <div className="navbar__backdrop" onClick={() => setOpen(false)} aria-hidden="true" />}
    </>
  );
}
