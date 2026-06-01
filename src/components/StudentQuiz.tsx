import React, { useState, useEffect, useRef } from 'react';
import { useLms } from '../context/LmsContext';
import { ViewState } from '../types';

interface StudentQuizProps {
  setView: (view: ViewState) => void;
  selectedCourseId: number | null;
}

export const StudentQuiz: React.FC<StudentQuizProps> = ({ setView, selectedCourseId }) => {
  const { currentUser, courses, quizzes, submitQuiz, logout } = useLms();
  
  const defaultCourseId = courses[0] ? courses[0].id : 1;
  const courseId = selectedCourseId || defaultCourseId;
  const activeCourse = courses.find(c => c.id === courseId) || courses[0];
  
  const courseQuestions = quizzes.filter(q => q.courseId === courseId);

  // Constants
  const TOTAL_TIME = 900; // 15 minutes in seconds

  // States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: number]: number }>({});
  const [quizResult, setQuizResult] = useState<{ score: number; correct: number; total: number } | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [timeOutSubmitted, setTimeOutSubmitted] = useState(false);

  // Sync answers ref
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Handler for automatic submission when time is up
  const handleAutoSubmit = async () => {
    try {
      setTimeOutSubmitted(true);
      const res = await submitQuiz(activeCourse.id, answersRef.current);
      setQuizResult(res);
    } catch (err: any) {
      console.error('Quiz auto-submission error:', err);
    }
  };

  // Timer Effect
  useEffect(() => {
    if (quizResult !== null) return;
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, quizResult]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timerPercentage = (timeLeft / TOTAL_TIME) * 100;
  const isUrgent = timeLeft < 60; // Flag for less than 1 minute

  if (!currentUser) return null;

  if (!activeCourse) {
    return <div className="p-8 text-center text-gray-500 text-sm">Please register or create a course to begin the quiz templates.</div>;
  }

  if (courseQuestions.length === 0) {
    return (
      <div className="w-screen h-screen flex bg-[#f5f6fb] text-[#111] overflow-hidden font-sans text-sm items-center justify-center">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm max-w-sm text-center">
          <i className="fa-solid fa-face-rolling-eyes text-4xl text-[#5b34ea] mb-4"></i>
          <h2 className="text-lg font-bold mb-2">Quiz Not Uploaded</h2>
          <p className="text-gray-500 text-xs mb-6">No active questions have been seeded for "{activeCourse.title}" course yet.</p>
          <button className="px-6 py-2.5 bg-[#5b34ea] text-white rounded-xl font-bold hover:bg-[#4a24c4] transition text-xs cursor-pointer" onClick={() => setView('student-dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = courseQuestions[currentIndex];
  const selectedOptionIndex = answers[currentQuestion.id];

  const handleSelectOption = (index: number) => {
    setAnswers(prev => {
      const updated = { ...prev, [currentQuestion.id]: index };
      // Optional interactive feedback check (optional but cool!)
      if (index === currentQuestion.correctIndex) {
        setFeedbackMsg(`Correct Answer! Option ${String.fromCharCode(65 + index)} is valid.`);
      } else {
        setFeedbackMsg(`Selected Option ${String.fromCharCode(65 + index)}. Review your answer before submitting.`);
      }
      return updated;
    });
  };

  const handleNext = () => {
    if (currentIndex < courseQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFeedbackMsg('');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFeedbackMsg('');
    }
  };

  const handleSubmit = async () => {
    // Check if answered everything
    const answeredCount = Object.keys(answers).length;
    if (answeredCount === 0) {
      alert('Answer at least one question first before submitting.');
      return;
    }
    
    if (answeredCount < courseQuestions.length) {
      const proceed = window.confirm(`You answered ${answeredCount} of ${courseQuestions.length} questions. Submit anyway?`);
      if (!proceed) return;
    }

    try {
      const res = await submitQuiz(activeCourse.id, answers);
      setQuizResult(res);
    } catch (err: any) {
      alert(err.message || 'Quiz submission failed.');
    }
  };

  const handleLogout = () => {
    logout();
    setView('home');
  };

  const handleRestart = () => {
    setAnswers({});
    setQuizResult(null);
    setCurrentIndex(0);
    setFeedbackMsg('');
    setTimeLeft(TOTAL_TIME);
    setTimeOutSubmitted(false);
  };

  // Render score board when completed
  if (quizResult !== null) {
    return (
      <div className="w-screen h-screen flex bg-[#f5f6fb] text-[#111] overflow-hidden font-sans text-sm items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-8 max-w-lg w-full text-center">
          {timeOutSubmitted && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-xs text-left">
              <i className="fa-solid fa-triangle-exclamation text-amber-500 text-lg shrink-0 animate-bounce"></i>
              <div>
                <h5 className="font-bold text-amber-900 leading-tight">Time Limit Reached</h5>
                <p className="mt-0.5">The exam timer expired. Your progress has been automatically graded.</p>
              </div>
            </div>
          )}
          
          <div className="w-24 h-24 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-4xl mx-auto mb-6">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <h2 className="text-2xl font-[800] text-gray-900 mb-2">Quiz Completed!</h2>
          <p className="text-xs text-gray-500 mb-6">Your answers for "{activeCourse.title}" have been submitted and evaluated.</p>
          
          <div className="p-6 bg-purple-50/50 rounded-2xl mb-8 flex justify-around items-center">
            <div>
              <h3 className="text-5xl font-[800] text-purple-900">{quizResult.score}%</h3>
              <p className="text-xs text-purple-600 font-[500] mt-1">Final Score</p>
            </div>
            <div className="w-px h-12 bg-purple-100"></div>
            <div>
              <h3 className="text-3xl font-bold text-gray-800">{quizResult.correct} / {quizResult.total}</h3>
              <p className="text-xs text-gray-400 mt-1">Correct Answers</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 h-12 bg-[#5b34ea] text-white rounded-xl font-bold hover:bg-[#4a24c4] transition text-xs cursor-pointer" onClick={() => setView('student-dashboard')}>
              Back to Dashboard
            </button>
            <button className="flex-1 h-12 border border-gray-200 text-gray-700 hover:border-[#5b34ea] rounded-xl font-bold transition text-xs cursor-pointer" onClick={handleRestart}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round(((currentIndex + 1) / courseQuestions.length) * 100);

  return (
    <div className="w-screen h-screen flex bg-[#f5f6fb] text-[#111] overflow-hidden font-sans text-sm">
      
      {/* SIDEBAR */}
      <aside className="w-[300px] bg-gradient-to-b from-[#2e1ea0] to-[#24188b] text-white p-6 justify-between flex-col hidden md:flex overflow-y-auto">
        <div>
          <div className="flex items-center gap-4 mb-10 cursor-pointer" onClick={() => setView('home')}>
            <i className="fa-solid fa-graduation-cap text-white text-[30px]"></i>
            <h2 className="text-[20px] font-bold leading-tight">Edunova<br /><span className="text-sm font-normal text-purple-200">Smart Learning</span></h2>
          </div>

          <nav className="flex flex-col gap-2">
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 text-purple-100 hover:bg-white/10 hover:text-white transition cursor-pointer" onClick={() => setView('student-dashboard')}>
              <i className="fa-solid fa-house"></i> Dashboard
            </span>
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 text-purple-100 hover:bg-white/10 hover:text-white transition cursor-pointer" onClick={() => setView('student-courses')}>
              <i className="fa-solid fa-book-open"></i> My Courses
            </span>
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 bg-white text-[#5b34ea] font-semibold cursor-pointer">
              <i className="fa-solid fa-question-circle"></i> Quizzes
            </span>
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 text-purple-100 hover:bg-white/10 hover:text-white transition cursor-pointer" onClick={() => setView('student-profile')}>
              <i className="fa-regular fa-user"></i> Profile / Progress
            </span>
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 text-purple-100 hover:bg-white/10 hover:text-white transition cursor-pointer" onClick={() => setView('student-messages')}>
              <i className="fa-regular fa-comment-dots"></i> Support & Inbox
            </span>
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 text-purple-100 hover:bg-white/10 hover:text-white transition cursor-pointer" onClick={handleLogout}>
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
            </span>
          </nav>
        </div>

        {/* Upgrade Card banner */}
        <div className="bg-white rounded-2xl p-5 text-gray-900 mt-8 relative overflow-hidden select-none">
          <h3 className="text-lg font-[800] bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent mb-1">
            Keep growing! 🚀
          </h3>
          <p className="text-gray-500 text-xs mb-4">Practice assessments to master complete frameworks.</p>
          <button className="w-full h-10 rounded-xl bg-[#5b34ea] text-white font-semibold hover:bg-[#4a24c4] transition text-xs cursor-pointer" onClick={() => setView('student-dashboard')}>
            Explore Free Courses
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
          <span className="text-[#5b34ea] text-xs font-bold hover:underline flex items-center gap-2 cursor-pointer" onClick={() => setView('student-dashboard')}>
            <i className="fa-solid fa-chevron-left text-[10px]"></i> Back to Dashboard
          </span>

          <div className="profile flex items-center gap-3 cursor-pointer" onClick={() => setView('student-profile')}>
            <img 
              src="https://randomuser.me/api/portraits/men/32.jpg" 
              alt={currentUser.name} 
              className="w-11 h-11 rounded-full border-2 border-[#5b34ea] object-cover" 
            />
            <div className="hidden lg:block">
              <h4 className="text-sm font-bold">{currentUser.name}</h4>
              <p className="text-gray-400 text-xs">Student ID: #{currentUser.id}</p>
            </div>
            <i className="fa-solid fa-chevron-down text-gray-400 text-xs"></i>
          </div>
        </header>

        {/* CONTENT GRIDS */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-[800] tracking-tight">{activeCourse.title} Quiz</h1>
                <span className="bg-[#ece6ff] text-[#5d35ff] px-2.5 py-1 rounded-lg text-xs font-semibold">Active module</span>
              </div>
              <p className="text-gray-500 text-xs">Answer the multiple-choice assessment to verifiably prove understanding.</p>
            </div>

            {/* STAT GENERAL CARD */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#5b34ea] flex items-center justify-center text-lg shrink-0"><i className="fa-solid fa-list-check"></i></div>
                <div><h3 className="font-bold text-sm">{courseQuestions.length}</h3><p className="text-gray-400 text-[10px]">Questions</p></div>
              </div>
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-lg shrink-0"><i className="fa-regular fa-clock"></i></div>
                <div><h3 className="font-bold text-sm">{Math.floor(TOTAL_TIME / 60)}:00</h3><p className="text-gray-400 text-[10px]">Time Limit</p></div>
              </div>
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-lg shrink-0"><i className="fa-solid fa-trophy"></i></div>
                <div><h3 className="font-bold text-sm">{courseQuestions.length * 10}</h3><p className="text-gray-400 text-[10px]">Total Points</p></div>
              </div>
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-lg shrink-0"><i className="fa-solid fa-chart-column"></i></div>
                <div><h3 className="font-bold text-sm">{answeredCount} / {courseQuestions.length}</h3><p className="text-gray-400 text-[10px]">Answered</p></div>
              </div>
            </div>

            {/* MAIN QUIZ BOX COMPONENT */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <h4 className="text-sm font-bold text-[#5d35ff] whitespace-nowrap">Question {currentIndex + 1} of {courseQuestions.length}</h4>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#5b34ea] rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <span className="text-xs font-bold text-gray-500">{progressPercent}%</span>
              </div>

              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-6 leading-relaxed">
                {currentQuestion.question}
              </h2>

              <div className="flex flex-col gap-4">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = selectedOptionIndex === idx;
                  return (
                    <div 
                      key={idx} 
                      className={`border-2 rounded-2xl p-5 flex items-center justify-between cursor-pointer group transition duration-150 ${isSelected ? 'border-purple-300 bg-purple-50/50 text-purple-950 font-semibold' : 'border-gray-100 hover:border-purple-200'}`}
                      onClick={() => handleSelectOption(idx)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-[#5d35ff]' : 'border-gray-300'}`}>
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#5d35ff]"></div>}
                        </div>
                        <span className="text-sm">
                          <strong className="text-gray-900 mr-2">{String.fromCharCode(65 + idx)}.</strong> {opt}
                        </span>
                      </div>
                      {isSelected && <i className="fa-solid fa-check text-green-500"></i>}
                    </div>
                  );
                })}
              </div>

              {/* FEEDBACK CONTAINER */}
              {feedbackMsg && (
                <div className="p-4 bg-green-50 text-green-800 rounded-2xl border border-green-100 mt-6 flex gap-3 text-xs leading-relaxed">
                  <i className="fa-solid fa-circle-check text-green-500 text-sm shrink-0"></i>
                  <div>
                    <h5 className="font-bold text-green-900 mb-1">Feedback Verified</h5>
                    <p>{feedbackMsg}</p>
                  </div>
                </div>
              )}

              {/* NAVIGATION BUTTONS */}
              <div className="flex justify-between items-center mt-8">
                <button 
                  disabled={currentIndex === 0}
                  className="h-12 px-6 rounded-xl border-2 border-purple-200 text-purple-600 font-bold hover:bg-purple-50 transition cursor-pointer text-xs disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-1.5"
                  onClick={handlePrev}
                >
                  <i className="fa-solid fa-arrow-left"></i> Previous
                </button>

                <button 
                  disabled={currentIndex === courseQuestions.length - 1}
                  className="h-12 px-6 rounded-xl bg-[#5d35ff] text-white font-bold hover:bg-[#4a24c4] transition cursor-pointer text-xs disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-1.5"
                  onClick={handleNext}
                >
                  Next <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>

            </div>

          </div>

          {/* RIGHT SIDEBAR */}
          <div className="flex flex-col gap-6">
            
            {/* PROGRESS SUMMARY */}
            <div className="bg-white border border-gray-100 rounded-[18px] p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Quiz Summary</h3>
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                  <span>Answered Questions</span>
                  <span className="font-bold text-green-500">{answeredCount} Questions</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                  <span>Remaining Questions</span>
                  <span className="font-bold text-red-400">{courseQuestions.length - answeredCount} Left</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span>Standard passing score</span>
                  <span className="font-bold text-gray-800">80% passing</span>
                </div>
              </div>
            </div>

            {/* INDIVIDUAL DIGIT PANELS JUMPER */}
            <div className="bg-white border border-gray-100 rounded-[18px] p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Question Navigator</h3>
              
              <div className="grid grid-cols-5 gap-3 mb-4">
                {courseQuestions.map((_, i) => {
                  const hasAnswered = answers[_.id] !== undefined;
                  const isActive = currentIndex === i;
                  return (
                    <button 
                      key={i} 
                      className={`w-10 h-10 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${isActive ? 'border-2 border-[#5d35ff] text-[#5d35ff] bg-purple-50' : hasAnswered ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-gray-50 text-gray-600'}`}
                      onClick={() => { setCurrentIndex(i); setFeedbackMsg(''); }}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-4 flex-wrap text-[10px] text-gray-500 font-bold border-t border-gray-50 pt-3">
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-green-100 border border-green-300"></div> Answered</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded border-2 border-[#5d35ff] bg-purple-50"></div> Current</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-gray-100"></div> Unanswered</span>
              </div>
            </div>

            {/* REMAINING CLOCK */}
            <div className={`rounded-2xl p-5 border transition-all duration-300 ${isUrgent ? 'bg-red-50 border-red-200' : 'bg-[#f3efff] border-purple-100'}`}>
              <h3 className={`font-bold text-xs mb-3 ${isUrgent ? 'text-red-700' : 'text-purple-900'}`}>Timer Count</h3>
              <div className={`flex items-center gap-4 font-bold mb-3 ${isUrgent ? 'text-red-950' : 'text-purple-950'}`}>
                <i className={`fa-regular fa-clock text-2xl ${isUrgent ? 'text-red-500 animate-pulse' : ''}`}></i>
                <span className="text-3xl font-mono">{formatTime(timeLeft)}</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isUrgent ? 'bg-red-100' : 'bg-[#ddd5ff]'}`}>
                <div className={`h-full rounded-full transition-all duration-1000 ${isUrgent ? 'bg-red-500' : 'bg-[#5b34ea]'}`} style={{ width: `${timerPercentage}%` }}></div>
              </div>
            </div>

            {/* SUBMIT ASSIGNMENT */}
            <div 
              className="bg-white rounded-2xl border-2 border-[#7a61ff] p-5 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-purple-50/50 transition duration-150"
              onClick={handleSubmit}
            >
              <i className="fa-regular fa-paper-plane text-purple-600 text-2xl shrink-0"></i>
              <div>
                <h4 className="text-xs font-bold text-gray-900 mb-1">Submit Quiz</h4>
                <p className="text-gray-400 text-[10px]">Grade my answers and finish the module exam.</p>
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
};
