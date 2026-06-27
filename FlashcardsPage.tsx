import { useState } from 'react';
import { useStore } from '../store';
import { Plus, BrainCircuit, BookOpen, PenTool, ListChecks, Shuffle, Trash2, Play, BarChart3 } from 'lucide-react';

export default function FlashcardsPage() {
  const { decks, flashcards, createDeck, deleteDeck, addFlashcard, setActiveDeck, setStudyMode, setView, activeDeckId } = useStore();
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [deckName, setDeckName] = useState('');
  const [deckDesc, setDeckDesc] = useState('');
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [selectedDeckView, setSelectedDeckView] = useState<string | null>(null);

  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  const handleCreateDeck = () => {
    if (deckName.trim()) {
      createDeck(deckName.trim(), deckDesc.trim(), selectedColor);
      setDeckName(''); setDeckDesc(''); setShowCreateDeck(false);
    }
  };

  const handleAddCard = () => {
    if (cardFront.trim() && cardBack.trim() && selectedDeckView) {
      addFlashcard(selectedDeckView, cardFront.trim(), cardBack.trim());
      setCardFront(''); setCardBack('');
    }
  };

  const startStudy = (deckId: string, mode: 'study' | 'write' | 'mcq' | 'match') => {
    setActiveDeck(deckId);
    setStudyMode(mode);
    setView('flashcard-study');
  };

  const getDeckCards = (deckId: string) => flashcards.filter(f => f.deckId === deckId);
  const getDueCards = (deckId: string) => getDeckCards(deckId).filter(c => new Date(c.nextReview) <= new Date());

  // Stats
  const totalCards = flashcards.length;
  const totalDue = flashcards.filter(c => new Date(c.nextReview) <= new Date()).length;
  const totalMastered = flashcards.filter(c => c.difficulty < 0.3).length;
  const reviewedToday = flashcards.filter(c => c.lastReviewed && new Date(c.lastReviewed).toDateString() === new Date().toDateString()).length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Flashcards</h1>
          <p className="text-gray-500 mt-1">Master your knowledge with spaced repetition</p>
        </div>
        <button onClick={() => setShowCreateDeck(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition active:scale-95">
          <Plus className="w-4 h-4" /> New Deck
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Cards', value: totalCards, icon: BrainCircuit, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Due Today', value: totalDue, icon: BookOpen, color: 'bg-orange-50 text-orange-600' },
          { label: 'Mastered', value: totalMastered, icon: BarChart3, color: 'bg-green-50 text-green-600' },
          { label: 'Reviewed Today', value: reviewedToday, icon: Play, color: 'bg-purple-50 text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className={`w-8 h-8 ${s.color} rounded-lg flex items-center justify-center mb-2`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Create Deck Modal */}
      {showCreateDeck && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateDeck(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Deck</h3>
            <input value={deckName} onChange={e => setDeckName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-3 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Deck name" />
            <textarea value={deckDesc} onChange={e => setDeckDesc(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-20"
              placeholder="Description (optional)" />
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Color</p>
              <div className="flex gap-2 flex-wrap">
                {colors.map(c => (
                  <button key={c} onClick={() => setSelectedColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${selectedColor === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCreateDeck(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreateDeck} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Decks Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {decks.map(deck => {
          const cards = getDeckCards(deck.id);
          const due = getDueCards(deck.id);
          const mastered = cards.filter(c => c.difficulty < 0.3).length;
          const isExpanded = selectedDeckView === deck.id;

          return (
            <div key={deck.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
              {/* Deck Header */}
              <div className="p-5 cursor-pointer" onClick={() => setSelectedDeckView(isExpanded ? null : deck.id)}
                style={{ borderTop: `4px solid ${deck.color}` }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">{deck.name}</h3>
                  <button onClick={e => { e.stopPropagation(); deleteDeck(deck.id); }}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-3">{deck.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">{cards.length} cards</span>
                  <span className="text-orange-600 font-medium">{due.length} due</span>
                  <span className="text-green-600">{mastered} mastered</span>
                </div>
                {/* Progress bar */}
                <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                    style={{ width: `${cards.length > 0 ? (mastered / cards.length) * 100 : 0}%` }} />
                </div>
              </div>

              {/* Expanded View */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                  {/* Study Modes */}
                  <p className="text-sm font-medium text-gray-600 mb-2">Study Modes</p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { icon: BookOpen, label: 'Study', mode: 'study' as const, color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' },
                      { icon: PenTool, label: 'Write', mode: 'write' as const, color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
                      { icon: ListChecks, label: 'Multiple Choice', mode: 'mcq' as const, color: 'bg-green-50 text-green-600 hover:bg-green-100' },
                      { icon: Shuffle, label: 'Match', mode: 'match' as const, color: 'bg-orange-50 text-orange-600 hover:bg-orange-100' },
                    ].map(m => (
                      <button key={m.mode} onClick={() => startStudy(deck.id, m.mode)}
                        disabled={cards.length === 0}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition ${m.color} disabled:opacity-50 disabled:cursor-not-allowed`}>
                        <m.icon className="w-4 h-4" /> {m.label}
                      </button>
                    ))}
                  </div>

                  {/* Add Card */}
                  {showAddCard && activeDeckId === deck.id ? null : (
                    <button onClick={() => { setShowAddCard(true); setActiveDeck(deck.id); setSelectedDeckView(deck.id); }}
                      className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition">
                      <Plus className="w-4 h-4" /> Add Card
                    </button>
                  )}
                  {showAddCard && selectedDeckView === deck.id && (
                    <div className="space-y-2 mt-2">
                      <textarea value={cardFront} onChange={e => setCardFront(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-16"
                        placeholder="Front (Question)" />
                      <textarea value={cardBack} onChange={e => setCardBack(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-16"
                        placeholder="Back (Answer)" />
                      <div className="flex gap-2">
                        <button onClick={() => { setShowAddCard(false); setCardFront(''); setCardBack(''); }}
                          className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button onClick={handleAddCard}
                          className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Add Card</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Public Library Teaser */}
      <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <BrainCircuit className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">Public Flashcard Library</h3>
            <p className="text-sm text-gray-500">Browse millions of user-generated decks or share your own</p>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
            Explore Library
          </button>
        </div>
      </div>
    </div>
  );
}
