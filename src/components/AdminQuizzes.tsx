import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { ViewState } from '../types';

interface AdminQuizzesProps {
  setView: (view: ViewState) => void;
}

export const AdminQuizzes: React.FC<AdminQuizzesProps> = ({ setView }) => {
  const { courses, quizzes, createQuiz, deleteQuiz, logout } = useLms();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // States
  const [selectedCourseId, setSelectedCourseId] = useState<number>(() => {
    return courses[0] ? courses[0].id : 1;
  });

  // Uploader State
  const [question, setQuestion] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctIndex, setCorrectIndex] = useState('0');

  const activeCourse = courses.find(c => c.id === selectedCourseId) || courses[0];
  const activeQuestions = quizzes.filter(q => q.courseId === selectedCourseId);

  const handleLogout = () => {
    logout();
    setView('home');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !optA || !optB) {
      alert('Question query and at least Option A & B are critical targets.');
      return;
    }

    const options = [optA.trim(), optB.trim()];
    if (optC.trim()) options.push(optC.trim());
    if (optD.trim()) options.push(optD.trim());

    try {
      await createQuiz({
        courseId: selectedCourseId,
        question: question.trim(),
        options,
        correctIndex: Number(correctIndex) || 0
      });

      // Reset
      setQuestion('');
      setOptA('');
      setOptB('');
      setOptC('');
      setOptD('');
      setCorrectIndex('0');
      alert('Assessment question appended successfully.');
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    }
  };

  return (
    <div className="w-screen h-screen flex bg-[#f5f6fb] text-[#111] overflow-hidden font-sans text-sm">
      
      {/* MOBILE DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop screen */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Sidebar Drawer */}
          <div className="relative w-[280px] max-w-full bg-[#050f59] text-white p-6 flex flex-col justify-between overflow-y-auto transition-all duration-300 ease-in-out z-10 shadow-2xl">
            <div>
              {/* Close Button and Logo */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setView('home'); setMobileMenuOpen(false); }}>
                  <i className="fa-solid fa-graduation-cap text-white text-[22px]"></i>
                  <h2 className="text-[18px] font-bold leading-tight">Edunova</h2>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
                  aria-label="Close menu"
                >
                  <i className="fa-solid fa-xmark text-sm"></i>
                </button>
              </div>

              <nav className="flex flex-col gap-1.5">
                <span 
                  className="h-11 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                  onClick={() => { setView('admin-dashboard'); setMobileMenuOpen(false); }}
                >
                  <i className="fa-solid fa-house"></i> Dashboard
                </span>
                <span 
                  className="h-11 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                  onClick={() => { setView('admin-users'); setMobileMenuOpen(false); }}
                >
                  <i className="fa-regular fa-user"></i> Users / Students
                </span>
                <span 
                  className="h-11 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                  onClick={() => { setView('admin-courses'); setMobileMenuOpen(false); }}
                >
                  <i className="fa-solid fa-book-open"></i> Courses Catalog
                </span>
                <span 
                  className="h-11 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                  onClick={() => { setView('admin-lessons'); setMobileMenuOpen(false); }}
                >
                  <i className="fa-regular fa-circle-play"></i> Upload Lessons
                </span>
                <span 
                  className="h-11 rounded-xl flex items-center gap-4 px-4 bg-white/10 text-white font-semibold cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <i className="fa-regular fa-circle-question"></i> Manage Quizzes
                </span>
                <span 
                  className="h-11 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                >
                  <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
                </span>
              </nav>
            </div>

            <div className="bg-[#131d67] border border-[#1b277a] rounded-2xl p-4 text-gray-200 text-xs mt-6 select-none">
              <h4 className="font-bold text-white mb-2 uppercase tracking-wide">Control Status</h4>
              <span className="flex items-center gap-1.5 text-green-400 font-bold"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Active, Online</span>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-[255px] bg-[#050f59] text-white p-6 justify-between flex-col hidden lg:flex overflow-y-auto shrink-0 select-none">
        <div>
          <div className="flex items-start gap-4 cursor-pointer mb-12" onClick={() => setView('home')}>
            <div className="w-[42px] h-[42px] rounded-xl bg-[#5a35ff] flex items-center justify-center">
              <i className="fa-solid fa-graduation-cap text-white text-[18px]"></i>
            </div>
            <div className="leading-tight">
              <div className="text-[17px] font-[700]">Edunova</div>
              <div className="text-[14px] text-gray-300 font-[500]">Smart Learning</div>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer" onClick={() => setView('admin-dashboard')}>
              <i className="fa-solid fa-house"></i> Dashboard
            </span>
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer" onClick={() => setView('admin-users')}>
              <i className="fa-regular fa-user"></i> Users / Students
            </span>
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer" onClick={() => setView('admin-courses')}>
              <i className="fa-solid fa-book-open"></i> Courses Catalog
            </span>
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer" onClick={() => setView('admin-lessons')}>
              <i className="fa-regular fa-circle-play"></i> Upload Lessons
            </span>
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 bg-white/10 text-white font-semibold cursor-pointer">
              <i className="fa-regular fa-circle-question"></i> Manage Quizzes
            </span>
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer" onClick={() => setView('admin-messages')}>
              <i className="fa-solid fa-bullhorn animate-pulse"></i> Communication Portal
            </span>
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer" onClick={handleLogout}>
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
            </span>
          </nav>
        </div>

        {/* System Health status */}
        <div className="bg-[#131d67] border border-[#1b277a] rounded-2xl p-4 text-gray-200 text-xs">
          <h4 className="font-bold text-white mb-2 uppercase tracking-wide">System Control Status</h4>
          <span className="flex items-center gap-1.5 text-green-400 font-bold"><span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span> Active, Online</span>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOPBAR */}
        <header className="h-[80px] bg-white border-b border-[#ececf4] px-4 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 md:gap-6">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 transition cursor-pointer shrink-0"
              aria-label="Toggle menu"
            >
              <i className="fa-solid fa-bars text-lg"></i>
            </button>
            {courses.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400">Select active Course filters:</span>
                <select 
                  className="bg-gray-50 border border-gray-200 rounded-xl p-2 font-bold text-gray-700 outline-none text-xs cursor-pointer"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                >
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="profile flex items-center gap-3">
              <div className="w-[44px] h-[44px] rounded-full bg-gradient-to-br from-[#ffcf9d] to-[#8b5a3b] border-2 border-[#5a35ff]"></div>
              <div>
                <h4 className="text-sm font-bold text-[#111827]">Super Admin</h4>
                <p className="text-gray-400 text-xs mt-[1px]">Administrator ID: #01</p>
              </div>
            </div>
          </div>
        </header>

        {/* DETAILS GRIDS HOST */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          
          {/* CREATOR PANEL */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-[800] leading-none mb-1 text-gray-900 tracking-tight">Manage Quiz Questions</h1>
              <p className="text-gray-500 text-xs">Create and manage multiple-choice questions matching this course curriculum module assessments.</p>
            </div>

            {/* CURRICULUM QUESTIONS PANEL */}
            <div className="bg-white border border-[#ececf4] rounded-2xl p-6 md:p-8 shadow-sm">
              <h3 className="font-bold text-[#5a35ff] text-base mb-6">Create New Quiz Choice</h3>
              
              <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700">Question Title *</label>
                  <input type="text" required value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full h-11 border border-gray-200 rounded-lg px-3 outline-none focus:border-[#5a35ff] text-xs" placeholder="e.g. Which keyword starts functions in Python?" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700">Option A *</label>
                    <input type="text" required value={optA} onChange={(e) => setOptA(e.target.value)} className="w-full h-10 border border-gray-200 rounded-lg px-3 outline-none focus:border-[#5a35ff] text-xs" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700">Option B *</label>
                    <input type="text" required value={optB} onChange={(e) => setOptB(e.target.value)} className="w-full h-10 border border-gray-200 rounded-lg px-3 outline-none focus:border-[#5a35ff] text-xs" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700">Option C (Optional)</label>
                    <input type="text" value={optC} onChange={(e) => setOptC(e.target.value)} className="w-full h-10 border border-gray-200 rounded-lg px-3 outline-none focus:border-[#5a35ff] text-xs" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700">Option D (Optional)</label>
                    <input type="text" value={optD} onChange={(e) => setOptD(e.target.value)} className="w-full h-10 border border-gray-200 rounded-lg px-3 outline-none focus:border-[#5a35ff] text-xs" />
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-2 w-[280px]">
                  <label className="text-xs font-bold text-gray-700">Correct Answer Index *</label>
                  <select 
                    value={correctIndex} 
                    onChange={(e) => setCorrectIndex(e.target.value)} 
                    className="w-full h-10 border border-gray-200 rounded-lg px-3 outline-none focus:border-[#5a35ff] text-xs bg-white cursor-pointer"
                  >
                    <option value="0">Option A (Index 0)</option>
                    <option value="1">Option B (Index 1)</option>
                    <option value="2">Option C (Index 2)</option>
                    <option value="3">Option D (Index 3)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button type="submit" className="h-11 px-6 bg-[#5a35ff] text-white rounded-xl text-xs font-bold hover:bg-[#4a24c4] transition cursor-pointer"><i className="fa-solid fa-plus-circle"></i> Save Quiz Question</button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN ACTIVE QUESTIONS GRID */}
          <div className="bg-white border border-[#ececf4] rounded-2xl p-5 shadow-sm overflow-hidden flex flex-col h-full min-h-[400px]">
            <h3 className="font-bold text-gray-900 text-base mb-4">Quiz Questions in "{activeCourse?.title}"</h3>
            
            <div className="flex-grow overflow-y-auto space-y-4">
              {activeQuestions.length > 0 ? (
                activeQuestions.map((quiz, idx) => (
                  <div key={quiz.id} className="flex justify-between items-start bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs">
                    <div className="flex-1 mr-4">
                      <h4 className="font-bold text-gray-800 line-clamp-2">Q{idx+1}. {quiz.question}</h4>
                      <div className="mt-2 pl-3 flex flex-col gap-1 text-[10px] text-gray-500 font-semibold list-decimal">
                        {quiz.options.map((opt, i) => (
                          <span key={i} className={i === quiz.correctIndex ? 'text-green-600 font-bold' : ''}>
                            {String.fromCharCode(65 + i)}) {opt} {i === quiz.correctIndex && '✓'}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button 
                      className="text-red-500 hover:bg-red-50 transition border border-red-100 bg-white p-1.5 rounded-md font-bold text-[10px] cursor-pointer shrink-0"
                      onClick={() => {
                        if (window.confirm(`Delete quiz question "${quiz.question.slice(0, 20)}..."?`)) {
                          deleteQuiz(quiz.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center py-12 text-gray-400 text-xs">No quiz questions found. Create questions using the panel on the left.</p>
              )}
            </div>
          </div>

        </div>

      </main>

    </div>
  );
};
