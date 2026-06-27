import { useState } from 'react';
import { useStore } from '../store';
import { Edit3, Shield, Eye, EyeOff, Calendar, Flame, Clock, BrainCircuit, FileText, Trophy, Settings, Check } from 'lucide-react';

const avatars = ['👨‍🎓', '👩‍🎓', '🧑‍💻', '👨‍🔬', '👩‍🔬', '🧑‍🎨', '👨‍💼', '👩‍⚕️', '🦊', '🐱', '🦉', '🐼'];

export default function ProfilePage() {
  const { user, updateProfile, trees, flashcards, notes, tasks } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '');
  const [showAvatars, setShowAvatars] = useState(false);

  if (!user) return null;

  const handleSave = () => {
    updateProfile({ name: editName, avatar: editAvatar });
    setIsEditing(false);
  };

  const totalMinutes = trees.reduce((sum, t) => sum + t.sessionMinutes, 0);
  const completedTasks = tasks.filter(t => t.completed).length;
  const masteredCards = flashcards.filter(c => c.difficulty < 0.3).length;

  // Activity data for heatmap
  const activityData = Array.from({ length: 84 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (83 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayTrees = trees.filter(t => t.earnedAt.startsWith(dateStr));
    return { date: d, count: dayTrees.length };
  });

  const stats = [
    { icon: Flame, label: 'Day Streak', value: user.streak, color: 'text-orange-500', bg: 'bg-orange-50' },
    { icon: Clock, label: 'Total Hours', value: Math.round(totalMinutes / 60), color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: BrainCircuit, label: 'Cards Mastered', value: masteredCards, color: 'text-purple-500', bg: 'bg-purple-50' },
    { icon: FileText, label: 'Notes Created', value: notes.length, color: 'text-green-500', bg: 'bg-green-50' },
    { icon: Trophy, label: 'Tasks Done', value: completedTasks, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { icon: Calendar, label: 'Trees Grown', value: trees.length, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
          <div className="absolute -bottom-12 left-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-5xl cursor-pointer"
                onClick={() => isEditing && setShowAvatars(!showAvatars)}>
                {isEditing ? editAvatar : user.avatar}
              </div>
              {isEditing && (
                <button onClick={() => setShowAvatars(!showAvatars)}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="pt-16 pb-6 px-6">
          {showAvatars && isEditing && (
            <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
              {avatars.map(a => (
                <button key={a} onClick={() => { setEditAvatar(a); setShowAvatars(false); }}
                  className={`text-3xl p-2 rounded-xl transition ${editAvatar === a ? 'bg-indigo-100 ring-2 ring-indigo-400' : 'hover:bg-gray-100'}`}>
                  {a}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-start justify-between">
            <div>
              {isEditing ? (
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  className="text-2xl font-bold text-gray-900 border-b-2 border-indigo-500 outline-none pb-1 bg-transparent" />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              )}
              <p className="text-gray-500 mt-1">{user.email}</p>
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">🎓 {user.level}</span>
                <span className="flex items-center gap-1">📅 Joined {new Date(user.joinDate).toLocaleDateString('en', { month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {user.subjects.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full font-medium">{s}</span>
                ))}
              </div>
            </div>
            <div>
              {isEditing ? (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
                    <Check className="w-4 h-4" /> Save
                  </button>
                </div>
              ) : (
                <button onClick={() => { setIsEditing(true); setEditName(user.name); setEditAvatar(user.avatar); }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Activity Heatmap */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-8">
        <h3 className="font-bold text-gray-900 mb-4">📊 Study Activity</h3>
        <div className="flex flex-wrap gap-1">
          {activityData.map((d, i) => (
            <div key={i}
              className={`w-3.5 h-3.5 rounded-sm transition ${d.count === 0 ? 'bg-gray-100' : d.count === 1 ? 'bg-green-200' : d.count === 2 ? 'bg-green-400' : 'bg-green-600'}`}
              title={`${d.date.toLocaleDateString()}: ${d.count} sessions`} />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-gray-100" />
          <div className="w-3 h-3 rounded-sm bg-green-200" />
          <div className="w-3 h-3 rounded-sm bg-green-400" />
          <div className="w-3 h-3 rounded-sm bg-green-600" />
          <span>More</span>
        </div>
      </div>

      {/* Settings */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-gray-600" />
            <h3 className="font-bold text-gray-900">Study Goals</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-700">Daily Goal</span>
              <span className="text-sm font-medium text-indigo-600">{user.dailyGoal}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-700">Education Level</span>
              <span className="text-sm font-medium text-gray-900">{user.level}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-700">Subjects</span>
              <span className="text-sm font-medium text-gray-900">{user.subjects.length} selected</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-gray-600" />
            <h3 className="font-bold text-gray-900">Privacy</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-700">Public Profile</p>
                <p className="text-xs text-gray-400">Others can see your stats</p>
              </div>
              <button onClick={() => updateProfile({ isPublic: !user.isPublic })}
                className={`w-12 h-6 rounded-full transition-all p-0.5 ${user.isPublic ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full transition-all shadow ${user.isPublic ? 'translate-x-6' : ''}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                {user.isPublic ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                <span className="text-sm text-gray-700">Profile is {user.isPublic ? 'visible' : 'hidden'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
