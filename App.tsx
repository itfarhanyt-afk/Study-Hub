import { useStore } from './store';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import OnboardingPage from './components/OnboardingPage';
import Dashboard from './components/Dashboard';
import NotesPage from './components/NotesPage';
import NoteEditor from './components/NoteEditor';
import FlashcardsPage from './components/FlashcardsPage';
import FlashcardStudy from './components/FlashcardStudy';
import FocusTimer from './components/FocusTimer';
import PlannerPage from './components/PlannerPage';
import CoursesPage from './components/CoursesPage';
import CoursePlayer from './components/CoursePlayer';
import ProfilePage from './components/ProfilePage';
import SearchPage from './components/SearchPage';
import Sidebar from './components/Sidebar';

export default function App() {
  const { currentView, isAuthenticated } = useStore();

  if (!isAuthenticated || currentView === 'login') return <LoginPage />;
  if (currentView === 'signup') return <SignupPage />;
  if (currentView === 'onboarding') return <OnboardingPage />;

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'notes': return <NotesPage />;
      case 'note-editor': return <NoteEditor />;
      case 'flashcards': return <FlashcardsPage />;
      case 'flashcard-study': return <FlashcardStudy />;
      case 'focus': return <FocusTimer />;
      case 'planner': return <PlannerPage />;
      case 'courses': return <CoursesPage />;
      case 'course-player': return <CoursePlayer />;
      case 'profile': return <ProfilePage />;
      case 'search': return <SearchPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}
