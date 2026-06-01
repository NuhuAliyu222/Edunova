import React, { useState, useEffect, useRef } from 'react';
import { useLms } from '../context/LmsContext';
import { ViewState } from '../types';
import { 
  Send, 
  MessageSquare, 
  Megaphone, 
  User as UserIcon, 
  Inbox, 
  Clock, 
  Volume2, 
  ShieldAlert, 
  CornerDownRight, 
  CheckCheck,
  Plus
} from 'lucide-react';

interface AdminMessagesProps {
  setView: (view: ViewState) => void;
}

export const AdminMessages: React.FC<AdminMessagesProps> = ({ setView }) => {
  const { 
    students, messages, announcements, sendMessage, addAnnouncement, logout 
  } = useLms();

  // Active navigation selection
  const [activeSegment, setActiveSegment] = useState<'helpdesk' | 'compose'>('helpdesk');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [typedReply, setTypedReply] = useState('');
  
  // Compose Announcement state
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnExcerpt, setNewExcerpt] = useState('');
  const [publishFeedback, setPublishFeedback] = useState('');

  const replyEndRef = useRef<HTMLDivElement>(null);

  // Default select first student if available and none selected
  useEffect(() => {
    if (students.length > 0 && selectedStudentId === null) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  // Keep chat scrolled down
  useEffect(() => {
    if (replyEndRef.current) {
      replyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedStudentId, activeSegment]);

  // Find active student
  const activeStudent = students.find(s => s.id === selectedStudentId);

  // Filter messages for selected student
  const activeChatMessages = selectedStudentId !== null
    ? messages.filter(m => m.userId === selectedStudentId)
    : [];

  const handleLogout = () => {
    logout();
    setView('home');
  };

  // Avatar matching helper
  const getStudentAvatar = (userId: number, email: string) => {
    if (userId === 10) return "https://randomuser.me/api/portraits/women/44.jpg"; // Sarah Johnson
    if (userId === 11) return "https://randomuser.me/api/portraits/men/85.jpg";   // Michael Brown
    const imgId = (userId % 70) + 1;
    const isFemale = email.toLowerCase().includes('female') || email.toLowerCase().includes('sarah') || userId % 2 === 0;
    return `https://randomuser.me/api/portraits/${isFemale ? 'women' : 'men'}/${imgId}.jpg`;
  };

  // Submit help reply
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedReply.trim() || selectedStudentId === null) return;

    sendMessage(selectedStudentId, typedReply.trim(), 'admin');
    setTypedReply('');
  };

  // Publish Announcement
  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnExcerpt.trim()) return;

    addAnnouncement(newAnnTitle.trim(), newAnnExcerpt.trim());
    setNewAnnTitle('');
    setNewExcerpt('');
    setPublishFeedback('🚀 Announcement published successfully! Broadcast immediately synchronized to student dashboards.');
    
    setTimeout(() => {
      setPublishFeedback('');
      setActiveSegment('helpdesk');
    }, 3000);
  };

  // Aggregate active counters: count unread support messages
  const getUnreadInquiriesCount = () => {
    // Unique users with recent student messages
    const studentSenders = messages.filter(m => m.sender === 'student' && !m.read);
    return Array.from(new Set(studentSenders.map(s => s.userId))).length;
  };

  return (
    <div className="w-screen h-screen flex bg-[#f5f6fb] text-[#111] overflow-hidden font-sans text-sm">
      
      {/* ADMIN SIDEBAR */}
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
            <span 
              className="h-12 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer" 
              onClick={() => setView('admin-dashboard')}
            >
              <i className="fa-solid fa-house"></i> Dashboard
            </span>
            <span 
              className="h-12 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer" 
              onClick={() => setView('admin-users')}
            >
              <i className="fa-regular fa-user"></i> Users / Students
            </span>
            <span 
              className="h-12 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer" 
              onClick={() => setView('admin-courses')}
            >
              <i className="fa-solid fa-book-open"></i> Courses Catalog
            </span>
            <span 
              className="h-12 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer" 
              onClick={() => setView('admin-lessons')}
            >
              <i className="fa-regular fa-circle-play"></i> Upload Lessons
            </span>
            <span 
              className="h-12 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer" 
              onClick={() => setView('admin-quizzes')}
            >
              <i className="fa-regular fa-circle-question"></i> Manage Quizzes
            </span>
            <span 
              className="h-12 rounded-xl flex items-center gap-4 px-4 bg-white/10 text-white font-semibold cursor-pointer" 
              onClick={() => setView('admin-messages')}
            >
              <i className="fa-solid fa-bullhorn text-purple-300 animate-pulse"></i> Communication Portal
            </span>
            <span 
              className="h-12 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer" 
              onClick={handleLogout}
            >
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
        <header className="h-[80px] bg-white border-b border-[#ececf4] px-6 md:px-8 flex items-center justify-between shrink-0 select-none">
          <div>
            <span className="text-[10px] bg-purple-50 text-[#5b35ff] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Administration Central Control
            </span>
            <h1 className="text-xl font-extrabold text-gray-900 mt-1">Student Communication & Helpdesk Center</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-[44px] h-[44px] rounded-full bg-gradient-to-br from-[#ffcf9d] to-[#8b5a3b] border-2 border-[#5a35ff]"></div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Super Admin</h4>
                <p className="text-gray-400 text-xs">Administrator ID: #01</p>
              </div>
            </div>
          </div>
        </header>

        {/* SPLIT ROW CONTAINER */}
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden bg-gray-50">
          
          {/* CONTROL NAVIGATION SUB-SIDEBAR */}
          <div className="w-full md:w-[280px] border-b md:border-b-0 md:border-r border-[#ececf4] bg-white flex md:flex-col shrink-0 select-none">
            <div className="p-4 border-b border-gray-100 hidden md:block">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Control Mode</h3>
            </div>

            <button 
              onClick={() => setActiveSegment('helpdesk')}
              className={`flex-1 md:flex-none h-14 md:h-16 px-4 flex items-center gap-3 text-xs md:text-sm font-bold transition-all border-b-2 md:border-b-0 md:border-l-4 ${
                activeSegment === 'helpdesk' 
                  ? 'border-[#5a35ff] text-[#5a35ff] bg-purple-50/40' 
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <MessageSquare size={16} />
              <div className="text-left flex-grow">
                <div className="flex justify-between items-center">
                  <span>Student Inquiries</span>
                  {getUnreadInquiriesCount() > 0 && (
                    <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full animate-bounce">
                      {getUnreadInquiriesCount()}
                    </span>
                  )}
                </div>
                <span className="text-[9px] text-gray-400 font-normal hidden md:block">Answer student feedback</span>
              </div>
            </button>

            <button 
              onClick={() => setActiveSegment('compose')}
              className={`flex-1 md:flex-none h-14 md:h-16 px-4 flex items-center gap-3 text-xs md:text-sm font-bold transition-all border-b-2 md:border-b-0 md:border-l-4 ${
                activeSegment === 'compose' 
                  ? 'border-[#5a35ff] text-[#5a35ff] bg-purple-50/40' 
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Megaphone size={16} />
              <div className="text-left">
                <div>Compose Broadcast</div>
                <div className="text-[9px] text-gray-400 font-normal hidden md:block font-sans">Publish dynamic announcement</div>
              </div>
            </button>
          </div>

          {/* ACTIVE CONTENT VIEWPORT */}
          <div className="flex-grow flex overflow-hidden h-full">
            
            {activeSegment === 'helpdesk' ? (
              <div className="flex-1 flex overflow-hidden">
                
                {/* INQUIRIES ROSTER LIST */}
                <div className="w-[280px] border-r border-[#ececf4] bg-white hidden md:flex flex-col select-none">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                    <h4 className="text-xs font-bold text-gray-600">Registered Students Inbox</h4>
                  </div>

                  <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                    {students.map((student) => {
                      const isSelected = student.id === selectedStudentId;
                      // Find latest message for preview
                      const studentMsgs = messages.filter(m => m.userId === student.id);
                      const latestMsg = studentMsgs[studentMsgs.length - 1];
                      const unread = studentMsgs.some(m => !m.read && m.sender === 'student');

                      return (
                        <div 
                          key={student.id}
                          onClick={() => setSelectedStudentId(student.id)}
                          className={`p-4 cursor-pointer transition flex items-center gap-3 text-left ${
                            isSelected ? 'bg-indigo-50/40 border-l-4 border-[#5a35ff]' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="relative shrink-0">
                            <img 
                              src={getStudentAvatar(student.id, student.email)} 
                              alt={student.name} 
                              className="w-[38px] h-[38px] rounded-full object-cover border border-purple-100"
                            />
                            {unread && (
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border border-white rounded-full"></span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-center">
                              <h4 className={`text-xs truncate ${unread || isSelected ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                                {student.name}
                              </h4>
                            </div>
                            <p className="text-[10px] text-gray-400 truncate mt-0.5">{student.email}</p>
                            {latestMsg && (
                              <p className="text-[9px] text-gray-500 truncate mt-1 italic flex items-center gap-0.5">
                                <CornerDownRight size={10} className="shrink-0 text-[#5a35ff]" />
                                {latestMsg.text}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* HELP DECK CHAT INTERACTIVE WINDOW */}
                <div className="flex-grow flex flex-col h-full bg-slate-50 min-w-0">
                  {activeStudent ? (
                    <div className="flex-grow flex flex-col overflow-hidden h-full">
                      
                      {/* Selected Student profile info header */}
                      <div className="px-5 py-4 bg-white border-b border-[#ececf4] flex justify-between items-center shrink-0 shadow-sm select-none">
                        <div className="flex items-center gap-3">
                          <img 
                            src={getStudentAvatar(activeStudent.id, activeStudent.email)} 
                            alt={activeStudent.name} 
                            className="w-10 h-10 rounded-full object-cover border border-purple-200"
                          />
                          <div>
                            <h3 className="text-xs font-extrabold text-indigo-950">{activeStudent.name}</h3>
                            <p className="text-[10px] text-gray-400 mt-0.5">EST. REGISTER PROFILE: #EDN-S{activeStudent.id + 7210} • {activeStudent.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Direct Channel Open
                          </span>
                        </div>
                      </div>

                      {/* Chat Messages */}
                      <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {activeChatMessages.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <h3 className="text-sm font-bold text-gray-700">No dialogue has been dispatched</h3>
                            <p className="text-xs text-gray-500 max-w-xs mt-1 leading-relaxed">
                              Initiate communication with {activeStudent.name} by typing a support message below.
                            </p>
                          </div>
                        ) : (
                          activeChatMessages.map((msg) => {
                            const isMe = msg.sender === 'admin';
                            const isSystem = msg.sender === 'system';

                            if (isSystem) {
                              return (
                                <div key={msg.id} className="flex justify-center my-2">
                                  <div className="bg-purple-50 text-purple-800 border border-purple-150 px-4 py-2 rounded-xl text-[10px] max-w-md text-center leading-relaxed font-sans shadow-sm select-none">
                                    <span className="font-extrabold uppercase tracking-wide block text-[8px] text-purple-600 mb-0.5">System Event Log</span>
                                    {msg.text}
                                    <span className="text-[7px] text-purple-400 block mt-1">{new Date(msg.sentAt).toLocaleTimeString()}</span>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div key={msg.id} className={`flex gap-3.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                {!isMe && (
                                  <img 
                                    src={getStudentAvatar(activeStudent.id, activeStudent.email)} 
                                    alt={activeStudent.name} 
                                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200"
                                  />
                                )}

                                <div className={`max-w-md flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                  <div className={`p-3.5 rounded-2xl text-[12px] leading-relaxed shadow-sm ${
                                    isMe 
                                      ? 'bg-[#5a35ff] text-white rounded-tr-none' 
                                      : 'bg-white text-gray-800 rounded-tl-none border border-gray-150'
                                  }`}>
                                    {msg.text}
                                  </div>

                                  <div className="flex items-center gap-1.5 mt-1 text-[9px] text-gray-400 font-semibold font-mono">
                                    <span>{new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    {isMe && <span className="text-indigo-500"><CheckCheck size={11} /></span>}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                        <div ref={replyEndRef} />
                      </div>

                      {/* Msg Entry Box */}
                      <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-[#ececf4] flex gap-3 items-center shrink-0">
                        <input 
                          type="text" 
                          placeholder={`Compose supportive assistance response to ${activeStudent.name}...`} 
                          value={typedReply}
                          onChange={(e) => setTypedReply(e.target.value)}
                          className="flex-grow h-11 border border-[#dfe3f0] focus:border-[#5a35ff] focus:ring-1 focus:ring-[#5a35ff] rounded-xl outline-none px-4 text-xs font-semibold placeholder-gray-400 text-gray-800 bg-gray-50 transition"
                        />
                        <button 
                          type="submit"
                          disabled={!typedReply.trim()}
                          className="h-11 px-5 rounded-xl bg-[#5a35ff] hover:bg-[#4620db] disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xl shadow-indigo-600/10 shrink-0"
                        >
                          <Send size={13} /> Respond
                        </button>
                      </form>

                    </div>
                  ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-8 select-none">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4 animate-pulse">
                        <Inbox size={26} />
                      </div>
                      <h3 className="text-sm font-bold text-gray-700">No Student Selected</h3>
                      <p className="text-xs text-gray-400 max-w-xs mt-1">
                        Select a student from the inbox panel on the left to start direct support dialogue.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex-grow overflow-y-auto p-6 md:p-8 flex items-center justify-center">
                <div className="bg-white border border-[#ececf4] rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-lg text-left">
                  
                  {/* Form Intro header */}
                  <div className="flex items-center gap-3 text-[#5a35ff] mb-4">
                    <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-[#5a35ff]">
                      <Megaphone size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#111827] text-sm sm:text-base">Publish Campus-wide Broadcast</h3>
                      <p className="text-gray-400 text-[11px] mt-0.5">Post an dynamic announcement visible immediately to all students.</p>
                    </div>
                  </div>

                  {/* Publish Success feedback Banner */}
                  {publishFeedback && (
                    <div className="mb-4 bg-emerald-50 text-emerald-800 border border-emerald-100 p-3.5 rounded-xl text-xs font-semibold">
                      {publishFeedback}
                    </div>
                  )}

                  {/* Compose form */}
                  <form onSubmit={handlePublishAnnouncement} className="space-y-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-extrabold text-gray-500 mb-1.5 font-sans">
                        Broadcast Title
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. 🎁 June Hackathon Challenge Launch!"
                        value={newAnnTitle}
                        onChange={(e) => setNewAnnTitle(e.target.value)}
                        className="w-full h-11 border border-[#dfe3f0] focus:border-[#5a35ff] focus:ring-1 focus:ring-[#5a35ff] rounded-xl outline-none px-4 text-xs font-bold text-gray-800 placeholder-gray-450 transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-extrabold text-gray-500 mb-1.5 font-sans">
                        Announcement Body / Excerpt
                      </label>
                      <textarea 
                        rows={5}
                        placeholder="Detail the update fully. Students will view this directly on their dashboard alerts page."
                        value={newAnnExcerpt}
                        onChange={(e) => setNewExcerpt(e.target.value)}
                        className="w-full border border-[#dfe3f0] focus:border-[#5a35ff] focus:ring-1 focus:ring-[#5a35ff] rounded-xl outline-none p-4 text-xs font-medium text-gray-800 placeholder-gray-450 transition resize-none"
                        required
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={!newAnnTitle.trim() || !newAnnExcerpt.trim()}
                      className="w-full h-11 rounded-xl bg-[#5a35ff] text-white hover:bg-[#4620db] disabled:opacity-50 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-xl shadow-indigo-600/15"
                    >
                      <Plus size={15} /> Publish Announcement Broadcast
                    </button>
                  </form>

                </div>
              </div>
            )}

          </div>

        </div>

      </main>

    </div>
  );
};
