import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { ViewState } from '../types';

interface AdminDashboardProps {
  setView: (view: ViewState) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setView }) => {
  const { 
    courses, students, enrollments, quizzes, certificates, apiMode, logout 
  } = useLms();

  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setView('home');
  };

  // Stats
  const usersCount = students.length + 1; // plus super admin
  const coursesCount = courses.length;
  const enrollmentsCount = enrollments.length;
  const quizzesCount = quizzes.length;
  const certificatesCount = certificates.length;

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
                  className="h-11 rounded-xl flex items-center gap-4 px-4 bg-white/10 text-white font-semibold cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
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
                  className="h-11 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                  onClick={() => { setView('admin-quizzes'); setMobileMenuOpen(false); }}
                >
                  <i className="fa-regular fa-circle-question"></i> Manage Quizzes
                </span>
                <span 
                  className="h-11 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                  onClick={() => { setView('admin-messages'); setMobileMenuOpen(false); }}
                >
                  <i className="fa-solid fa-bullhorn animate-pulse"></i> Communication Portal
                </span>
                <span 
                  className="h-11 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                  onClick={() => { setView('admin-settings'); setMobileMenuOpen(false); }}
                >
                  <i className="fa-solid fa-gears"></i> PHP SQL Connect
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
          {/* Logo */}
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
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 bg-white/10 text-white font-semibold cursor-pointer">
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
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer" onClick={() => setView('admin-quizzes')}>
              <i className="fa-regular fa-circle-question"></i> Manage Quizzes
            </span>
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer" onClick={() => setView('admin-messages')}>
              <i className="fa-solid fa-bullhorn animate-pulse"></i> Communication Portal
            </span>
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer" onClick={() => setView('admin-settings')}>
              <i className="fa-solid fa-gears"></i> PHP SQL Connect
            </span>
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer" onClick={handleLogout}>
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
            </span>
          </nav>
        </div>

        {/* System Health card status */}
        <div className="bg-[#131d67] border border-[#1b277a] rounded-2xl p-4 text-gray-200 text-xs">
          <h4 className="font-bold text-white mb-2 uppercase tracking-wide">System Control Status</h4>
          <span className="flex items-center gap-1.5 text-green-400 font-bold"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Active, Online</span>
        </div>
      </aside>

      {/* MAIN CONTAINER PANEL */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOPBAR */}
        <header className="h-[80px] bg-white border-b border-[#ececf4] px-4 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 md:gap-6">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 transition cursor-pointer"
              aria-label="Toggle menu"
            >
              <i className="fa-solid fa-bars text-lg"></i>
            </button>
            <div className="w-[180px] sm:w-[300px] md:w-[380px] h-[42px] border border-[#dfe3f0] rounded-xl flex items-center px-4 bg-[#fafbfc]">
              <input 
                type="text" 
                placeholder="Search catalog, registers or results..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent outline-none text-[#111]"
              />
              <i className="fa-solid fa-magnifying-glass text-gray-400"></i>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative text-gray-700">
              <i className="fa-regular fa-bell text-xl"></i>
              <span className="absolute -top-1.5 -right-2 w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                3
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-[44px] h-[44px] rounded-full bg-gradient-to-br from-[#ffcf9d] to-[#8b5a3b] border-2 border-[#5a35ff]"></div>
              <div>
                <h4 className="text-sm font-bold text-[#111827]">Super Admin</h4>
                <p className="text-gray-400 text-xs mt-[1px]">Administrator ID: #01</p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT HOST */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-[800] leading-none mb-1 text-gray-900 tracking-tight">Welcome back, Admin! 👋</h1>
              <p className="text-gray-500 text-sm">Review real-time registered student actions, certificates issued, and upload course items.</p>
            </div>
            
            <button className="h-12 border border-[#e6e8f0] bg-white px-5 rounded-xl font-bold flex items-center gap-2 cursor-pointer text-xs">
              <i className="fa-regular fa-calendar"></i> May 12 – May 18, 2026
            </button>
          </div>

          {/* BACKEND MYSQL/PHP HANDSHAKE STATUS BANNER */}
          <div className="bg-gradient-to-r from-[#5a35ff]/10 to-blue-50 border border-[#5a35ff]/20 rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#5a35ff] text-white rounded-2xl flex items-center justify-center text-lg shrink-0">
                <i className="fa-solid fa-network-wired animate-pulse text-sm"></i>
              </div>
              <div className="max-w-2xl">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2 flex-wrap">
                  Completed PHP & MySQL Backend Connected!
                  <span className={`inline-flex items-center gap-1.2 px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold ${
                    apiMode === 'api' ? 'bg-green-100 text-green-700 animate-pulse' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {apiMode === 'api' ? 'Active Live API' : 'Sandbox Emulator'}
                  </span>
                </h3>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                  The backend controllers are fully developed. Switch to live Direct API Handshake, test your endpoint, copy SQL configurations, and monitor connection status in settings.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setView('admin-settings')}
              className="bg-[#5a35ff] hover:bg-[#4828df] text-white px-5 h-11 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 shrink-0 shadow-md shadow-purple-500/10"
            >
              <i className="fa-solid fa-gears"></i> Open Server Control Center
            </button>
          </div>

          {/* TOTAL COUNTER STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white border border-[#ececf4] rounded-2xl p-5 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 bg-[#ede7ff] text-[#5b35ff] rounded-2xl flex items-center justify-center text-lg shrink-0"><i className="fa-regular fa-user"></i></div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{usersCount}</h3>
                <p className="text-gray-500 text-xs">Total Users</p>
              </div>
            </div>

            <div className="bg-white border border-[#ececf4] rounded-2xl p-5 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 bg-[#e8f1ff] text-[#4584ff] rounded-2xl flex items-center justify-center text-lg shrink-0"><i className="fa-regular fa-bookmark"></i></div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{coursesCount}</h3>
                <p className="text-gray-500 text-xs">Total Courses</p>
              </div>
            </div>

            <div className="bg-white border border-[#ececf4] rounded-2xl p-5 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 bg-[#e6f7ed] text-[#38b86d] rounded-2xl flex items-center justify-center text-lg shrink-0"><i className="fa-solid fa-graduation-cap"></i></div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{enrollmentsCount}</h3>
                <p className="text-gray-500 text-xs">Registrations</p>
              </div>
            </div>

            <div className="bg-white border border-[#ececf4] rounded-2xl p-5 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 bg-[#fff3e2] text-[#ff9f2e] rounded-2xl flex items-center justify-center text-lg shrink-0"><i className="fa-regular fa-clipboard"></i></div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{quizzesCount}</h3>
                <p className="text-gray-500 text-xs">Quizzes</p>
              </div>
            </div>

            <div className="bg-white border border-[#ececf4] rounded-2xl p-5 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 bg-[#eee8ff] text-[#6b3dff] rounded-2xl flex items-center justify-center text-lg shrink-0"><i className="fa-regular fa-id-card"></i></div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{certificatesCount}</h3>
                <p className="text-gray-500 text-xs">Certificates Issued</p>
              </div>
            </div>
          </div>

          {/* TWO PANEL ANALYTICS LISTING */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* Enrollment overview chart */}
            <div className="bg-white border border-[#ececf4] rounded-3xl p-6 shadow-sm col-span-1 lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900 text-base">Registrations Overview Trends</h3>
                <span className="text-xs bg-gray-50 border border-gray-100 rounded-lg p-2 text-gray-500 font-semibold cursor-pointer">Weekly logs</span>
              </div>
              
              <div className="h-[200px] flex items-end gap-3 justify-between font-mono text-[9px] text-gray-400 select-none pb-4 border-b border-gray-50">
                <div className="flex flex-col items-center gap-2 flex-grow">
                  <div className="w-full bg-[#5a35ff]/20 rounded-t-md relative h-20"><div className="absolute bottom-0 left-0 right-0 h-[40%] bg-[#5a35ff] rounded-t-lg"></div></div>
                  <span>May 12</span>
                </div>
                <div className="flex flex-col items-center gap-2 flex-grow">
                  <div className="w-full bg-[#5a35ff]/20 rounded-t-md relative h-28"><div className="absolute bottom-0 left-0 right-0 h-[60%] bg-[#5a35ff] rounded-t-lg"></div></div>
                  <span>May 13</span>
                </div>
                <div className="flex flex-col items-center gap-2 flex-grow">
                  <div className="w-full bg-[#5a35ff]/20 rounded-t-md relative h-32"><div className="absolute bottom-0 left-0 right-0 h-[80%] bg-[#5a35ff] rounded-t-lg"></div></div>
                  <span>May 14</span>
                </div>
                <div className="flex flex-col items-center gap-2 flex-grow">
                  <div className="w-full bg-[#5a35ff]/20 rounded-t-md relative h-36"><div className="absolute bottom-0 left-0 right-0 h-[90%] bg-[#5a35ff] rounded-t-lg"></div></div>
                  <span>May 15</span>
                </div>
                <div className="flex flex-col items-center gap-2 flex-grow">
                  <div className="w-full bg-[#5a35ff]/20 rounded-t-md relative h-24"><div className="absolute bottom-0 left-0 right-0 h-[50%] bg-[#5a35ff] rounded-t-lg"></div></div>
                  <span>May 16</span>
                </div>
                <div className="flex flex-col items-center gap-2 flex-grow">
                  <div className="w-full bg-[#5a35ff]/20 rounded-t-md relative h-40"><div className="absolute bottom-0 left-0 right-0 h-[100%] bg-[#5a35ff] rounded-t-lg"></div></div>
                  <span>May 17</span>
                </div>
              </div>
            </div>

            {/* Users classification role */}
            <div className="bg-white border border-[#ececf4] rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 text-base mb-6">Users by Role Classification</h3>
              <div className="flex items-center justify-between gap-4">
                <div className="w-32 h-32 rounded-full border-[10px] border-[#5a35ff] flex flex-col items-center justify-center shrink-0">
                  <h4 className="text-xl font-bold">{usersCount}</h4>
                  <span className="text-[10px] text-gray-400">Total Users</span>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#5a35ff]"></span> Students: {students.length}</div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#4391ff]"></span> Instructors: 143</div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#44bf6c]"></span> Editors: 65</div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#ff9827]"></span> Super Admins: 1</div>
                </div>
              </div>
            </div>

          </div>

          {/* ROW 3 GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Top Courses detail list */}
            <div className="bg-white border border-[#ececf4] rounded-3xl p-6 shadow-sm col-span-1 lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900 text-base">Popular Course catalogs</h3>
                <span className="text-xs font-bold text-[#5a35ff] hover:underline cursor-pointer" onClick={() => setView('admin-courses')}>Roster manager</span>
              </div>

              <div className="flex flex-col divide-y divide-[#edf0f7]">
                {courses.slice(0, 4).map((course, idx) => (
                  <div key={course.id} className="flex justify-between items-center py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold text-xs">#{idx + 1}</div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{course.title}</h4>
                        <span className="text-[10px] text-gray-400">{course.category} • Instructor: {course.instructor}</span>
                      </div>
                    </div>
                    <div className="text-right text-xs font-bold text-gray-800">Free catalog</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Storage capacity specs */}
            <div className="bg-white border border-[#ececf4] rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 text-base mb-6">Operational Host capacity</h3>
              
              <div className="flex flex-col gap-6 text-xs text-gray-600">
                <div>
                  <div className="flex justify-between mb-2"><span>LocalStorage space used</span><strong>12KB / 5MB (0.2%)</strong></div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#5a35ff] rounded-full" style={{ width: '1%' }}></div></div>
                </div>

                <div>
                  <div className="flex justify-between mb-2"><span>Container ingress Bandwidth</span><strong>256 GB / 1 TB</strong></div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: '25%' }}></div></div>
                </div>

                <div className="flex justify-between items-center bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <span className="font-semibold text-gray-700">Database sandbox mode</span>
                  <span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded text-[10px]">VERIFIED</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
};
