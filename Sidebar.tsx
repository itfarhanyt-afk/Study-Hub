import { useStore } from '../store';
import { BookOpen, LayoutDashboard, FileText, BrainCircuit, Timer, CalendarDays, GraduationCap, Search, LogOut } from 'lucide-react';
import type { View } from '../store';

const navItems: { icon: typeof LayoutDashboard; label: string; view: View }[] = [
  { icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard' },
  { icon: FileText, label: 'Notes', view: 'notes' },
  { icon: BrainCircuit, label: 'Flashcards', view: 'flashcards' },
  { icon: Timer, label: 'Focus', view: 'focus' },
  { icon: CalendarDays, label: 'Planner', view: 'planner' },
  { icon: GraduationCap, label: 'Courses', view: 'courses' },
];

export default function Sidebar() {
  const { currentView, setView, user, logout } = useStore();

  return (
    <aside className="w-[72px] lg:w-64 bg-white border-r border-gray-100 flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="p-4 lg:p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900 hidden lg:block">StudyHub</span>
      </div>

      {/* Search */}
      <div className="px-3 lg:px-4 mb-2">
        <button onClick={() => setView('search')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${currentView === 'search' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}>
          <Search className="w-5 h-5 shrink-0" />
          <span className="hidden lg:block">Search</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 lg:px-4 space-y-1">
        {navItems.map(({ icon: Icon, label, view }) => {
          const isActive = currentView === view || (view === 'notes' && currentView === 'note-editor') || (view === 'flashcards' && currentView === 'flashcard-study') || (view === 'courses' && currentView === 'course-player');
          return (
            <button key={view} onClick={() => setView(view)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Icon className="w-5 h-5 shrink-0" />
              <span className="hidden lg:block">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 lg:p-4 border-t border-gray-100 space-y-1">
        <button onClick={() => setView('profile')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${currentView === 'profile' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-lg shrink-0">
            {user?.avatar || '👤'}
          </div>
          <div className="hidden lg:block text-left min-w-0">
            <p className="font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-gray-400">🔥 {user?.streak} day streak</p>
          </div>
        </button>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all">
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="hidden lg:block">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
