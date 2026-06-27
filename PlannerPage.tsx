import { useState } from 'react';
import { useStore } from '../store';
import { Plus, Calendar, CheckCircle2, Circle, ChevronDown, ChevronRight, Trash2, Flag, Clock, ListChecks } from 'lucide-react';
import { v4 as uuid } from 'uuid';

export default function PlannerPage() {
  const { tasks, addTask, toggleTask, toggleSubtask, deleteTask } = useStore();
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newCategory, setNewCategory] = useState('');
  const [newHours, setNewHours] = useState(1);
  const [newSubtasks, setNewSubtasks] = useState<string[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');

  const handleAddTask = () => {
    if (!newTitle.trim()) return;
    addTask({
      title: newTitle.trim(),
      description: newDesc.trim(),
      dueDate: newDate || new Date().toISOString().split('T')[0],
      priority: newPriority,
      completed: false,
      subtasks: newSubtasks.map(text => ({ id: uuid(), text, done: false })),
      category: newCategory || 'General',
      estimatedHours: newHours
    });
    setNewTitle(''); setNewDesc(''); setNewDate(''); setNewCategory(''); setNewSubtasks([]);
    setShowAddTask(false);
  };

  const addSubtask = () => {
    if (newSubtaskText.trim()) {
      setNewSubtasks([...newSubtasks, newSubtaskText.trim()]);
      setNewSubtaskText('');
    }
  };

  const filteredTasks = tasks
    .filter(t => filter === 'all' ? true : filter === 'active' ? !t.completed : t.completed)
    .sort((a, b) => {
      if (sortBy === 'date') return a.dueDate.localeCompare(b.dueDate);
      const pOrder = { high: 0, medium: 1, low: 2 };
      return pOrder[a.priority] - pOrder[b.priority];
    });

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const highPriority = activeTasks.filter(t => t.priority === 'high');
  const totalEstimated = activeTasks.reduce((sum, t) => sum + t.estimatedHours, 0);

  // Calendar-like view for next 7 days
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayTasks = tasks.filter(t => t.dueDate === dateStr && !t.completed);
    return { date: d, dateStr, tasks: dayTasks, isToday: i === 0 };
  });

  const priorityColor = (p: string) => p === 'high' ? 'text-red-600 bg-red-50' : p === 'medium' ? 'text-yellow-600 bg-yellow-50' : 'text-green-600 bg-green-50';
  const priorityDot = (p: string) => p === 'high' ? 'bg-red-500' : p === 'medium' ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Study Planner</h1>
          <p className="text-gray-500 mt-1">Track assignments, deadlines, and study tasks</p>
        </div>
        <button onClick={() => setShowAddTask(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition active:scale-95">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <ListChecks className="w-5 h-5 text-indigo-600 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{activeTasks.length}</p>
          <p className="text-xs text-gray-500">Active Tasks</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <Flag className="w-5 h-5 text-red-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{highPriority.length}</p>
          <p className="text-xs text-gray-500">High Priority</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <Clock className="w-5 h-5 text-orange-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{totalEstimated}h</p>
          <p className="text-xs text-gray-500">Estimated Work</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{completedTasks.length}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
      </div>

      {/* Weekly Calendar Preview */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-gray-900">This Week</h3>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {next7Days.map((d, i) => (
            <div key={i} className={`p-3 rounded-xl text-center ${d.isToday ? 'bg-indigo-50 border-2 border-indigo-200' : 'bg-gray-50'}`}>
              <p className="text-xs text-gray-500 mb-1">{d.date.toLocaleDateString('en', { weekday: 'short' })}</p>
              <p className={`text-lg font-bold ${d.isToday ? 'text-indigo-600' : 'text-gray-900'}`}>{d.date.getDate()}</p>
              {d.tasks.length > 0 && (
                <div className="mt-1 flex justify-center gap-0.5">
                  {d.tasks.slice(0, 3).map(t => (
                    <div key={t.id} className={`w-1.5 h-1.5 rounded-full ${priorityDot(t.priority)}`} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Tasks List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {(['all', 'active', 'completed'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === f ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 outline-none">
              <option value="date">Sort by Date</option>
              <option value="priority">Sort by Priority</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredTasks.map(task => {
              const daysLeft = Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              const isExpanded = expandedTask === task.id;
              const subtasksDone = task.subtasks.filter(s => s.done).length;

              return (
                <div key={task.id} className={`bg-white rounded-2xl border shadow-sm transition-all ${task.completed ? 'border-gray-100 opacity-60' : 'border-gray-100 hover:shadow-md'}`}>
                  <div className="p-4 flex items-start gap-3">
                    <button onClick={() => toggleTask(task.id)} className="mt-0.5">
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 hover:text-indigo-500 transition" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0" onClick={() => setExpandedTask(isExpanded ? null : task.id)}>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor(task.priority)}`}>{task.priority}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{task.dueDate}</span>
                        <span className={`font-medium ${daysLeft <= 1 ? 'text-red-500' : daysLeft <= 3 ? 'text-yellow-500' : 'text-green-500'}`}>
                          {daysLeft <= 0 ? 'Due today' : `${daysLeft} days left`}
                        </span>
                        <span>{task.category}</span>
                        {task.subtasks.length > 0 && <span>{subtasksDone}/{task.subtasks.length} subtasks</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setExpandedTask(isExpanded ? null : task.id)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                      </button>
                      <button onClick={() => deleteTask(task.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-gray-50">
                      {task.description && <p className="text-sm text-gray-500 mb-3">{task.description}</p>}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Est. {task.estimatedHours}h</span>
                      </div>
                      {task.subtasks.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Subtasks</p>
                          {task.subtasks.map(sub => (
                            <button key={sub.id} onClick={() => toggleSubtask(task.id, sub.id)}
                              className="flex items-center gap-2 w-full text-left text-sm hover:bg-gray-50 px-2 py-1 rounded-lg transition">
                              {sub.done ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                              )}
                              <span className={sub.done ? 'line-through text-gray-400' : 'text-gray-700'}>{sub.text}</span>
                            </button>
                          ))}
                          {/* Progress */}
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-green-500 rounded-full transition-all"
                              style={{ width: `${task.subtasks.length > 0 ? (subtasksDone / task.subtasks.length) * 100 : 0}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Priority Suggestions */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">🤖 AI Priority Suggestions</h3>
            <div className="space-y-3">
              {activeTasks.sort((a, b) => {
                const aDays = Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / 86400000);
                const bDays = Math.ceil((new Date(b.dueDate).getTime() - Date.now()) / 86400000);
                const aScore = (a.priority === 'high' ? 3 : a.priority === 'medium' ? 2 : 1) * (1 / Math.max(1, aDays));
                const bScore = (b.priority === 'high' ? 3 : b.priority === 'medium' ? 2 : 1) * (1 / Math.max(1, bDays));
                return bScore - aScore;
              }).slice(0, 4).map((t, i) => (
                <div key={t.id} className="flex items-center gap-3 p-3 bg-white/70 rounded-xl">
                  <span className="text-lg font-bold text-indigo-600">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                    <p className="text-xs text-gray-500">{t.category} • {t.estimatedHours}h</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${priorityDot(t.priority)}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-3">📅 Google Calendar</h3>
            <div className="text-center py-6 text-gray-400">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Connect Google Calendar to sync your classes</p>
              <button className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
                Connect Calendar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddTask(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Task</h3>
            <div className="space-y-4">
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Task title" />
              <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-20"
                placeholder="Description (optional)" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Due Date</label>
                  <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Priority</label>
                  <select value={newPriority} onChange={e => setNewPriority(e.target.value as any)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Category</label>
                  <input value={newCategory} onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Math" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Estimated Hours</label>
                  <input type="number" min={0.5} step={0.5} value={newHours} onChange={e => setNewHours(Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              {/* Subtasks */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Subtasks</label>
                <div className="flex gap-2 mb-2">
                  <input value={newSubtaskText} onChange={e => setNewSubtaskText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSubtask()}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="Add a subtask" />
                  <button onClick={addSubtask} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm hover:bg-gray-200">Add</button>
                </div>
                {newSubtasks.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 py-1">
                    <Circle className="w-3.5 h-3.5 text-gray-300" />
                    <span className="flex-1">{s}</span>
                    <button onClick={() => setNewSubtasks(newSubtasks.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">×</button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddTask(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={handleAddTask} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">Add Task</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
