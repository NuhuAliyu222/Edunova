import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { ViewState } from '../types';
import { StudentQuizLeaderboard } from './StudentQuizLeaderboard';
import { StudentQuizHistory } from './StudentQuizHistory';

interface StudentDashboardProps {
  setView: (view: ViewState) => void;
  setSelectedCourseId: (id: number) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ setView, setSelectedCourseId }) => {
  const { 
    currentUser, courses, lessons, enrollments, progress, attempts, 
    announcements, bookmarks, messages, toggleBookmark, logout 
  } = useLms();

  const [searchTerm, setSearchTerm] = useState('');
  const [subView, setSubView] = useState<'dashboard' | 'leaderboard' | 'history'>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);

  // Search history state, isolated per student using currentUser.id
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      if (!currentUser) return [];
      const saved = localStorage.getItem(`recent_searches_${currentUser.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addSearchHistory = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5); // Keep top 5 search items
      if (currentUser) {
        localStorage.setItem(`recent_searches_${currentUser.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const removeSearchHistoryItem = (termToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory(prev => {
      const updated = prev.filter(item => item !== termToRemove);
      if (currentUser) {
        localStorage.setItem(`recent_searches_${currentUser.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const clearAllSearchHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory([]);
    if (currentUser) {
      localStorage.removeItem(`recent_searches_${currentUser.id}`);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = searchTerm.trim();
      if (trimmed) {
        addSearchHistory(trimmed);
        setShowHistoryDropdown(false);
      }
    }
  };

  // Protect student view safety
  if (!currentUser) return null;

  // Extract all unique categories
  const categories = ['All', ...Array.from(new Set(courses.map(c => c.category)))];
  const uniqueCategories = Array.from(new Set(courses.map(c => c.category as string))) as string[];
  const matchingCategories: string[] = searchTerm.trim()
    ? uniqueCategories.filter((cat: string) => cat.toLowerCase().includes(searchTerm.toLowerCase()))
    : uniqueCategories; // Keep all categories on focus if user hasn't typed anything yet so they have quick selections!

  // Compute states
  const myEnrollments = enrollments.filter(e => e.userId === currentUser.id);
  const enrolledCourses = courses.filter(c => myEnrollments.some(e => e.courseId === c.id));
  
  const completedLessons = progress.filter(p => p.userId === currentUser.id).length;
  const myAttempts = attempts.filter(a => a.userId === currentUser.id);
  const quizTakenCount = myAttempts.length;
  
  const avgScore = quizTakenCount > 0 
    ? Math.round(myAttempts.reduce((sum, a) => sum + a.score, 0) / quizTakenCount)
    : 0;

  // Filter courses based on search & category selection
  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter bookmarked courses
  const bookmarkedCourses = courses.filter(c => 
    bookmarks.some(b => b.userId === currentUser.id && b.courseId === c.id)
  );

  const handleCourseClick = (courseId: number) => {
    setSelectedCourseId(courseId);
    setView('student-courses');
  };

  const handleLogout = () => {
    logout();
    setView('home');
  };

  return (
    <div className="w-screen h-screen flex bg-[#f5f6fb] text-[#111] overflow-hidden font-sans text-sm">
      
      {/* MOBILE DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Sidebar Drawer */}
          <div className="relative w-[280px] max-w-full bg-gradient-to-b from-[#2e1ea0] to-[#24188b] text-white p-6 flex flex-col justify-between overflow-y-auto transition-all duration-300 ease-in-out z-10 shadow-2xl">
            <div>
              {/* Close Button and Logo */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setView('home'); setMobileMenuOpen(false); }}>
                  <i className="fa-solid fa-graduation-cap text-white text-[24px]"></i>
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
                  className={`h-11 rounded-xl flex items-center gap-4 px-4 cursor-pointer transition ${
                    subView === 'dashboard' ? 'bg-white text-[#5b34ea] font-semibold' : 'text-purple-100 hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={() => { setSubView('dashboard'); setMobileMenuOpen(false); }}
                >
                  <i className="fa-solid fa-house"></i> Dashboard
                </span>
                <span 
                  className={`h-11 rounded-xl flex items-center gap-4 px-4 cursor-pointer transition ${
                    subView === 'leaderboard' ? 'bg-white text-[#5b34ea] font-semibold' : 'text-purple-100 hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={() => { setSubView('leaderboard'); setMobileMenuOpen(false); }}
                >
                  <i className="fa-solid fa-trophy text-yellow-300"></i> Quiz Leaderboard
                </span>
                <span 
                  className={`h-11 rounded-xl flex items-center gap-4 px-4 cursor-pointer transition ${
                    subView === 'history' ? 'bg-white text-[#5b34ea] font-semibold' : 'text-purple-100 hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={() => { setSubView('history'); setMobileMenuOpen(false); }}
                >
                  <i className="fa-regular fa-clipboard text-indigo-300"></i> Grade History
                </span>
                <span 
                  className="h-11 rounded-xl flex items-center gap-4 px-4 text-purple-100 hover:bg-white/10 hover:text-white transition cursor-pointer" 
                  onClick={() => { setView('student-courses'); setMobileMenuOpen(false); }}
                >
                  <i className="fa-solid fa-book-open"></i> My Courses
                </span>
                <span 
                  className="h-11 rounded-xl flex items-center gap-4 px-4 text-purple-100 hover:bg-white/10 hover:text-white transition cursor-pointer" 
                  onClick={() => { setView('student-quiz'); setMobileMenuOpen(false); }}
                >
                  <i className="fa-solid fa-question-circle"></i> Quizzes
                </span>
                <span 
                  className="h-11 rounded-xl flex items-center gap-4 px-4 text-purple-100 hover:bg-white/10 hover:text-white transition cursor-pointer" 
                  onClick={() => { setView('student-profile'); setMobileMenuOpen(false); }}
                >
                  <i className="fa-regular fa-user"></i> Profile / Progress
                </span>
                <span 
                  className="h-11 rounded-xl flex items-center gap-4 px-4 text-purple-100 hover:bg-white/10 hover:text-white transition cursor-pointer" 
                  onClick={() => { setView('student-messages'); setMobileMenuOpen(false); }}
                >
                  <i className="fa-regular fa-comment-dots"></i> Support & Inbox
                </span>
                <span 
                  className="h-11 rounded-xl flex items-center gap-4 px-4 text-purple-100 hover:bg-white/10 hover:text-white transition cursor-pointer" 
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                >
                  <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
                </span>
              </nav>
            </div>

            {/* Upgrade banner */}
            <div className="bg-white rounded-2xl p-4 text-gray-900 mt-6 relative overflow-hidden select-none">
              <h3 className="text-sm font-[800] bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent mb-1">
                Keep growing! 🚀
              </h3>
              <p className="text-gray-500 text-[10px] mb-2">Enroll in free lessons and unlock verifications.</p>
              <button 
                className="w-full h-8 rounded-lg bg-[#5b34ea] text-white font-semibold hover:bg-[#4a24c4] transition text-xs cursor-pointer"
                onClick={() => { setView('student-courses'); setMobileMenuOpen(false); }}
              >
                Explore Free Courses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-[280px] bg-gradient-to-b from-[#2e1ea0] to-[#24188b] text-white p-6 justify-between flex-col hidden md:flex overflow-y-auto">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-4 mb-10 cursor-pointer" onClick={() => setView('home')}>
            <i className="fa-solid fa-graduation-cap text-white text-[30px]"></i>
            <h2 className="text-[20px] font-bold leading-tight">Edunova<br /><span className="text-sm font-normal text-purple-200">Smart Learning</span></h2>
          </div>

          <nav className="flex flex-col gap-2">
            <span 
              className={`h-12 rounded-xl flex items-center gap-4 px-4 cursor-pointer transition ${
                subView === 'dashboard' ? 'bg-white text-[#5b34ea] font-semibold' : 'text-purple-100 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => setSubView('dashboard')}
            >
              <i className="fa-solid fa-house"></i> Dashboard
            </span>
            <span 
              className={`h-12 rounded-xl flex items-center gap-4 px-4 cursor-pointer transition ${
                subView === 'leaderboard' ? 'bg-white text-[#5b34ea] font-semibold' : 'text-purple-100 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => setSubView('leaderboard')}
            >
              <i className="fa-solid fa-trophy text-yellow-300"></i> Quiz Leaderboard
            </span>
            <span 
              className={`h-12 rounded-xl flex items-center gap-4 px-4 cursor-pointer transition ${
                subView === 'history' ? 'bg-white text-[#5b34ea] font-semibold' : 'text-purple-100 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => setSubView('history')}
            >
              <i className="fa-regular fa-clipboard text-indigo-300"></i> Grade History
            </span>
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 text-purple-100 hover:bg-white/10 hover:text-white transition cursor-pointer" onClick={() => setView('student-courses')}>
              <i className="fa-solid fa-book-open"></i> My Courses
            </span>
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 text-purple-100 hover:bg-white/10 hover:text-white transition cursor-pointer" onClick={() => setView('student-quiz')}>
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

        {/* Upgrade card banner */}
        <div className="bg-white rounded-2xl p-5 text-gray-900 mt-8 relative overflow-hidden select-none">
          <h3 className="text-lg font-[800] bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent mb-1">
            Keep growing! 🚀
          </h3>
          <p className="text-gray-500 text-xs mb-4">Enroll in free lessons and unlock verifications.</p>
          <button 
            className="w-full h-10 rounded-xl bg-[#5b34ea] text-white font-semibold hover:bg-[#4a24c4] transition text-xs cursor-pointer"
            onClick={() => setView('student-courses')}
          >
            Explore Free Courses
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-3 md:gap-6">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden flex items-center justify-center w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 transition cursor-pointer"
              aria-label="Toggle menu"
            >
              <i className="fa-solid fa-bars text-lg"></i>
            </button>
            <div className="relative w-[180px] sm:w-[300px] md:w-[380px]">
              <div className="h-11 border border-gray-200 rounded-xl flex items-center px-4 bg-[#fafbfc] focus-within:border-[#5b34ea] focus-within:bg-white transition-all duration-200">
                <input 
                  type="text" 
                  placeholder="Search courses..." 
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowHistoryDropdown(true);
                  }}
                  onFocus={() => setShowHistoryDropdown(true)}
                  onBlur={() => {
                    // Small timeout delay so select item clicks can resolve first
                    setTimeout(() => setShowHistoryDropdown(false), 200);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full bg-transparent outline-none text-[#111]"
                />
                <button
                  onClick={() => {
                    if (searchTerm.trim()) {
                      addSearchHistory(searchTerm);
                      setShowHistoryDropdown(false);
                    }
                  }}
                  type="button"
                  className="p-1 text-gray-400 hover:text-[#5b34ea] transition cursor-pointer"
                >
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>

              {/* FLOATING HISTORY DROPDOWN */}
              {showHistoryDropdown && (searchHistory.length > 0 || matchingCategories.length > 0) && (
                <div 
                  className="absolute left-0 right-0 top-[105%] bg-white border border-gray-200 rounded-xl shadow-xl p-2.5 z-50 flex flex-col gap-2 max-w-full"
                  onMouseDown={(e) => {
                    // Prevent loss of focus on input to allow click interactions inside dropdown
                    e.preventDefault();
                  }}
                >
                  {/* CATEGORY SUGGESTIONS */}
                  {matchingCategories.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider px-2 py-1">
                        <span className="flex items-center gap-1.5 text-purple-600">
                          <i className="fa-solid fa-tags text-purple-500"></i> {searchTerm.trim() ? 'Suggested Categories' : 'Browse by Category'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5 max-h-[150px] overflow-y-auto">
                        {matchingCategories.slice(0, 4).map((cat, id) => (
                          <div
                            key={`cat-${id}`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setSelectedCategory(cat);
                              setSearchTerm('');
                              addSearchHistory(cat);
                              setShowHistoryDropdown(false);
                            }}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-purple-50 group cursor-pointer transition duration-150"
                          >
                            <div className="flex items-center gap-2 text-xs text-gray-750 font-semibold group-hover:text-[#5b34ea]">
                              <i className="fa-solid fa-folder-open text-purple-400 group-hover:text-[#5b34ea]"></i>
                              <span className="flex items-center gap-1">
                                {cat} 
                                <span className="text-[9px] bg-purple-100 text-[#5b34ea] px-1.5 py-0.5 rounded-full font-bold ml-1.5 transition group-hover:bg-[#5b34ea] group-hover:text-white">Category</span>
                              </span>
                            </div>
                            <i className="fa-solid fa-chevron-right text-[10px] text-gray-300 group-hover:text-[#5b34ea] transition pl-2"></i>
                          </div>
                        ))}
                      </div>
                      {searchHistory.length > 0 && <div className="border-t border-gray-100 my-1"></div>}
                    </div>
                  )}

                  {/* RECENT SEARCHES */}
                  {searchHistory.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[10px] text-gray-400 font-extrabold uppercase tracking-wider px-2 py-1">
                        <span className="flex items-center gap-1">
                          <i className="fa-solid fa-clock-rotate-left"></i> Recent Searches
                        </span>
                        <button 
                          onMouseDown={(e) => { 
                            e.preventDefault(); 
                            clearAllSearchHistory(e); 
                          }}
                          className="text-[#5b34ea] hover:underline cursor-pointer normal-case"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="flex flex-col gap-0.5 max-h-[180px] overflow-y-auto">
                        {searchHistory.map((item, id) => (
                          <div
                            key={`hist-${id}`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setSearchTerm(item);
                              setSelectedCategory('All');
                              addSearchHistory(item);
                              setShowHistoryDropdown(false);
                            }}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-purple-50 group cursor-pointer transition duration-150"
                          >
                            <div className="flex items-center gap-2 text-xs text-gray-750 font-semibold group-hover:text-[#5b34ea]">
                              <i className="fa-regular fa-clock text-gray-300 group-hover:text-purple-400"></i>
                              <span>{item}</span>
                            </div>
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                removeSearchHistoryItem(item, e);
                              }}
                              className="w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition cursor-pointer"
                              title="Delete from history"
                            >
                              <i className="fa-solid fa-xmark text-[9px]"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative text-gray-700 cursor-pointer" onClick={() => setView('student-profile')}>
              <i className="fa-regular fa-bell text-xl"></i>
              <span className="absolute -top-1.5 -right-2 w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                1
              </span>
            </div>

            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('student-profile')}>
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
          </div>
        </header>

        {/* CONTENT HOST */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 flex gap-6">
          
          {subView === 'leaderboard' ? (
            <div className="flex-1 max-w-full">
              <div className="mb-4">
                <button 
                  onClick={() => setSubView('dashboard')}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 transition shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-arrow-left"></i> ← Back to Dashboard
                </button>
              </div>
              <StudentQuizLeaderboard />
            </div>
          ) : subView === 'history' ? (
            <div className="flex-1 max-w-full">
              <div className="mb-4">
                <button 
                  onClick={() => setSubView('dashboard')}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 transition shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-arrow-left"></i> ← Back to Dashboard
                </button>
              </div>
              <StudentQuizHistory 
                onRetake={(courseId) => {
                  setSelectedCourseId(courseId);
                  setView('student-quiz');
                }} 
              />
            </div>
          ) : (
            <>
              <div className="flex-1 max-w-full">
            <div className="mb-6">
              <h1 className="text-3xl font-[800] leading-none mb-1 bg-gradient-to-r from-[#5b34ea] to-indigo-600 bg-clip-text text-transparent">
                Hello, {currentUser.name}! 👋
              </h1>
              <p className="text-gray-500 text-sm">Welcome back to your dashboard. Expand your skill roadmap today.</p>
            </div>

            {/* STATS COUNT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:translate-y-[-2px] transition duration-200">
                <div className="w-[52px] h-[52px] rounded-2xl bg-[#efe7ff] text-[#5b34ea] flex items-center justify-center text-xl shrink-0">
                  <i className="fa-solid fa-book-open"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-[800]">{enrolledCourses.length}</h2>
                  <p className="text-gray-500 text-xs">Enrolled Courses</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:translate-y-[-2px] transition duration-200">
                <div className="w-[52px] h-[52px] rounded-2xl bg-[#e3f9ee] text-[#10b981] flex items-center justify-center text-xl shrink-0">
                  <i className="fa-regular fa-circle-check"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-[800]">{completedLessons}</h2>
                  <p className="text-gray-500 text-xs">Lessons Completed</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:translate-y-[-2px] transition duration-200">
                <div className="w-[52px] h-[52px] rounded-2xl bg-[#e6f0ff] text-[#3b82f6] flex items-center justify-center text-xl shrink-0">
                  <i className="fa-regular fa-clipboard"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-[800]">{quizTakenCount}</h2>
                  <p className="text-gray-500 text-xs">Quizzes Answered</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:translate-y-[-2px] transition duration-200">
                <div className="w-[52px] h-[52px] rounded-2xl bg-[#fff0e6] text-[#f59e0b] flex items-center justify-center text-xl shrink-0">
                  <i className="fa-solid fa-trophy"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-[800]">{avgScore}%</h2>
                  <p className="text-gray-500 text-xs">Average Quiz Score</p>
                </div>
              </div>
            </div>

            {/* ACTIVE COURSE PROGRESS TRACKER */}
            {enrolledCourses.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-chart-simple text-[#5b34ea]"></i> My Course Progress Tracks
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {enrolledCourses.map(course => {
                    const courseLessons = lessons.filter(l => l.courseId === course.id);
                    const myCompleted = progress.filter(p => p.userId === currentUser.id && p.courseId === course.id);
                    const doneCount = myCompleted.length;
                    const totalCount = courseLessons.length;
                    const remaining = totalCount - doneCount;
                    const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

                    return (
                      <div 
                        key={course.id} 
                        className="bg-gray-50/50 hover:bg-gray-50 border border-gray-100/80 hover:border-purple-200 rounded-xl p-4 transition duration-200 cursor-pointer flex flex-col justify-between"
                        onClick={() => handleCourseClick(course.id)}
                      >
                        <div className="flex justify-between items-start gap-3 mb-3">
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{course.category}</h4>
                            <h3 className="text-sm font-bold text-gray-900 truncate mt-0.5">{course.title}</h3>
                          </div>
                          <span className="text-xs font-black text-[#5b34ea] bg-white border border-gray-100 px-2.5 py-1 rounded-lg shrink-0 shadow-sm leading-none">
                            {pct}%
                          </span>
                        </div>

                        {/* Interactive Tooltip Progress Bar */}
                        <div 
                          className="relative group/tooltip pt-2 pb-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="w-full h-2.5 bg-gray-200/50 rounded-full overflow-hidden relative">
                            <div 
                              className="h-full bg-gradient-to-r from-[#5b34ea] to-indigo-600 rounded-full transition-all duration-500" 
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>

                          {/* Hover Tooltip display */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[240px] bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-[11px] opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-300 shadow-xl flex flex-col gap-1 z-30 scale-95 origin-bottom group-hover/tooltip:scale-100">
                            <div className="flex items-center gap-1.5 font-extrabold text-[#a78bfa]">
                              <i className="fa-solid fa-graduation-cap"></i>
                              <span>{pct}% Course Completed</span>
                            </div>
                            <div className="text-gray-300 font-medium">
                              {remaining === 0 ? (
                                <span className="text-emerald-400 font-extrabold flex items-center gap-1 mt-0.5">
                                  <i className="fa-solid fa-circle-check text-xs"></i> Course Completed!
                                </span>
                              ) : (
                                <span className="text-amber-300 font-semibold">
                                  {remaining} {remaining === 1 ? 'lesson' : 'lessons'} remaining
                                </span>
                              )}
                            </div>
                            <div className="text-[9px] text-gray-400 border-t border-slate-800 pt-1 mt-1 font-semibold">
                              Progress: {doneCount} of {totalCount} lessons completed
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900"></div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100/50">
                          <span className="text-[10px] text-gray-400 font-semibold">Instructor: {course.instructor}</span>
                          <span className="text-[10px] text-[#5b34ea] font-extrabold hover:underline flex items-center gap-1">
                            Continue <i className="fa-solid fa-arrow-right text-[8px]"></i>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* POPULAR COURSES GRID */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span>Program Roadmaps</span>
                  <span className="text-[10px] bg-[#efe7ff] text-[#5b34ea] font-[800] px-2 py-0.5 rounded-full">
                    {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
                  </span>
                </h2>
                <p className="text-gray-400 text-xs mt-0.5">Explore guided software curricula and track your progress milestones.</p>
              </div>
              <span className="text-xs font-semibold text-[#5b34ea] hover:underline cursor-pointer" onClick={() => setView('student-courses')}>
                My full list →
              </span>
            </div>

            {/* REAL-TIME CATEGORY FILTERS */}
            <div className="flex flex-wrap gap-2 mb-5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`h-8 px-3.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer border flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-[#5b34ea] border-[#5b34ea] text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat === 'All' ? (
                    <i className="fa-solid fa-shapes text-indigo-400"></i>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  )}
                  <span>{cat}</span>
                </button>
              ))}
            </div>

            {/* SEARCH HISTORY CHIPS COMPONENT */}
            {searchHistory.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4 bg-purple-50/40 p-2.5 rounded-xl border border-purple-100/40 select-none">
                <span className="text-[11px] font-bold text-[#5b34ea] flex items-center gap-1.5 pl-1 shrink-0">
                  <i className="fa-solid fa-clock-rotate-left"></i> Recent searches:
                </span>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {searchHistory.map((term, index) => (
                    <div 
                      key={index} 
                      className="group flex items-center gap-1 bg-white hover:bg-purple-50/70 border border-purple-100/60 rounded-lg px-2.5 py-1 text-xs cursor-pointer shadow-sm hover:border-[#5b34ea] transition duration-150"
                      onClick={() => {
                        setSearchTerm(term);
                        setSelectedCategory('All');
                        addSearchHistory(term);
                      }}
                    >
                      <span className="text-gray-700 font-semibold group-hover:text-[#5b34ea]">{term}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSearchHistoryItem(term, e);
                        }}
                        className="w-4 h-4 rounded-full flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition cursor-pointer"
                        title="Delete search"
                      >
                        <i className="fa-solid fa-xmark text-[9px]"></i>
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    onClick={clearAllSearchHistory}
                    className="text-[10px] font-bold text-gray-400 hover:text-[#5b34ea] transition px-2 py-0.5 cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}

            {filteredCourses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center mb-6 shadow-sm">
                <div className="w-12 h-12 bg-purple-50 text-[#5b34ea] rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fa-solid fa-shapes text-lg"></i>
                </div>
                <h3 className="text-sm font-extrabold text-gray-900">No matching program roadmaps</h3>
                <p className="text-gray-400 text-xs mt-1 max-w-sm mx-auto leading-relaxed">
                  We couldn't find any courses matching your category &ldquo;<strong className="text-gray-700">{selectedCategory}</strong>&rdquo; or active search phrase.
                </p>
                <button
                  onClick={() => { setSelectedCategory('All'); setSearchTerm(''); }}
                  className="mt-4 h-9 px-4 bg-[#5b34ea]/10 hover:bg-[#5b34ea] text-[#5b34ea] hover:text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Reset Active Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {filteredCourses.slice(0, 4).map((course, idx) => {
                  const isMyCourse = enrollments.some(e => e.userId === currentUser.id && e.courseId === course.id);
                  
                  // Calculate lessons and progress
                  const courseLessons = lessons.filter(l => l.courseId === course.id);
                  const myCompleted = progress.filter(p => p.userId === currentUser.id && p.courseId === course.id);
                  const doneCount = myCompleted.length;
                  const totalCount = courseLessons.length;
                  const remaining = totalCount - doneCount;
                  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

                  return (
                    <div key={course.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:scale-[1.01] transition duration-200 cursor-pointer flex flex-col justify-between" onClick={() => handleCourseClick(course.id)}>
                      <div className="relative h-[110px] bg-purple-50">
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                        {isMyCourse && <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">Enrolled</span>}
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div className="mb-3">
                          <h3 className="text-sm font-bold line-clamp-1 mb-1">{course.title}</h3>
                          <p className="text-gray-400 text-xs">{course.instructor} • {course.category}</p>
                          
                          {/* Completion progress bar inside the roadmap card */}
                          {isMyCourse && (
                            <div 
                              className="relative group/tooltip mt-3.5 pt-0.5"
                              onClick={(e) => {
                                // Prevent navigation click bubbling inside tooltip
                                e.stopPropagation();
                              }}
                            >
                              <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 mb-1">
                                <span>Practice Track</span>
                                <span>{pct}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-purple-50 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#5b34ea] to-indigo-500 rounded-full transition-all duration-300" style={{ width: `${pct}%` }}></div>
                              </div>
                              
                              {/* Interactive tooltip displaying exact lessons remaining */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[210px] bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-[11px] opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-300 shadow-xl flex flex-col gap-1 z-30 scale-95 origin-bottom group-hover/tooltip:scale-100">
                                <div className="flex items-center gap-1.5 font-extrabold text-[#a78bfa]">
                                  <i className="fa-solid fa-graduation-cap"></i>
                                  <span>{pct}% Done</span>
                                </div>
                                <div className="text-gray-300 font-medium">
                                  {remaining === 0 ? (
                                    <span className="text-emerald-400 font-extrabold flex items-center gap-1 mt-0.5">
                                      <i className="fa-solid fa-circle-check text-xs"></i> Completed!
                                    </span>
                                  ) : (
                                    <span className="text-amber-300 font-semibold">
                                      {remaining} {remaining === 1 ? 'lesson' : 'lessons'} remaining
                                    </span>
                                  )}
                                </div>
                                <div className="text-[9px] text-gray-400 border-t border-slate-800 pt-1 mt-1 font-semibold">
                                  Done: {doneCount} of {totalCount} lessons
                                </div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900"></div>
                              </div>
                            </div>
                          )}
                        </div>
                        <button className="w-full h-9 rounded-lg bg-[#5b34ea]/10 hover:bg-[#5b34ea] hover:text-white text-[#5b34ea] text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer">
                          <span>{isMyCourse ? '▶ Continue Course' : '📚 Enroll for Free'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ACCORDION FEED DETAIL PAGES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="pb-3 mb-3 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-gray-900">User Progress Activity</h3>
                </div>
                <div className="flex flex-col gap-3">
                  {progress.filter(p => p.userId === currentUser.id).length > 0 ? (
                    progress.filter(p => p.userId === currentUser.id).slice(0, 3).map((prog, idx) => {
                      const matchedLesson = lessons.find(l => l.id === prog.lessonId);
                      return (
                        <div key={idx} className="flex gap-3 items-center">
                          <div className="min-w-8 min-h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center text-xs">✓</div>
                          <div className="flex-1">
                            <h4 className="text-xs font-semibold text-gray-800">Completed Lesson: {matchedLesson ? matchedLesson.title : 'Overview'}</h4>
                            <p className="text-[10px] text-gray-400">{new Date(prog.completedAt).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-gray-400 text-xs">No lesson completions recorded. Mark lessons complete inside your courses!</div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="pb-3 mb-3 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-gray-900">Recent Quiz Grades</h3>
                  <div className="flex gap-3">
                    <span className="text-xs font-bold text-[#5b34ea]/80 cursor-pointer hover:underline" onClick={() => setSubView('history')}>History 📋</span>
                    <span className="text-xs font-bold text-gray-400 cursor-pointer hover:underline" onClick={() => setView('student-quiz')}>Take a quiz</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {myAttempts.length > 0 ? (
                    myAttempts.slice(0, 3).map((att, idx) => {
                      const matchedCourse = courses.find(c => c.id === att.courseId);
                      return (
                        <div key={idx} className="flex justify-between items-center py-1">
                          <div>
                            <h4 className="text-xs font-bold text-gray-800">{matchedCourse ? matchedCourse.title : 'Course Exam'}</h4>
                            <p className="text-[10px] text-gray-400">Score: {att.correctCount}/{att.totalCount} correct</p>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded-md ${att.score >= 80 ? 'bg-green-50 text-green-500' : 'bg-amber-50 text-amber-500'}`}>{att.score}%</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-gray-400 text-xs">No quiz scores recorded yet. Let\'s practice in the Quizzes panel!</div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE OPTIONS BAR */}
          <div className="w-[340px] flex flex-col gap-4 shrink-0 hidden lg:flex">
            
            {/* Announcements */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-bullhorn text-indigo-600"></i> Platform Announcements
              </h3>
              <div className="flex flex-col gap-4">
                {announcements.map(ann => (
                  <div key={ann.id} className="border-b border-gray-50 pb-2 last:border-none last:pb-0">
                    <h4 className="text-xs font-semibold text-gray-900 mb-1">{ann.title}</h4>
                    <p className="text-[11px] text-gray-500 mb-2 leading-relaxed">{ann.excerpt}</p>
                    <span className="text-[10px] text-gray-400">{ann.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bookmarks */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="fa-regular fa-bookmark text-indigo-600"></i> Bookmarked
              </h3>
              <div className="flex flex-col gap-3">
                {bookmarkedCourses.length > 0 ? (
                  bookmarkedCourses.map(course => (
                    <div key={course.id} className="flex justify-between items-center hover:bg-gray-50 cursor-pointer p-1 rounded-lg" onClick={() => handleCourseClick(course.id)}>
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{course.title}</h4>
                        <p className="text-[10px] text-gray-400">{course.category}</p>
                      </div>
                      <i className="fa-solid fa-chevron-right text-gray-300 text-[10px]"></i>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400 text-xs">No bookmarks saved. Click favorite inside any course!</div>
                )}
              </div>
            </div>

            {/* Leaderboard Fast Access Promo Badge */}
            <div 
              className="bg-gradient-to-br from-[#2e1ea0] to-[#5b34ea] text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md hover:scale-[1.01] transition duration-200 select-none"
              onClick={() => setSubView('leaderboard')}
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-white/10 backdrop-blur-md text-purple-200 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border border-white/5 flex items-center gap-1.5">
                    <i className="fa-solid fa-trophy text-yellow-300"></i> Academy Podium
                  </span>
                  <i className="fa-solid fa-chevron-right text-purple-200 text-xs"></i>
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Quiz Leaderboard</h4>
                <p className="text-[11px] text-purple-100 leading-relaxed">See who reigns the engineering rankings and claim your spot on the top 3 podium!</p>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between pointer-events-none">
                <div className="flex -space-x-2 overflow-hidden">
                  <img className="inline-block h-6 w-6 rounded-full ring-2 ring-[#2e1ea0] object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=facearea&facepad=2&w=100&h=100" alt="Sarah" />
                  <img className="inline-block h-6 w-6 rounded-full ring-2 ring-[#2e1ea0] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=facearea&facepad=2&w=100&h=100" alt="Michael" />
                  <img className="inline-block h-6 w-6 rounded-full ring-2 ring-[#2e1ea0] object-cover" src="https://randomuser.me/api/portraits/men/32.jpg" alt="You" />
                </div>
                <span className="text-[10px] text-yellow-300 font-bold hover:underline">View Standings →</span>
              </div>
            </div>

          </div>

            </>
          )}

        </div>

      </main>

    </div>
  );
};
