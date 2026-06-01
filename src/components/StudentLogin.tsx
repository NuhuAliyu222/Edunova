import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { ViewState } from '../types';

interface StudentLoginProps {
  setView: (view: ViewState) => void;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({ setView }) => {
  const { login } = useLms();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
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
      await login(email, password, 'student');
      setView('student-dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Try developer defaults: student@edunova.com / student123');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#f4f2ff] font-sans antialiased text-sm min-h-screen py-8 px-6 flex items-center justify-center">
      <div className="w-full max-w-[1400px] bg-white rounded-[28px] overflow-hidden grid grid-cols-1 lg:grid-cols-[46%_54%] shadow-[0_10px_60px_rgba(0,0,0,0.04)] border border-[#e8e5f8] min-h-[860px]">
        
        {/* LEFT ILLUST PANEL */}
        <div className="relative px-12 pt-12 overflow-hidden bg-[#faf9ff] hidden lg:flex flex-col justify-between select-none">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView('home')}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6D3BFF] to-[#4B22E8] flex items-center justify-center text-white text-[24px] shadow-md">
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
              <div className="text-[20px] font-extrabold leading-none">
                <span className="text-[#5B34F2]">Edunova</span>
                <span className="text-[#111827]"> - Smart Learning</span>
              </div>
            </div>

            <div className="mt-16 relative z-10">
              <h1 className="text-[56px] leading-[62px] font-[800] tracking-[-1.5px] text-[#09122D]">
                Welcome <br />
                <span className="text-[#5B34F2]">Back!</span>
              </h1>
              <p className="mt-4 text-[18px] leading-relaxed text-gray-500 max-w-[440px]">
                Log back in to view your courses, complete interactive quizzes, and earn verifiable completion awards.
              </p>

              {/* List features with decorative badges */}
              <div className="mt-12 flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-[14px] bg-[#F0EAFF] border border-[#E4DAFF] flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-book-open text-[#5B34F2]"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#141B34]">Access Free Lessons</h3>
                    <p className="text-gray-500 text-xs">Learn from curated guides and practical roadmap files.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-[14px] bg-[#F0EAFF] border border-[#E4DAFF] flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-chart-column text-[#5B34F2]"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#141B34]">Track Complete Growth</h3>
                    <p className="text-gray-500 text-xs">Keep tab of completed modules with real-time stats.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-[14px] bg-[#F0EAFF] border border-[#E4DAFF] flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-file-lines text-[#5B34F2]"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#141B34]">Download Verify Certificates</h3>
                    <p className="text-gray-500 text-xs">Print a gorgeous PDF certificate of course achievement.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Laptop vector illustration background mockup at the bottom */}
          <div className="relative mt-8 max-w-[500px] z-10 self-center">
            <div className="w-[420px] h-[260px] rounded-t-[18px] bg-[#0F172A] border-[8px] border-[#2E3347] shadow-xl p-4 overflow-hidden">
              <div className="bg-white h-full rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-[#D7E1FF]"></div>
                  <div>
                    <div className="h-2 w-20 bg-gray-200 rounded"></div>
                    <div className="h-1.5 w-12 bg-gray-100 rounded mt-1"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <div className="h-1.5 w-10 bg-gray-200 rounded"></div>
                    <div className="h-5 w-6 bg-purple-100 rounded mt-2"></div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <div className="h-1.5 w-10 bg-gray-200 rounded"></div>
                    <div className="h-5 w-6 bg-[#27ae60]/20 rounded mt-2"></div>
                  </div>
                </div>
                <div className="h-12 w-full bg-purple-50 rounded-lg mt-3 p-2 flex items-center justify-between">
                  <div className="h-2 w-24 bg-purple-200 rounded"></div>
                  <div className="h-6 w-16 bg-purple-600 rounded"></div>
                </div>
              </div>
            </div>
            <div className="w-[460px] h-[12px] bg-[#D6D8E0] rounded-b-[20px] ml-[-20px] shadow-md"></div>
          </div>
        </div>

        {/* RIGHT LOGIN FORM PANEL */}
        <div className="flex items-center justify-center p-8 lg:p-14">
          <div className="w-full max-w-[580px] bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-12">
            <div className="flex justify-center mb-6">
              <div className="w-[96px] h-[96px] rounded-full bg-[#F0EAFF] flex items-center justify-center">
                <i className="fa-solid fa-lock text-[44px] text-[#5B34F2]"></i>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-[32px] md:text-[36px] font-extrabold text-[#0D1733]">
                Login to Student Portal
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                Enter your credentials to access your course files
              </p>
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
                <label className="block text-sm font-bold text-[#111827] mb-2">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <i className="fa-regular fa-envelope absolute left-4 text-gray-400 text-lg"></i>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your student email address"
                    className="w-full h-14 pl-12 pr-4 bg-[#fafbfc] border border-gray-200 rounded-xl outline-none focus:border-[#5B34F2] transition text-base text-[#111]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-[#111827]">
                    Password
                  </label>
                  <span className="text-xs font-semibold text-[#5B34F2] hover:underline cursor-pointer" onClick={() => {
                    alert('Please contact Edunova administrator to reset your password, or register a new account.');
                  }}>
                    Forgot Password?
                  </span>
                </div>
                <div className="relative flex items-center">
                  <i className="fa-solid fa-lock absolute left-4 text-gray-400 text-lg"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your security password"
                    className="w-full h-14 pl-12 pr-12 bg-[#fafbfc] border border-gray-200 rounded-xl outline-none focus:border-[#5B34F2] transition text-base text-[#111]"
                  />
                  <i
                    className={`fa-regular ${showPassword ? 'fa-eye' : 'fa-eye-slash'} absolute right-4 text-gray-400 text-lg hover:text-[#5B34F2] cursor-pointer`}
                    onClick={() => setShowPassword(!showPassword)}
                  ></i>
                </div>
              </div>

              {/* Remember */}
              <div className="flex items-center gap-3">
                <input type="checkbox" id="rememberMe" className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer" />
                <label htmlFor="rememberMe" className="text-xs font-[500] text-gray-600 cursor-pointer">
                  Remember my credentials on this browser
                </label>
              </div>

              {/* Submit btn */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-[#6D3BFF] to-[#4B22E8] text-white text-lg font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Logging in...</span>
                ) : (
                  <>
                    <span>Login</span>
                    <i className="fa-solid fa-right-to-bracket"></i>
                  </>
                )}
              </button>

              {/* Toggle registering */}
              <div className="text-center mt-6 text-sm text-gray-500">
                Don't have an account?{' '}
                <span className="text-[#5B34F2] font-[700] hover:underline cursor-pointer" onClick={() => setView('student-register')}>
                  Register here
                </span>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
