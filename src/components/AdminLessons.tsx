import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { ViewState } from '../types';

interface AdminLessonsProps {
  setView: (view: ViewState) => void;
}

export const AdminLessons: React.FC<AdminLessonsProps> = ({ setView }) => {
  const { courses, lessons, createLesson, deleteLesson, logout } = useLms();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Selection
  const [selectedCourseId, setSelectedCourseId] = useState<number>(() => {
    return courses[0] ? courses[0].id : 1;
  });

  // Inputs
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDuration, setLessonDuration] = useState('');
  const [lessonOrder, setLessonOrder] = useState('1');
  const [videoUrl, setVideoUrl] = useState('');

  const activeCourse = courses.find(c => c.id === selectedCourseId) || courses[0];
  const activeLessons = lessons.filter(l => l.courseId === selectedCourseId);

  const handleLogout = () => {
    logout();
    setView('home');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle) {
      alert('Lesson title is required.');
      return;
    }

    try {
      await createLesson({
        courseId: selectedCourseId,
        title: lessonTitle.trim(),
        duration: lessonDuration.trim() || '15:00',
        order: Number(lessonOrder) || 1,
        videoUrl: videoUrl.trim()
      });

      // Reset
      setLessonTitle('');
      setLessonDuration('');
      setLessonOrder('1');
      setVideoUrl('');
      alert('Lesson successfully uploaded & appended to curriculum!');
    } catch (err: any) {
      alert(err.message || 'Error occurred.');
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
                  className="h-11 rounded-xl flex items-center gap-4 px-4 bg-white/10 text-white font-semibold cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <i className="fa-regular fa-circle-play"></i> Upload Lessons
                </span>
                <span 
                  className="h-11 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                  onClick={() => { setView('admin-quizzes'); setMobileMenuOpen(false); }}
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
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 bg-white/10 text-white font-semibold cursor-pointer">
              <i className="fa-regular fa-circle-play"></i> Upload Lessons
            </span>
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer" onClick={() => setView('admin-quizzes')}>
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

        {/* GRIDS COLUMN */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          
          {/* UPLOAD FORM COLUMN */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-[800] leading-none mb-1 text-gray-900 tracking-tight">Upload Course Lessons</h1>
              <p className="text-gray-500 text-xs">Append new video lessons, content checksheets or text modules to the active course syllabus.</p>
            </div>

            {/* CURRICULUM UPLOADER PANEL */}
            <div className="bg-white border border-[#ececf4] rounded-2xl p-6 md:p-8 shadow-sm">
              <h3 className="font-bold text-[#5b21ff] text-base mb-6">Lesson Metadata Details</h3>
              
              <form onSubmit={handleSave} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700">Lesson Title *</label>
                    <input type="text" required value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} className="w-full h-11 border border-gray-200 rounded-lg px-3 outline-none focus:border-[#5a35ff] text-xs" placeholder="e.g. Introduction to CSS selectors" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700">Duration (minute value, e.g. 15:00)</label>
                    <input type="text" value={lessonDuration} onChange={(e) => setLessonDuration(e.target.value)} className="w-full h-11 border border-gray-200 rounded-lg px-3 outline-none focus:border-[#5a35ff] text-xs" placeholder="e.g. 15:00" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700">Order placement number</label>
                    <input type="number" value={lessonOrder} onChange={(e) => setLessonOrder(e.target.value)} className="w-full h-11 border border-gray-200 rounded-lg px-3 outline-none focus:border-[#5a35ff] text-xs" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700 font-sans">Lesson Video URL</label>
                    <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="w-full h-11 border border-gray-200 rounded-lg px-3 outline-none focus:border-[#5a35ff] text-xs" placeholder="https://..." />
                  </div>
                </div>

                {/* Vector Drag-and-drop box decoration mockup */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center select-none mt-4 hover:border-[#5b21ff]/40 transition">
                  <i className="fa-solid fa-cloud-arrow-up text-[42px] text-[#5b21ff] mb-3"></i>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">Drag and drop resource files</h4>
                  <p className="text-gray-400 text-xs">Supports MP4, PDF, DOC, PPT slides (Max size: 500MB)</p>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button type="submit" className="h-11 px-6 bg-[#5a35ff] text-white rounded-xl text-xs font-bold hover:bg-[#4a24c4] transition cursor-pointer flex items-center justify-center gap-1.5"><i className="fa-solid fa-upload"></i> Append Lesson</button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT SIDEBAR ACTIVE LESSONS GRID */}
          <div className="bg-white border border-[#ececf4] rounded-2xl p-5 shadow-sm overflow-hidden flex flex-col h-full min-h-[400px]">
            <h3 className="font-bold text-gray-900 text-base mb-4">Lessons in "{activeCourse?.title}"</h3>
            
            <div className="flex-1 overflow-y-auto space-y-4">
              {activeLessons.length > 0 ? (
                activeLessons.map((lesson, idx) => (
                  <div key={lesson.id} className="flex justify-between items-center bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs">
                    <div>
                      <h4 className="font-bold text-gray-800 line-clamp-1">{idx+1}. {lesson.title}</h4>
                      <span className="text-[10px] text-gray-400">Duration: {lesson.duration}</span>
                    </div>
                    <button 
                      className="text-red-500 hover:bg-red-50 transition border border-red-100 bg-white p-1.5 rounded-md font-bold text-[10px] cursor-pointer"
                      onClick={() => {
                        if (window.confirm(`Delete lesson "${lesson.title}"?`)) {
                          deleteLesson(lesson.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center py-12 text-gray-400 text-xs">No lessons added yet. Populate using the metadata form.</p>
              )}
            </div>
          </div>

        </div>

      </main>

    </div>
  );
};
