import React, { useState, useEffect, useRef } from 'react';
import { useLms } from '../context/LmsContext';
import { ViewState } from '../types';
import { 
  Send, 
  MessageSquare, 
  Bell, 
  ArrowRight, 
  ShieldAlert, 
  Inbox, 
  ChevronRight, 
  Megaphone,
  User as UserIcon,
  HelpCircle,
  Clock,
  CheckCheck
} from 'lucide-react';

interface StudentMessagesProps {
  setView: (view: ViewState) => void;
}

export const StudentMessages: React.FC<StudentMessagesProps> = ({ setView }) => {
  const { 
    currentUser, messages, announcements, sendMessage, markMessagesRead, logout 
  } = useLms();

  const [activeTab, setActiveTab] = useState<'inbox' | 'announcements'>('inbox');
  const [typedMessage, setTypedMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Protect student view safety
  if (!currentUser) return null;

  // On page load, mark our student messages as read
  useEffect(() => {
    markMessagesRead(currentUser.id);
  }, [currentUser.id, messages.length]);

  // Keep chat scrolled down
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  // Avatar matching helper
  const getStudentAvatar = (userId: number, email: string) => {
    if (userId === 10) return "https://randomuser.me/api/portraits/women/44.jpg"; // Sarah Johnson
    if (userId === 11) return "https://randomuser.me/api/portraits/men/85.jpg";   // Michael Brown
    if (userId === currentUser.id) {
      return "https://randomuser.me/api/portraits/men/32.jpg"; 
    }
    const imgId = (userId % 70) + 1;
    const isFemale = email.toLowerCase().includes('female') || email.toLowerCase().includes('sarah') || userId % 2 === 0;
    return `https://randomuser.me/api/portraits/${isFemale ? 'women' : 'men'}/${imgId}.jpg`;
  };

  const handleLogout = () => {
    logout();
    setView('home');
  };

  // Filter messages for this student (conversations can be other student/admin/system)
  const myMessages = messages.filter(m => m.userId === currentUser.id || m.userId === 0);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    sendMessage(currentUser.id, typedMessage.trim(), 'student');
    const userMsg = typedMessage.trim();
    setTypedMessage('');

    // Simulated quick auto-response if the admin portal is idle initially
    setTimeout(() => {
      // Find latest messages or check keywords
      let adminReply = "Hello! Our Academy Support team has received your ticket. We will review your academic ledger promptly and post a response below. Stay focused on your course lessons!";
      if (userMsg.toLowerCase().includes('certificate') || userMsg.toLowerCase().includes('cert')) {
        adminReply = "Hello! Verifiable certificates are automatically unlocked when you complete all lessons in a course. Once unlocked, click 'View Certificate' in the Course details or your Profile page!";
      } else if (userMsg.toLowerCase().includes('quiz') || userMsg.toLowerCase().includes('exam')) {
        adminReply = "Greetings scholar! You can re-take course quizzes as many times as you'd like. Only your highest single score is registered on the Wall of Fame Smart Leaderboard!";
      }
      sendMessage(currentUser.id, adminReply, 'admin');
    }, 2000);
  };

  return (
    <div className="w-screen h-screen flex bg-[#f5f6fb] text-[#111] overflow-hidden font-sans text-sm">
      
      {/* SIDEBAR */}
      <aside className="w-[280px] bg-gradient-to-b from-[#2e1ea0] to-[#24188b] text-white p-6 justify-between flex-col hidden md:flex overflow-y-auto shrink-0 select-none">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-4 mb-10 cursor-pointer" onClick={() => setView('home')}>
            <i className="fa-solid fa-graduation-cap text-white text-[30px]"></i>
            <h2 className="text-[20px] font-bold leading-tight">Edunova<br /><span className="text-sm font-normal text-purple-200">Smart Learning</span></h2>
          </div>

          <nav className="flex flex-col gap-2">
            <span 
              className="h-12 rounded-xl flex items-center gap-4 px-4 text-purple-100 hover:bg-white/10 hover:text-white transition cursor-pointer" 
              onClick={() => setView('student-dashboard')}
            >
              <i className="fa-solid fa-house"></i> Dashboard
            </span>
            <span 
              className="h-12 rounded-xl flex items-center gap-4 px-4 text-purple-100 hover:bg-white/10 hover:text-white transition cursor-pointer" 
              onClick={() => setView('student-courses')}
            >
              <i className="fa-solid fa-book-open"></i> My Courses
            </span>
            <span 
              className="h-12 rounded-xl flex items-center gap-4 px-4 text-purple-100 hover:bg-white/10 hover:text-white transition cursor-pointer" 
              onClick={() => setView('student-quiz')}
            >
              <i className="fa-solid fa-question-circle"></i> Quizzes
            </span>
            <span 
              className="h-12 rounded-xl flex items-center gap-4 px-4 text-purple-100 hover:bg-white/10 hover:text-white transition cursor-pointer" 
              onClick={() => setView('student-profile')}
            >
              <i className="fa-regular fa-user"></i> Profile / Progress
            </span>
            <span 
              className="h-12 rounded-xl flex items-center gap-4 px-4 bg-white text-[#5b34ea] font-semibold cursor-pointer" 
              onClick={() => setView('student-messages')}
            >
              <i className="fa-regular fa-comment-dots text-[#5b34ea]"></i> Support & Inbox
            </span>
            <span 
              className="h-12 rounded-xl flex items-center gap-4 px-4 text-purple-100 hover:bg-white/10 hover:text-white transition cursor-pointer" 
              onClick={handleLogout}
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
            </span>
          </nav>
        </div>

        {/* Upgrade Card banner */}
        <div className="bg-white rounded-2xl p-5 text-gray-900 mt-8 relative overflow-hidden select-none">
          <h3 className="text-sm font-[800] bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent mb-1">
            Student Support Active
          </h3>
          <p className="text-gray-500 text-[11px] mb-3 leading-relaxed">Have questions about coursework, grading, or certificates? Ask our deans anytime.</p>
          <div className="flex items-center gap-1.5 text-[10px] text-green-600 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Registrars Online
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOPBAR */}
        <header className="h-[80px] bg-white border-b border-[#ececf4] px-6 md:px-8 flex items-center justify-between shrink-0 select-none">
          <div>
            <span className="text-[10px] bg-indigo-50 text-[#5b34ea] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Communication Center
            </span>
            <h1 className="text-xl font-extrabold text-gray-900 mt-1">Student News & Helpdesk</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <img 
                src={getStudentAvatar(currentUser.id, currentUser.email)} 
                alt="Profile avatar" 
                className="w-[42px] h-[42px] rounded-full border-2 border-[#5a35ff] object-cover"
              />
              <div className="hidden sm:block">
                <h4 className="text-sm font-bold text-gray-900 leading-none">{currentUser.name}</h4>
                <p className="text-gray-400 text-[11px] mt-1 uppercase font-semibold">Student ID: #EDN-S{currentUser.id + 7210}</p>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN SPLIT VIEWS */}
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden bg-gray-50">
          
          {/* LEFT CHANNEL CHANNEL VIEW SELECTOR */}
          <div className="w-full md:w-[260px] border-b md:border-b-0 md:border-r border-[#ececf4] bg-white flex md:flex-col shrink-0 select-none">
            <button 
              onClick={() => setActiveTab('inbox')}
              className={`flex-1 md:flex-none h-14 md:h-16 px-4 flex items-center gap-3 text-xs md:text-sm font-bold transition-all border-b-2 md:border-b-0 md:border-l-4 ${
                activeTab === 'inbox' 
                  ? 'border-[#5b34ea] text-[#5b34ea] bg-indigo-50/40' 
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <MessageSquare size={16} />
              <div className="text-left">
                <div>Support Messenger</div>
                <div className="text-[9px] text-gray-400 font-normal hidden md:block">Direct line to portal admin</div>
              </div>
            </button>

            <button 
              onClick={() => setActiveTab('announcements')}
              className={`flex-1 md:flex-none h-14 md:h-16 px-4 flex items-center gap-3 text-xs md:text-sm font-bold transition-all border-b-2 md:border-b-0 md:border-l-4 ${
                activeTab === 'announcements' 
                  ? 'border-[#5b34ea] text-[#5b34ea] bg-indigo-50/40' 
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Megaphone size={16} />
              <div className="text-left col">
                <div>Academy Announcements</div>
                <div className="text-[9px] text-gray-400 font-normal hidden md:block">General campus broadcasts</div>
              </div>
            </button>
          </div>

          {/* MAIN MESSAGE RENDERING HOST */}
          <div className="flex-grow flex flex-col overflow-hidden h-full">
            
            {activeTab === 'inbox' ? (
              <div className="flex-grow flex flex-col overflow-hidden h-full bg-slate-50">
                {/* Chat Top Banner Alert */}
                <div className="px-5 py-3.5 bg-yellow-50 text-yellow-800 border-b border-yellow-105 flex items-center gap-3 text-xs shrink-0 font-medium">
                  <ShieldAlert size={16} className="text-amber-600 shrink-0" />
                  <span>Your messages are logged for academic verification. Please do not request core answers!</span>
                </div>

                {/* Messages Scroller Window */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {myMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4 animate-bounce">
                        <Inbox size={26} />
                      </div>
                      <h3 className="text-sm font-bold text-gray-800">Your helpdesk is clean</h3>
                      <p className="text-xs text-gray-500 max-w-xs mt-1 leading-relaxed">
                        Submit a direct helper inquiry below. Our academy administration team responds within minutes!
                      </p>
                    </div>
                  ) : (
                    myMessages.map((msg) => {
                      const isMe = msg.sender === 'student';
                      const isSystem = msg.sender === 'system';
                      
                      if (isSystem) {
                        return (
                          <div key={msg.id} className="flex justify-center my-2">
                            <div className="bg-purple-50 border border-purple-100 text-purple-800 px-4 py-2.5 rounded-2xl max-w-md text-[11px] leading-relaxed text-center shadow-sm">
                              <span className="font-bold uppercase tracking-wider block text-[8px] text-purple-600 mb-0.5">System Notification Log</span>
                              {msg.text}
                              <span className="text-[8px] text-purple-400 block mt-1 font-mono">{new Date(msg.sentAt).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={msg.id} className={`flex gap-3.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          
                          {/* Profile Avatar for incoming responses */}
                          {!isMe && (
                            <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm border border-purple-200">
                              ADM
                            </div>
                          )}

                          <div className={`max-w-md flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            {/* Message Bubble text content */}
                            <div className={`p-4 rounded-2xl leading-relaxed text-[12px] shadow-sm font-sans ${
                              isMe 
                                ? 'bg-[#5b34ea] text-white rounded-tr-none' 
                                : 'bg-white text-gray-800 rounded-tl-none border border-gray-150'
                            }`}>
                              {msg.text}
                            </div>
                            
                            {/* timestamp & status stamp */}
                            <div className="flex items-center gap-1.5 mt-1 text-[9px] text-gray-400 font-semibold font-mono">
                              <span>{new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {isMe && <span className="text-indigo-500"><CheckCheck size={12} /></span>}
                            </div>
                          </div>

                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Messages composing footer */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-[#ececf4] flex gap-3 items-center shrink-0">
                  <input 
                    type="text" 
                    placeholder="Type your inquiry query to Registrar's office..." 
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    className="flex-grow h-11 border border-[#dfe3f0] focus:border-[#5b34ea] focus:ring-1 focus:ring-[#5b34ea] rounded-xl outline-none px-4 text-xs font-medium placeholder-gray-400 text-gray-800 bg-gray-50 transition"
                  />
                  <button 
                    type="submit"
                    disabled={!typedMessage.trim()}
                    className="h-11 w-11 rounded-xl bg-[#5b34ea] hover:bg-[#4a24c4] active:bg-[#3d1ba3] disabled:opacity-50 text-white flex items-center justify-center shrink-0 cursor-pointer transition shadow-md shadow-indigo-600/10"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50">
                {/* Announcements Header */}
                <div className="bg-white border border-[#ececf4] rounded-2xl p-5 shadow-sm text-left select-none">
                  <div className="flex items-center gap-2.5 text-[#5b34ea] mb-2 font-black uppercase text-xs">
                    <Megaphone size={16} /> Campus Broadcasting System
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    View official updates, system events, and free certification campaigns initiated by the Edunova Registrar.
                  </p>
                </div>

                {/* Map list */}
                <div className="space-y-4">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="bg-white border border-[#ececf4] rounded-2xl p-5 shadow-sm hover:shadow-md transition text-left flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-50 text-[#5b34ea] flex items-center justify-center shrink-0">
                        <Megaphone size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-extrabold text-[#111827] text-xs sm:text-sm">{ann.title}</h3>
                          <span className="text-[9px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                            <Clock size={10} /> {ann.date}
                          </span>
                        </div>
                        <p className="text-[12px] text-gray-600 leading-relaxed mt-2">{ann.excerpt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </main>

    </div>
  );
};
