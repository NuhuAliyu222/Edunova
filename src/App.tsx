import { useState } from 'react';
import { ViewState } from './types';
import { useLms } from './context/LmsContext';

// Import View Components
import { WelcomeLanding } from './components/WelcomeLanding';
import { StudentLogin } from './components/StudentLogin';
import { StudentRegister } from './components/StudentRegister';
import { StudentDashboard } from './components/StudentDashboard';
import { StudentCourses } from './components/StudentCourses';
import { StudentQuiz } from './components/StudentQuiz';
import { StudentProfile } from './components/StudentProfile';
import { CertificateView } from './components/CertificateView';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminStudents } from './components/AdminStudents';
import { AdminCourses } from './components/AdminCourses';
import { AdminLessons } from './components/AdminLessons';
import { AdminQuizzes } from './components/AdminQuizzes';
import { StudentMessages } from './components/StudentMessages';
import { AdminMessages } from './components/AdminMessages';
import { AdminSettings } from './components/AdminSettings';

export default function App() {
  const { currentUser } = useLms();
  const [view, setView] = useState<ViewState>('home');
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  // Auto-protect and route if required
  const routeToView = (targetView: ViewState) => {
    // If student view and logged out, redirect
    if (targetView.startsWith('student-') && targetView !== 'student-login' && targetView !== 'student-register') {
      if (!currentUser || currentUser.role !== 'student') {
        setView('student-login');
        return;
      }
    }
    // If admin view and logged out, redirect
    if (targetView.startsWith('admin-') && targetView !== 'admin-login') {
      if (!currentUser || currentUser.role !== 'admin') {
        setView('admin-login');
        return;
      }
    }
    setView(targetView);
  };

  return (
    <div className="w-full min-h-screen bg-[#f5f6fb]">
      
      {/* View routing selection orchestrator */}
      {view === 'home' && (
        <WelcomeLanding 
          setView={routeToView} 
          setSelectedCourseId={setSelectedCourseId} 
        />
      )}

      {view === 'student-login' && (
        <StudentLogin setView={routeToView} />
      )}

      {view === 'student-register' && (
        <StudentRegister setView={routeToView} />
      )}

      {view === 'student-dashboard' && (
        <StudentDashboard 
          setView={routeToView} 
          setSelectedCourseId={setSelectedCourseId} 
        />
      )}

      {view === 'student-courses' && (
        <StudentCourses 
          setView={routeToView} 
          selectedCourseId={selectedCourseId} 
          setSelectedCourseId={setSelectedCourseId} 
        />
      )}

      {view === 'student-quiz' && (
        <StudentQuiz 
          setView={routeToView} 
          selectedCourseId={selectedCourseId} 
        />
      )}

      {view === 'student-profile' && (
        <StudentProfile 
          setView={routeToView} 
          setSelectedCourseId={setSelectedCourseId} 
        />
      )}

      {view === 'student-messages' && (
        <StudentMessages 
          setView={routeToView} 
        />
      )}

      {view === 'certificate' && (
        <CertificateView 
          setView={routeToView} 
          selectedCourseId={selectedCourseId} 
        />
      )}

      {view === 'admin-login' && (
        <AdminLogin setView={routeToView} />
      )}

      {view === 'admin-dashboard' && (
        <AdminDashboard setView={routeToView} />
      )}

      {view === 'admin-users' && (
        <AdminStudents setView={routeToView} />
      )}

      {view === 'admin-courses' && (
        <AdminCourses setView={routeToView} />
      )}

      {view === 'admin-lessons' && (
        <AdminLessons setView={routeToView} />
      )}

      {view === 'admin-quizzes' && (
        <AdminQuizzes setView={routeToView} />
      )}

      {view === 'admin-messages' && (
        <AdminMessages setView={routeToView} />
      )}

      {view === 'admin-settings' && (
        <AdminSettings setView={routeToView} />
      )}

    </div>
  );
}
