import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { ViewState } from '../types';

interface StudentCoursesProps {
  setView: (view: ViewState) => void;
  selectedCourseId: number | null;
  setSelectedCourseId: (id: number) => void;
}

export const StudentCourses: React.FC<StudentCoursesProps> = ({ setView, selectedCourseId, setSelectedCourseId }) => {
  const { 
    currentUser, courses, lessons, enrollments, progress, 
    bookmarks, toggleBookmark, markLessonComplete, logout 
  } = useLms();

  const [activeTab, setActiveTab] = useState<'content' | 'about' | 'reviews' | 'announcements'>('content');

  // Protect view
  if (!currentUser) return null;

  // Resolve current active course
  const defaultCourseId = courses[0] ? courses[0].id : 1;
  const activeId = selectedCourseId || defaultCourseId;
  const activeCourse = courses.find(c => c.id === activeId) || courses[0];

  const handleLogout = () => {
    logout();
    setView('home');
  };

  if (!activeCourse) {
    return <div className="p-8 text-center text-gray-500 text-sm">No courses found on this system.</div>;
  }

  // Calculate course values
  const courseLessons = lessons.filter(l => l.courseId === activeCourse.id);
  const myCompletedLessons = progress.filter(
    p => p.userId === currentUser.id && p.courseId === activeCourse.id
  );
  
  const completionPercentage = courseLessons.length > 0 
    ? Math.round((myCompletedLessons.length / courseLessons.length) * 100)
    : 0;

  const isBookmarked = bookmarks.some(b => b.userId === currentUser.id && b.courseId === activeCourse.id);
  const isEnrolled = enrollments.some(e => e.userId === currentUser.id && e.courseId === activeCourse.id);

  const toggleLesson = async (lessonId: number) => {
    try {
      await markLessonComplete(activeCourse.id, lessonId);
    } catch (err: any) {
      alert(err.message || 'Progress update failed.');
    }
  };

  return (
    <div className="w-screen h-screen flex bg-[#f5f6fb] text-[#111] overflow-hidden font-sans text-sm">
      
      {/* SIDEBAR */}
      <aside className="w-[255px] bg-gradient-to-b from-[#2e1ea0] to-[#24188b] text-white p-6 justify-between flex-col hidden md:flex overflow-y-auto">
        <div>
          <div className="flex items-center gap-4 mb-10 cursor-pointer" onClick={() => setView('home')}>
            <i className="fa-solid fa-graduation-cap text-white text-[30px]"></i>
            <h2 className="text-[20px] font-bold leading-tight">Edunova<br /><span className="text-sm font-normal text-purple-200">Smart Learning</span></h2>
          </div>

          <nav className="flex flex-col gap-2">
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 text-purple-100 hover:bg-white/10 hover:text-white transition cursor-pointer" onClick={() => setView('student-dashboard')}>
              <i className="fa-solid fa-house"></i> Dashboard
            </span>
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 bg-white text-[#5b34ea] font-semibold cursor-pointer">
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

        {/* Upgrade Card banner */}
        <div className="bg-white rounded-2xl p-5 text-gray-900 mt-8 relative overflow-hidden select-none">
          <h3 className="text-lg font-[800] bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent mb-1">
            Keep growing! 🚀
          </h3>
          <p className="text-gray-500 text-xs mb-4">Enroll in free lessons and unlock verifications.</p>
          <button className="w-full h-10 rounded-xl bg-[#5b34ea] text-white font-semibold hover:bg-[#4a24c4] transition text-xs cursor-pointer" onClick={() => setView('student-dashboard')}>
            Explore Free Courses
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-6">
            {courses.length > 1 && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400">Switch Course Detail:</span>
                <select 
                  className="bg-gray-50 border border-gray-200 rounded-xl p-2 font-bold text-gray-700 outline-none text-xs cursor-pointer"
                  value={activeCourse.id}
                  onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                >
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
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
          </div>
        </header>

        {/* DETAILS GRID HOST */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          
          <div className="flex flex-col gap-6">
            {/* Back to list */}
            <span className="text-[#5b34ea] text-xs font-bold hover:underline flex items-center gap-2 cursor-pointer inline-block" onClick={() => setView('student-dashboard')}>
              <i className="fa-solid fa-chevron-left text-[10px]"></i> Back to Dashboard
            </span>

            {/* HERO CARD */}
            <div className="bg-white border border-gray-100 rounded-[18px] p-5 shadow-sm grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 items-center">
              <div className="relative h-[200px] rounded-2xl overflow-hidden bg-purple-100">
                <img src={activeCourse.thumbnail} alt={activeCourse.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 flex gap-1.5 flex-col">
                  <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded">HTML</span>
                  <span className="bg-blue-400 text-white text-[10px] font-bold px-2 py-1 rounded">CSS</span>
                  <span className="bg-[#fbbf24] text-white text-[10px] font-bold px-2 py-1 rounded">JS</span>
                </div>
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-[800] leading-tight text-gray-900 mb-3">{activeCourse.title}</h1>
                <p className="text-gray-500 text-xs mb-4 leading-relaxed line-clamp-2">{activeCourse.description}</p>
                
                <div className="flex items-center gap-6 mb-4 flex-wrap text-xs text-gray-600">
                  <div className="flex items-center gap-1.5"><i className="fa-solid fa-star text-[#f4b400]"></i> {activeCourse.rating} ({activeCourse.reviewsCount.toLocaleString()} Reviews)</div>
                  <div className="flex items-center gap-1.5"><i className="fa-solid fa-users"></i> {activeCourse.instructor}</div>
                  <div className="flex items-center gap-1.5"><i className="fa-solid fa-tag"></i> {activeCourse.price ? `$${activeCourse.price}` : 'Free Course'}</div>
                </div>

                {isEnrolled && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-2">
                      <span>Course Progress Track</span>
                      <span>{completionPercentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-purple-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5b34ea] rounded-full" style={{ width: `${completionPercentage}%` }}></div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 flex-wrap">
                  <button 
                    className="h-11 px-6 rounded-xl bg-[#5b34ea] text-white font-bold hover:bg-[#4a24c4] transition shadow-md text-xs cursor-pointer flex items-center justify-center gap-2"
                    onClick={() => setView('student-quiz')}
                  >
                    <i className="fa-solid fa-play"></i> Start Quiz / Practice
                  </button>
                  <button 
                    className="h-11 px-6 rounded-xl border border-gray-200 hover:border-[#5b34ea] hover:bg-[#faf9ff] text-gray-700 hover:text-[#5b34ea] font-semibold transition text-xs cursor-pointer flex items-center justify-center gap-2"
                    onClick={() => toggleBookmark(activeCourse.id)}
                  >
                    <i className={`${isBookmarked ? 'fa-solid' : 'fa-regular'} fa-bookmark text-indigo-500`}></i> 
                    {isBookmarked ? 'Bookmarked' : 'Add to Bookmarks'}
                  </button>
                </div>
              </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="bg-white border border-gray-100 rounded-[18px] overflow-hidden shadow-sm">
              <div className="flex border-b border-gray-100 h-14 items-center px-6 gap-8 text-xs font-bold text-gray-500">
                <span className={`h-full flex items-center cursor-pointer relative ${activeTab === 'content' ? 'text-[#5b34ea]' : 'hover:text-gray-800'}`} onClick={() => setActiveTab('content')}>
                  Course Content
                  {activeTab === 'content' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5b34ea] rounded-full"></span>}
                </span>
                <span className={`h-full flex items-center cursor-pointer relative ${activeTab === 'about' ? 'text-[#5b34ea]' : 'hover:text-gray-800'}`} onClick={() => setActiveTab('about')}>
                  About Course
                  {activeTab === 'about' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5b34ea] rounded-full"></span>}
                </span>
                <span className={`h-full flex items-center cursor-pointer relative ${activeTab === 'reviews' ? 'text-[#5b34ea]' : 'hover:text-gray-800'}`} onClick={() => setActiveTab('reviews')}>
                  Reviews ({activeCourse.reviewsCount.toLocaleString()})
                  {activeTab === 'reviews' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5b34ea] rounded-full"></span>}
                </span>
                <span className={`h-full flex items-center cursor-pointer relative ${activeTab === 'announcements' ? 'text-[#5b34ea]' : 'hover:text-gray-800'}`} onClick={() => setActiveTab('announcements')}>
                  Announcements
                  {activeTab === 'announcements' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5b34ea] rounded-full"></span>}
                </span>
              </div>

              <div className="p-6">
                
                {/* COURSE CONTENT */}
                {activeTab === 'content' && (
                  <div className="flex flex-col gap-4">
                    <div className="bg-[#fafbfc] border border-gray-100 rounded-xl p-4 flex justify-between items-center">
                      <h3 className="font-bold text-gray-900 text-sm">Course Outline Lessons</h3>
                      <p className="text-gray-500 text-xs">{courseLessons.length} modules available</p>
                    </div>

                    <div className="flex flex-col divide-y divide-gray-50">
                      {courseLessons.length > 0 ? (
                        courseLessons.map((lesson, idx) => {
                          const done = progress.some(p => p.userId === currentUser.id && p.courseId === activeCourse.id && p.lessonId === lesson.id);
                          return (
                            <div 
                              key={lesson.id} 
                              className={`flex justify-between items-center py-4 cursor-pointer transition px-4 rounded-xl ${done ? 'bg-green-50/40 text-green-800' : 'hover:bg-gray-50'}`}
                              onClick={() => toggleLesson(lesson.id)}
                              title={done ? 'Lesson Completed' : 'Click to complete lesson'}
                            >
                              <div className="flex items-center gap-4">
                                <i className={`text-sm ${done ? 'fa-solid fa-circle-check text-green-500' : 'fa-regular fa-circle-play text-gray-400'}`}></i>
                                <span className={`font-semibold ${done ? 'text-green-800 line-through decoration-1' : 'text-gray-800'}`}>
                                  {idx + 1}. {lesson.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-6">
                                <span className="text-xs text-gray-400">{lesson.duration}</span>
                                {done ? (
                                  <span className="bg-green-100 text-green-600 rounded-full px-2 py-0.5 text-[10px] font-bold">Done</span>
                                ) : (
                                  <span className="text-[10px] text-purple-600 font-bold bg-purple-50 hover:bg-purple-100 transition px-2 py-1 rounded-md">Mark done</span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-gray-400">No lessons uploaded yet for this course.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* ABOUT COURSE */}
                {activeTab === 'about' && (
                  <div className="leading-relaxed text-gray-600 text-sm flex flex-col gap-4">
                    <p>{activeCourse.description}</p>
                    <p className="font-semibold text-gray-800">What you will master:</p>
                    <ul className="list-disc pl-6 flex flex-col gap-2">
                      <li>Understand core baseline syntax blocks and execution systems.</li>
                      <li>Incorporate modular components and layouts that adapt across modern view sizes seamlessly.</li>
                      <li>Deploy operational interfaces with secure sandboxed parameters.</li>
                    </ul>
                  </div>
                )}

                {/* REVIEWS */}
                {activeTab === 'reviews' && (
                  <div className="flex flex-col gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-4">
                      <h2 className="text-4xl font-extrabold text-purple-900">{activeCourse.rating}</h2>
                      <div>
                        <h3>Stellar Student Review index</h3>
                        <p className="text-gray-400 text-xs">Accumulated from 100% completed members</p>
                      </div>
                    </div>
                    <div className="flex flex-col divide-y divide-gray-50">
                      <div className="py-4">
                        <div className="flex justify-between mb-1.5">
                          <strong className="text-gray-800">Sarah J.</strong>
                          <span className="text-[#f4b400]">★★★★★</span>
                        </div>
                        <p className="text-gray-500 text-xs">Fantastic modular system. The widgets and sandbox state logic allowed me to execute projects in under 3 days.</p>
                      </div>
                      <div className="py-4">
                        <div className="flex justify-between mb-1.5">
                          <strong className="text-gray-800">Michael B.</strong>
                          <span className="text-[#f4b400]">★★★★☆</span>
                        </div>
                        <p className="text-gray-500 text-xs">High fidelity design that perfectly scales on mobile views. The instant lesson completeness tracker is superb!</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ANNOUNCEMENTS */}
                {activeTab === 'announcements' && (
                  <div className="flex flex-col gap-4">
                    <div className="p-4 bg-indigo-50 text-indigo-800 rounded-xl border border-indigo-100">
                      <h4 className="font-bold mb-1">🎉 Verifiable Certs Enabled</h4>
                      <p className="text-xs">Once the progress bar strikes 100%, check your student Profile page immediately. A unique golden completion cert has been issued under your active name!</p>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            
            {/* ABOUT CARD */}
            <div className="bg-white border border-gray-100 rounded-[18px] p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 text-base mb-4">Course Specifications</h3>
              <div className="flex flex-col gap-4 text-xs text-gray-700">
                <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                  <span><i className="fa-regular fa-user mr-2 text-indigo-500"></i> Instructor</span>
                  <span className="font-bold text-[#5b34ea]">{activeCourse.instructor}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                  <span><i className="fa-regular fa-clock mr-2 text-indigo-500"></i> Duration</span>
                  <span className="font-bold text-gray-900">10h 30m</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                  <span><i className="fa-regular fa-rectangle-list mr-2 text-indigo-500"></i> Lessons</span>
                  <span className="font-bold text-gray-900">{courseLessons.length} Lessons</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                  <span><i className="fa-solid fa-globe mr-2 text-indigo-500"></i> Language</span>
                  <span className="font-bold text-gray-900">English Standard</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                  <span><i className="fa-regular fa-id-badge mr-2 text-indigo-500"></i> Certificate</span>
                  <span className="font-bold text-purple-600">Yes, Verifiable</span>
                </div>
              </div>
            </div>

            {/* RESOURCE DOWNLANDS */}
            <div className="bg-white border border-gray-100 rounded-[18px] p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 text-base mb-4">Curriculum Downloads</h3>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <div className="flex items-center gap-3">
                    <i className="fa-regular fa-file-pdf text-red-500 text-base"></i>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">Course Notes Guide</h4>
                      <span className="text-[10px] text-gray-400">2.4 MB • PDF</span>
                    </div>
                  </div>
                  <span className="text-gray-400 hover:text-[#5b34ea] cursor-pointer text-sm" onClick={() => alert('Download starting for Course Notes (PDF)...')}><i className="fa-solid fa-download"></i></span>
                </div>

                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <div className="flex items-center gap-3">
                    <i className="fa-regular fa-file-lines text-blue-500 text-base"></i>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">HTML Checklist Sheet</h4>
                      <span className="text-[10px] text-gray-400">1.1 MB • PDF</span>
                    </div>
                  </div>
                  <span className="text-gray-400 hover:text-[#5b34ea] cursor-pointer text-sm" onClick={() => alert('Download starting for HTML Checklist (PDF)...')}><i className="fa-solid fa-download"></i></span>
                </div>

                <div className="flex justify-between items-center pb-2">
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-globe text-[#fbbf24] text-base"></i>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">Verify Certification Keys</h4>
                      <span className="text-[10px] text-gray-400">Verifiably Online</span>
                    </div>
                  </div>
                  <span className="text-gray-400 hover:text-[#5b34ea] cursor-pointer text-sm" onClick={() => setView('student-profile')}><i className="fa-solid fa-arrow-up-right-from-square"></i></span>
                </div>
              </div>
            </div>

            {/* CONTACT HELP SUPPORT CARD */}
            <div className="bg-[#f1edff] rounded-[18px] p-5 border border-purple-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-purple-950 mb-1">Need assistance?</h3>
                <p className="text-gray-600 text-xs mb-4 leading-relaxed">Reach out to our student helpline desk instantly.</p>
                <button className="px-4 py-2 bg-[#5b34ea] text-white rounded-lg text-xs font-bold hover:bg-[#4a24c4] transition cursor-pointer" onClick={() => alert('Support ticket launched. Our team will email your profile soon.')}>
                  Contact Help
                </button>
              </div>
              <img src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png" className="w-[84px] h-[84px] object-contain ml-2" alt="support" />
            </div>

          </div>

        </div>

      </main>

    </div>
  );
};
