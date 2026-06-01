import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, Course, Lesson, Enrollment, LessonProgress, 
  QuizQuestion, QuizAttempt, Certificate, Bookmark, Message, Announcement 
} from '../types';

interface LmsContextType {
  currentUser: User | null;
  courses: Course[];
  lessons: Lesson[];
  enrollments: Enrollment[];
  progress: LessonProgress[];
  quizzes: QuizQuestion[];
  attempts: QuizAttempt[];
  certificates: Certificate[];
  bookmarks: Bookmark[];
  messages: Message[];
  announcements: Announcement[];
  students: User[];
  
  // API Dynamic Backend Handshake Keys
  apiMode: 'local' | 'api';
  apiUrl: string;
  setApiMode: (mode: 'local' | 'api') => void;
  setApiUrl: (url: string) => void;
  pingStatus: 'Connected' | 'Disconnected' | 'Checking' | 'Error';
  triggerPing: (urlToCheck?: string) => Promise<boolean>;
  
  // Auth Operations
  login: (email: string, password: string, role: 'student' | 'admin') => Promise<User>;
  register: (name: string, username: string, email: string, dob: string, gender: string, phone?: string) => Promise<User>;
  logout: () => void;
  updateProfile: (name: string, email: string, bio: string, phone?: string, gender?: string, dob?: string, location?: string) => Promise<User>;
  
  // Student Actions
  enroll: (courseId: number) => Promise<Enrollment>;
  markLessonComplete: (courseId: number, lessonId: number) => Promise<LessonProgress[]>;
  submitQuiz: (courseId: number, answers: { [questionId: number]: number }) => Promise<{ score: number; correct: number; total: number }>;
  toggleBookmark: (courseId: number) => void;
  addSystemMessage: (userId: number, text: string) => void;
  sendMessage: (userId: number, text: string, sender: 'student' | 'admin' | 'system') => void;
  markMessagesRead: (userId: number) => void;
  
  // Admin Operations
  createCourse: (course: Omit<Course, 'id' | 'rating' | 'reviewsCount'>) => Promise<Course>;
  updateCourse: (id: number, course: Partial<Course>) => Promise<Course>;
  deleteCourse: (id: number) => Promise<void>;
  createLesson: (lesson: Omit<Lesson, 'id'>) => Promise<Lesson>;
  deleteLesson: (id: number) => Promise<void>;
  createQuiz: (quiz: Omit<QuizQuestion, 'id'>) => Promise<QuizQuestion>;
  deleteQuiz: (id: number) => Promise<void>;
  deleteStudent: (id: number) => Promise<void>;
  addAnnouncement: (title: string, excerpt: string) => void;
}

const LmsContext = createContext<LmsContextType | undefined>(undefined);

export const useLms = () => {
  const context = useContext(LmsContext);
  if (!context) throw new Error('useLms must be used within LmsProvider');
  return context;
};

export const LmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize States from LocalStorage or pre-populated Mock Data
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('edunova_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('edunova_courses');
    let parsed: Course[] | null = null;
    if (saved) {
      try {
        parsed = JSON.parse(saved);
        // Automatically map old Unsplash images to beautiful new generated ones
        parsed = parsed.map(c => {
          if (c.thumbnail && c.thumbnail.includes('unsplash.com')) {
            if (c.id === 1) c.thumbnail = '/src/assets/images/web_development_thumbnail_1780339612963.png';
            if (c.id === 2) c.thumbnail = '/src/assets/images/python_programming_thumbnail_1780339634285.png';
            if (c.id === 3) c.thumbnail = '/src/assets/images/database_management_thumbnail_1780339652011.png';
            if (c.id === 4) c.thumbnail = '/src/assets/images/ui_ux_design_thumbnail_1780339670669.png';
          }
          return c;
        });
        localStorage.setItem('edunova_courses', JSON.stringify(parsed));
      } catch (e) {
        parsed = null;
      }
    }
    if (parsed) return parsed;
    
    // Default initial mock courses using professional generated 3D assets
    const initial: Course[] = [
      {
        id: 1,
        title: 'Complete Web Development Bootcamp',
        description: 'Learn HTML, CSS, JavaScript, React & Node.js, and build premium portfolio sites.',
        category: 'Web Development',
        instructor: 'Alex Johnson',
        price: 0,
        thumbnail: '/src/assets/images/web_development_thumbnail_1780339612963.png',
        rating: 4.8,
        reviewsCount: 2450
      },
      {
        id: 2,
        title: 'Python Programming Basics',
        description: 'Beginner to Advanced Python scripting, object-oriented concepts, and custom API creation.',
        category: 'Python Programming',
        instructor: 'Sarah Wilson',
        price: 0,
        thumbnail: '/src/assets/images/python_programming_thumbnail_1780339634285.png',
        rating: 4.7,
        reviewsCount: 1890
      },
      {
        id: 3,
        title: 'Database Management MASTERY',
        description: 'Deep dive into SQL, PostgreSQL, indexing, normalized designs, and document databases.',
        category: 'Database Management',
        instructor: 'Michael Brown',
        price: 0,
        thumbnail: '/src/assets/images/database_management_thumbnail_1780339652011.png',
        rating: 4.6,
        reviewsCount: 1234
      },
      {
        id: 4,
        title: 'UI/UX Design Essentials',
        description: 'Learn modern wireframing and user experience principles inside Figma and prototyping.',
        category: 'UI/UX Design',
        instructor: 'Emily Davis',
        price: 0,
        thumbnail: '/src/assets/images/ui_ux_design_thumbnail_1780339670669.png',
        rating: 4.9,
        reviewsCount: 2100
      }
    ];
    localStorage.setItem('edunova_courses', JSON.stringify(initial));
    return initial;
  });

  const [lessons, setLessons] = useState<Lesson[]>(() => {
    const saved = localStorage.getItem('edunova_lessons');
    if (saved) return JSON.parse(saved);
    
    // Initial pre-loaded lessons for the courses
    const initial: Lesson[] = [
      // Web Dev (Course 1)
      { id: 101, courseId: 1, title: 'What is Web Development?', duration: '10:15', order: 1 },
      { id: 102, courseId: 1, title: 'How Does the Web Work?', duration: '15:20', order: 2 },
      { id: 103, courseId: 1, title: 'HTML Overview and Document Structure', duration: '12:30', order: 3 },
      { id: 104, courseId: 1, title: 'Working with HTML Lists & Forms', duration: '14:40', order: 4 },
      { id: 105, courseId: 1, title: 'CSS Flexbox Layout Fundamentals', duration: '18:15', order: 5 },
      // Python (Course 2)
      { id: 201, courseId: 2, title: 'Introduction to Python & Installation', duration: '08:45', order: 1 },
      { id: 202, courseId: 2, title: 'Variables, Data Types, and Operators', duration: '11:20', order: 2 },
      { id: 203, courseId: 2, title: 'Building Python Functions & Logic Flows', duration: '15:10', order: 3 },
      // Databases (Course 3)
      { id: 301, courseId: 3, title: 'Understanding Relational Databases', duration: '09:30', order: 1 },
      { id: 302, courseId: 3, title: 'SQL SELECT Statements & Filtering', duration: '14:15', order: 2 },
      // UI/UX (Course 4)
      { id: 401, courseId: 4, title: 'What is UI vs UX Design?', duration: '11:10', order: 1 },
      { id: 402, courseId: 4, title: 'Wireframing in Figma Guidelines', duration: '16:50', order: 2 }
    ];
    localStorage.setItem('edunova_lessons', JSON.stringify(initial));
    return initial;
  });

  const [students, setStudents] = useState<User[]>(() => {
    const saved = localStorage.getItem('edunova_students');
    if (saved) return JSON.parse(saved);
    
    // Standard student baseline accounts
    const initial: User[] = [
      {
        id: 10,
        name: 'Sarah Johnson',
        username: 'sarahj',
        email: 'student@edunova.com',
        role: 'student',
        phone: '+1 234 567 8901',
        gender: 'female',
        dob: '2001-05-18',
        bio: 'Enthusiastic beginner student looking to master engineering!',
        registeredAt: '2026-05-15T12:00:00Z'
      },
      {
        id: 11,
        name: 'Michael Brown',
        username: 'mbrown',
        email: 'michael@edunova.com',
        role: 'student',
        registeredAt: '2026-05-18T08:30:00Z'
      }
    ];
    localStorage.setItem('edunova_students', JSON.stringify(initial));
    return initial;
  });

  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => {
    const saved = localStorage.getItem('edunova_enrollments');
    if (saved) return JSON.parse(saved);
    
    // Initial mock enrollments for Michael (id: 11) & Sarah (id: 10) to make dashboard stats look fully production-ready
    const initial: Enrollment[] = [
      { id: '10-1', userId: 10, courseId: 1, enrolledAt: '2026-05-15T12:05:00Z' },
      { id: '10-2', userId: 10, courseId: 2, enrolledAt: '2026-05-16T10:00:00Z' },
      { id: '11-1', userId: 11, courseId: 1, enrolledAt: '2026-05-18T08:35:00Z' }
    ];
    localStorage.setItem('edunova_enrollments', JSON.stringify(initial));
    return initial;
  });

  const [progress, setProgress] = useState<LessonProgress[]>(() => {
    const saved = localStorage.getItem('edunova_progress');
    if (saved) return JSON.parse(saved);
    
    // Sarah has complete 2 lessons of course 1
    const initial: LessonProgress[] = [
      { id: '10-1-101', userId: 10, courseId: 1, lessonId: 101, completedAt: '2026-05-15T14:30:00Z' },
      { id: '10-1-102', userId: 10, courseId: 1, lessonId: 102, completedAt: '2026-05-15T16:00:00Z' }
    ];
    localStorage.setItem('edunova_progress', JSON.stringify(initial));
    return initial;
  });

  const [quizzes, setQuizzes] = useState<QuizQuestion[]>(() => {
    const saved = localStorage.getItem('edunova_quizzes');
    if (saved) return JSON.parse(saved);
    
    // Default high-fidelity quiz questions matching student quiz expectation perfectly
    const initial: QuizQuestion[] = [
      {
        id: 501,
        courseId: 1,
        question: 'Which of the following is the correct HTML tag for inserting a line break?',
        options: ['<br>', '<break>', '<lb>', '<line>'],
        correctIndex: 0
      },
      {
        id: 502,
        courseId: 1,
        question: 'What does HTML stand for?',
        options: ['Hyperlink Markup Language', 'Hyper Text Markup Language', 'Home Tool Markup Language', 'High Tech Modern Language'],
        correctIndex: 1
      },
      {
        id: 503,
        courseId: 1,
        question: 'Which CSS property defines the layout of flexible container items?',
        options: ['display: flex', 'layout: flexible', 'align: flex', 'align-content: stretch'],
        correctIndex: 0
      },
      {
        id: 504,
        courseId: 2,
        question: 'Which collection is ordered, changeable, and allows duplicate members in Python?',
        options: ['Set', 'Dictionary', 'Tuple', 'List'],
        correctIndex: 3
      },
      {
        id: 505,
        courseId: 3,
        question: 'What is the standard statement used to extract database records?',
        options: ['GET', 'EXTRACT', 'SELECT', 'QUERY'],
        correctIndex: 2
      }
    ];
    localStorage.setItem('edunova_quizzes', JSON.stringify(initial));
    return initial;
  });

  const [attempts, setAttempts] = useState<QuizAttempt[]>(() => {
    const saved = localStorage.getItem('edunova_attempts');
    if (saved) return JSON.parse(saved);
    
    // Default initial mock attempts for the leaderboard to look alive immediately
    const initial: QuizAttempt[] = [
      {
        id: 1001,
        userId: 10, // Sarah Johnson
        courseId: 1, // Complete Web Development Bootcamp
        score: 100,
        correctCount: 3,
        totalCount: 3,
        attemptedAt: '2026-05-28T14:30:00Z'
      },
      {
        id: 1002,
        userId: 11, // Michael Brown
        courseId: 1, // Complete Web Development Bootcamp
        score: 67,
        correctCount: 2,
        totalCount: 3,
        attemptedAt: '2026-05-29T10:15:00Z'
      },
      {
        id: 1003,
        userId: 10, // Sarah Johnson
        courseId: 2, // Python Programming Basics
        score: 100,
        correctCount: 1,
        totalCount: 1,
        attemptedAt: '2026-05-30T11:00:00Z'
      }
    ];
    localStorage.setItem('edunova_attempts', JSON.stringify(initial));
    return initial;
  });

  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    const saved = localStorage.getItem('edunova_certificates');
    return saved ? JSON.parse(saved) : [];
  });

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('edunova_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('edunova_messages');
    if (saved) return JSON.parse(saved);
    
    const initial: Message[] = [
      { id: 901, userId: 10, text: 'Welcome to Edunova! Start exploring free lessons today.', sender: 'system', read: false, sentAt: '2026-05-15T12:00:00Z' }
    ];
    localStorage.setItem('edunova_messages', JSON.stringify(initial));
    return initial;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('edunova_announcements');
    if (saved) return JSON.parse(saved);
    const initial: Announcement[] = [
      { id: 1, title: '🚀 Free Certificates Campaign', excerpt: 'Earn free verifiable course certificates automatically once you finish all lessons in any course.', date: 'May 18, 2024' },
      { id: 2, title: '🔧 Scheduled Server Maintenance', excerpt: 'Edunova smart database engines will undergo standard optimization this Saturday morning.', date: 'May 17, 2024' }
    ];
    localStorage.setItem('edunova_announcements', JSON.stringify(initial));
    return initial;
  });

  const [apiMode, setApiMode] = useState<'local' | 'api'>(() => {
    const saved = localStorage.getItem('edunova_api_mode');
    return (saved as 'local' | 'api') || 'local';
  });

  const [apiUrl, setApiUrl] = useState<string>(() => {
    const saved = localStorage.getItem('edunova_api_url');
    return saved || 'http://localhost/backend';
  });

  const [pingStatus, setPingStatus] = useState<'Connected' | 'Disconnected' | 'Checking' | 'Error'>('Disconnected');

  useEffect(() => {
    localStorage.setItem('edunova_api_mode', apiMode);
  }, [apiMode]);

  useEffect(() => {
    localStorage.setItem('edunova_api_url', apiUrl);
  }, [apiUrl]);

  // Helper to fetch authorization bearer token headers
  const getHeaders = () => {
    const token = localStorage.getItem('edunova_api_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const loadApiData = async () => {
    if (apiMode !== 'api') return;
    try {
      const headers = getHeaders();

      // 1. Fetch courses
      const coursesRes = await fetch(`${apiUrl}/api/courses.php`, { headers });
      const coursesJson = await coursesRes.json();
      if (coursesRes.ok && coursesJson.status === 'success') {
        const remoteCourses = coursesJson.data;
        setCourses(remoteCourses);

        // 2. Fetch lessons & compile local maps
        const fetchedLessons: Lesson[] = [];
        const remoteProgress: LessonProgress[] = [];
        const remoteEnrollments: Enrollment[] = [];
        
        for (const course of remoteCourses) {
          const lessonsRes = await fetch(`${apiUrl}/api/lessons.php?courseId=${course.id}`, { headers });
          const lessonsJson = await lessonsRes.json();
          if (lessonsRes.ok && lessonsJson.status === 'success') {
            fetchedLessons.push(...lessonsJson.data);
            
            lessonsJson.data.forEach((l: any) => {
              if (l.isCompleted && currentUser) {
                remoteProgress.push({
                  id: `${currentUser.id}-${course.id}-${l.id}`,
                  userId: currentUser.id,
                  courseId: course.id,
                  lessonId: l.id,
                  completedAt: new Date().toISOString()
                });
              }
            });
          }

          if (course.isEnrolled && currentUser) {
            remoteEnrollments.push({
              id: `${currentUser.id}-${course.id}`,
              userId: currentUser.id,
              courseId: course.id,
              enrolledAt: new Date().toISOString()
            });
          }
        }
        
        if (fetchedLessons.length > 0) {
          setLessons(fetchedLessons);
        }
        if (currentUser) {
          setProgress(remoteProgress);
          setEnrollments(remoteEnrollments);
        }
      }

      // 3. Fetch announcements
      const annRes = await fetch(`${apiUrl}/api/announcements.php`, { headers });
      const annJson = await annRes.json();
      if (annRes.ok && annJson.status === 'success') {
        setAnnouncements(annJson.data);
      }

      if (currentUser) {
        // 4. Fetch certificates
        const certRes = await fetch(`${apiUrl}/api/certificate.php`, { headers });
        const certJson = await certRes.json();
        if (certRes.ok && certJson.status === 'success') {
          const remoteCerts: Certificate[] = certJson.data.map((c: any, i: number) => ({
            id: c.id || i + 1,
            userId: currentUser.id,
            userName: currentUser.name,
            courseId: c.course_id || 1,
            courseTitle: c.course_title || 'Relational Databases',
            certificateCode: c.certificate_code,
            issuedAt: c.issued_at
          }));
          setCertificates(remoteCerts);
        }

        // 5. Fetch messages
        const msgRes = await fetch(`${apiUrl}/api/messages.php`, { headers });
        const msgJson = await msgRes.json();
        if (msgRes.ok && msgJson.status === 'success') {
          setMessages(msgJson.data);
        }

        // 6. If Admin, also load students list
        if (currentUser.role === 'admin') {
          const stdRes = await fetch(`${apiUrl}/api/users.php`, { headers });
          const stdJson = await stdRes.json();
          if (stdRes.ok && stdJson.status === 'success') {
            setStudents(stdJson.data);
          }
        }
      }
    } catch (err) {
      console.error("Failed synchronizing API dataset: ", err);
    }
  };

  useEffect(() => {
    if (apiMode === 'api') {
      loadApiData();
    }
  }, [apiMode, apiUrl, currentUser]);

  const triggerPing = async (urlToCheck?: string): Promise<boolean> => {
    setPingStatus('Checking');
    const targetUrl = urlToCheck || apiUrl;
    try {
      const response = await fetch(`${targetUrl}/api/courses.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        setPingStatus('Connected');
        return true;
      } else {
        setPingStatus('Error');
        return false;
      }
    } catch (e) {
      setPingStatus('Error');
      return false;
    }
  };

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('edunova_announcements', JSON.stringify(announcements));
  }, [announcements]);
  useEffect(() => {
    localStorage.setItem('edunova_current_user', currentUser ? JSON.stringify(currentUser) : '');
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('edunova_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('edunova_lessons', JSON.stringify(lessons));
  }, [lessons]);

  useEffect(() => {
    localStorage.setItem('edunova_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('edunova_enrollments', JSON.stringify(enrollments));
  }, [enrollments]);

  useEffect(() => {
    localStorage.setItem('edunova_progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('edunova_quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem('edunova_attempts', JSON.stringify(attempts));
  }, [attempts]);

  useEffect(() => {
    localStorage.setItem('edunova_certificates', JSON.stringify(certificates));
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem('edunova_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('edunova_messages', JSON.stringify(messages));
  }, [messages]);

  // AUTH IMPLEMENTATIONS
  const login = async (email: string, password: string, role: 'student' | 'admin'): Promise<User> => {
    if (apiMode === 'api') {
      try {
        const res = await fetch(`${apiUrl}/auth/login.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Authentication failed on PHP backend.');
        }
        if (data.token) {
          localStorage.setItem('edunova_api_token', data.token);
        }
        const apiUser: User = {
          id: parseInt(data.user.id) || 1,
          name: data.user.name,
          username: data.user.username || data.user.name.toLowerCase().replace(/\s/g, ''),
          email: data.user.email,
          phone: data.user.phone || '',
          gender: data.user.gender || '',
          dob: data.user.dob || '',
          bio: data.user.bio || '',
          role: data.user.role || role,
          registeredAt: data.user.created_at || new Date().toISOString()
        };
        setCurrentUser(apiUser);
        return apiUser;
      } catch (err: any) {
        throw new Error(err.message || 'Failed connecting to external PHP auth service.');
      }
    }

    // Check credentials inside local state
    if (role === 'admin') {
      if (email === 'admin@edunova.com' && password === 'admin123') {
        const adminUser: User = {
          id: 1,
          name: 'Super Admin',
          username: 'admin',
          email: 'admin@edunova.com',
          role: 'admin',
          registeredAt: '2026-01-01T00:00:00Z'
        };
        setCurrentUser(adminUser);
        return adminUser;
      }
      throw new Error('Invalid Admin email or password.');
    } else {
      // Find matches in registered students list
      const matched = students.find(s => s.email.toLowerCase() === email.toLowerCase());
      if (matched && password === 'student123') {
        setCurrentUser(matched);
        return matched;
      } else if (matched && email === 'student@edunova.com' && password === 'student123') {
        setCurrentUser(matched);
        return matched;
      } else if (matched && password) {
        // Simple test credential pass for custom passwords as well
        setCurrentUser(matched);
        return matched;
      }
      
      throw new Error('Invalid Student credentials.');
    }
  };

  const register = async (name: string, username: string, email: string, dob: string, gender: string, phone?: string): Promise<User> => {
    if (apiMode === 'api') {
      try {
        const res = await fetch(`${apiUrl}/auth/register.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, username, email, password: 'student123', dob, gender, phone })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Registration failed on PHP backend.');
        }
        const apiUser: User = {
          id: parseInt(data.user.id) || (students.length + 101),
          name: data.user.name,
          username: data.user.username,
          email: data.user.email,
          phone: data.user.phone,
          gender: data.user.gender,
          dob: data.user.dob,
          bio: data.user.bio || '',
          role: 'student',
          registeredAt: data.user.created_at || new Date().toISOString()
        };
        setStudents(prev => [...prev, apiUser]);
        setCurrentUser(apiUser);
        return apiUser;
      } catch (err: any) {
        throw new Error(err.message || 'Registration failed via dynamic PHP server integration.');
      }
    }

    // Validate uniqueness
    const exists = students.some(s => s.email.toLowerCase() === email.toLowerCase());
    if (exists) throw new Error('A student account with this email already exists.');

    const newStudent: User = {
      id: students.length + 100,
      name,
      username,
      email,
      dob,
      gender,
      phone,
      role: 'student',
      registeredAt: new Date().toISOString()
    };

    setStudents(prev => [...prev, newStudent]);
    setCurrentUser(newStudent);
    return newStudent;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateProfile = async (
    name: string, 
    email: string, 
    bio: string, 
    phone?: string, 
    gender?: string, 
    dob?: string, 
    location?: string
  ): Promise<User> => {
    if (!currentUser) throw new Error('No user is logged in.');

    if (apiMode === 'api') {
      try {
        const res = await fetch(`${apiUrl}/api/users.php`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ name, phone, gender, dob, bio })
        });
        const data = await res.json();
        if (!res.ok || data.status !== 'success') {
          throw new Error(data.message || 'Profile modification failed on PHP backend.');
        }
        const apiUser: User = {
          ...currentUser,
          name: data.data.name,
          phone: data.data.phone || '',
          gender: data.data.gender || '',
          dob: data.data.dob || '',
          bio: data.data.bio || '',
        };
        setCurrentUser(apiUser);
        loadApiData(); // Refresh UI State
        return apiUser;
      } catch (err: any) {
        throw new Error(err.message || 'Failed connecting to SQL to update profile.');
      }
    }

    const updatedUser = {
      ...currentUser,
      name,
      email,
      bio,
      phone: phone || currentUser.phone,
      gender: gender || currentUser.gender,
      dob: dob || currentUser.dob,
    };

    // Update in students collection if student
    if (currentUser.role === 'student') {
      setStudents(prev => prev.map(s => s.id === currentUser.id ? updatedUser : s));
    }
    
    setCurrentUser(updatedUser);
    return updatedUser;
  };

  // STUDENT ACTIONS
  const enroll = async (courseId: number): Promise<Enrollment> => {
    if (!currentUser) throw new Error('Authentication required.');
    
    if (apiMode === 'api') {
      try {
        const res = await fetch(`${apiUrl}/api/enroll.php`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ courseId })
        });
        const data = await res.json();
        if (!res.ok && data.status !== 'success') {
          if (res.status !== 409) {
            throw new Error(data.message || 'Failed enrolling via PHP database.');
          }
        }
        await loadApiData(); // Sync enrollments
      } catch (err: any) {
        console.error("API enroll failed: ", err);
      }
    }

    const exists = enrollments.some(e => e.userId === currentUser.id && e.courseId === courseId);
    if (exists) {
      return enrollments.find(e => e.userId === currentUser.id && e.courseId === courseId)!;
    }

    const newEnrollment: Enrollment = {
      id: `${currentUser.id}-${courseId}`,
      userId: currentUser.id,
      courseId,
      enrolledAt: new Date().toISOString()
    };

    setEnrollments(prev => [...prev, newEnrollment]);
    return newEnrollment;
  };

  const markLessonComplete = async (courseId: number, lessonId: number): Promise<LessonProgress[]> => {
    if (!currentUser) throw new Error('Authentication required.');

    if (apiMode === 'api') {
      try {
        const res = await fetch(`${apiUrl}/api/complete_lesson.php`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ courseId, lessonId })
        });
        const data = await res.json();
        if (res.ok && data.status === 'success') {
          await loadApiData();
          return progress;
        }
      } catch (err: any) {
        console.error("API progress update failed: ", err);
      }
    }

    // Auto-enroll if not enrolled
    await enroll(courseId);

    const progressId = `${currentUser.id}-${courseId}-${lessonId}`;
    const exists = progress.some(p => p.id === progressId);
    let updatedProgress = progress;

    if (!exists) {
      const pItem: LessonProgress = {
        id: progressId,
        userId: currentUser.id,
        courseId,
        lessonId,
        completedAt: new Date().toISOString()
      };
      updatedProgress = [...progress, pItem];
      setProgress(updatedProgress);
    }

    // CHECK FOR COURSE COMPLETION (TOWARD CERTIFICATE CONVERSION)
    const courseLessons = lessons.filter(l => l.courseId === courseId);
    const completedForThisCourse = updatedProgress.filter(
      p => p.userId === currentUser.id && p.courseId === courseId
    );

    if (courseLessons.length > 0 && completedForThisCourse.length === courseLessons.length) {
      // Complete! Issue Certificate if not already present
      const certExists = certificates.some(c => c.userId === currentUser.id && c.courseId === courseId);
      if (!certExists) {
        const matchedCourse = courses.find(c => c.id === courseId);
        const certCode = `EDUNOVA-${courseId}-${Math.floor(100000 + Math.random() * 900000)}`;
        const newCert: Certificate = {
          id: Date.now() + Math.floor(Math.random() * 100),
          userId: currentUser.id,
          userName: currentUser.name,
          courseId,
          courseTitle: matchedCourse ? matchedCourse.title : `Course #${courseId}`,
          certificateCode: certCode,
          issuedAt: new Date().toISOString()
        };
        setCertificates(prev => [...prev, newCert]);
        
        // system congratulations message
        addSystemMessage(
          currentUser.id, 
          `🏆 Congratulations! You have successfully completed "${newCert.courseTitle}". Your verifiable certificate code is ${certCode}.`
        );
      }
    }

    return updatedProgress;
  };

  const submitQuiz = async (courseId: number, answers: { [questionId: number]: number }): Promise<{ score: number; correct: number; total: number }> => {
    if (!currentUser) throw new Error('Authentication required.');

    if (apiMode === 'api') {
      try {
        const formattedAnswers: { [key: string]: number } = {};
        Object.entries(answers).forEach(([k, v]) => {
          formattedAnswers[k] = v;
        });

        const res = await fetch(`${apiUrl}/api/quizzes.php`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ courseId, answers: formattedAnswers })
        });
        const json = await res.json();
        if (!res.ok || json.status !== 'success') {
          throw new Error(json.message || 'Quiz scoring failed on real-time server.');
        }

        const newAttempt: QuizAttempt = {
          id: json.data.attemptId || Date.now(),
          userId: currentUser.id,
          courseId,
          score: json.data.score,
          correctCount: json.data.correctCount,
          totalCount: json.data.totalCount,
          attemptedAt: json.data.attemptedAt || new Date().toISOString()
        };
        setAttempts(prev => [newAttempt, ...prev]);
        loadApiData(); // Refresh certificates

        return {
          score: Math.round(json.data.score),
          correct: json.data.correctCount,
          total: json.data.totalCount
        };
      } catch (err: any) {
        throw new Error(err.message || 'Failed processing quiz on external API.');
      }
    }

    const courseQuestions = quizzes.filter(q => q.courseId === courseId);
    if (!courseQuestions.length) throw new Error('No quiz questions for this course.');

    let correctCount = 0;
    courseQuestions.forEach(q => {
      const studentAnswer = answers[q.id];
      if (studentAnswer !== undefined && studentAnswer === q.correctIndex) {
        correctCount += 1;
      }
    });

    const score = Math.round((correctCount / courseQuestions.length) * 100);

    const newAttempt: QuizAttempt = {
      id: Date.now(),
      userId: currentUser.id,
      courseId,
      score,
      correctCount,
      totalCount: courseQuestions.length,
      attemptedAt: new Date().toISOString()
    };

    setAttempts(prev => [...prev, newAttempt]);
    return { score, correct: correctCount, total: courseQuestions.length };
  };

  const toggleBookmark = (courseId: number) => {
    if (!currentUser) return;
    const bookmarkId = `${currentUser.id}-${courseId}`;
    const exists = bookmarks.some(b => b.id === bookmarkId);
    
    if (exists) {
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
    } else {
      setBookmarks(prev => [...prev, { id: bookmarkId, userId: currentUser.id, courseId }]);
    }
  };

  const addSystemMessage = (userId: number, text: string) => {
    const newMsg: Message = {
      id: Date.now() + Math.floor(Math.random() * 10),
      userId,
      text,
      sender: 'system',
      read: false,
      sentAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const sendMessage = async (userId: number, text: string, sender: 'student' | 'admin' | 'system') => {
    if (apiMode === 'api') {
      try {
        const res = await fetch(`${apiUrl}/api/messages.php`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ text, userId: userId !== currentUser?.id ? userId : undefined })
        });
        if (res.ok) {
          const msgRes = await fetch(`${apiUrl}/api/messages.php`, { headers: getHeaders() });
          const msgJson = await msgRes.json();
          if (msgRes.ok && msgJson.status === 'success') {
            setMessages(msgJson.data);
          }
          return;
        }
      } catch (err) {
        console.error("API message dispatch failed: ", err);
      }
    }

    const newMsg: Message = {
      id: Date.now() + Math.round(Math.random() * 100),
      userId,
      text,
      sender,
      read: false,
      sentAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const markMessagesRead = (userId: number) => {
    setMessages(prev => prev.map(m => m.userId === userId ? { ...m, read: true } : m));
  };

  const addAnnouncement = (title: string, excerpt: string) => {
    const newAnnouncement: Announcement = {
      id: announcements.length > 0 ? Math.max(...announcements.map(a => a.id)) + 1 : 1,
      title,
      excerpt,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
  };

  // ADMIN OPERATIONS
  const createCourse = async (course: Omit<Course, 'id' | 'rating' | 'reviewsCount'>): Promise<Course> => {
    if (apiMode === 'api') {
      try {
        const res = await fetch(`${apiUrl}/api/courses.php`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(course)
        });
        const data = await res.json();
        if (!res.ok || data.status !== 'success') {
          throw new Error(data.message || 'Course launch aborted by MySQL backend.');
        }
        const created: Course = data.data;
        setCourses(prev => [created, ...prev]);
        await loadApiData();
        return created;
      } catch (err: any) {
        throw new Error(err.message || 'Connection error creating course.');
      }
    }

    const newCourse: Course = {
      ...course,
      id: courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1,
      rating: 4.5,
      reviewsCount: 0
    };
    setCourses(prev => [...prev, newCourse]);
    return newCourse;
  };

  const updateCourse = async (id: number, fields: Partial<Course>): Promise<Course> => {
    if (apiMode === 'api') {
      try {
        const res = await fetch(`${apiUrl}/api/courses.php`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ id, ...fields })
        });
        const data = await res.json();
        if (!res.ok || data.status !== 'success') {
          throw new Error(data.message || 'Course update configuration rejected.');
        }
        await loadApiData();
        return { id, ...fields } as Course;
      } catch (err: any) {
        throw new Error(err.message || 'Connection error updating course.');
      }
    }

    let updated: Course | null = null;
    setCourses(prev => prev.map(c => {
      if (c.id === id) {
        updated = { ...c, ...fields };
        return updated;
      }
      return c;
    }));
    if (!updated) throw new Error('Course not found');
    return updated;
  };

  const deleteCourse = async (id: number): Promise<void> => {
    if (apiMode === 'api') {
      try {
        const res = await fetch(`${apiUrl}/api/courses.php?id=${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        const data = await res.json();
        if (!res.ok || data.status !== 'success') {
          throw new Error(data.message || 'Failed deleting course module from database.');
        }
        await loadApiData();
        return;
      } catch (err: any) {
        throw new Error(err.message || 'Connection error deleting course.');
      }
    }

    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const createLesson = async (lesson: Omit<Lesson, 'id'>): Promise<Lesson> => {
    if (apiMode === 'api') {
      try {
        const res = await fetch(`${apiUrl}/api/lessons.php`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(lesson)
        });
        const data = await res.json();
        if (!res.ok || data.status !== 'success') {
          throw new Error(data.message || 'Failed uploading lesson module to DB.');
        }
        const created: Lesson = data.data;
        setLessons(prev => [...prev, created]);
        await loadApiData();
        return created;
      } catch (err: any) {
        throw new Error(err.message || 'Connection error adding lesson.');
      }
    }

    const newLesson: Lesson = {
      ...lesson,
      id: lessons.length > 0 ? Math.max(...lessons.map(l => l.id)) + 1 : 101
    };
    setLessons(prev => [...prev, newLesson]);
    return newLesson;
  };

  const deleteLesson = async (id: number): Promise<void> => {
    if (apiMode === 'api') {
      try {
        const res = await fetch(`${apiUrl}/api/lessons.php?id=${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        const data = await res.json();
        if (!res.ok || data.status !== 'success') {
          throw new Error(data.message || 'Failed expunging lesson from MySQL tables.');
        }
        await loadApiData();
        return;
      } catch (err: any) {
        throw new Error(err.message || 'Connection error removing lesson.');
      }
    }

    setLessons(prev => prev.filter(l => l.id !== id));
  };

  const createQuiz = async (quiz: Omit<QuizQuestion, 'id'>): Promise<QuizQuestion> => {
    const newQuiz: QuizQuestion = {
      ...quiz,
      id: quizzes.length > 0 ? Math.max(...quizzes.map(q => q.id)) + 1 : 501
    };
    setQuizzes(prev => [...prev, newQuiz]);
    return newQuiz;
  };

  const deleteQuiz = async (id: number): Promise<void> => {
    setQuizzes(prev => prev.filter(q => q.id !== id));
  };

  const deleteStudent = async (id: number): Promise<void> => {
    if (apiMode === 'api') {
      try {
        const res = await fetch(`${apiUrl}/api/users.php?id=${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        const data = await res.json();
        if (!res.ok || data.status !== 'success') {
          throw new Error(data.message || 'Failed expelling user record on MySQL database.');
        }
        await loadApiData();
        return;
      } catch (err: any) {
        throw new Error(err.message || 'Connection error deleting user.');
      }
    }

    setStudents(prev => prev.filter(s => s.id !== id));
    // Clear enrollment/bookmarks for this student
    setEnrollments(prev => prev.filter(e => e.userId !== id));
    setProgress(prev => prev.filter(p => p.userId !== id));
  };

  return (
    <LmsContext.Provider value={{
      currentUser, courses, lessons, enrollments, progress, quizzes, 
      attempts, certificates, bookmarks, messages, announcements, students,
      apiMode, apiUrl, setApiMode, setApiUrl, pingStatus, triggerPing,
      login, register, logout, updateProfile, enroll, markLessonComplete,
      submitQuiz, toggleBookmark, addSystemMessage, sendMessage, markMessagesRead, createCourse, updateCourse,
      deleteCourse, createLesson, deleteLesson, createQuiz, deleteQuiz, deleteStudent, addAnnouncement
    }}>
      {children}
    </LmsContext.Provider>
  );
};
