import { Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Home from './pages/Home';
import Syllabus from './pages/Syllabus';
import Criteria from './pages/Criteria';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import LearnHome from './pages/LearnHome';
import ContentSheets from './pages/ContentSheets';
import Worksheets from './pages/Worksheets';
import Quizzes from './pages/Quizzes';
import QuizPlay from './pages/QuizPlay';
import TeachingMedia from './pages/TeachingMedia';
import MissionPlay from './pages/MissionPlay';
import Guide from './pages/Guide';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* หน้าที่ทุกคนเข้าดูได้ */}
        <Route path="/" element={<Home />} />
        <Route path="/syllabus" element={<Syllabus />} />
        <Route path="/criteria" element={<Criteria />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* หน้าที่ต้องเข้าสู่ระบบก่อน */}
        <Route element={<ProtectedRoute />}>
          <Route path="/learn" element={<LearnHome />} />
          <Route path="/content" element={<ContentSheets />} />
          <Route path="/worksheets" element={<Worksheets />} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/quizzes/:quizId" element={<QuizPlay />} />
          <Route path="/media" element={<TeachingMedia />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/quest/:missionId" element={<MissionPlay />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
