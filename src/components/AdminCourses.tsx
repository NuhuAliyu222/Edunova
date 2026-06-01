import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { ViewState } from '../types';

interface AdminCoursesProps {
  setView: (view: ViewState) => void;
}

export const AdminCourses: React.FC<AdminCoursesProps> = ({ setView }) => {
  const { courses, createCourse, updateCourse, deleteCourse, logout } = useLms();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Create / Edit Form State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [instructor, setInstructor] = useState('');
  const [price, setPrice] = useState(0);
  const [thumbnail, setThumbnail] = useState('');

  const handleLogout = () => {
    logout();
    setView('home');
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setCategory('');
    setInstructor('');
    setPrice(0);
    setThumbnail('/src/assets/images/web_development_thumbnail_1780339612963.png');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (courseId: number) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    setEditingId(courseId);
    setTitle(course.title);
    setDescription(course.description);
    setCategory(course.category);
    setInstructor(course.instructor);
    setPrice(course.price);
    setThumbnail(course.thumbnail);
    setIsEditorOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert('Title is required.');
      return;
    }

    try {
      if (editingId !== null) {
        // Edit Mode
        await updateCourse(editingId, {
          title,
          description,
          category,
          instructor,
          price: Number(price) || 0,
          thumbnail
        });
      } else {
        // New Course
        await createCourse({
          title,
          description,
          category,
          instructor,
          price: Number(price) || 0,
          thumbnail
        });
      }
      setIsEditorOpen(false);
    } catch (err: any) {
      alert(err.message || 'Operation failed.');
    }
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  className="h-11 rounded-xl flex items-center gap-4 px-4 bg-white/10 text-white font-semibold cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
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
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 bg-white/10 text-white font-semibold cursor-pointer">
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
            <span className="h-12 rounded-xl flex items-center gap-4 px-4 text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer" onClick={handleLogout}>
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
            </span>
          </nav>
        </div>

        {/* System Health status */}
        <div className="bg-[#131d67] border border-[#1b277a] rounded-2xl p-4 text-gray-200 text-xs">
          <h4 className="font-bold text-white mb-2 uppercase tracking-wide">System Control Status</h4>
          <span className="flex items-center gap-1.5 text-green-400 font-bold"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Active, Online</span>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
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
                placeholder="Search catalog courses..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent outline-none text-[#111]"
              />
              <i className="fa-solid fa-magnifying-glass text-gray-400"></i>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="profile flex items-center gap-3">
              <div className="w-[44px] h-[44px] rounded-full bg-gradient-to-br from-[#ffcf9d] to-[#8b5a3b] border-2 border-[#5a35ff]"></div>
              <div>
                <h4 className="text-sm font-bold text-[#111827]">Super Admin</h4>
                <p className="text-gray-400 text-xs mt-[1px]">Administrator ID: #01</p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT ENVELOPE */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-[800] leading-none mb-1 text-gray-900 tracking-tight font-sans">Courses Catalog Catalog</h1>
              <p className="text-gray-500 text-xs mt-1">Publish new course models, edit existing attributes, price levels or thumbnail headers.</p>
            </div>
            
            <button className="h-11 bg-[#5a35ff] text-white px-5 rounded-xl font-bold flex items-center gap-2 cursor-pointer text-xs shadow-md" onClick={handleOpenCreate}>
              <i className="fa-solid fa-plus"></i> Add New Course
            </button>
          </div>

          {/* CATALOG EDIT EDITOR POPUP MODAL */}
          {isEditorOpen && (
            <div className="bg-white border-2 border-purple-200 rounded-2xl p-6 mb-8 max-w-xl shadow-lg border-t-[8px]">
              <h3 className="font-bold text-gray-900 text-base mb-4">{editingId ? 'Edit Course details' : 'Draft New Course Catalog'}</h3>
              
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700">Course Course Title *</label>
                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full h-10 border border-gray-200 rounded-lg px-3 outline-none focus:border-[#5a35ff] text-xs" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700">Category Tag</label>
                    <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full h-10 border border-gray-200 rounded-lg px-3 outline-none focus:border-[#5a35ff] text-xs" placeholder="e.g. Programming" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700">Author Instructor</label>
                    <input type="text" value={instructor} onChange={(e) => setInstructor(e.target.value)} className="w-full h-10 border border-gray-200 rounded-lg px-3 outline-none focus:border-[#5a35ff] text-xs" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700">Price (0 = Free)</label>
                    <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full h-10 border border-gray-200 rounded-lg px-3 outline-none focus:border-[#5a35ff] text-xs" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700 font-sans">Summary Description</label>
                  <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full h-10 border border-gray-200 rounded-lg px-3 outline-none focus:border-[#5a35ff] text-xs" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700">Thumbnail URL</label>
                  <input type="text" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} className="w-full h-10 border border-gray-200 rounded-lg px-3 outline-none focus:border-[#5a35ff] text-xs" />
                </div>

                <div className="flex gap-3 justify-end mt-4">
                  <button type="button" className="h-9 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 text-xs font-semibold cursor-pointer" onClick={() => setIsEditorOpen(false)}>Cancel</button>
                  <button type="submit" className="h-9 px-4 bg-[#5a35ff] text-white rounded-xl text-xs font-bold hover:bg-[#4a24c4] transition cursor-pointer">Save Catalog details</button>
                </div>
              </form>
            </div>
          )}

          {/* TABLE MATRIX COMPONENT */}
          <div className="bg-white border border-[#ececf4] rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 uppercase text-[10px] font-bold text-gray-400 tracking-wider">
                  <th className="p-4 pl-6">Catalog Course</th>
                  <th className="p-4">Author Instructor</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price Attribute</th>
                  <th className="p-4">Audit Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map(course => (
                    <tr key={course.id} className="hover:bg-gray-50/40">
                      <td className="p-4 pl-6 font-semibold text-gray-900 flex items-center gap-3">
                        <img src={course.thumbnail} className="w-12 h-10 rounded-md object-cover border border-gray-100" alt="thumbnail" />
                        <span>{course.title}</span>
                      </td>
                      <td className="p-4">{course.instructor}</td>
                      <td className="p-4 text-purple-600 font-bold">{course.category}</td>
                      <td className="p-4 font-bold text-gray-900">{course.price === 0 ? 'Free' : `$${course.price}`}</td>
                      <td className="p-4"><span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded text-[10px]">Published</span></td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button 
                            className="bg-purple-50 text-[#5a35ff] hover:bg-purple-100 transition p-2 rounded-lg cursor-pointer border border-[#eceaf5]"
                            onClick={() => handleOpenEdit(course.id)}
                            title="Edit"
                          >
                            <i className="fa-solid fa-pen"></i> edit
                          </button>
                          <button 
                            className="bg-red-50 text-red-500 hover:bg-red-100 transition p-2 rounded-lg cursor-pointer border border-red-100"
                            onClick={() => {
                              if (window.confirm(`Delete "${course.title}"?`)) {
                                deleteCourse(course.id);
                              }
                            }}
                            title="Delete"
                          >
                            <i className="fa-regular fa-trash-can"></i> delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">No courses recorded inside Catalog folders at present.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </main>

    </div>
  );
};
