import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { ArrowLeft, RotateCcw, Check, X, ThumbsUp, ThumbsDown, Minus, Trophy, BookOpen } from 'lucide-react';

export default function FlashcardStudy() {
  const { activeDeckId, studyMode, flashcards, decks, reviewFlashcard, setView } = useStore();
  const deck = decks.find(d => d.id === activeDeckId);
  const deckCards = flashcards.filter(f => f.deckId === activeDeckId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [writeAnswer, setWriteAnswer] = useState('');
  const [showWriteResult, setShowWriteResult] = useState(false);
  const [mcqOptions, setMcqOptions] = useState<string[]>([]);
  const [mcqSelected, setMcqSelected] = useState<number | null>(null);
  const [matchPairs, setMatchPairs] = useState<{ id: string; text: string; type: 'front' | 'back'; matched: boolean; selected: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [matchFirst, setMatchFirst] = useState<string | null>(null);

  const currentCard = deckCards[currentIndex];

  useEffect(() => {
    if (studyMode === 'mcq' && currentCard) {
      generateMCQ();
    }
    if (studyMode === 'match') {
      generateMatchPairs();
    }
  }, [currentIndex, studyMode]);

  const generateMCQ = () => {
    if (!currentCard) return;
    const otherCards = deckCards.filter(c => c.id !== currentCard.id);
    const wrongAnswers = otherCards.sort(() => Math.random() - 0.5).slice(0, 3).map(c => c.back);
    while (wrongAnswers.length < 3) wrongAnswers.push('...');
    const allOptions = [currentCard.back, ...wrongAnswers].sort(() => Math.random() - 0.5);
    setMcqOptions(allOptions);
    setMcqSelected(null);
  };

  const generateMatchPairs = () => {
    const cards = deckCards.slice(0, Math.min(5, deckCards.length));
    const pairs = [
      ...cards.map(c => ({ id: c.id + '-front', text: c.front.slice(0, 40), type: 'front' as const, matched: false, selected: false })),
      ...cards.map(c => ({ id: c.id + '-back', text: c.back.slice(0, 40), type: 'back' as const, matched: false, selected: false })),
    ].sort(() => Math.random() - 0.5);
    setMatchPairs(pairs);
    setMatchFirst(null);
  };

  const handleStudyRating = (quality: number) => {
    if (!currentCard) return;
    reviewFlashcard(currentCard.id, quality);
    setTotal(t => t + 1);
    if (quality >= 3) setScore(s => s + 1);
    nextCard();
  };

  const handleWriteSubmit = () => {
    setShowWriteResult(true);
    setTotal(t => t + 1);
    const isCorrect = writeAnswer.trim().toLowerCase() === currentCard?.back.trim().toLowerCase();
    if (isCorrect) setScore(s => s + 1);
    if (currentCard) reviewFlashcard(currentCard.id, isCorrect ? 4 : 1);
  };

  const handleMCQSelect = (index: number) => {
    setMcqSelected(index);
    setTotal(t => t + 1);
    const isCorrect = mcqOptions[index] === currentCard?.back;
    if (isCorrect) setScore(s => s + 1);
    if (currentCard) reviewFlashcard(currentCard.id, isCorrect ? 4 : 1);
    setTimeout(() => nextCard(), 1500);
  };

  const handleMatchSelect = (id: string) => {
    if (matchPairs.find(p => p.id === id)?.matched) return;
    
    if (!matchFirst) {
      setMatchFirst(id);
      setMatchPairs(prev => prev.map(p => p.id === id ? { ...p, selected: true } : { ...p, selected: false }));
    } else {
      const first = matchPairs.find(p => p.id === matchFirst)!;
      const second = matchPairs.find(p => p.id === id)!;
      
      if (first.type === second.type) {
        setMatchFirst(id);
        setMatchPairs(prev => prev.map(p => p.id === id ? { ...p, selected: true } : { ...p, selected: false }));
        return;
      }

      const firstCardId = matchFirst.replace('-front', '').replace('-back', '');
      const secondCardId = id.replace('-front', '').replace('-back', '');
      
      if (firstCardId === secondCardId) {
        setMatchPairs(prev => prev.map(p => 
          p.id === matchFirst || p.id === id ? { ...p, matched: true, selected: false } : p
        ));
        setScore(s => s + 1);
      } else {
        setMatchPairs(prev => prev.map(p => ({ ...p, selected: false })));
      }
      setTotal(t => t + 1);
      setMatchFirst(null);
    }
  };

  const nextCard = () => {
    setFlipped(false);
    setWriteAnswer('');
    setShowWriteResult(false);
    setMcqSelected(null);
    if (currentIndex + 1 >= deckCards.length) {
      setCompleted(true);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  if (!deck || deckCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-600 mb-2">No cards in this deck</h2>
        <button onClick={() => setView('flashcards')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl">Go Back</button>
      </div>
    );
  }

  // Match mode
  if (studyMode === 'match') {
    const allMatched = matchPairs.every(p => p.matched);
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setView('flashcards')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" /> Back to Decks
          </button>
          <h2 className="text-xl font-bold text-gray-900">{deck.name} - Match Game</h2>
          <span className="text-sm text-gray-500">{score} matched</span>
        </div>
        {allMatched ? (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">All Matched! 🎉</h2>
            <p className="text-gray-500 mb-6">Great job matching all the pairs!</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { generateMatchPairs(); setScore(0); setTotal(0); }} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium">Play Again</button>
              <button onClick={() => setView('flashcards')} className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600">Back to Decks</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Questions</h3>
              {matchPairs.filter(p => p.type === 'front').map(p => (
                <button key={p.id} onClick={() => handleMatchSelect(p.id)}
                  className={`w-full p-4 rounded-xl text-left text-sm transition-all ${p.matched ? 'bg-green-50 border-2 border-green-300 text-green-700 opacity-60' : p.selected ? 'bg-indigo-50 border-2 border-indigo-400 text-indigo-700' : 'bg-white border-2 border-gray-100 hover:border-indigo-200'}`}>
                  {p.text}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Answers</h3>
              {matchPairs.filter(p => p.type === 'back').map(p => (
                <button key={p.id} onClick={() => handleMatchSelect(p.id)}
                  className={`w-full p-4 rounded-xl text-left text-sm transition-all ${p.matched ? 'bg-green-50 border-2 border-green-300 text-green-700 opacity-60' : p.selected ? 'bg-indigo-50 border-2 border-indigo-400 text-indigo-700' : 'bg-white border-2 border-gray-100 hover:border-indigo-200'}`}>
                  {p.text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Completed view
  if (completed) {
    const percentage = Math.round((score / total) * 100);
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Session Complete!</h2>
          <p className="text-gray-500 mb-6">You reviewed {total} cards</p>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
            <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">{percentage}%</div>
            <p className="text-gray-500">Accuracy</p>
            <div className="mt-4 flex justify-center gap-6">
              <div className="text-center">
                <p className="text-xl font-bold text-green-600">{score}</p>
                <p className="text-xs text-gray-400">Correct</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-red-500">{total - score}</p>
                <p className="text-xs text-gray-400">Incorrect</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setCurrentIndex(0); setScore(0); setTotal(0); setCompleted(false); setFlipped(false); }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">
              <RotateCcw className="w-4 h-4" /> Study Again
            </button>
            <button onClick={() => setView('flashcards')}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50">
              Back to Decks
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-8">
        <button onClick={() => setView('flashcards')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <div className="text-center">
          <h2 className="font-bold text-gray-900">{deck.name}</h2>
          <p className="text-xs text-gray-500">{studyMode === 'study' ? 'Study Mode' : studyMode === 'write' ? 'Write Mode' : 'Multiple Choice'}</p>
        </div>
        <span className="text-sm text-gray-500">{currentIndex + 1} / {deckCards.length}</span>
      </div>

      {/* Progress */}
      <div className="w-full h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
          style={{ width: `${((currentIndex + 1) / deckCards.length) * 100}%` }} />
      </div>

      {/* Card */}
      {studyMode === 'study' && (
        <>
          <div onClick={() => setFlipped(!flipped)}
            className="w-full aspect-[3/2] max-h-[400px] bg-white rounded-2xl border border-gray-100 shadow-lg cursor-pointer flex items-center justify-center p-8 mb-8 hover:shadow-xl transition-all active:scale-[0.99]"
            style={{ perspective: '1000px' }}>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-3">{flipped ? 'ANSWER' : 'QUESTION'}</p>
              <p className="text-xl lg:text-2xl font-medium text-gray-900 leading-relaxed">
                {flipped ? currentCard.back : currentCard.front}
              </p>
              {!flipped && <p className="text-sm text-indigo-500 mt-4">Click to reveal answer</p>}
            </div>
          </div>

          {flipped && (
            <div className="flex gap-3 w-full">
              <button onClick={() => handleStudyRating(1)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition">
                <ThumbsDown className="w-4 h-4" /> Again
              </button>
              <button onClick={() => handleStudyRating(3)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-yellow-50 text-yellow-600 rounded-xl font-medium hover:bg-yellow-100 transition">
                <Minus className="w-4 h-4" /> Hard
              </button>
              <button onClick={() => handleStudyRating(4)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-50 text-green-600 rounded-xl font-medium hover:bg-green-100 transition">
                <Check className="w-4 h-4" /> Good
              </button>
              <button onClick={() => handleStudyRating(5)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-medium hover:bg-indigo-100 transition">
                <ThumbsUp className="w-4 h-4" /> Easy
              </button>
            </div>
          )}
        </>
      )}

      {/* Write Mode */}
      {studyMode === 'write' && (
        <>
          <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-lg p-8 mb-6">
            <p className="text-xs text-gray-400 mb-3">QUESTION</p>
            <p className="text-xl font-medium text-gray-900 mb-6">{currentCard.front}</p>
            {!showWriteResult ? (
              <div>
                <textarea value={writeAnswer} onChange={e => setWriteAnswer(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24"
                  placeholder="Type your answer..." 
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleWriteSubmit(); } }} />
                <button onClick={handleWriteSubmit}
                  className="mt-3 w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition">
                  Check Answer
                </button>
              </div>
            ) : (
              <div>
                <div className={`p-4 rounded-xl mb-3 ${writeAnswer.trim().toLowerCase() === currentCard.back.trim().toLowerCase() ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className="text-sm font-medium mb-1">{writeAnswer.trim().toLowerCase() === currentCard.back.trim().toLowerCase() ? '✅ Correct!' : '❌ Incorrect'}</p>
                  <p className="text-sm text-gray-600">Your answer: {writeAnswer}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl mb-3">
                  <p className="text-xs text-gray-400 mb-1">Correct Answer:</p>
                  <p className="text-sm font-medium text-gray-900">{currentCard.back}</p>
                </div>
                <button onClick={nextCard}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition">
                  Next Card
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* MCQ Mode */}
      {studyMode === 'mcq' && (
        <>
          <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-lg p-8 mb-6">
            <p className="text-xs text-gray-400 mb-3">QUESTION</p>
            <p className="text-xl font-medium text-gray-900 mb-6">{currentCard.front}</p>
            <div className="space-y-3">
              {mcqOptions.map((opt, i) => {
                const isCorrect = opt === currentCard.back;
                const isSelected = mcqSelected === i;
                let style = 'bg-white border-2 border-gray-100 hover:border-indigo-200';
                if (mcqSelected !== null) {
                  if (isCorrect) style = 'bg-green-50 border-2 border-green-400 text-green-700';
                  else if (isSelected) style = 'bg-red-50 border-2 border-red-400 text-red-700';
                }
                return (
                  <button key={i} onClick={() => mcqSelected === null && handleMCQSelect(i)}
                    className={`w-full p-4 rounded-xl text-left text-sm transition-all ${style}`}>
                    <span className="font-medium">{String.fromCharCode(65 + i)}.</span> {opt}
                    {mcqSelected !== null && isCorrect && <Check className="w-4 h-4 inline ml-2" />}
                    {isSelected && !isCorrect && <X className="w-4 h-4 inline ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Score */}
      <div className="mt-4 text-sm text-gray-500">
        Score: {score}/{total} {total > 0 && `(${Math.round((score/total)*100)}%)`}
      </div>
    </div>
  );
}
