import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

import './styles/variables.css';
import './styles/global.css';
import './styles/navbar.css';
import './styles/footer.css';
import './styles/home.css';
import './styles/page.css';
import './styles/mascot.css';
import './styles/backdrop.css';
import './styles/quiz.css';
import './styles/exam.css';
import './styles/guide.css';
import './styles/course.css';
import './styles/auth.css';
import './styles/learn.css';
import './styles/criteria.css';
import './styles/syllabus.css';
import './styles/quest.css';
import './styles/admin.css';
import './styles/homex.css';
import './styles/quizx.css';
import './styles/guidex.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
