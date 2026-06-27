import { useState } from 'react';
import { useStore } from '../store';
import { BookOpen, GraduationCap, Target, ArrowRight, Check } from 'lucide-react';

const levels = ['High School', 'University', 'Post-Graduate', 'Self-Learning'];
const allSubjects = ['Mathematics', 'Computer Science', 'Physics', 'Chemistry', 'Biology', 'History', 'Literature', 'Languages', 'Economics', 'Psychology', 'Art', 'Music'];
const goals = ['Master 20 cards a day', 'Focus for 1 hour', 'Focus for 2 hours', 'Complete 3 lessons daily', 'Review all due cards'];

export default function OnboardingPage() {
  const { completeOnboarding } = useStore();
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [goal, setGoal] = useState('');

  const toggleSubject = (s: string) => {
    setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const canProceed = step === 0 ? !!level : step === 1 ? subjects.length > 0 : !!goal;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-8">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">StudyHub</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {[0, 1, 2].map(i => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i <= step ? 'bg-indigo-600 w-16' : 'bg-gray-200 w-8'}`} />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 p-8">
          {step === 0 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">What's your education level?</h2>
                  <p className="text-sm text-gray-500">We'll personalize your experience</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {levels.map(l => (
                  <button key={l} onClick={() => setLevel(l)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${level === l ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <p className="font-semibold text-gray-900">{l}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Select your subjects</h2>
                  <p className="text-sm text-gray-500">Choose what you're studying</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {allSubjects.map(s => (
                  <button key={s} onClick={() => toggleSubject(s)}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-1.5 ${subjects.includes(s) ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'}`}>
                    {subjects.includes(s) && <Check className="w-3.5 h-3.5" />}
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Set your daily goal</h2>
                  <p className="text-sm text-gray-500">We'll help you stay on track</p>
                </div>
              </div>
              <div className="space-y-3">
                {goals.map(g => (
                  <button key={g} onClick={() => setGoal(g)}
                    className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all ${goal === g ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </>
          )}

          <button onClick={() => step < 2 ? setStep(step + 1) : completeOnboarding(level, subjects, goal)}
            disabled={!canProceed}
            className="w-full mt-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {step < 2 ? 'Continue' : 'Get Started'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
