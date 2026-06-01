import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { ViewState } from '../types';

interface StudentProfileProps {
  setView: (view: ViewState) => void;
  setSelectedCourseId: (id: number) => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ setView, setSelectedCourseId }) => {
  const { 
    currentUser, enrollments, progress, attempts, 
    certificates, updateProfile, logout 
  } = useLms();

  // Inputs state
  const [name, setName] = useState(currentUser?.name || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [dob, setDob] = useState(currentUser?.dob || '');
  const [gender, setGender] = useState(currentUser?.gender || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [feedback, setFeedback] = useState('');

  if (!currentUser) return null;

  // Filter stats
  const myEnrollmentsCount = enrollments.filter(e => e.userId === currentUser.id).length;
  const completedLessonsCount = progress.filter(p => p.userId === currentUser.id).length;
  const myAttempts = attempts.filter(a => a.userId === currentUser.id);
  const averageScore = myAttempts.length > 0 
    ? Math.round(myAttempts.reduce((sum, a) => sum + a.score, 0) / myAttempts.length)
    : 0;

  const myCertificates = certificates.filter(c => c.userId === currentUser.id);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback('');
    if (!name || !email) {
      setFeedback('Name and email are required.');
      return;
    }

    try {
      await updateProfile(name, email, bio, phone, gender, dob);
      setFeedback('Profile successfully updated!');
      setTimeout(() => setFeedback(''), 3000);
    } catch (err: any) {
      setFeedback(err.message || 'Profile update failed.');
    }
  };

  const handleLogout = () => {
    logout();
    setView('home');
  };

  const handleCertClick = (courseId: number) => {
    setSelectedCourseId(courseId);
    setView('certificate');
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
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 text-purple-100 hover:bg-white/10 hover:text-white transition cursor-pointer" onClick={() => setView('student-courses')}>
              <i className="fa-solid fa-book-open"></i> My Courses
            </span>
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 text-purple-100 hover:bg-white/10 hover:text-white transition cursor-pointer" onClick={() => setView('student-quiz')}>
              <i className="fa-solid fa-question-circle"></i> Quizzes
            </span>
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 bg-white text-[#5b34ea] font-semibold cursor-pointer">
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
          <p className="text-gray-500 text-xs mb-4">Complete module courses to trigger verifiable certificates.</p>
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

          <div className="profile flex items-center gap-3 cursor-pointer">
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

        {/* PROFILE CONTENT HOST GRIDS */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-[800] tracking-tight text-gray-900 mb-1">My Student Profile</h1>
              <p className="text-gray-500 text-xs">Manage your personal variables, registration parameters, and certified completion keys.</p>
            </div>

            {/* PROFILE HERO COMPONENT */}
            <div className="bg-[#f1edff] border border-purple-100 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative select-none">
              
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <img 
                    src="https://randomuser.me/api/portraits/men/32.jpg" 
                    alt={currentUser.name} 
                    className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-sm"
                  />
                  <div className="absolute bottom-2 right-0 bg-white text-[#5d35ff] w-9 h-9 rounded-xl shadow-md border border-gray-100 flex items-center justify-center cursor-pointer hover:scale-105 duration-100" onClick={() => alert('Photo upload requires real-time camera storage authorization approval.')}>
                    <i className="fa-solid fa-camera"></i>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    {currentUser.name}
                    <span className="bg-[#e8dcff] text-[#5d35ff] text-xs font-bold px-2 py-0.5 rounded-md">Student</span>
                  </h2>
                  <p className="text-gray-500 text-xs mt-1">@{currentUser.username}</p>
                  
                  <div className="flex flex-col gap-2 mt-4 text-xs text-gray-600">
                    <span className="flex items-center gap-2"><i className="fa-regular fa-envelope text-indigo-500"></i> {currentUser.email}</span>
                    {currentUser.phone && <span className="flex items-center gap-2"><i className="fa-solid fa-phone text-indigo-500"></i> {currentUser.phone}</span>}
                    <span className="flex items-center gap-2"><i className="fa-regular fa-calendar text-indigo-500"></i> Registered on {new Date(currentUser.registeredAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CERTIFICATE AWARDS CARD PANEL */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                <i className="fa-solid fa-award text-yellow-500"></i> Verifiable Certificates Saved ({myCertificates.length})
              </h3>
              
              <div className="flex flex-col gap-4">
                {myCertificates.length > 0 ? (
                  myCertificates.map(cert => (
                    <div 
                      key={cert.id} 
                      className="border border-green-100 bg-green-50/50 rounded-2xl p-4 flex justify-between items-center cursor-pointer hover:bg-green-100/40 transition duration-150"
                      onClick={() => handleCertClick(cert.courseId)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-xl text-yellow-500 border border-green-200">
                          🎓
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-900">{cert.courseTitle}</h4>
                          <span className="text-[10px] text-gray-400">Verifiable Code: {cert.certificateCode}</span>
                        </div>
                      </div>

                      <button className="h-9 px-4 bg-green-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-green-700 transition cursor-pointer">
                        <i className="fa-solid fa-download"></i> View Cert
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-xs text-center py-6">No certificates issued yet. Complete all lessons of any course to earn completion awards automatically!</p>
                )}
              </div>
            </div>

            {/* PERSONAL EDIT FORM PANEL */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 text-base mb-6 pb-2 border-b border-gray-50">Edit Profile Variables</h3>
              
              <form onSubmit={handleSave} className="flex flex-col gap-6">
                {feedback && (
                  <div className={`p-4 rounded-xl border text-xs font-bold ${feedback.includes('success') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-500 border-red-100'}`}>
                    {feedback}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700">Full Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full h-11 px-4 bg-[#fafbfc] border border-gray-200 rounded-lg outline-none focus:border-[#5b34ea] transition" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700">Username</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full h-11 px-4 bg-[#fafbfc] border border-gray-200 rounded-lg outline-none focus:border-[#5b34ea] transition" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700">Email Address (Credentials)</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-11 px-4 bg-[#fafbfc] border border-gray-200 rounded-lg outline-none focus:border-[#5b34ea] transition" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700">Phone</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-11 px-4 bg-[#fafbfc] border border-gray-200 rounded-lg outline-none focus:border-[#5b34ea] transition" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700">Date of Birth</label>
                    <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full h-11 px-4 bg-[#fafbfc] border border-gray-200 rounded-lg outline-none focus:border-[#5b34ea] transition" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700">Gender</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full h-11 px-4 bg-[#fafbfc] border border-gray-200 rounded-lg outline-none focus:border-[#5b34ea] transition cursor-pointer">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700">Bio Description</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full h-24 p-4 bg-[#fafbfc] border border-gray-200 rounded-lg outline-none focus:border-[#5b34ea] transition resize-none leading-relaxed" placeholder="Tell us about your computer science learning objectives..." />
                </div>

                <button type="submit" className="w-32 h-11 bg-[#5b34ea] text-white rounded-xl text-xs font-bold hover:bg-[#4a24c4] transition cursor-pointer self-start">
                  Save Changes
                </button>
              </form>

            </div>

          </div>

          {/* RIGHT STATS SIDE PANEL */}
          <div className="space-y-6 shrink-0 hidden lg:block">
            
            <div className="bg-white border border-gray-100 rounded-[18px] p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 text-base mb-4">Learning Stats Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 text-[#5b34ea] flex items-center justify-center text-sm shrink-0"><i className="fa-solid fa-book-open"></i></div>
                  <div><h4 className="font-bold text-sm">{myEnrollmentsCount}</h4><p className="text-gray-400 text-[10px]">Courses</p></div>
                </div>

                <div className="p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center text-sm shrink-0"><i className="fa-solid fa-circle-check"></i></div>
                  <div><h4 className="font-bold text-sm">{completedLessonsCount}</h4><p className="text-gray-400 text-[10px]">Lessons</p></div>
                </div>

                <div className="p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center text-sm shrink-0"><i className="fa-solid fa-trophy"></i></div>
                  <div><h4 className="font-bold text-sm">{averageScore}%</h4><p className="text-gray-400 text-[10px]">Avg Score</p></div>
                </div>

                <div className="p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center text-sm shrink-0"><i className="fa-regular fa-clock"></i></div>
                  <div><h4 className="font-bold text-sm">28h 30m</h4><p className="text-gray-400 text-[10px]">Time Spent</p></div>
                </div>
              </div>
            </div>

            {/* CONNECTED ACCOUNTS */}
            <div className="bg-white border border-gray-100 rounded-[18px] p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 text-base mb-3">Sync Connected Accounts</h3>
              <p className="text-gray-500 text-xs mb-4 leading-relaxed">OAuth single-sign on configurations keep profile indices integrated.</p>
              
              <div className="flex flex-col gap-3">
                <button type="button" className="w-full h-11 border border-gray-200 hover:bg-gray-50 rounded-xl flex items-center justify-center gap-2 text-xs font-[500] cursor-pointer" onClick={() => alert('Connect credentials popup for Google SSO is starting...')}>
                  <i className="fa-brands fa-google text-red-500 text-sm"></i> Connect Google
                </button>
                <button type="button" className="w-full h-11 border border-gray-200 hover:bg-gray-50 rounded-xl flex items-center justify-center gap-2 text-xs font-[500] cursor-pointer" onClick={() => alert('Connect credentials popup for Facebook SSO is starting...')}>
                  <i className="fa-brands fa-facebook text-blue-600 text-sm"></i> Connect Facebook
                </button>
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
};
