import { useState } from 'react';
import { useStore } from '../store';
import { ArrowLeft, Play, CheckCircle2, Circle, Trophy, BookOpen, ChevronDown, ChevronRight, FileText, HelpCircle } from 'lucide-react';

export default function CoursePlayer() {
  const { activeCourseId, courses, toggleLessonComplete, setQuizScore, setView } = useStore();
  const course = courses.find(c => c.id === activeCourseId);
  const [activeModule, setActiveModule] = useState<string | null>(course?.modules[0]?.id || null);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  if (!course) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-400">Course not found</p>
    </div>
  );

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = course.modules.reduce((sum, m) => sum + m.lessons.filter(l => l.completed).length, 0);

  // Simple quiz questions for demo
  const quizQuestions = [
    { q: 'What is the main concept covered in this module?', options: ['Sorting', 'Searching', 'Graphing', 'Hashing'], correct: 0 },
    { q: 'Which has better worst-case performance?', options: ['Quick Sort', 'Merge Sort', 'Bubble Sort', 'Selection Sort'], correct: 1 },
    { q: 'What is the space complexity of merge sort?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correct: 2 },
  ];

  const handleQuizSubmit = () => {
    const score = quizQuestions.reduce((sum, q, i) => sum + (quizAnswers[i] === q.correct ? 1 : 0), 0);
    const percentage = Math.round((score / quizQuestions.length) * 100);
    if (activeModule) setQuizScore(course.id, activeModule, percentage);
    setQuizSubmitted(true);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar - Course outline */}
      <div className="w-80 border-r border-gray-100 bg-white flex flex-col shrink-0 hidden lg:flex">
        <div className="p-4 border-b border-gray-100">
          <button onClick={() => setView('courses')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm mb-3">
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </button>
          <h3 className="font-bold text-gray-900 text-lg mb-1">{course.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <span>{completedLessons}/{totalLessons} lessons</span>
            <span>•</span>
            <span>{course.progress}% complete</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
              style={{ width: `${course.progress}%` }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {course.modules.map((mod, mi) => (
            <div key={mod.id}>
              <button onClick={() => setActiveModule(activeModule === mod.id ? null : mod.id)}
                className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-gray-50 transition border-b border-gray-50">
                {activeModule === mod.id ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Module {mi + 1}: {mod.title}</p>
                  <p className="text-xs text-gray-500">{mod.lessons.filter(l => l.completed).length}/{mod.lessons.length} completed
                    {mod.quizScore !== null && <span className="ml-1 text-indigo-600">• Quiz: {mod.quizScore}%</span>}
                  </p>
                </div>
              </button>
              {activeModule === mod.id && (
                <div className="bg-gray-50/50">
                  {mod.lessons.map((lesson) => (
                    <button key={lesson.id}
                      onClick={() => {
                        if (lesson.type === 'quiz') {
                          setShowQuiz(true);
                          setActiveLesson(lesson.id);
                        } else {
                          setActiveLesson(lesson.id);
                          setShowQuiz(false);
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-6 py-2.5 text-left text-sm transition ${activeLesson === lesson.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-600'}`}>
                      {lesson.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      ) : lesson.type === 'quiz' ? (
                        <HelpCircle className="w-4 h-4 text-purple-400 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{lesson.title}</p>
                        <p className="text-xs text-gray-400">{lesson.duration}</p>
                      </div>
                      {lesson.type === 'video' && <Play className="w-3.5 h-3.5 text-gray-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {activeLesson && !showQuiz ? (
          <>
            {/* Video Player Area */}
            <div className="bg-gray-900 aspect-video max-h-[50vh] flex items-center justify-center relative">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 mx-auto backdrop-blur cursor-pointer hover:bg-white/20 transition">
                  <Play className="w-10 h-10 text-white ml-1" />
                </div>
                <p className="text-white/80 text-lg">
                  {course.modules.flatMap(m => m.lessons).find(l => l.id === activeLesson)?.title}
                </p>
                <p className="text-white/40 text-sm mt-1">Video player placeholder</p>
              </div>
              {/* Mark complete button */}
              {(() => {
                const mod = course.modules.find(m => m.lessons.some(l => l.id === activeLesson));
                const lesson = mod?.lessons.find(l => l.id === activeLesson);
                if (!mod || !lesson) return null;
                return (
                  <button onClick={() => toggleLessonComplete(course.id, mod.id, activeLesson)}
                    className={`absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${lesson.completed ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                    {lesson.completed ? <><CheckCircle2 className="w-4 h-4" /> Completed</> : <><Circle className="w-4 h-4" /> Mark Complete</>}
                  </button>
                );
              })()}
            </div>

            {/* Split-screen Note Taking */}
            <div className="flex-1 flex">
              <div className="flex-1 p-6 border-r border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2">
                  {course.modules.flatMap(m => m.lessons).find(l => l.id === activeLesson)?.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Duration: {course.modules.flatMap(m => m.lessons).find(l => l.id === activeLesson)?.duration}
                </p>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                  <p>📺 This is where the video lesson content would be displayed.</p>
                  <p className="mt-2">In a full implementation, this would include:</p>
                  <ul className="list-disc ml-4 mt-2 space-y-1">
                    <li>Embedded video player with controls</li>
                    <li>Playback speed adjustment</li>
                    <li>Transcript and closed captions</li>
                    <li>Bookmarking timestamps</li>
                  </ul>
                </div>
              </div>
              <div className="w-80 p-4 bg-gray-50 hidden xl:block">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-sm font-bold text-gray-900">Lesson Notes</h4>
                </div>
                <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)}
                  className="w-full h-64 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Take notes while watching..." />
              </div>
            </div>
          </>
        ) : showQuiz ? (
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Module Quiz</h2>
                <p className="text-sm text-gray-500">Test your understanding</p>
              </div>
            </div>

            {!quizSubmitted ? (
              <div className="space-y-6">
                {quizQuestions.map((q, qi) => (
                  <div key={qi} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <p className="font-medium text-gray-900 mb-3">{qi + 1}. {q.q}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => (
                        <button key={oi} onClick={() => setQuizAnswers({ ...quizAnswers, [qi]: oi })}
                          className={`w-full p-3 rounded-xl text-left text-sm transition ${quizAnswers[qi] === oi ? 'bg-indigo-50 border-2 border-indigo-400 text-indigo-700' : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'}`}>
                          {String.fromCharCode(65 + oi)}. {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button onClick={handleQuizSubmit}
                  disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  Submit Quiz
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h3>
                <p className="text-gray-500 mb-4">
                  You scored {quizQuestions.reduce((sum, q, i) => sum + (quizAnswers[i] === q.correct ? 1 : 0), 0)}/{quizQuestions.length}
                </p>
                <div className="space-y-3 text-left max-w-md mx-auto">
                  {quizQuestions.map((q, qi) => (
                    <div key={qi} className={`p-3 rounded-xl text-sm ${quizAnswers[qi] === q.correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {quizAnswers[qi] === q.correct ? '✅' : '❌'} {q.q} — {q.options[q.correct]}
                    </div>
                  ))}
                </div>
                <button onClick={() => { setShowQuiz(false); setQuizSubmitted(false); setQuizAnswers({}); }}
                  className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition">
                  Continue Learning
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-600 mb-2">Select a lesson to begin</h2>
              <p className="text-gray-400">Choose from the course outline on the left</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
