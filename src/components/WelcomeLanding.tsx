import React, { useEffect, useState } from 'react';
import { useLms } from '../context/LmsContext';
import { ViewState } from '../types';

interface WelcomeLandingProps {
  setView: (view: ViewState) => void;
  setSelectedCourseId: (id: number) => void;
}

export const WelcomeLanding: React.FC<WelcomeLandingProps> = ({ setView, setSelectedCourseId }) => {
  const { courses, students } = useLms();
  
  // Counting counters triggers
  const [coursesCount, setCoursesCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [successRate, setSuccessRate] = useState(0);

  useEffect(() => {
    // Elegant numerical animations
    const targetCourses = courses.length * 15 + 10;
    const targetStudents = students.length * 400 + 12000;
    const targetSuccess = 95;

    let c = 0, s = 0, rate = 0;
    const interval = setInterval(() => {
      let active = false;
      if (c < targetCourses) { c += Math.ceil(targetCourses / 50); if (c > targetCourses) c = targetCourses; setCoursesCount(c); active = true; }
      if (s < targetStudents) { s += Math.ceil(targetStudents / 50); if (s > targetStudents) s = targetStudents; setStudentsCount(s); active = true; }
      if (rate < targetSuccess) { rate += 2; if (rate > targetSuccess) rate = targetSuccess; setSuccessRate(rate); active = true; }
      if (!active) clearInterval(interval);
    }, 25);
    
    return () => clearInterval(interval);
  }, [courses, students]);

  // Navigate to course detail
  const handleCourseClick = (courseId: number) => {
    setSelectedCourseId(courseId);
    setView('student-courses');
  };

  return (
    <div className="w-full bg-[#f5f4fb] min-h-screen text-[#111] font-sans antialiased text-sm">
      <div className="w-[95%] max-w-[1400px] mx-auto py-5">
        
        {/* NAVBAR */}
        <nav className="bg-white rounded-[18px] px-8 py-5 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.04)] flex-wrap gap-5">
          <div className="flex items-center gap-3 font-extrabold text-[#111] text-[20px] cursor-pointer" onClick={() => setView('home')}>
            <i className="fa-solid fa-graduation-cap text-[#4f2de0] text-[34px]"></i>
            <span>
              <span className="text-[#5130e5]">Edunova</span> - Smart Learning
            </span>
          </div>

          <div className="flex gap-10 font-[500]">
            <span className="text-[#5b33ea] cursor-pointer" href="#" onClick={() => setView('home')}>Home</span>
            <span className="text-[#111] hover:text-[#5b33ea] cursor-pointer" onClick={() => setView('student-dashboard')}>Courses</span>
            <span className="text-[#111] hover:text-[#5b33ea] cursor-pointer" onClick={() => {
              const el = document.getElementById('footer');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}>About Us</span>
          </div>

          <div className="flex gap-4">
            <button className="px-7 py-3 border border-[#ddd] rounded-xl font-[500] bg-white flex items-center gap-2 hover:bg-gray-50 transition cursor-pointer" onClick={() => setView('student-login')}>
              <i className="fa-regular fa-user"></i> Login
            </button>
            <button className="px-7 py-3 bg-[#5130e5] text-white rounded-xl font-[500] hover:bg-[#3f1fb8] flex items-center gap-2 transition cursor-pointer" onClick={() => setView('student-register')}>
              <i className="fa-solid fa-user-plus"></i> Register
            </button>
          </div>
        </nav>

        {/* HERO SECTION */}
        <section className="mt-6 bg-gradient-to-br from-[#f5f1ff] to-[#f8f2ff] rounded-[25px] p-[50px] flex flex-col lg:flex-row items-center justify-between gap-10 min-h-[580px] relative overflow-hidden shadow-sm">
          <div className="flex-1 z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 bg-[#ede8ff] text-[#5130e5] px-[18px] py-3 rounded-xl font-[500] mb-6 text-[15px]">
              <i className="fa-solid fa-graduation-cap"></i>
              Learn Anytime, Anywhere
            </div>

            <h1 className="text-[48px] md:text-[68px] leading-[1.1] font-[800] text-[#111] mb-6">
              Smart Way To <br />
              <span className="text-[#5130e5]">Learn</span> Anything
            </h1>

            <p className="text-gray-600 text-[18px] leading-relaxed max-w-[560px] mb-8 mx-auto lg:mx-0">
              Edunova - Smart Learning is an interactive LMS portal that empowers learners worldwide to build robust, production-ready technical skills at their own pace.
            </p>

            <div className="flex gap-4 flex-wrap justify-center lg:justify-start">
              <button className="px-8 py-[16px] bg-[#5130e5] text-white rounded-[14px] font-[500] text-[16px] hover:bg-[#3f1fb8] transition shadow-[0_10px_25px_rgba(81,48,229,0.2)] flex items-center gap-2 cursor-pointer" onClick={() => setView('student-register')}>
                <i className="fa-solid fa-rocket"></i> Get Started
              </button>
              <button className="px-8 py-[16px] bg-white border border-[#ddd] hover:border-[#5130e5] text-[#111] rounded-[14px] font-[500] text-[16px] transition flex items-center gap-2 cursor-pointer" onClick={() => setView('student-dashboard')}>
                <i className="fa-solid fa-book-open"></i> Explore Courses
              </button>
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center min-h-[480px]">
            {/* Background Shape Orbit circles */}
            <div className="w-[380px] h-[380px] md:w-[460px] md:h-[460px] rounded-full bg-[#8454ff]/[0.08] flex items-center justify-center relative">
              <div className="w-[300px] h-[300px] md:w-[380px] md:h-[380px] rounded-full bg-[#8454ff]/[0.12] flex items-center justify-center">
                <div className="w-[240px] h-[240px] md:w-[300px] md:h-[300px] rounded-full bg-[#8454ff]/[0.10]"></div>
              </div>
              
              <img 
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop" 
                alt="Learning Portal" 
                className="absolute w-[80%] h-[80%] object-cover rounded-full shadow-lg border-[6px] border-white z-10"
              />
            </div>

            {/* Orbiting Counting stats cards */}
            <div className="absolute top-[10%] left-[-5%] bg-white p-4 rounded-2xl shadow-md border border-gray-100 flex flex-col items-center min-w-[110px] transform hover:scale-[1.08] transition z-20">
              <i className="fa-solid fa-book text-[#5130e5] text-[24px] mb-2"></i>
              <h4 className="text-[20px] font-bold">{coursesCount}+</h4>
              <p className="text-gray-500 text-xs">Courses</p>
            </div>

            <div className="absolute bottom-[20%] right-[-5%] bg-white p-4 rounded-2xl shadow-md border border-gray-100 flex flex-col items-center min-w-[110px] transform hover:scale-[1.08] transition z-20">
              <i className="fa-solid fa-users text-[#27ae60] text-[24px] mb-2"></i>
              <h4 className="text-[20px] font-bold">{studentsCount.toLocaleString()}+</h4>
              <p className="text-gray-500 text-xs">Students</p>
            </div>

            <div className="absolute bottom-[10%] left-[10%] bg-white p-4 rounded-2xl shadow-md border border-gray-100 flex flex-col items-center min-w-[110px] transform hover:scale-[1.08] transition z-20">
              <i className="fa-solid fa-trophy text-[#f4b400] text-[24px] mb-2"></i>
              <h4 className="text-[20px] font-bold">{successRate}%</h4>
              <p className="text-gray-500 text-xs">Success Rate</p>
            </div>
          </div>
        </section>

        {/* POPULAR COURSES GRID */}
        <section className="py-[60px]" id="allcourses">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[28px] md:text-[34px] font-bold text-[#111]">Popular Courses</h2>
            <span className="text-[#5130e5] font-[500] hover:translate-x-2 transition cursor-pointer" onClick={() => setView('student-dashboard')}>
              View All Courses →
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div 
                key={course.id} 
                className="bg-white rounded-[18px] overflow-hidden border border-gray-100 hover:-translate-y-2 hover:shadow-lg transition cursor-pointer"
                onClick={() => handleCourseClick(course.id)}
              >
                <div className="h-[200px] overflow-hidden">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover hover:scale-[1.05] transition duration-300" />
                </div>
                <div className="p-[22px]">
                  <h3 className="text-[18px] font-semibold mb-2 line-clamp-1">{course.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                    <span className="text-[#f4b400] font-[500] text-sm">
                      ★ {course.rating} ({course.reviewsCount.toLocaleString()})
                    </span>
                    <span className="text-[#5130e5] font-[500] text-sm group-hover:translate-x-1 duration-200">
                      View Course →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES ROW */}
        <section className="bg-gradient-to-r from-[#f3efff] to-[#f8f2ff] rounded-[25px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-[45px_35px] mb-10">
          <div className="flex gap-4 items-start p-2">
            <div className="w-[65px] h-[65px] bg-gradient-to-br from-[#5130e5] to-[#7c5cf5] text-white flex items-center justify-center rounded-full text-[24px] shrink-0">
              <i className="fa-solid fa-chalkboard-user"></i>
            </div>
            <div>
              <h4 className="text-[18px] font-semibold mb-2 text-[#111]">Expert Instructors</h4>
              <p className="text-gray-500 text-xs leading-relaxed">Learn from experienced and professional industry experts.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start p-2">
            <div className="w-[65px] h-[65px] bg-gradient-to-br from-[#5130e5] to-[#7c5cf5] text-white flex items-center justify-center rounded-full text-[24px] shrink-0">
              <i className="fa-regular fa-clock"></i>
            </div>
            <div>
              <h4 className="text-[18px] font-semibold mb-2 text-[#111]">Flexible Learning</h4>
              <p className="text-gray-500 text-xs leading-relaxed">Study at your own convenient schedule with instant lifetime course access.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start p-2">
            <div className="w-[65px] h-[65px] bg-gradient-to-br from-[#5130e5] to-[#7c5cf5] text-white flex items-center justify-center rounded-full text-[24px] shrink-0">
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <div>
              <h4 className="text-[18px] font-semibold mb-2 text-[#111]">Track Progress</h4>
              <p className="text-gray-500 text-xs leading-relaxed">Monitor your completion rate and scores dynamically in the visual charts.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start p-2">
            <div className="w-[65px] h-[65px] bg-gradient-to-br from-[#5130e5] to-[#7c5cf5] text-white flex items-center justify-center rounded-full text-[24px] shrink-0">
              <i className="fa-solid fa-certificate"></i>
            </div>
            <div>
              <h4 className="text-[18px] font-semibold mb-2 text-[#111]">Get Certificates</h4>
              <p className="text-gray-500 text-xs leading-relaxed">Earn unique, verifiable certificates upon fully completing standard lessons.</p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-gradient-to-br from-[#1a0f5e] to-[#2d1b8a] text-white rounded-[25px] p-[50px] overflow-hidden" id="footer">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3 font-extrabold text-[24px] mb-5">
                <i className="fa-solid fa-graduation-cap text-[#8766ff]"></i>
                <span>Edunova</span>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed mb-6">
                Empowering technical learners globally with stellar, accessible educational technologies. Use your free student dashboard to monitor growth today.
              </p>
              <div className="flex gap-4">
                <span className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#5130e5] flex items-center justify-center cursor-pointer transition text-sm"><i className="fa-brands fa-facebook-f"></i></span>
                <span className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#5130e5] flex items-center justify-center cursor-pointer transition text-sm"><i className="fa-brands fa-twitter"></i></span>
                <span className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#5130e5] flex items-center justify-center cursor-pointer transition text-sm"><i className="fa-brands fa-instagram"></i></span>
                <span className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#5130e5] flex items-center justify-center cursor-pointer transition text-sm"><i className="fa-brands fa-linkedin-in"></i></span>
              </div>
            </div>

            <div>
              <h3 className="text-[18px] font-semibold mb-5 pb-2 border-b border-white/10">Quick Links</h3>
              <ul className="flex flex-col gap-3 text-gray-300 text-sm">
                <li className="hover:text-white transition cursor-pointer" onClick={() => setView('home')}>Home</li>
                <li className="hover:text-white transition cursor-pointer" onClick={() => setView('student-dashboard')}>Courses</li>
                <li className="hover:text-white transition cursor-pointer" onClick={() => setView('student-register')}>Get Started</li>
              </ul>
            </div>

            <div>
              <h3 className="text-[18px] font-semibold mb-5 pb-2 border-b border-white/10">Resources</h3>
              <ul className="flex flex-col gap-3 text-gray-300 text-sm">
                <li className="hover:text-white transition cursor-pointer">Privacy Policy</li>
                <li className="hover:text-white transition cursor-pointer">Terms & Conditions</li>
                <li className="hover:text-white transition cursor-pointer">Support Help Desk</li>
                <li className="hover:text-white transition cursor-pointer">System Specifications</li>
              </ul>
            </div>

            <div>
              <h3 className="text-[18px] font-semibold mb-5 pb-2 border-b border-white/10">Reach Us</h3>
              <ul className="flex flex-col gap-4 text-gray-300 text-sm">
                <li className="flex items-center gap-3"><i className="fa-regular fa-envelope text-[#8766ff]"></i> support@edunova.com</li>
                <li className="flex items-center gap-3"><i className="fa-solid fa-phone text-[#8766ff]"></i> +1 (555) 123-4567</li>
                <li className="flex items-center gap-3"><i className="fa-solid fa-location-dot text-[#8766ff]"></i> 123 Learning Lane, CA</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-white/10 text-center text-gray-400 text-xs">
            © 2026 Edunova Smart Learning. All Rights Reserved. Fully sandboxed Client Storage Mode enabled.
          </div>
        </footer>

      </div>
    </div>
  );
};
