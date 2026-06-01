import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { ViewState } from '../types';

interface AdminSettingsProps {
  setView: (view: ViewState) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ setView }) => {
  const { 
    apiMode, setApiMode, apiUrl, setApiUrl, pingStatus, triggerPing, logout 
  } = useLms();

  const [localUrl, setLocalUrl] = useState(apiUrl);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [pingMessage, setPingMessage] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    setView('home');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiUrl(localUrl);
    setPingMessage('Settings updated successfully! Testing connection...');
    const result = await triggerPing(localUrl);
    if (result) {
      setPingMessage('Success! Successfully connected with PHP REST API & MySQL Service.');
    } else {
      setPingMessage('Could not reach backend URL directly from browser context. Please verify your local Apache/PHP server environment is running on port 80/443 and has CORS configuration enabled.');
    }
  };

  const handleManualPing = async () => {
    setPingMessage('Sending CORS handshake request...');
    const result = await triggerPing(localUrl);
    if (result) {
      setPingMessage('Online! Connected to: ' + localUrl + '/api/courses.php (Latency OK)');
    } else {
      setPingMessage('Error: Connection timed out or blocked by CORS. Ensure your PHP config allows request methods from modern browser origins.');
    }
  };

  const dbTables = [
    { name: 'users', desc: 'Prepopulated admin account and registered students.', count: '1 Admin + Custom Students' },
    { name: 'courses', desc: 'Main learning modules, category titles, list prices, and average ratings.', count: '4 Default Modules' },
    { name: 'lessons', desc: 'Individual training video URLs, duration metadata, and lecture sequences.', count: '8 Lectures' },
    { name: 'enrollments', desc: 'Cross-reference student identifiers mapping registered courses.', count: 'Live tracks' },
    { name: 'lesson_progress', desc: 'Active lesson completion logs used to trigger automatic certificates.', count: 'Dynamic student records' },
    { name: 'certificates', desc: 'Verifiable unique certificate codes issued to students upon complete progress.', count: 'Automatic' },
    { name: 'messages', desc: 'Student support thread communication log files.', count: 'Live channels' },
    { name: 'announcements', desc: 'Broadcasted announcements shown in main dashboards.', count: '2 Default Ads' }
  ];

  return (
    <div className="w-screen h-screen flex bg-[#f5f6fb] text-[#111] overflow-hidden font-sans text-sm">
      
      {/* MOBILE DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          <div className="relative w-[280px] max-w-full bg-[#050f59] text-white p-6 flex flex-col justify-between overflow-y-auto transition-all duration-300 ease-in-out z-10 shadow-2xl">
            <div>
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
                  className="h-11 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                  onClick={() => { setView('admin-quizzes'); setMobileMenuOpen(false); }}
                >
                  <i className="fa-regular fa-circle-question"></i> Manage Quizzes
                </span>
                <span 
                  className="h-11 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                  onClick={() => { setView('admin-messages'); setMobileMenuOpen(false); }}
                >
                  <i className="fa-solid fa-bullhorn text-sm"></i> Communication Portal
                </span>
                <span 
                  className="h-11 rounded-xl flex items-center gap-4 px-4 bg-white/10 text-white font-semibold cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <i className="fa-solid fa-gears text-sm"></i> PHP SQL Connect
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
              <h4 className="font-bold text-white mb-2 uppercase tracking-wide">Platform Status</h4>
              <span className="flex items-center gap-1.5 text-green-400 font-bold">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Active ({apiMode === 'api' ? 'Live backend' : 'Local Dev-SQL'})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR FOR DESKTOP */}
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
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer" onClick={() => setView('admin-quizzes')}>
              <i className="fa-regular fa-circle-question"></i> Manage Quizzes
            </span>
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer" onClick={() => setView('admin-messages')}>
              <i className="fa-solid fa-bullhorn text-sm"></i> Communication Portal
            </span>
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 bg-white/10 text-white font-semibold cursor-pointer">
              <i className="fa-solid fa-gears text-sm"></i> PHP SQL Connect
            </span>
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer" onClick={handleLogout}>
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
            </span>
          </nav>
        </div>

        <div className="bg-[#131d67] border border-[#1b277a] rounded-2xl p-4 text-gray-200 text-xs">
          <h4 className="font-bold text-white mb-2 uppercase tracking-wide">Platform Status</h4>
          <span className="flex items-center gap-1.5 text-green-400 font-bold">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> 
            Active ({apiMode === 'api' ? 'Live API' : 'Local Dev-SQL'})
          </span>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOPBAR */}
        <header className="h-[80px] bg-white border-b border-[#ececf4] px-4 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 transition cursor-pointer"
            >
              <i className="fa-solid fa-bars text-lg"></i>
            </button>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <i className="fa-solid fa-network-wired text-purple-600"></i> Settings & Connections
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-[44px] h-[44px] rounded-full bg-gradient-to-br from-[#ffcf9d] to-[#8b5a3b] border-2 border-[#5a35ff]"></div>
              <div>
                <h4 className="text-sm font-bold text-[#111827]">Super Admin</h4>
                <p className="text-gray-400 text-xs mt-[1px]">Server config tab</p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT HOST */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8">
          
          <div className="mb-8">
            <h1 className="text-3xl font-[800] text-gray-900 tracking-tight leading-none mb-2">Backend Connection Center</h1>
            <p className="text-gray-500">Unify the interactive React frontend with the fully completed PHP script handlers and MySQL schemas.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* CONFIG CONNECTOR PANEL */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              <div className="bg-white border border-[#ececf4] rounded-3xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 text-base mb-2">Primary Gateway Driver Mode</h3>
                <p className="text-xs text-gray-500 mb-6">Transition instantly from an offline mock runtime environment to connecting directly with the actual local or live hosting PHP routes.</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => { setApiMode('local'); setPingMessage(null); }}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition ${apiMode === 'local' ? 'border-[#5a35ff] bg-[#5a35ff]/5' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900">1. Client Simulation (Default)</span>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${apiMode === 'local' ? 'bg-[#5a35ff] border-[#5a35ff]' : 'border-gray-300'}`}>
                        {apiMode === 'local' && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">Uses localStorage state engines. Safe, works perfectly in the sandboxed preview environment without external set up.</p>
                  </button>

                  <button 
                    onClick={() => { setApiMode('api'); setPingMessage(null); }}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition ${apiMode === 'api' ? 'border-[#5a35ff] bg-[#5a35ff]/5' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900">2. Production PHP & MySQL API</span>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${apiMode === 'api' ? 'bg-[#5a35ff] border-[#5a35ff]' : 'border-gray-300'}`}>
                        {apiMode === 'api' && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">Fires fetch calls directly to the completed backend endpoints so your dynamic catalog database updates in real PHP.</p>
                  </button>
                </div>
              </div>

              {/* URL CONFIG MODULE */}
              <div className="bg-white border border-[#ececf4] rounded-3xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 text-base mb-4">PHP Server Core Handshake</h3>
                
                <form onSubmit={handleSaveSettings} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 label-spaced mb-2">BASE ENDPOINT PATH (NO TRAILING SLASH)</label>
                    <div className="flex gap-2">
                      <div className="flex-1 border border-gray-200 rounded-xl px-4 bg-gray-55 flex items-center gap-2">
                        <i className="fa-solid fa-link text-gray-400"></i>
                        <input 
                          type="text" 
                          value={localUrl}
                          onChange={(e) => setLocalUrl(e.target.value)}
                          placeholder="http://localhost:80/edunova-backend"
                          className="w-full h-11 bg-transparent outline-none p-1"
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={handleManualPing}
                        className="h-11 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 rounded-xl font-bold text-xs transition cursor-pointer shrink-0"
                      >
                        Ping Test
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2">Example: <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px]">http://localhost/backend</code> (points directly to script endpoints inside your project workspace folder).</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Service Status Check:</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        pingStatus === 'Connected' ? 'bg-green-100 text-green-700' : 
                        pingStatus === 'Checking' ? 'bg-amber-100 text-amber-700 animate-pulse' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          pingStatus === 'Connected' ? 'bg-green-500' : 
                          pingStatus === 'Checking' ? 'bg-amber-500 animate-pulse' : 
                          'bg-red-500'
                        }`}></span>
                        {pingStatus}
                      </span>
                    </div>

                    <button 
                      type="submit" 
                      className="bg-[#5a35ff] hover:bg-[#4828df] text-white px-5 h-11 rounded-xl font-bold text-xs transition cursor-pointer"
                    >
                      Save & Sync Backend Gateway
                    </button>
                  </div>
                </form>

                {pingMessage && (
                  <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-700 leading-relaxed font-mono whitespace-pre-line">
                    <i className="fa-solid fa-circle-info text-blue-600 mr-1"></i> {pingMessage}
                  </div>
                )}
              </div>

              {/* ARCHITECTURE CARD */}
              <div className="bg-gradient-to-br from-[#0c1861] to-[#050f59] text-white rounded-3xl p-6 shadow-md">
                <h3 className="font-bold text-base mb-2">Full Stack Architecture Handshake</h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  The backend folder contains 100% completed, production-ready REST controllers written in native PHP. When "Production API Mode" is enabled:
                </p>
                <div className="flex flex-col gap-3 text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white shrink-0 font-bold">1</span>
                    <span><strong>State Synchronization:</strong> Login, registration, lesson tracker, and course listings fetch directly from database tables using CORS wrappers.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white shrink-0 font-bold">2</span>
                    <span><strong>Token Sessions:</strong> Authorizations are securely passed inside HTTP Bearer headers configured in <code className="text-blue-200">helpers.php</code>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white shrink-0 font-bold">3</span>
                    <span><strong>Database Integration:</strong> Supports instant MySQL server deployment via the included production script <code className="text-blue-200">schema.sql</code>.</span>
                  </div>
                </div>
              </div>

            </div>

            {/* SCHEMA DIAGRAM SIDEBAR PANEL */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              <div className="bg-white border border-[#ececf4] rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 text-base">MySQL Database Tables</h3>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText('view backend/schema.sql');
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2000);
                    }}
                    className="text-[11px] font-bold text-[#5a35ff] bg-purple-50 hover:bg-purple-100 h-7 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition"
                  >
                    <i className="fa-regular fa-copy"></i> {copiedSql ? 'Copied' : 'Schema'}
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {dbTables.map((table, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 transition">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-[#5a35ff]">{table.name}</span>
                        <span className="text-[10px] font-semibold text-gray-400">{table.count}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-tight">{table.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* OFFLINE MANAGE UTILITIES */}
              <div className="bg-white border border-[#ececf4] rounded-3xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 text-base mb-4">Local DB Utilities</h3>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to restore the default seed dataset in local storage? This will reset all modifications.')) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-700 h-11 rounded-xl font-bold text-xs transition cursor-pointer text-center"
                  >
                    Reset & Recalibrate Seed SQL
                  </button>
                  <p className="text-[10px] text-gray-400 mt-1 text-center font-mono">Restores 4 core courses, default admin credentials, and initial student profiles.</p>
                </div>
              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};
