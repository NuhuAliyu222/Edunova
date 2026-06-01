import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { ViewState } from '../types';

interface StudentRegisterProps {
  setView: (view: ViewState) => void;
}

export const StudentRegister: React.FC<StudentRegisterProps> = ({ setView }) => {
  const { register } = useLms();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [termCheck, setTermCheck] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Helper age calculator
  const getAge = (dobString: string) => {
    if (!dobString) return null;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculatedAge = getAge(dob);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !username || !email || !password || !confirmPassword || !dob || !gender) {
      setErrorMsg('Please populate all required fields marked with *');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters long.');
      return;
    }

    if (!termCheck) {
      setErrorMsg('You must accept the Terms & Conditions and Privacy Policy to register.');
      return;
    }

    setIsLoading(true);
    try {
      await register(name, username, email, dob, gender, phone);
      setView('student-dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#f5f2ff] font-sans antialiased text-sm min-h-screen py-8 px-6 flex items-center justify-center relative">
      <div className="w-full max-w-[1400px] bg-white rounded-[28px] overflow-hidden grid grid-cols-1 lg:grid-cols-[42%_58%] shadow-[0_10px_40px_rgba(109,40,217,0.08)] border border-gray-100 min-h-[960px]">
        
        {/* LEFT BRAND PANEL */}
        <div className="relative px-12 pt-12 overflow-hidden bg-[#faf9ff] hidden lg:flex flex-col justify-between select-none">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView('home')}>
              <div className="w-[54px] h-[54px] rounded-xl bg-gradient-to-br from-[#6D3BFF] to-[#4B22E8] flex items-center justify-center text-white text-[28px] shadow-md">
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
              <div className="text-[26px] font-extrabold leading-none">
                <span className="text-[#5B2EFF]">Edunova</span>
                <span className="text-[#111827]"> - Smart Learning</span>
              </div>
            </div>

            <div className="mt-16 relative z-10 pl-4">
              <h1 className="text-[64px] font-extrabold leading-[74px] tracking-[-2px] text-[#071028]">
                Create Your <br />
                <span className="text-[#6B35F5]">Account</span>
              </h1>
              <p className="text-[20px] leading-relaxed text-gray-500 mt-4 max-w-[440px]">
                Join Edunova - Smart Learning System and start your free interactive technical roadmap.
              </p>

              {/* Badges */}
              <div className="mt-12 flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-[22px] bg-white border border-[#ebe7f6] flex items-center justify-center shrink-0 shadow-sm">
                    <i className="fa-solid fa-book-open text-[#6B35F5] text-[26px]"></i>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#111827]">Structured Practical Lessons</h3>
                    <p className="text-gray-500 text-xs">Learn with hands-on HTML, CSS and Python guides.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-[22px] bg-white border border-[#ebe7f6] flex items-center justify-center shrink-0 shadow-sm">
                    <i className="fa-solid fa-chart-column text-[#27ae60] text-[26px]"></i>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#111827]">Real-time Performance Metrics</h3>
                    <p className="text-gray-500 text-xs">Review score grades and overall progress percentages.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-[22px] bg-white border border-[#ebe7f6] flex items-center justify-center shrink-0 shadow-sm">
                    <i className="fa-solid fa-trophy text-[#fbbf24] text-[26px]"></i>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#111827]">Gain Award Certificates</h3>
                    <p className="text-gray-500 text-xs">Accumulate complete lesson hours and get verifiable codes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Plant, Laptop vectors mockup */}
          <div className="relative mt-8 max-w-[460px] self-center z-10">
            <div className="w-[420px] h-[250px] rounded-t-[18px] bg-[#d9d4f4] border-[6px] border-white p-3 shadow-xl overflow-hidden">
              <div className="bg-[#faf9ff] h-full rounded-lg flex">
                <div className="w-[78px] bg-[#171B46] p-4 flex flex-col gap-4 text-white text-xs">
                  <i className="fa-solid fa-home"></i>
                  <i className="fa-solid fa-circle-play"></i>
                  <i className="fa-solid fa-circle-question"></i>
                </div>
                <div className="flex-1 p-4">
                  <div className="h-20 w-full bg-gradient-to-r from-[#6b2cf5] to-[#7c3aed] rounded-xl flex items-center justify-center">
                    <i className="fa-solid fa-play text-white text-lg"></i>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="h-6 w-full bg-gray-100 rounded"></div>
                    <div className="h-6 w-full bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[450px] h-[12px] bg-[#cbc6e6] rounded-b-[40px] ml-[-15px] shadow-sm"></div>
          </div>
        </div>

        {/* RIGHT REGISTER INPUTS FORM */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="w-full">
            <div className="text-center mb-10">
              <div className="w-[88px] h-[88px] rounded-full border-[3px] border-[#6D3BFF] flex items-center justify-center text-[#6D3BFF] text-[36px] mx-auto mb-4">
                <i className="fa-regular fa-user"></i>
              </div>
              <h2 className="text-[34px] md:text-[44px] font-extrabold text-[#0f172a]">
                Create Account
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Fill in the details to establish your free LMS profile
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {errorMsg && (
                <div className="p-4 bg-red-50 text-red-500 rounded-xl border border-red-100 text-sm font-semibold flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-bold text-[#111827] mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <i className="fa-regular fa-user absolute left-4 text-gray-400 text-lg"></i>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full h-14 pl-12 pr-4 bg-[#fafbfc] border border-gray-200 rounded-xl outline-none focus:border-[#6B35F5] transition text-base text-[#111]"
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-bold text-[#111827] mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <i className="fa-regular fa-user absolute left-4 text-gray-400 text-lg"></i>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. johndoe1"
                      className="w-full h-14 pl-12 pr-4 bg-[#fafbfc] border border-gray-200 rounded-xl outline-none focus:border-[#6B35F5] transition text-base text-[#111]"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-[#111827] mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <i className="fa-regular fa-envelope absolute left-4 text-gray-400 text-lg"></i>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. jdoe@example.com"
                      className="w-full h-14 pl-12 pr-4 bg-[#fafbfc] border border-gray-200 rounded-xl outline-none focus:border-[#6B35F5] transition text-base text-[#111]"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-bold text-[#111827] mb-2">
                    Phone Number
                  </label>
                  <div className="relative flex items-center">
                    <i className="fa-solid fa-phone absolute left-4 text-gray-400 text-lg"></i>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 555-1234"
                      className="w-full h-14 pl-12 pr-4 bg-[#fafbfc] border border-gray-200 rounded-xl outline-none focus:border-[#6B35F5] transition text-base text-[#111]"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-bold text-[#111827] mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <i className="fa-solid fa-lock absolute left-4 text-gray-400 text-lg"></i>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      className="w-full h-14 pl-12 pr-12 bg-[#fafbfc] border border-gray-200 rounded-xl outline-none focus:border-[#6B35F5] transition text-base text-[#111]"
                    />
                    <i
                      className={`fa-regular ${showPassword ? 'fa-eye' : 'fa-eye-slash'} absolute right-4 text-gray-400 text-lg cursor-pointer hover:text-[#5B34F2]`}
                      onClick={() => setShowPassword(!showPassword)}
                    ></i>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-bold text-[#111827] mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <i className="fa-solid fa-lock absolute left-4 text-gray-400 text-lg"></i>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full h-14 pl-12 pr-12 bg-[#fafbfc] border border-gray-200 rounded-xl outline-none focus:border-[#6B35F5] transition text-base text-[#111]"
                    />
                    <i
                      className={`fa-regular ${showConfirmPassword ? 'fa-eye' : 'fa-eye-slash'} absolute right-4 text-gray-400 text-lg cursor-pointer hover:text-[#5B34F2]`}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    ></i>
                  </div>
                </div>

                {/* DOB & Age Display */}
                <div>
                  <label className="block text-sm font-bold text-[#111827] mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <i className="fa-regular fa-calendar absolute left-4 text-gray-400 text-lg"></i>
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full h-14 pl-12 pr-4 bg-[#fafbfc] border border-gray-200 rounded-xl outline-none focus:border-[#6B35F5] transition text-base text-[#111]"
                    />
                  </div>
                  {calculatedAge !== null && (
                    <p className="text-xs mt-1.5 font-bold text-[#6D3BFF]">
                      Age: {calculatedAge} years old
                    </p>
                  )}
                </div>

                {/* Gender select */}
                <div>
                  <label className="block text-sm font-bold text-[#111827] mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <i className="fa-regular fa-user absolute left-4 text-gray-400 text-lg"></i>
                    <select
                      required
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full h-14 pl-12 pr-4 bg-[#fafbfc] border border-gray-200 rounded-xl outline-none focus:border-[#6B35F5] transition text-base text-[#111] cursor-pointer appearance-none"
                    >
                      <option value="" disabled>Select your gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                    <i className="fa-solid fa-chevron-down absolute right-4 text-gray-400 pointer-events-none text-xs"></i>
                  </div>
                </div>

              </div>

              {/* T&C agreements */}
              <div className="flex items-center gap-3 mt-4">
                <input
                  type="checkbox"
                  id="termsCheck"
                  checked={termCheck}
                  onChange={(e) => setTermCheck(e.target.checked)}
                  className="w-6 h-6 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <label htmlFor="termsCheck" className="text-sm text-gray-600 cursor-pointer">
                  I agree to the{' '}
                  <span className="text-[#5B2EFF] font-semibold hover:underline" onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}>
                    Terms & Conditions
                  </span>{' '}
                  and{' '}
                  <span className="text-[#5B2EFF] font-semibold hover:underline" onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }}>
                    Privacy Policy
                  </span>
                </label>
              </div>

              {/* Submit registrar button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 mt-4 bg-gradient-to-r from-[#6D3BFF] to-[#4B22E8] text-white text-lg font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Registering...</span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <i className="fa-solid fa-user-plus"></i>
                  </>
                )}
              </button>

              {/* Back links */}
              <div className="text-center mt-6 text-sm text-gray-500">
                Already have an account?{' '}
                <span className="text-[#5B2EFF] font-[700] hover:underline cursor-pointer" onClick={() => setView('student-login')}>
                  Login here
                </span>
              </div>
            </form>
          </div>
        </div>

      </div>

      {/* T&C MODAL DIALOG */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowTermsModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 bg-gradient-to-r from-[#1a0f5e] to-[#2d1b8a] text-white flex justify-between items-center">
              <h2 className="text-lg font-bold">📜 Terms & Conditions</h2>
              <button className="text-2xl font-bold cursor-pointer hover:opacity-80" onClick={() => setShowTermsModal(false)}>&times;</button>
            </div>
            <div className="p-8 overflow-y-auto leading-relaxed text-[#4b5563] text-sm">
              <div className="p-4 bg-purple-50 rounded-xl mb-6 text-purple-700"><strong>Effective Date:</strong> January 1, 2024</div>
              <h3 className="font-bold text-gray-900 mt-4 mb-2">1. Educational License</h3>
              <p className="mb-4">Edunova provides a free online curriculum on modern computer science architectures. Completing lessons is strictly designed for personal capacity improvement.</p>
              <h3 className="font-bold text-gray-900 mt-4 mb-2">2. Verifiable Certification</h3>
              <p className="mb-4">Standard certificates of progress are issued after completing every structured lesson of the courses. Code sharing or mock certificate forging will suspend user authorization access.</p>
              <h3 className="font-bold text-gray-900 mt-4 mb-2">3. Age Requirement</h3>
              <p>Edunova is open to students of all ages. Anyone can register to learn and progress at their own speed!</p>
            </div>
          </div>
        </div>
      )}

      {/* PRIVACY MODAL DIALOG */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowPrivacyModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 bg-gradient-to-r from-[#1a0f5e] to-[#2d1b8a] text-white flex justify-between items-center">
              <h2 className="text-lg font-bold">🔒 Privacy Policy</h2>
              <button className="text-2xl font-bold cursor-pointer hover:opacity-80" onClick={() => setShowPrivacyModal(false)}>&times;</button>
            </div>
            <div className="p-8 overflow-y-auto leading-relaxed text-[#4b5563] text-sm">
              <div className="p-4 bg-purple-50 rounded-xl mb-6 text-purple-700"><strong>🛡️ Data Protection Guarantee</strong></div>
              <p className="mb-4">We do NOT share student email addresses or demographic details with third-party networks. All student growth statistics and lesson progress markers are secured in sandboxed LocalStorage scopes.</p>
              <p className="mb-4">Passwords are locally handled and verified. Hashing layers protect student profile info securely across persistent operations.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
