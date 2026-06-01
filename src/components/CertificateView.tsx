import React from 'react';
import { useLms } from '../context/LmsContext';
import { ViewState } from '../types';

interface CertificateViewProps {
  setView: (view: ViewState) => void;
  selectedCourseId: number | null;
}

export const CertificateView: React.FC<CertificateViewProps> = ({ setView, selectedCourseId }) => {
  const { currentUser, certificates, courses } = useLms();
  
  if (!currentUser) return null;

  const activeId = selectedCourseId || 1;
  const cert = certificates.find(c => c.userId === currentUser.id && c.courseId === activeId);

  // If no cert is generated (for instance they haven\'t marked all lessons complete), let\'s show a helpful generation warning
  if (!cert) {
    const course = courses.find(c => c.id === activeId);
    return (
      <div className="w-screen h-screen flex bg-gradient-to-br from-[#667eea] to-[#764ba2] text-[#111] overflow-hidden font-sans text-sm items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <i className="fa-solid fa-lock text-4xl text-[#5b34ea] mb-4"></i>
          <h2 className="text-lg font-bold mb-2">Certificate Locked</h2>
          <p className="text-gray-500 text-xs mb-6">Complete all lessons in "{course ? course.title : 'Course'}" first to trigger your certificate generation!</p>
          <div className="flex gap-4">
            <button className="flex-1 h-12 bg-[#5b34ea] text-white rounded-xl font-bold hover:bg-[#4a24c4] transition text-xs cursor-pointer" onClick={() => setView('student-dashboard')}>
              Back to Dashboard
            </button>
            <button className="flex-1 h-12 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition text-xs cursor-pointer" onClick={() => setView('student-courses')}>
              Go to Lessons
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-screen h-screen flex bg-gradient-to-br from-[#667eea] to-[#764ba2] text-[#111] overflow-y-auto font-sans text-sm items-center justify-center p-6">
      
      <div className="max-w-[1000px] w-full bg-white rounded-[20px] shadow-[0_25px_50px_rgba(0,0,0,0.2)] overflow-hidden animate-slide-up">
        
        {/* Certificate Header Banner */}
        <div className="bg-gradient-to-br from-[#1a0f5e] to-[#2d1b8a] text-white p-10 text-center select-none">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-white/20">🎓</div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight">Certificate of Completion</h1>
          <p className="text-gray-200 font-semibold text-sm">This certificate is proudly awarded to recognize progress milestones</p>
        </div>

        {/* Certificate Body Container */}
        <div className="p-10 md:p-14 text-center">
          
          <div className="text-yellow-500 text-[64px] mb-6">
            <i className="fa-solid fa-award"></i>
          </div>

          <h2 className="text-lg md:text-xl font-bold text-[#1a0f5e] uppercase tracking-wider mb-2">This is verifiably certified to</h2>

          <div className="text-3xl md:text-5xl font-extrabold text-[#5b34ea] py-6 my-6 border-t-2 border-b-2 border-gray-100 uppercase tracking-tight">
            {cert.userName}
          </div>

          <p className="text-gray-500 text-xs mb-2">for successfully reviewing all elements & completing all modules of the program</p>
          
          <div className="text-xl md:text-2xl font-bold text-gray-900 my-4 uppercase tracking-wide">
            {cert.courseTitle}
          </div>

          {/* Gold certified seal */}
          <div className="w-24 h-24 rounded-full border-4 border-yellow-500 flex items-center justify-center text-4xl text-yellow-500 my-8 mx-auto hover:scale-105 duration-200 cursor-pointer">
            <i className="fa-solid fa-certificate"></i>
          </div>

          {/* Code segment */}
          <div className="inline-block bg-gray-50 border border-gray-100 p-4 rounded-xl font-mono text-xs md:text-sm text-gray-700 tracking-wider mb-6">
            CERTIFICATE KEY ID: {cert.certificateCode}
          </div>

          <p className="text-gray-400 text-xs mt-3 flex items-center justify-center gap-2">
            <i className="fa-regular fa-calendar"></i> Issued on {new Date(cert.issuedAt).toLocaleDateString()}
          </p>

        </div>

        {/* Certificate Footer printing row */}
        <div className="bg-gray-50 border-t border-gray-100 p-6 flex justify-center gap-4">
          <button 
            className="h-12 px-8 rounded-xl bg-[#5b34ea] text-white font-bold hover:bg-[#4a24c4] transition text-xs shadow-md cursor-pointer flex items-center gap-2"
            onClick={handlePrint}
          >
            <i className="fa-solid fa-print"></i> Print / PDF Copy
          </button>
          <button 
            className="h-12 px-8 rounded-xl border border-[#5b34ea] bg-white text-[#5b34ea] font-extrabold hover:bg-purple-50 transition text-xs cursor-pointer flex items-center gap-2"
            onClick={() => setView('student-profile')}
          >
            <i className="fa-solid fa-arrow-left"></i> Back to Profile
          </button>
        </div>

      </div>

    </div>
  );
};
