import React, { useState, useMemo } from 'react';
import { useLms } from '../context/LmsContext';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Award, 
  Crown, 
  Search, 
  Filter, 
  Sparkles, 
  BookOpen, 
  Medal, 
  Target, 
  TrendingUp, 
  User as UserIcon,
  HelpCircle,
  Calendar,
  Printer,
  X
} from 'lucide-react';

export const StudentQuizLeaderboard: React.FC = () => {
  const { currentUser, courses, attempts, students } = useLms();

  // Filter States
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'highest' | 'average'>('highest');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  if (!currentUser) return null;

  // Avatar matching helper
  const getStudentAvatar = (userId: number, email: string) => {
    if (userId === 10) return "https://randomuser.me/api/portraits/women/44.jpg"; // Sarah Johnson
    if (userId === 11) return "https://randomuser.me/api/portraits/men/85.jpg";   // Michael Brown
    if (userId === currentUser.id) {
      return "https://randomuser.me/api/portraits/men/32.jpg"; // Consistent with header
    }
    const imgId = (userId % 70) + 1;
    const isFemale = email.toLowerCase().includes('female') || email.toLowerCase().includes('sarah') || userId % 2 === 0;
    return `https://randomuser.me/api/portraits/${isFemale ? 'women' : 'men'}/${imgId}.jpg`;
  };

  // Process leaderboard ranking
  const leaderboardData = useMemo(() => {
    // 1. Filter attempts by selected course
    const filteredAttempts = attempts.filter(att => {
      if (courseFilter === 'all') return true;
      return att.courseId.toString() === courseFilter;
    });

    // 2. Group by student (userId)
    const grouped: { [userId: number]: {
      userId: number;
      name: string;
      email: string;
      attemptsList: typeof attempts;
      highestScore: number;
      averageScore: number;
      totalCount: number;
      correctCount: number;
      totalQuizzes: number;
      lastAttemptDate: string;
    }} = {};

    filteredAttempts.forEach(att => {
      const uId = att.userId;
      
      // Determine user metadata
      let name = `Student #${uId}`;
      let email = '';
      if (uId === currentUser.id) {
        name = currentUser.name;
        email = currentUser.email;
      } else {
        const matchingStudent = students.find(s => s.id === uId);
        if (matchingStudent) {
          name = matchingStudent.name;
          email = matchingStudent.email;
        }
      }

      if (!grouped[uId]) {
        grouped[uId] = {
          userId: uId,
          name,
          email,
          attemptsList: [],
          highestScore: 0,
          averageScore: 0,
          totalCount: 0,
          correctCount: 0,
          totalQuizzes: 0,
          lastAttemptDate: att.attemptedAt,
        };
      }

      const g = grouped[uId];
      g.attemptsList.push(att);
      g.highestScore = Math.max(g.highestScore, att.score);
      g.totalCount += att.totalCount;
      g.correctCount += att.correctCount;
      g.totalQuizzes += 1;
      
      if (new Date(att.attemptedAt).getTime() > new Date(g.lastAttemptDate).getTime()) {
        g.lastAttemptDate = att.attemptedAt;
      }
    });

    // Compute averages
    Object.values(grouped).forEach(g => {
      const sum = g.attemptsList.reduce((sumScore, a) => sumScore + a.score, 0);
      g.averageScore = g.attemptsList.length > 0 ? Math.round(sum / g.attemptsList.length) : 0;
    });

    // Convert to array
    let list = Object.values(grouped);

    // Filter by search name
    if (searchTerm.trim()) {
      list = list.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by metric choice
    if (sortBy === 'highest') {
      list.sort((a, b) => {
        if (b.highestScore !== a.highestScore) {
          return b.highestScore - a.highestScore;
        }
        return b.totalQuizzes - a.totalQuizzes; // Tie breaker: more attempts equals more dedication
      });
    } else {
      list.sort((a, b) => {
        if (b.averageScore !== a.averageScore) {
          return b.averageScore - a.averageScore;
        }
        return b.totalQuizzes - a.totalQuizzes;
      });
    }

    return list;
  }, [attempts, students, courseFilter, sortBy, searchTerm, currentUser]);

  // Find Current Logged in User rank
  const currentUserStanding = useMemo(() => {
    const rankIndex = leaderboardData.findIndex(item => item.userId === currentUser.id);
    if (rankIndex === -1) return null;
    return {
      rank: rankIndex + 1,
      total: leaderboardData.length,
      record: leaderboardData[rankIndex]
    };
  }, [leaderboardData, currentUser]);

  // Top 3 for Podium view
  const podiumWinners = useMemo(() => {
    const topThree = leaderboardData.slice(0, 3);
    const order = [1, 0, 2]; // Render 2nd, 1st, 3rd for Podium centering aesthetics
    const result: (typeof leaderboardData[0] | null)[] = [null, null, null];
    
    order.forEach((srcIndex, displayPosition) => {
      if (topThree[srcIndex]) {
        result[displayPosition] = topThree[srcIndex];
      }
    });

    return {
      hasWinners: topThree.length > 0,
      winners: result,
      rawTopThree: topThree
    };
  }, [leaderboardData]);

  // Get course title helper
  const getCourseTitle = (idStr: string) => {
    if (idStr === 'all') return 'All Course Subjects';
    const c = courses.find(item => item.id.toString() === idStr);
    return c ? c.title : 'Course Subjects';
  };

  return (
    <div id="quiz-leaderboard" className="bg-[#f5f6fb] text-[#111] w-full min-h-full font-sans flex flex-col gap-6">
      
      {/* HEADER SECTION WITH HERO BANNER */}
      <div className="bg-gradient-to-r from-[#2e1ea0] to-[#5b34ea] text-white p-6 md:p-8 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[160px]">
        {/* Absolute Background Graphics */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-center select-none pointer-events-none">
          <Trophy size={180} className="transform rotate-12" />
        </div>
        <div className="absolute left-1/4 top-1/3 w-[150px] h-[150px] bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-25"></div>
        <div className="absolute right-1/4 bottom-1/4 w-[120px] h-[120px] bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5 w-full">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-white/10 backdrop-blur-md text-purple-200 text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full border border-white/5 flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-300 fill-amber-300" /> Smart Leaderboard
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-[800] tracking-tight">Top Student Performers</h1>
            <p className="text-purple-100 text-xs md:text-sm max-w-xl leading-relaxed mt-1">
              Real-time peer scoring. Answer course quizzes correctly, reduce your completion times, and lock your position on the Edunova academy wall of fame!
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="h-11 px-5 rounded-2xl bg-white text-[#5b34ea] hover:bg-purple-50 active:bg-purple-100 text-xs font-bold flex items-center justify-center gap-2 border border-white/90 shadow-md hover:shadow-lg transition cursor-pointer self-start md:self-auto"
            >
              <Printer size={15} /> Print Rank Card
            </button>
          </div>
        </div>
      </div>

      {/* FILTER AND CONTROLS */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 md:p-5">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          
          {/* SEARCH BOX */}
          <div className="relative w-full lg:w-[260px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </span>
            <input 
              type="text" 
              placeholder="Search student names..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 border border-gray-200 pl-10 pr-4 bg-gray-50/50 rounded-xl outline-none focus:border-[#5b34ea] focus:bg-white text-xs text-[#111] transition duration-200"
            />
          </div>

          {/* CHIPS CARD FILTERS AND NAVIGATION SELECTORS */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Sort Criteria */}
            <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
              <button 
                onClick={() => setSortBy('highest')}
                className={`h-9 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  sortBy === 'highest' 
                    ? 'bg-white text-[#5b34ea] shadow-sm' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Target size={14} /> Highest Score
              </button>
              <button 
                onClick={() => setSortBy('average')}
                className={`h-9 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  sortBy === 'average' 
                    ? 'bg-white text-[#5b34ea] shadow-sm' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <TrendingUp size={14} /> Average Score
              </button>
            </div>

            {/* Course Dropdown Filter */}
            <div className="relative flex-1 sm:flex-initial">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <BookOpen size={14} className="text-gray-400" />
              </span>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full sm:w-[240px] h-11 border border-gray-200 pl-9 pr-8 bg-gray-50/50 rounded-xl outline-none focus:border-[#5b34ea] focus:bg-white text-xs font-semibold text-gray-700 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3B%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[position:right_0.5rem_center] bg-no-repeat"
              >
                <option value="all">All Subjects combined</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id.toString()}>{course.title}</option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* CURRENT USER STANDING CARD */}
      {currentUserStanding ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#5b34ea] text-white flex items-center justify-center text-lg shrink-0 shadow-md shadow-indigo-600/10">
              <Trophy size={22} className="text-yellow-300 fill-yellow-300" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Your Standing Standing</h4>
              <p className="text-indigo-900 text-sm mt-0.5">
                You are currently ranked <strong className="text-base text-[#5b34ea]">#{currentUserStanding.rank}</strong> out of <strong className="text-[#5b34ea]">{currentUserStanding.total}</strong> active academy students!
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-center self-end sm:self-center">
            <div className="text-right">
              <p className="text-[10px] text-indigo-700 uppercase font-semibold">Your Best Score</p>
              <h3 className="text-lg font-extrabold text-[#5b34ea]">{currentUserStanding.record.highestScore}%</h3>
            </div>
            <div className="w-px h-8 bg-indigo-200"></div>
            <div className="text-right">
              <p className="text-[10px] text-indigo-700 uppercase font-semibold">Quizzes Taken</p>
              <h3 className="text-lg font-extrabold text-indigo-950">{currentUserStanding.record.totalQuizzes}</h3>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="bg-amber-50/60 border border-amber-200/50 rounded-2xl p-4 flex gap-4 items-center">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg shrink-0">
            <HelpCircle size={22} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">No Attempts Found</h4>
            <p className="text-amber-900 text-xs mt-0.5 leading-relaxed">
              You haven't completed any quizzes under <strong className="font-semibold text-amber-950">"{getCourseTitle(courseFilter)}"</strong> yet. Attempt a course quiz to appear on the live leaderboard!
            </p>
          </div>
        </div>
      )}

      {/* PODIUM TOP 3 VISUALIZATION */}
      {podiumWinners.hasWinners && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end justify-center py-6 px-4">
          
          {/* Rank 2 (Silver) */}
          {podiumWinners.winners[0] ? (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm text-center flex flex-col items-center justify-end order-2 md:order-1 h-[240px] relative hover:shadow-md transition duration-300"
            >
              <div className="absolute top-4 left-4 w-7 h-7 bg-slate-100 rounded-full text-slate-700 font-bold text-xs flex items-center justify-center">
                2
              </div>
              <div className="absolute top-4 right-4 text-slate-400">
                <Award size={18} />
              </div>
              
              <div className="relative mb-3">
                <img 
                  src={getStudentAvatar(podiumWinners.winners[0].userId, podiumWinners.winners[0].email)} 
                  alt={podiumWinners.winners[0].name} 
                  className="w-16 h-16 rounded-full border-4 border-slate-200 object-cover shadow-sm"
                />
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-slate-200 text-slate-800 text-[9px] font-bold px-2 py-0.5 rounded-full select-none uppercase shadow-sm">
                  Silver
                </span>
              </div>
              
              <h3 className="font-bold text-sm text-gray-800 line-clamp-1">{podiumWinners.winners[0].name}</h3>
              <p className="text-gray-400 text-[10px] mb-4 truncate w-full">{podiumWinners.winners[0].email}</p>
              
              <div className="bg-slate-50 border border-slate-100 w-full rounded-2xl p-2.5 flex items-center justify-around gap-2 text-xs">
                <div>
                  <p className="text-gray-400 text-[9px] uppercase font-semibold">Best</p>
                  <p className="font-extrabold text-slate-700">{podiumWinners.winners[0].highestScore}%</p>
                </div>
                <div className="w-px h-5 bg-slate-200"></div>
                <div>
                  <p className="text-gray-400 text-[9px] uppercase font-semibold">Avg</p>
                  <p className="font-extrabold text-slate-700">{podiumWinners.winners[0].averageScore}%</p>
                </div>
                <div className="w-px h-5 bg-slate-200"></div>
                <div>
                  <p className="text-gray-400 text-[9px] uppercase font-semibold">Quizzes</p>
                  <p className="font-extrabold text-slate-755">{podiumWinners.winners[0].totalQuizzes}</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="hidden md:block order-2 md:order-1 h-[240px]" />
          )}

          {/* Rank 1 (Gold) */}
          {podiumWinners.winners[1] ? (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl border-2 border-amber-200 p-6 shadow-md text-center flex flex-col items-center justify-end order-1 md:order-2 h-[280px] relative hover:shadow-lg transition duration-300"
            >
              <div className="absolute top-4 left-4 w-8 h-8 bg-amber-500 text-white font-black text-sm flex items-center justify-center rounded-full shadow-sm">
                1
              </div>
              <div className="absolute top-4 right-4 text-amber-500 animate-pulse">
                <Crown size={22} className="fill-amber-300" />
              </div>
              <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 text-amber-400 z-10">
                <Crown size={30} className="fill-amber-400 drop-shadow-md" />
              </div>
              
              <div className="relative mb-4">
                <img 
                  src={getStudentAvatar(podiumWinners.winners[1].userId, podiumWinners.winners[1].email)} 
                  alt={podiumWinners.winners[1].name} 
                  className="w-20 h-20 rounded-full border-4 border-amber-300 object-cover shadow-md"
                />
                <span className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full select-none uppercase shadow-sm flex items-center gap-1">
                  <Sparkles size={10} className="fill-white" /> Gold
                </span>
              </div>
              
              <h3 className="font-black text-base text-gray-900 line-clamp-1">{podiumWinners.winners[1].name}</h3>
              <p className="text-gray-400 text-[10px] mb-4 truncate w-full">{podiumWinners.winners[1].email}</p>
              
              <div className="bg-amber-50 border border-amber-100 w-full rounded-2xl p-3 flex items-center justify-around gap-2 text-xs">
                <div>
                  <p className="text-amber-800 text-[10px] uppercase font-bold">Best</p>
                  <p className="font-black text-amber-600 text-sm">{podiumWinners.winners[1].highestScore}%</p>
                </div>
                <div className="w-px h-6 bg-amber-200"></div>
                <div>
                  <p className="text-amber-800 text-[10px] uppercase font-bold">Avg</p>
                  <p className="font-black text-amber-600 text-sm">{podiumWinners.winners[1].averageScore}%</p>
                </div>
                <div className="w-px h-6 bg-amber-200"></div>
                <div>
                  <p className="text-amber-800 text-[10px] uppercase font-bold">Quizzes</p>
                  <p className="font-black text-amber-800 text-sm">{podiumWinners.winners[1].totalQuizzes}</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="order-1 md:order-2 h-[280px]" />
          )}

          {/* Rank 3 (Bronze) */}
          {podiumWinners.winners[2] ? (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm text-center flex flex-col items-center justify-end order-3 md:order-3 h-[210px] relative hover:shadow-md transition duration-300"
            >
              <div className="absolute top-4 left-4 w-7 h-7 bg-orange-100 rounded-full text-orange-750 font-bold text-xs flex items-center justify-center">
                3
              </div>
              <div className="absolute top-4 right-4 text-orange-500">
                <Medal size={18} />
              </div>
              
              <div className="relative mb-3">
                <img 
                  src={getStudentAvatar(podiumWinners.winners[2].userId, podiumWinners.winners[2].email)} 
                  alt={podiumWinners.winners[2].name} 
                  className="w-14 h-14 rounded-full border-4 border-orange-200 object-cover shadow-sm"
                />
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-orange-200 text-center text-orange-800 text-[9px] font-bold px-2 py-0.5 rounded-full select-none uppercase shadow-sm">
                  Bronze
                </span>
              </div>
              
              <h3 className="font-bold text-sm text-gray-800 line-clamp-1">{podiumWinners.winners[2].name}</h3>
              <p className="text-gray-400 text-[10px] mb-3 truncate w-full">{podiumWinners.winners[2].email}</p>
              
              <div className="bg-orange-50/70 border border-orange-100/70 w-full rounded-2xl p-2 flex items-center justify-around gap-1.5 text-xs">
                <div>
                  <p className="text-gray-400 text-[9px] uppercase font-semibold">Best</p>
                  <p className="font-bold text-orange-700">{podiumWinners.winners[2].highestScore}%</p>
                </div>
                <div className="w-px h-4 bg-orange-200"></div>
                <div>
                  <p className="text-gray-400 text-[9px] uppercase font-semibold">Avg</p>
                  <p className="font-bold text-orange-700">{podiumWinners.winners[2].averageScore}%</p>
                </div>
                <div className="w-px h-4 bg-orange-200"></div>
                <div>
                  <p className="text-gray-400 text-[9px] uppercase font-semibold">Quizzes</p>
                  <p className="font-bold text-orange-755">{podiumWinners.winners[2].totalQuizzes}</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="hidden md:block order-3 md:order-3 h-[210px]" />
          )}

        </div>
      )}

      {/* DETAILED LEADERBOARD LIST / TABLE */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
          <div>
            <h3 className="text-base font-bold text-gray-900">Current Standings Registry</h3>
            <p className="text-gray-500 text-[11px] mt-0.5">Showing rankings under: <strong className="font-semibold text-gray-700">"{getCourseTitle(courseFilter)}"</strong></p>
          </div>
          <span className="bg-indigo-50 text-[#5b34ea] text-[10px] font-bold px-3 py-1 rounded-full border border-indigo-100">
            {leaderboardData.length} Registered Students Ranked
          </span>
        </div>

        {leaderboardData.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-50 text-[#5b34ea] shrink-0 flex items-center justify-center mx-auto mb-4">
              <Trophy size={28} className="text-gray-300" />
            </div>
            <h4 className="font-bold text-gray-700 text-sm">Registry is Empty</h4>
            <p className="text-gray-400 text-xs px-6 mt-1.5 max-w-sm mx-auto leading-relaxed">
              No matching search names or quiz attempts were recorded. Try changing the filter, clearing your search, or answering a test!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-150 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-4 px-6 text-center w-16">Rank</th>
                  <th className="py-4 px-6">Student Profiling</th>
                  <th className="py-4 px-6 text-center">Total Completed Quizzes</th>
                  <th className="py-4 px-6 text-right">Highest Single score</th>
                  <th className="py-4 px-6 text-right">Average Quiz score</th>
                  <th className="py-4 px-6 text-right pr-8">Last Attempt Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaderboardData.map((student, idx) => {
                  const rank = idx + 1;
                  const isUser = student.userId === currentUser.id;
                  
                  // Render Rank Designations
                  let rankEl: React.ReactNode = (
                    <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center mx-auto">
                      {rank}
                    </span>
                  );
                  if (rank === 1) {
                    rankEl = (
                      <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold text-xs border border-amber-200 flex items-center justify-center mx-auto shadow-sm relative">
                        <Trophy size={14} className="text-amber-500 fill-amber-300 transform -rotate-12 absolute -top-1 -right-1" />
                        1
                      </span>
                    );
                  } else if (rank === 2) {
                    rankEl = (
                      <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 flex items-center justify-center mx-auto shadow-sm">
                        2
                      </span>
                    );
                  } else if (rank === 3) {
                    rankEl = (
                      <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold text-xs border border-orange-200 flex items-center justify-center mx-auto shadow-sm">
                        3
                      </span>
                    );
                  }

                  return (
                    <tr 
                      key={student.userId} 
                      className={`hover:bg-gray-50/50 transition duration-150 ${isUser ? 'bg-indigo-50/30' : ''}`}
                    >
                      {/* Rank Column */}
                      <td className="py-4 px-6 text-center font-bold">
                        {rankEl}
                      </td>

                      {/* Name Card */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img 
                            src={getStudentAvatar(student.userId, student.email)} 
                            alt={student.name} 
                            className="w-10 h-10 rounded-full border border-gray-100 object-cover shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-950">{student.name}</span>
                              {isUser && (
                                <span className="bg-[#5b34ea] text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase select-none tracking-wide">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium block">{student.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Quizzes Column */}
                      <td className="py-4 px-6 text-center font-semibold text-xs text-gray-700">
                        {student.totalQuizzes}
                      </td>

                      {/* Highest Score Column */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                student.highestScore >= 80 
                                  ? 'bg-green-500' 
                                  : student.highestScore >= 50 
                                  ? 'bg-amber-500' 
                                  : 'bg-red-555'
                              }`} 
                              style={{ width: `${student.highestScore}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold ${
                            student.highestScore >= 80 
                              ? 'text-green-600' 
                              : student.highestScore >= 50 
                              ? 'text-amber-600' 
                              : 'text-gray-700'
                          }`}>
                            {student.highestScore}%
                          </span>
                        </div>
                      </td>

                      {/* Average Score Column */}
                      <td className="py-4 px-6 text-right text-xs font-extrabold text-gray-800">
                        {student.averageScore}%
                      </td>

                      {/* Completed At Column */}
                      <td className="py-4 px-6 text-right text-[10px] text-gray-400 font-semibold pr-8">
                        <span className="flex items-center justify-end gap-1">
                          <Calendar size={12} className="text-gray-300" />
                          {new Date(student.lastAttemptDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FOOTER HELPER TIPS FOR HIGHER SCORE */}
      <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-5 items-start md:items-center">
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#5b34ea] shrink-0 flex items-center justify-center text-lg">
          <BookOpen size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">How can I climb the leaderboard?</h4>
          <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">
            The leaderboard prioritizes students with the <strong>highest score single attempts</strong> in each course. Complete course lectures, answer all review question sets carefully, and minimize exam duration limits to master critical skills!
          </p>
        </div>
      </div>

      {/* PRINT-ONLY CSS HELPER OVERRIDES */}
      <style>{`
        @media print {
          /* Hide everything under the sun */
          body * {
            visibility: hidden !important;
          }
          /* Show and format ONLY the print-active container */
          #leaderboard-print-card, #leaderboard-print-card * {
            visibility: visible !important;
          }
          #leaderboard-print-card {
            position: fixed !important;
            left: 50% !important;
            top: 45% !important;
            transform: translate(-50%, -50%) scale(1.15) !important;
            width: 440px !important;
            max-width: 440px !important;
            margin: 0 !important;
            padding: 24px !important;
            border: 2px solid #5b34ea !important;
            border-radius: 20px !important;
            background: #ffffff !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* EXPORT RANK PDF MODAL */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden flex flex-col relative animate-in fade-in-50 zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Trophy className="text-[#5b34ea]" size={18} />
                <h2 className="text-xs font-black text-gray-900 uppercase tracking-wide">Academy Ranking Card</h2>
              </div>
              <button 
                onClick={() => setIsExportModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Print Card Wrapper / Preview */}
            <div className="p-6 bg-gray-100 flex items-center justify-center">
              <div 
                id="leaderboard-print-card" 
                className="bg-white border-2 border-[#5b34ea] rounded-2xl p-5 shadow-lg max-w-sm w-full relative overflow-hidden font-sans border-t-[10px] border-t-[#5b34ea] text-left"
              >
                {/* Background Graphics */}
                <div className="absolute right-[-40px] bottom-[-40px] opacity-10 select-none pointer-events-none transform rotate-12 text-[#5b34ea]">
                  <Trophy size={160} />
                </div>

                {/* Crest Header */}
                <div className="text-center mb-4 border-b border-gray-100 pb-3">
                  <div className="flex items-center justify-center gap-1 mb-1 text-[#5b34ea]">
                    <Crown size={16} className="fill-[#5b34ea]/10" />
                    <span className="text-[10px] font-black tracking-widest uppercase">Edunova Learning Academy</span>
                  </div>
                  <span className="text-[8px] bg-purple-50 text-[#5b34ea] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Academy Merit Credential
                  </span>
                </div>

                {/* Student Profile Card */}
                <div className="flex items-center gap-3.5 mb-4 bg-purple-50/50 p-3 rounded-xl border border-purple-100/30">
                  <img 
                    src={getStudentAvatar(currentUser.id, currentUser.email)} 
                    alt={currentUser.name} 
                    className="w-11 h-11 rounded-full border-2 border-purple-200 object-cover shadow-sm bg-white shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-extrabold text-gray-900 truncate">{currentUser.name}</h4>
                    <p className="text-[9px] text-gray-500 truncate">{currentUser.email}</p>
                    <p className="text-[8px] text-[#5b34ea] font-bold mt-0.5 tracking-wider">REGISTRY PROFILE ID: #EDN-S{currentUser.id + 7210}</p>
                  </div>
                </div>

                {/* Score and Placement Grid */}
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[8px] text-gray-400 uppercase font-black tracking-wider">Leaderboard Rank</span>
                    <div className="flex items-baseline gap-0.5 mt-0.5">
                      <span className="text-sm font-black text-[#5b34ea]">
                        {currentUserStanding ? `#${currentUserStanding.rank}` : 'Unranked'}
                      </span>
                      {currentUserStanding && (
                        <span className="text-[8px] text-gray-400">/ {currentUserStanding.total}</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[8px] text-gray-400 uppercase font-black tracking-wider">Academy Subject</span>
                    <span className="text-[10px] font-extrabold text-gray-800 mt-1 block truncate">
                      {getCourseTitle(courseFilter).split('(')[0]}
                    </span>
                  </div>

                  <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[8px] text-gray-400 uppercase font-black tracking-wider">Highest Score Single</span>
                    <span className="text-sm font-black text-green-600 mt-0.5 block">
                      {currentUserStanding ? `${currentUserStanding.record.highestScore}%` : '0%'}
                    </span>
                  </div>

                  <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[8px] text-gray-400 uppercase font-black tracking-wider">Exams Completed</span>
                    <span className="text-[10px] font-black text-gray-800 mt-1 block">
                      {currentUserStanding ? `${currentUserStanding.record.totalQuizzes} Approved` : '0 Quizzes'}
                    </span>
                  </div>
                </div>

                {/* Sign-off Stamps and Hashes */}
                <div className="flex justify-between items-end border-t border-gray-150 pt-3 mt-1">
                  <div>
                    <span className="text-[7px] text-gray-400 uppercase tracking-wider font-bold">Verification Hash</span>
                    <div className="font-mono text-[7px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded mt-0.5 font-bold select-all uppercase">
                      EDN-{currentUser.id}-{courseFilter.toUpperCase().slice(0, 3)}-{currentUserStanding?.record.highestScore || 0}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="inline-flex flex-col items-center justify-center border border-dashed border-red-500 rounded p-1 rotate-2 mb-1 bg-red-50/10">
                      <span className="text-[6px] font-black text-red-500 tracking-wider leading-none">Portal Admin</span>
                      <span className="text-[5px] font-extrabold text-red-500 leading-none mt-0.5">VERIFIED RECORD</span>
                    </div>
                    <span className="text-[7px] text-gray-400 font-bold block uppercase font-sans">Edunova Registrar</span>
                  </div>
                </div>

                {/* Print Timestamp */}
                <p className="text-[6px] text-gray-300 font-semibold text-center mt-3 pt-1 border-t border-gray-50 uppercase">
                  Generated progress card • Live telemetry verification active
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-[9px] text-gray-400 font-medium max-w-[180px] text-center sm:text-left leading-snug">
                Select <strong className="text-gray-600">"Save as PDF"</strong> under destination menu to export.
              </span>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => setIsExportModalOpen(false)}
                  className="flex-1 sm:flex-none h-10 px-4 border border-gray-205 text-gray-700 bg-white rounded-xl hover:bg-gray-50 text-xs font-semibold cursor-pointer transition shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 sm:flex-none h-10 px-5 bg-[#5b34ea] hover:bg-[#4924cf] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/15 transition"
                >
                  <Printer size={13} /> Print PDF Card
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
