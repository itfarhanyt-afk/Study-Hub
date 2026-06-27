import { useState } from 'react';
import { useStore } from '../store';
import { Search, FileText, BrainCircuit, CalendarDays, GraduationCap, ArrowRight } from 'lucide-react';

export default function SearchPage() {
  const { notes, decks, flashcards, tasks, courses, setView, setActiveNote, setActiveDeck, setActiveCourse } = useStore();
  const [query, setQuery] = useState('');

  const q = query.toLowerCase();

  const results = {
    notes: q ? notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some(t => t.includes(q))) : [],
    decks: q ? decks.filter(d => d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)) : [],
    cards: q ? flashcards.filter(f => f.front.toLowerCase().includes(q) || f.back.toLowerCase().includes(q)) : [],
    tasks: q ? tasks.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) : [],
    courses: q ? courses.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) : [],
  };

  const totalResults = results.notes.length + results.decks.length + results.cards.length + results.tasks.length + results.courses.length;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Search</h1>
      <p className="text-gray-500 mb-6">Find anything across notes, flashcards, tasks, and courses</p>

      {/* Search Input */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input value={query} onChange={e => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm"
          placeholder="Search notes, flashcards, tasks, courses..."
          autoFocus />
      </div>

      {query && (
        <p className="text-sm text-gray-500 mb-6">{totalResults} result{totalResults !== 1 ? 's' : ''} found</p>
      )}

      {!query && (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">Search across everything</h3>
          <p className="text-gray-400">Full-text search across all your notes, flashcards, tasks, and courses</p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['binary search', 'mitosis', 'Spanish', 'sorting', 'algebra'].map(term => (
              <button key={term} onClick={() => setQuery(term)}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition">
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-6">
        {results.notes.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              <FileText className="w-4 h-4" /> Notes ({results.notes.length})
            </h3>
            <div className="space-y-2">
              {results.notes.map(note => (
                <button key={note.id} onClick={() => { setActiveNote(note.id); setView('note-editor'); }}
                  className="w-full bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition text-left group flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{note.title}</p>
                    <p className="text-sm text-gray-500 truncate">{note.content.replace(/[#*`>[\]()]/g, '').slice(0, 100)}</p>
                    <div className="flex gap-1 mt-1">
                      {note.tags.map(t => <span key={t} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{t}</span>)}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {results.decks.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              <BrainCircuit className="w-4 h-4" /> Flashcard Decks ({results.decks.length})
            </h3>
            <div className="space-y-2">
              {results.decks.map(deck => (
                <button key={deck.id} onClick={() => { setActiveDeck(deck.id); setView('flashcards'); }}
                  className="w-full bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition text-left group flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full shrink-0" style={{ backgroundColor: deck.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{deck.name}</p>
                    <p className="text-sm text-gray-500">{deck.description} • {deck.cardCount} cards</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {results.cards.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              <BrainCircuit className="w-4 h-4" /> Flashcards ({results.cards.length})
            </h3>
            <div className="space-y-2">
              {results.cards.slice(0, 10).map(card => (
                <div key={card.id} className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="font-medium text-gray-900 text-sm">{card.front}</p>
                  <p className="text-sm text-gray-500 mt-1">{card.back}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.tasks.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              <CalendarDays className="w-4 h-4" /> Tasks ({results.tasks.length})
            </h3>
            <div className="space-y-2">
              {results.tasks.map(task => (
                <button key={task.id} onClick={() => setView('planner')}
                  className="w-full bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition text-left group flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</p>
                    <p className="text-sm text-gray-500">Due: {task.dueDate} • {task.category}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {results.courses.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              <GraduationCap className="w-4 h-4" /> Courses ({results.courses.length})
            </h3>
            <div className="space-y-2">
              {results.courses.map(course => (
                <button key={course.id} onClick={() => { setActiveCourse(course.id); setView('course-player'); }}
                  className="w-full bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition text-left group flex items-center gap-3">
                  <span className="text-2xl">{course.thumbnail}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{course.title}</p>
                    <p className="text-sm text-gray-500">{course.description} • {course.progress}% complete</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
