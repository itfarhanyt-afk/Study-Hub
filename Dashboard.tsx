import { useStore } from '../store';
import { FileText, BrainCircuit, Timer, CalendarDays, TrendingUp, Flame, Clock, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const { user, setView, tasks, flashcards, trees, courses, notes } = useStore();

  const today = new Date().toISOString().split('T')[0];
  const todayTrees = trees.filter(t => t.earnedAt.startsWith(today));
  const todayMinutes = todayTrees.reduce((sum, t) => sum + t.sessionMinutes, 0);
  const upcomingTasks = tasks.filter(t => !t.completed).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4);
  const dueCards = flashcards.filter(c => new Date(c.nextReview) <= new Date()).length;
  const totalMastered = flashcards.filter(c => c.difficulty < 0.3).length;

  const stats = [
    { icon: Flame, label: 'Day Streak', value: user?.streak || 0, color: 'from-orange-500 to-red-500', bg: 'bg-orange-50' },
    { icon: Clock, label: 'Hours Studied', value: Math.round(user?.totalHours || 0), color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
    { icon: BrainCircuit, label: 'Cards Mastered', value: user?.cardsMastered || totalMastered, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50' },
    { icon: FileText, label: 'Notes Created', value: user?.notesCreated || notes.length, color: 'from-green-500 to-emerald-500', bg: 'bg-green-50' },
  ];

  const quickActions = [
    { icon: FileText, label: 'New Note', desc: 'Create a note', color: 'bg-blue-500', action: () => { setView('notes'); } },
    { icon: BrainCircuit, label: 'Review Cards', desc: `${dueCards} cards due`, color: 'bg-purple-500', action: () => setView('flashcards') },
    { icon: Timer, label: 'Focus Session', desc: 'Start studying', color: 'bg-green-500', action: () => setView('focus') },
    { icon: CalendarDays, label: 'View Tasks', desc: `${upcomingTasks.length} pending`, color: 'bg-orange-500', action: () => setView('planner') },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's your study overview for today</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 bg-gradient-to-r ${s.color} bg-clip-text`} style={{ color: s.color.includes('orange') ? '#f97316' : s.color.includes('blue') ? '#3b82f6' : s.color.includes('purple') ? '#8b5cf6' : '#22c55e' }} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map((a, i) => (
          <button key={i} onClick={a.action}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group hover:scale-[1.02] active:scale-[0.98]">
            <div className={`w-10 h-10 ${a.color} rounded-xl flex items-center justify-center mb-3`}>
              <a.icon className="w-5 h-5 text-white" />
            </div>
            <p className="font-semibold text-gray-900">{a.label}</p>
            <p className="text-sm text-gray-500">{a.desc}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-orange-500" /> Upcoming Tasks
            </h3>
            <button onClick={() => setView('planner')} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {upcomingTasks.map(task => {
              const daysLeft = Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
                  <div className={`w-3 h-3 rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.category}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${daysLeft <= 1 ? 'bg-red-100 text-red-700' : daysLeft <= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {daysLeft <= 0 ? 'Today' : `${daysLeft}d left`}
                  </span>
                </div>
              );
            })}
            {upcomingTasks.length === 0 && (
              <div className="text-center py-6 text-gray-400">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
                <p>All caught up! 🎉</p>
              </div>
            )}
          </div>
        </div>

        {/* Study Progress */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" /> Study Progress
            </h3>
          </div>
          {/* Today's Focus */}
          <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Today's Focus Time</span>
              <span className="text-sm font-bold text-indigo-600">{todayMinutes} min</span>
            </div>
            <div className="w-full h-3 bg-white rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${Math.min(100, (todayMinutes / 120) * 100)}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-1">Goal: 120 minutes</p>
          </div>

          {/* Flashcard Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-purple-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-purple-700">{dueCards}</p>
              <p className="text-xs text-purple-500">Cards Due</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-green-700">{totalMastered}</p>
              <p className="text-xs text-green-500">Mastered</p>
            </div>
          </div>

          {/* Course Progress */}
          <div className="space-y-2">
            {courses.slice(0, 2).map(c => (
              <button key={c.id} onClick={() => { setView('courses'); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-left">
                <span className="text-2xl">{c.thumbnail}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                  <div className="w-full h-2 bg-gray-100 rounded-full mt-1">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${c.progress}%` }} />
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-600">{c.progress}%</span>
              </button>
            ))}
          </div>
        </div>

        {/* Today's Garden */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              🌳 Today's Garden
            </h3>
            <button onClick={() => setView('focus')} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Focus now <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-3 min-h-[80px]">
            {todayTrees.length > 0 ? todayTrees.map(t => (
              <div key={t.id} className="text-3xl animate-bounce" style={{ animationDelay: `${Math.random()}s`, animationDuration: '2s' }}>{t.type}</div>
            )) : (
              <div className="w-full text-center py-4 text-gray-400">
                <p className="text-3xl mb-2">🌱</p>
                <p className="text-sm">Complete a focus session to grow your garden!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Notes */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" /> Recent Notes
            </h3>
            <button onClick={() => setView('notes')} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {[...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4).map(note => (
              <button key={note.id} onClick={() => { useStore.getState().setActiveNote(note.id); setView('note-editor'); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-left">
                <FileText className="w-5 h-5 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{note.title}</p>
                  <p className="text-xs text-gray-400">{new Date(note.updatedAt).toLocaleDateString()}</p>
                </div>
                {note.isPinned && <span className="text-xs">📌</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
