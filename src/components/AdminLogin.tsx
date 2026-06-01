import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { ViewState } from '../types';

interface AdminLoginProps {
  setView: (view: ViewState) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ setView }) => {
  const { login } = useLms();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    try {
      await login(email, password, 'admin');
      setView('admin-dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please use developer admin defaults.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#f4f4f7] font-sans antialiased text-sm min-h-screen py-8 px-6 flex items-center justify-center">
      <div className="w-full max-w-[1540px] bg-white rounded-[28px] overflow-hidden flex shadow-[0_10px_60px_rgba(0,0,0,0.08)] min-h-[880px]">
        
        {/* LEFT BRAND PANEL */}
        <div className="w-[48%] relative text-white px-14 py-12 hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#040f5e] to-[#07145f] select-none">
          <div className="absolute top-[-80px] right-[-90px] w-[340px] h-[340px] bg-white/[0.04] rounded-full"></div>
          <div className="absolute top-[70px] right-[40px] w-[220px] h-[220px] bg-white/[0.03] rounded-full"></div>
          
          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
              <div className="w-10 h-10 rounded-xl bg-[#4d31ff] flex items-center justify-center text-white">
                <i className="fa-solid fa-graduation-cap text-lg"></i>
              </div>
              <div className="text-[20px] font-bold">
                Edunova <span className="text-[#8c74ff]">- Smart Learning</span>
              </div>
            </div>

            <div className="mt-20">
              <h1 className="text-[52px] leading-tight font-extrabold tracking-tight">
                Admin <span className="text-[#8c74ff]">Portal</span>
              </h1>
              <p className="mt-4 text-gray-300 text-base leading-relaxed max-w-[480px]">
                Secure dashboard area for administrative system preferences, curriculum lesson uploads, student audits and verifications.
              </p>
            </div>

            {/* Admin features */}
            <div className="mt-14 flex flex-col gap-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#3b2bb6] flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-users text-sm text-white"></i>
                </div>
                <div>
                  <h4 className="font-bold text-base leading-none">Roster Management</h4>
                  <p className="text-gray-300 text-xs mt-1.5 leading-relaxed">Manage registered students, audits, and enrollment parameters.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#3b2bb6] flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-book-open text-sm text-white"></i>
                </div>
                <div>
                  <h4 className="font-bold text-base leading-none">Curriculum Editor</h4>
                  <p className="text-gray-300 text-xs mt-1.5 leading-relaxed">Publish new course models, catalog specifications and lesson details.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#3b2bb6] flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-gear text-sm text-white"></i>
                </div>
                <div>
                  <h4 className="font-bold text-base leading-none">Complete System Control</h4>
                  <p className="text-gray-300 text-xs mt-1.5 leading-relaxed">Edit customizable attributes, assess scores, and review verifications.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 bg-white/[0.04] p-5 rounded-2xl border border-white/[0.05] max-w-[500px] mt-8 self-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-200 mb-3">Quick System Health</h4>
            <div className="flex items-center gap-2 text-xs font-bold text-green-400">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
              All Host Services Operational
            </div>
          </div>
        </div>

        {/* RIGHT ADMIN LOGIN FORM */}
        <div className="w-full lg:w-[52%] bg-[#f6f6f9] flex items-center justify-center p-8">
          <div className="w-full max-w-[580px] bg-white rounded-3xl shadow-sm p-8 md:p-12">
            
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-[#f0ebff] flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-[#5b37ff] flex items-center justify-center">
                  <i className="fa-solid fa-shield text-white text-2xl"></i>
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-[#0f1738]">Admin Area Login</h2>
              <p className="text-gray-500 text-sm mt-1.5">Enter authorized details to verify access authorization</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {errorMsg && (
                <div className="p-4 bg-red-50 text-red-500 rounded-xl border border-red-100 text-sm font-semibold flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {errorMsg}
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Email Address</label>
                <div className="relative flex items-center">
                  <i className="fa-regular fa-envelope absolute left-4 text-gray-400 text-lg"></i>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter admin credentials email"
                    className="w-full h-14 pl-12 pr-4 bg-[#fafbfc] border border-gray-200 rounded-xl outline-none focus:border-[#5b37ff] transition text-base text-[#111]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-gray-800">Password</label>
                  <span className="text-xs font-bold text-[#5b37ff] hover:underline cursor-pointer" onClick={() => {
                    alert('Please search system configuration records or contact your deployment supervisor.');
                  }}>
                    Password help?
                  </span>
                </div>
                <div className="relative flex items-center">
                  <i className="fa-solid fa-lock absolute left-4 text-gray-400 text-lg"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="security password"
                    className="w-full h-14 pl-12 pr-12 bg-[#fafbfc] border border-gray-200 rounded-xl outline-none focus:border-[#5b37ff] transition text-base text-[#111]"
                  />
                  <i
                    className={`fa-regular ${showPassword ? 'fa-eye' : 'fa-eye-slash'} absolute right-4 text-gray-400 text-lg cursor-pointer hover:text-[#5b37ff]`}
                    onClick={() => setShowPassword(!showPassword)}
                  ></i>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-[#5a2cff] to-[#4f27f7] text-white text-base font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Authorizing admin...</span>
                ) : (
                  <>
                    <span>Login</span>
                    <i className="fa-solid fa-right-to-bracket text-sm"></i>
                  </>
                )}
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-[1px] bg-gray-100"></div>
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Navigate</span>
                <div className="flex-1 h-[1px] bg-gray-100"></div>
              </div>

              <button type="button" className="w-full h-11 border border-purple-200 bg-purple-50 text-purple-700 font-bold rounded-xl text-xs hover:bg-purple-100/50 transition cursor-pointer" onClick={() => setView('student-login')}>
                👥 Go to Student Sign-in
              </button>
            </form>

            <div className="text-center mt-12 text-xs text-gray-400 flex items-center justify-center gap-2">
              <i className="fa-solid fa-lock"></i>
              Secure admin session. Unauthorised logs will be saved.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
