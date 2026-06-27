import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { Play, Pause, RotateCcw, Timer, Clock, Infinity, Volume2, VolumeX, AlertTriangle } from 'lucide-react';

const ambientSounds = [
  { name: 'Rain', emoji: '🌧️' },
  { name: 'Cafe', emoji: '☕' },
  { name: 'Forest', emoji: '🌲' },
  { name: 'Lo-fi', emoji: '🎵' },
  { name: 'Ocean', emoji: '🌊' },
  { name: 'Silent', emoji: '🔇' },
];

const TREE_TYPES = ['🌱', '🌿', '🌳', '🌲', '🌴', '🎋', '🎄', '🌸', '💐', '🌻'];

export default function FocusTimer() {
  const { trees, completeFocusSession } = useStore();
  const [mode, setMode] = useState<'pomodoro' | 'countdown' | 'stopwatch'>('pomodoro');
  const [countdownMinutes, setCountdownMinutes] = useState(25);
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [targetSeconds, setTargetSeconds] = useState(25 * 60);
  const [pomodoroPhase, setPomodoroPhase] = useState<'focus' | 'break'>('focus');
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [activeSound, setActiveSound] = useState('Silent');
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [earnedTree, setEarnedTree] = useState('');
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  useEffect(() => {
    if (mode === 'pomodoro' || mode === 'countdown') {
      if (seconds >= targetSeconds && isRunning) {
        setIsRunning(false);
        if (mode === 'pomodoro') {
          if (pomodoroPhase === 'focus') {
            const tree = TREE_TYPES[Math.floor(Math.random() * TREE_TYPES.length)];
            setEarnedTree(tree);
            completeFocusSession(Math.round(targetSeconds / 60), 'pomodoro');
            setSessionComplete(true);
            setPomodoroCount(c => c + 1);
          } else {
            // Break ended
            setPomodoroPhase('focus');
            setTargetSeconds(25 * 60);
            setSeconds(0);
          }
        } else {
          const tree = TREE_TYPES[Math.floor(Math.random() * TREE_TYPES.length)];
          setEarnedTree(tree);
          completeFocusSession(Math.round(targetSeconds / 60), 'countdown');
          setSessionComplete(true);
        }
      }
    }
  }, [seconds, targetSeconds, isRunning]);

  const startTimer = () => {
    if (mode === 'pomodoro') {
      setTargetSeconds(pomodoroPhase === 'focus' ? 25 * 60 : 5 * 60);
    } else if (mode === 'countdown') {
      setTargetSeconds(countdownMinutes * 60);
    }
    setSeconds(0);
    setIsRunning(true);
    setSessionComplete(false);
  };

  const handleStop = () => {
    if (isRunning && seconds > 60) {
      setShowExitWarning(true);
    } else {
      resetTimer();
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(0);
    setShowExitWarning(false);
  };

  const confirmExit = () => {
    setIsRunning(false);
    setSeconds(0);
    setShowExitWarning(false);
  };

  const startBreak = () => {
    setPomodoroPhase('break');
    setTargetSeconds(5 * 60);
    setSeconds(0);
    setIsRunning(true);
    setSessionComplete(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getDisplayTime = () => {
    if (mode === 'stopwatch') return formatTime(seconds);
    const remaining = Math.max(0, targetSeconds - seconds);
    return formatTime(remaining);
  };

  const getProgress = () => {
    if (mode === 'stopwatch') return 0;
    return Math.min(100, (seconds / targetSeconds) * 100);
  };

  // Garden stats
  const today = new Date().toISOString().split('T')[0];
  const todayTrees = trees.filter(t => t.earnedAt.startsWith(today));
  const todayMinutes = todayTrees.reduce((sum, t) => sum + t.sessionMinutes, 0);
  const weekTrees = trees.filter(t => {
    const d = new Date(t.earnedAt);
    const now = new Date();
    return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
  });
  const weekMinutes = weekTrees.reduce((sum, t) => sum + t.sessionMinutes, 0);

  // Build bar chart data for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayTrees = trees.filter(t => t.earnedAt.startsWith(dateStr));
    const mins = dayTrees.reduce((sum, t) => sum + t.sessionMinutes, 0);
    return { day: d.toLocaleDateString('en', { weekday: 'short' }), mins, trees: dayTrees.length };
  });
  const maxMins = Math.max(...last7Days.map(d => d.mins), 60);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Focus Timer</h1>
      <p className="text-gray-500 mb-8">Stay focused and grow your forest 🌳</p>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Timer Section */}
        <div className="lg:col-span-3">
          {/* Mode Selector */}
          <div className="flex gap-2 mb-6">
            {[
              { m: 'pomodoro' as const, icon: Timer, label: 'Pomodoro' },
              { m: 'countdown' as const, icon: Clock, label: 'Countdown' },
              { m: 'stopwatch' as const, icon: Infinity, label: 'Stopwatch' },
            ].map(({ m, icon: Icon, label }) => (
              <button key={m} onClick={() => { if (!isRunning) { setMode(m); setSeconds(0); } }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${mode === m ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {/* Countdown Duration Selector */}
          {mode === 'countdown' && !isRunning && (
            <div className="flex gap-2 mb-6 flex-wrap">
              {[10, 15, 20, 25, 30, 45, 60, 90, 120].map(m => (
                <button key={m} onClick={() => setCountdownMinutes(m)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition ${countdownMinutes === m ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                  {m} min
                </button>
              ))}
            </div>
          )}

          {/* Timer Display */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 lg:p-12 text-center mb-6 relative overflow-hidden">
            {/* Growing tree animation */}
            {isRunning && (
              <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-20">
                <div className="text-8xl transition-all duration-1000" style={{ transform: `scale(${0.5 + getProgress() / 200})` }}>
                  {getProgress() < 25 ? '🌱' : getProgress() < 50 ? '🌿' : getProgress() < 75 ? '🌳' : '🌲'}
                </div>
              </div>
            )}
            
            <div className="relative z-10">
              {mode === 'pomodoro' && (
                <p className={`text-sm font-medium mb-4 ${pomodoroPhase === 'focus' ? 'text-indigo-600' : 'text-green-600'}`}>
                  {pomodoroPhase === 'focus' ? '🎯 Focus Time' : '☕ Break Time'} • Session {pomodoroCount + 1}
                </p>
              )}

              {/* Circular Progress */}
              <div className="relative w-64 h-64 mx-auto mb-8">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                  {mode !== 'stopwatch' && (
                    <circle cx="50" cy="50" r="45" fill="none"
                      stroke={pomodoroPhase === 'break' ? '#22c55e' : '#6366f1'}
                      strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${getProgress() * 2.83} 283`}
                      className="transition-all duration-1000" />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl lg:text-6xl font-bold text-gray-900 font-mono tracking-tight">{getDisplayTime()}</span>
                  {mode === 'stopwatch' && <span className="text-sm text-gray-400 mt-1">Elapsed</span>}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                {!isRunning && !sessionComplete ? (
                  <button onClick={startTimer}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold text-lg hover:shadow-xl hover:shadow-indigo-200 transition-all active:scale-95">
                    <Play className="w-6 h-6" /> Start
                  </button>
                ) : isRunning ? (
                  <>
                    <button onClick={() => setIsRunning(false)}
                      className="flex items-center gap-2 px-6 py-3 bg-yellow-50 text-yellow-700 rounded-xl font-medium hover:bg-yellow-100 transition">
                      <Pause className="w-5 h-5" /> Pause
                    </button>
                    <button onClick={handleStop}
                      className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition">
                      <RotateCcw className="w-5 h-5" /> Stop
                    </button>
                  </>
                ) : !isRunning && seconds > 0 && !sessionComplete ? (
                  <>
                    <button onClick={() => setIsRunning(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition">
                      <Play className="w-5 h-5" /> Resume
                    </button>
                    <button onClick={handleStop}
                      className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition">
                      <RotateCcw className="w-5 h-5" /> Reset
                    </button>
                  </>
                ) : null}

                {mode === 'stopwatch' && isRunning && seconds > 0 && (
                  <button onClick={() => {
                    setIsRunning(false);
                    const mins = Math.max(1, Math.round(seconds / 60));
                    const tree = TREE_TYPES[Math.floor(Math.random() * TREE_TYPES.length)];
                    setEarnedTree(tree);
                    completeFocusSession(mins, 'stopwatch');
                    setSessionComplete(true);
                    setSeconds(0);
                  }}
                    className="flex items-center gap-2 px-6 py-3 bg-green-50 text-green-600 rounded-xl font-medium hover:bg-green-100 transition">
                    ✅ Complete
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Session Complete */}
          {sessionComplete && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center mb-6">
              <div className="text-6xl mb-3 animate-bounce">{earnedTree}</div>
              <h3 className="text-xl font-bold text-green-800 mb-1">Session Complete!</h3>
              <p className="text-green-600 mb-4">You earned a new tree for your garden!</p>
              <div className="flex gap-3 justify-center">
                {mode === 'pomodoro' && pomodoroPhase === 'focus' && (
                  <button onClick={startBreak}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition">
                    Start Break (5 min)
                  </button>
                )}
                <button onClick={() => { setSessionComplete(false); setSeconds(0); setPomodoroPhase('focus'); }}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition">
                  New Session
                </button>
              </div>
            </div>
          )}

          {/* Ambient Sounds */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              {activeSound !== 'Silent' ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
              <span className="text-sm font-medium text-gray-700">Ambient Sounds</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {ambientSounds.map(s => (
                <button key={s.name} onClick={() => setActiveSound(s.name)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition ${activeSound === s.name ? 'bg-indigo-50 text-indigo-600 font-medium' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                  {s.emoji} {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Garden & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Garden */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-3">🌳 Your Garden</h3>
            <div className="grid grid-cols-5 gap-2 p-4 bg-gradient-to-b from-green-50 to-emerald-50 rounded-xl min-h-[120px]">
              {todayTrees.length > 0 ? todayTrees.map(t => (
                <div key={t.id} className="text-2xl text-center">{t.type}</div>
              )) : (
                <div className="col-span-5 text-center text-gray-400 text-sm py-4">
                  Complete a focus session to grow trees!
                </div>
              )}
            </div>
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-gray-500">Today: {todayTrees.length} trees</span>
              <span className="text-gray-500">{todayMinutes} min focused</span>
            </div>
          </div>

          {/* Weekly Stats */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4">📊 This Week</h3>
            <div className="flex items-end gap-2 h-32 mb-3">
              {last7Days.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-indigo-100 rounded-t-lg transition-all relative" style={{ height: `${Math.max(4, (d.mins / maxMins) * 100)}%` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg" />
                  </div>
                  <span className="text-xs text-gray-400">{d.day}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-indigo-50 rounded-xl text-center">
                <p className="text-xl font-bold text-indigo-700">{weekTrees.length}</p>
                <p className="text-xs text-indigo-500">Trees Grown</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl text-center">
                <p className="text-xl font-bold text-green-700">{Math.round(weekMinutes / 60 * 10) / 10}h</p>
                <p className="text-xs text-green-500">Focus Time</p>
              </div>
            </div>
          </div>

          {/* All-Time Forest */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-3">🌲 All-Time Forest</h3>
            <div className="grid grid-cols-5 gap-1 max-h-[200px] overflow-y-auto p-2">
              {trees.map(t => (
                <div key={t.id} className="text-xl text-center" title={`${t.sessionMinutes} min`}>{t.type}</div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">{trees.length} total trees grown</p>
          </div>
        </div>
      </div>

      {/* Exit Warning Modal */}
      {showExitWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Stop Session?</h3>
            <p className="text-gray-500 mb-1">Your growing plant will be lost! 🥀</p>
            <p className="text-sm text-gray-400 mb-6">You've focused for {formatTime(seconds)} so far.</p>
            <div className="flex gap-3">
              <button onClick={() => { setShowExitWarning(false); setIsRunning(true); }}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">Keep Going</button>
              <button onClick={confirmExit}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50">Give Up</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
