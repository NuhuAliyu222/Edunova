import React, { useState, useMemo } from 'react';
import { useLms } from '../context/LmsContext';
import { motion } from 'motion/react';
import {
  Calendar,
  Search,
  BookOpen,
  Award,
  Crown,
  Trophy,
  Activity,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Clock
} from 'lucide-react';

interface StudentQuizHistoryProps {
  onRetake: (courseId: number) => void;
}

export const StudentQuizHistory: React.FC<StudentQuizHistoryProps> = ({ onRetake }) => {
  const { currentUser, courses, attempts } = useLms();

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'perfect' | 'passed' | 'review'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'highest' | 'lowest'>('recent');

  if (!currentUser) return null;

  // Filter and sort attempts belonging to current student
  const filteredAndSortedAttempts = useMemo(() => {
    // 1. Get attempts for current student
    let list = attempts.filter(att => att.userId === currentUser.id);

    // 2. Filter by matching course title
    if (searchTerm.trim() !== '') {
      list = list.filter(att => {
        const course = courses.find(c => c.id === att.courseId);
        return course ? course.title.toLowerCase().includes(searchTerm.toLowerCase()) : false;
      });
    }

    // 3. Filter by scorecard performance
    if (scoreFilter === 'perfect') {
      list = list.filter(att => att.score === 100);
    } else if (scoreFilter === 'passed') {
      list = list.filter(att => att.score >= 75 && att.score < 100);
    } else if (scoreFilter === 'review') {
      list = list.filter(att => att.score < 75);
    }

    // 4. Sorting logic
    list = [...list].sort((a, b) => {
      const dateA = new Date(a.attemptedAt).getTime();
      const dateB = new Date(b.attemptedAt).getTime();

      if (sortBy === 'recent') return dateB - dateA;
      if (sortBy === 'oldest') return dateA - dateB;
      if (sortBy === 'highest') return b.score - a.score;
      if (sortBy === 'lowest') return a.score - b.score;
      return 0;
    });

    return list;
  }, [attempts, courses, currentUser.id, searchTerm, scoreFilter, sortBy]);

  // Compute historic metrics specifically for this student
  const metrics = useMemo(() => {
    const studentAttempts = attempts.filter(att => att.userId === currentUser.id);
    const totalCount = studentAttempts.length;

    if (totalCount === 0) {
      return {
        total: 0,
        average: 0,
        highest: 0,
        perfectCount: 0,
        recentlyCompleted: null,
      };
    }

    const scoresSum = studentAttempts.reduce((sum, att) => sum + att.score, 0);
    const average = Math.round(scoresSum / totalCount);
    const highest = Math.max(...studentAttempts.map(att => att.score));
    const perfectCount = studentAttempts.filter(att => att.score === 100).length;

    const sortedByDate = [...studentAttempts].sort(
      (a, b) => new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime()
    );

    return {
      total: totalCount,
      average,
      highest,
      perfectCount,
      recentlyCompleted: sortedByDate[0] || null,
    };
  }, [attempts, currentUser.id]);

  // Find course helpers
  const getCourseInfo = (courseId: number) => {
    const course = courses.find(c => c.id === courseId);
    return course || {
      title: 'Unknown Course Module',
      thumbnail: '/src/assets/images/web_development_thumbnail_1780339612963.png',
      instructor: 'Senior Instructor'
    };
  };

  // Score Badge styling utility
  const getScoreBadgeInfo = (score: number) => {
    if (score === 100) {
      return {
        bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        progressBar: 'bg-emerald-500',
        icon: <Crown className="text-amber-500 fill-amber-300 w-4 h-4 shrink-0 animate-bounce" />,
        label: 'Perfect Mark'
      };
    }
    if (score >= 75) {
      return {
        bg: 'bg-indigo-50 border-indigo-200 text-[#5b34ea]',
        progressBar: 'bg-[#5b34ea]',
        icon: <CheckCircle2 className="text-[#5b34ea] w-4 h-4 shrink-0" />,
        label: 'Passed'
      };
    }
    if (score >= 50) {
      return {
        bg: 'bg-amber-50 border-amber-200 text-amber-700',
        progressBar: 'bg-amber-500',
        icon: <AlertTriangle className="text-amber-500 w-4 h-4 shrink-0" />,
        label: 'Passed (Retake Advised)'
      };
    }
    return {
      bg: 'bg-rose-50 border-rose-200 text-rose-700',
      progressBar: 'bg-rose-500',
      icon: <XCircle className="text-rose-500 w-4 h-4 shrink-0" />,
      label: 'Needs Study'
    };
  };

  return (
    <div id="quiz-history" className="bg-[#f5f6fb] text-[#111] w-full min-h-full font-sans flex flex-col gap-6">
      
      {/* 1. HEADER SECTION (HERO SLATE) */}
      <div className="bg-gradient-to-r from-[#2e1ea0] to-[#5b34ea] text-white p-6 md:p-8 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[160px]">
        {/* Decorative background vectors */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-center select-none pointer-events-none">
          <Activity size={180} className="transform -rotate-12" />
        </div>
        <div className="absolute left-1/3 top-1/4 w-[160px] h-[160px] bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-white/10 backdrop-blur-md text-purple-200 text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full border border-white/5 flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-300 fill-amber-300 animate-pulse" /> Grades Archive
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-[800] tracking-tight">Your Quiz Attempt Records</h1>
          <p className="text-purple-100 text-xs md:text-sm max-w-xl leading-relaxed mt-1">
            Review detailed grade metrics, trace your core skill development timestamps, and verify passing score thresholds instantly.
          </p>
        </div>
      </div>

      {/* 2. ANALYZE STATE METRICS BANNER */}
      {metrics.total > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#5b34ea] flex items-center justify-center text-lg shrink-0">
              <Trophy size={20} className="text-[#5b34ea]" />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] uppercase font-bold">Total Attempts</p>
              <h2 className="text-xl font-extrabold text-[#111]">{metrics.total}</h2>
              <p className="text-gray-400 text-[10px] mt-0.5">Quizzes completed</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shrink-0">
              <Crown size={20} className="text-emerald-500 fill-emerald-100" />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] uppercase font-bold">Perfect Marks</p>
              <h2 className="text-xl font-extrabold text-emerald-600">{metrics.perfectCount}</h2>
              <p className="text-gray-400 text-[10px] mt-0.5">100% Score awards</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg shrink-0">
              <Award size={20} className="text-[#5b34ea] fill-purple-100" />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] uppercase font-bold">High Score</p>
              <h2 className="text-xl font-extrabold text-[#111]">{metrics.highest}%</h2>
              <p className="text-gray-400 text-[10px] mt-0.5">Your personal best</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg shrink-0">
              <Activity size={20} className="text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-400 text-[10px] uppercase font-bold">Average Passing</p>
              <h2 className="text-xl font-extrabold text-[#111]">{metrics.average}%</h2>
              <div className="w-full h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${metrics.average >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                  style={{ width: `${metrics.average}%` }}
                ></div>
              </div>
            </div>
          </div>

        </div>
      ) : null}

      {/* 3. FILTERS CARD */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 md:p-5">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          
          {/* Free text search */}
          <div className="relative w-full lg:w-[280px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </span>
            <input 
              type="text" 
              placeholder="Search by course module title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 border border-gray-200 pl-10 pr-4 bg-gray-50/50 rounded-xl outline-none focus:border-[#5b34ea] focus:bg-white text-xs text-[#111] transition duration-200"
            />
          </div>

          {/* Combined state dropdowns and filters */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            
            {/* Score segment tags */}
            <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
              <button 
                onClick={() => setScoreFilter('all')}
                className={`h-9 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  scoreFilter === 'all' 
                    ? 'bg-white text-[#5b34ea] shadow-sm' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                All Attempts
              </button>
              <button 
                onClick={() => setScoreFilter('perfect')}
                className={`h-9 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  scoreFilter === 'perfect' 
                    ? 'bg-white text-[#5b34ea] shadow-sm' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Perfect (100%)
              </button>
              <button 
                onClick={() => setScoreFilter('passed')}
                className={`h-9 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  scoreFilter === 'passed' 
                    ? 'bg-white text-[#5b34ea] shadow-sm' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Passed (75%+)
              </button>
              <button 
                onClick={() => setScoreFilter('review')}
                className={`h-9 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  scoreFilter === 'review' 
                    ? 'bg-white text-[#5b34ea] shadow-sm' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Retake Warn
              </button>
            </div>

            {/* Sorting mechanism dropdown */}
            <div className="relative flex-1 sm:flex-initial">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter size={14} className="text-gray-400" />
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-[150px] h-11 border border-gray-200 pl-9 pr-8 bg-gray-50/50 rounded-xl outline-none focus:border-[#5b34ea] focus:bg-white text-xs font-semibold text-gray-700 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3B%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[position:right_0.5rem_center] bg-no-repeat"
              >
                <option value="recent">Recent attempts</option>
                <option value="oldest">Oldest first</option>
                <option value="highest">Highest scores</option>
                <option value="lowest">Lowest scores</option>
              </select>
            </div>

          </div>

        </div>
      </div>

      {/* 4. ATTEMPTS RECORD DISPLAY LIST */}
      {filteredAndSortedAttempts.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-[#5b34ea] flex items-center justify-center mx-auto mb-4">
            <HelpCircle size={28} className="text-gray-300" />
          </div>
          <h3 className="font-bold text-gray-800 text-sm">No Quiz Scores Found</h3>
          <p className="text-gray-400 text-xs px-6 mt-1.5 max-w-sm mx-auto leading-relaxed">
            There are no matching quiz records based on your current filters. Practice course learning objectives, answer exam sets, and complete grades to populate your archive here!
          </p>
          <div className="mt-6">
            <button 
              onClick={() => {
                setSearchTerm('');
                setScoreFilter('all');
                setSortBy('recent');
              }}
              className="text-xs font-bold text-[#5b34ea] hover:underline flex items-center gap-1.5 mx-auto cursor-pointer"
            >
              Reset Filters & View All
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredAndSortedAttempts.map((attempt, idx) => {
            const courseInfo = getCourseInfo(attempt.courseId);
            const badge = getScoreBadgeInfo(attempt.score);
            const tryIndex = filteredAndSortedAttempts.length - idx; // Logical display index sequence

            return (
              <motion.div
                key={attempt.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.4) }}
                className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col md:flex-row justify-between gap-5"
              >
                
                {/* Thumbnail, course module info, completed time */}
                <div className="flex gap-4 items-start">
                  
                  {/* Miniature Thumbnail */}
                  <div className="w-[84px] h-[64px] rounded-xl bg-purple-50 overflow-hidden border border-gray-100 shrink-0 hidden sm:block">
                    <img 
                      src={courseInfo.thumbnail} 
                      alt={courseInfo.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Textbook data details */}
                  <div>
                    <span className="text-[9px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-1 inline-block select-none">
                      Module Entry #{attempt.id}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-1">{courseInfo.title}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Instructor: {courseInfo.instructor}</p>
                    
                    {/* Timestamp with Clock */}
                    <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-semibold mt-2.5">
                      <Clock size={12} className="text-gray-300" />
                      <span>Completed on: </span>
                      <span className="text-gray-500 font-mono">
                        {new Date(attempt.attemptedAt).toLocaleDateString(undefined, {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Score indicators and action call buttons */}
                <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-4 items-start sm:items-center md:items-end lg:items-center justify-between min-w-full md:min-w-[280px] lg:min-w-[340px] pt-4 md:pt-0 border-t md:border-t-0 border-gray-105">
                  
                  {/* Detailed accuracy performance */}
                  <div className="flex-1 sm:flex-initial">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      {badge.icon}
                      <span className="text-[10px] font-bold text-gray-600 tracking-wide">{badge.label}</span>
                    </div>

                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-[900] text-gray-900 leading-none">{attempt.score}%</span>
                      <span className="text-[10px] text-gray-400 font-bold">Grade Average</span>
                    </div>

                    <p className="text-[10px] text-gray-400 mt-1 font-semibold">
                      Accuracy profile: <strong className="text-gray-700">{attempt.correctCount} correct</strong> of {attempt.totalCount} total questions
                    </p>
                  </div>

                  {/* Horizontal progress visualization divider */}
                  <div className="w-[100px] h-2 bg-gray-100 rounded-full overflow-hidden hidden lg:block">
                    <div className={`h-full rounded-full ${badge.progressBar}`} style={{ width: `${attempt.score}%` }}></div>
                  </div>

                  {/* Direct retake shortcut trigger */}
                  <button 
                    onClick={() => onRetake(attempt.courseId)}
                    className="h-10 px-4 rounded-xl border border-gray-200 hover:border-[#5b34ea] hover:bg-[#5b34ea]/5 text-gray-700 hover:text-[#5b34ea] text-xs font-bold transition flex items-center gap-2 cursor-pointer self-stretch sm:self-center md:self-stretch lg:self-center shrink-0 justify-center"
                  >
                    <RotateCcw size={14} />
                    <span>Retake Practice</span>
                    <ArrowRight size={13} />
                  </button>

                </div>

              </motion.div>
            );
          })}
        </div>
      )}

      {/* 5. USER INFORMATION EDUCATION CARD */}
      <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-5 items-start md:items-center mt-3">
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#5b34ea] shrink-0 flex items-center justify-center text-lg">
          <BookOpen size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">How are passing status thresholds evaluated?</h4>
          <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">
            In our modern curriculum, scoring <strong>75% or higher</strong> grants a passing status seal. If you score below 75%, don't worry! Click <strong>Retake Practice</strong>, examine the feedback tips, and conquer the subjects as many times as you like.
          </p>
        </div>
      </div>

    </div>
  );
};
