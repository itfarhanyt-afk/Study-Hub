import { useStore } from '../store';
import { Play, BookOpen, Trophy, ArrowRight, Plus, Search } from 'lucide-react';
import { useState } from 'react';

export default function CoursesPage() {
  const { courses, setActiveCourse, setView } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | string>('all');

  const categories = [...new Set(courses.map(c => c.category))];
  const filtered = courses.filter(c =>
    (filter === 'all' || c.category === filter) &&
    (!searchTerm || c.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Hub</h1>
          <p className="text-gray-500 mt-1">Structured learning paths with video lessons & quizzes</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition active:scale-95">
          <Plus className="w-4 h-4" /> Create Course
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            placeholder="Search courses..." />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <button onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${filter === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            All
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${filter === cat ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(course => {
          const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
          const completedLessons = course.modules.reduce((sum, m) => sum + m.lessons.filter(l => l.completed).length, 0);
          const avgQuiz = course.modules.filter(m => m.quizScore !== null).reduce((sum, m) => sum + (m.quizScore || 0), 0) / Math.max(1, course.modules.filter(m => m.quizScore !== null).length);

          return (
            <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
              onClick={() => { setActiveCourse(course.id); setView('course-player'); }}>
              {/* Thumbnail */}
              <div className="h-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center relative">
                <span className="text-6xl">{course.thumbnail}</span>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                  <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                    <Play className="w-6 h-6 text-indigo-600 ml-1" />
                  </div>
                </div>
                <div className="absolute top-3 right-3 px-2 py-1 bg-black/30 backdrop-blur text-white text-xs rounded-full">
                  {course.category}
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-lg mb-1">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{course.description}</p>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">{completedLessons}/{totalLessons} lessons</span>
                    <span className="font-semibold text-indigo-600">{course.progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${course.progress}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {course.modules.length} modules</span>
                    {avgQuiz > 0 && (
                      <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-yellow-500" /> {Math.round(avgQuiz)}% avg</span>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Offline Mode Teaser */}
      <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">📥</div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">Offline Mode</h3>
            <p className="text-sm text-gray-500">Download courses and notes for studying on the go</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition">
            Enable Offline
          </button>
        </div>
      </div>
    </div>
  );
}
