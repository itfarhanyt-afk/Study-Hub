import { create } from 'zustand';
import { v4 as uuid } from 'uuid';

// ============ TYPES ============

export type View = 'login' | 'signup' | 'onboarding' | 'dashboard' | 'notes' | 'note-editor' | 'flashcards' | 'flashcard-study' | 'focus' | 'planner' | 'courses' | 'course-player' | 'profile' | 'search';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  level: string;
  subjects: string[];
  dailyGoal: string;
  streak: number;
  totalHours: number;
  cardsMastered: number;
  notesCreated: number;
  joinDate: string;
  isPublic: boolean;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  isExpanded: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  difficulty: number; // 0-1
  nextReview: string;
  interval: number; // days
  easeFactor: number;
  reviewCount: number;
  lastReviewed: string | null;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  description: string;
  color: string;
  cardCount: number;
  mastered: number;
  createdAt: string;
}

export interface FocusSession {
  id: string;
  duration: number; // minutes
  type: 'pomodoro' | 'countdown' | 'stopwatch';
  completedAt: string;
  treeType: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  subtasks: { id: string; text: string; done: boolean }[];
  category: string;
  estimatedHours: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  modules: CourseModule[];
  progress: number;
  thumbnail: string;
  category: string;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: CourseLesson[];
  quizScore: number | null;
}

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  type: 'video' | 'reading' | 'quiz';
}

export interface TreeReward {
  id: string;
  type: string;
  earnedAt: string;
  sessionMinutes: number;
}

interface AppState {
  // Auth
  currentView: View;
  isAuthenticated: boolean;
  user: User | null;
  
  // Notes
  folders: Folder[];
  notes: Note[];
  activeNoteId: string | null;
  activeFolderId: string | null;
  
  // Flashcards
  decks: FlashcardDeck[];
  flashcards: Flashcard[];
  activeDeckId: string | null;
  studyMode: 'study' | 'write' | 'mcq' | 'match' | null;
  
  // Focus
  focusSessions: FocusSession[];
  trees: TreeReward[];
  activeTimer: { running: boolean; seconds: number; mode: 'pomodoro' | 'countdown' | 'stopwatch'; targetSeconds: number } | null;
  
  // Tasks
  tasks: Task[];
  
  // Courses
  courses: Course[];
  activeCourseId: string | null;
  
  // Search
  searchQuery: string;
  
  // Actions
  setView: (view: View) => void;
  login: (email: string, password: string) => void;
  signup: (name: string, email: string, password: string) => void;
  completeOnboarding: (level: string, subjects: string[], goal: string) => void;
  logout: () => void;
  
  // Note actions
  createFolder: (name: string, parentId: string | null) => void;
  toggleFolder: (id: string) => void;
  createNote: (folderId: string | null) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  setActiveNote: (id: string | null) => void;
  setActiveFolder: (id: string | null) => void;
  
  // Flashcard actions
  createDeck: (name: string, description: string, color: string) => void;
  deleteDeck: (id: string) => void;
  addFlashcard: (deckId: string, front: string, back: string) => void;
  deleteFlashcard: (id: string) => void;
  reviewFlashcard: (id: string, quality: number) => void;
  setActiveDeck: (id: string | null) => void;
  setStudyMode: (mode: 'study' | 'write' | 'mcq' | 'match' | null) => void;
  
  // Focus actions
  startTimer: (mode: 'pomodoro' | 'countdown' | 'stopwatch', targetMinutes: number) => void;
  stopTimer: () => void;
  completeFocusSession: (minutes: number, type: string) => void;
  
  // Task actions
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  
  // Course actions
  setActiveCourse: (id: string | null) => void;
  toggleLessonComplete: (courseId: string, moduleId: string, lessonId: string) => void;
  setQuizScore: (courseId: string, moduleId: string, score: number) => void;
  
  // Search
  setSearchQuery: (q: string) => void;
  
  // Profile
  updateProfile: (updates: Partial<User>) => void;
}

const TREE_TYPES = ['🌱', '🌿', '🌳', '🌲', '🌴', '🎋', '🎄', '🌸', '💐', '🌻'];
const DECK_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];

// Sample data
const sampleFolders: Folder[] = [
  { id: 'f1', name: 'Computer Science', parentId: null, isExpanded: true },
  { id: 'f2', name: 'Data Structures', parentId: 'f1', isExpanded: false },
  { id: 'f3', name: 'Algorithms', parentId: 'f1', isExpanded: false },
  { id: 'f4', name: 'Mathematics', parentId: null, isExpanded: false },
  { id: 'f5', name: 'Linear Algebra', parentId: 'f4', isExpanded: false },
  { id: 'f6', name: 'Physics', parentId: null, isExpanded: false },
];

const sampleNotes: Note[] = [
  {
    id: 'n1', title: 'Binary Search Trees', folderId: 'f2',
    content: '# Binary Search Trees\n\nA BST is a binary tree where each node has a value greater than all values in its left subtree and less than all values in its right subtree.\n\n## Key Operations\n- **Search**: O(log n) average\n- **Insert**: O(log n) average\n- **Delete**: O(log n) average\n\n## Properties\n1. Left subtree contains only nodes with keys less than the parent\n2. Right subtree contains only nodes with keys greater than the parent\n3. Both subtrees are also BSTs\n\n> Important: In the worst case, a BST can degenerate into a linked list with O(n) operations.\n\n## Code Example\n```python\nclass Node:\n    def __init__(self, val):\n        self.val = val\n        self.left = None\n        self.right = None\n```\n\n- [x] Understand BST basics\n- [x] Implement insertion\n- [ ] Implement deletion\n- [ ] Practice balancing',
    tags: ['data-structures', 'trees', 'algorithms'],
    createdAt: '2025-01-15T10:00:00Z', updatedAt: '2025-01-16T14:30:00Z', isPinned: true
  },
  {
    id: 'n2', title: 'Sorting Algorithms Comparison', folderId: 'f3',
    content: '# Sorting Algorithms\n\n## Quick Sort\n- Average: O(n log n)\n- Worst: O(n²)\n- Space: O(log n)\n- **Unstable** sort\n\n## Merge Sort\n- Average: O(n log n)\n- Worst: O(n log n)\n- Space: O(n)\n- **Stable** sort\n\n## Heap Sort\n- Average: O(n log n)\n- Worst: O(n log n)\n- Space: O(1)\n- **Unstable** sort\n\n> Use merge sort when stability matters, quick sort for average-case performance.',
    tags: ['algorithms', 'sorting'],
    createdAt: '2025-01-14T09:00:00Z', updatedAt: '2025-01-14T09:00:00Z', isPinned: false
  },
  {
    id: 'n3', title: 'Matrix Operations', folderId: 'f5',
    content: '# Matrix Operations\n\n## Addition\nMatrices must have the same dimensions.\n\n## Multiplication\nColumns of A must equal rows of B.\nResulting matrix: rows of A × columns of B\n\n## Determinant\nOnly for square matrices.\n\n## Inverse\nA matrix A has inverse A⁻¹ if det(A) ≠ 0.',
    tags: ['linear-algebra', 'matrices'],
    createdAt: '2025-01-13T11:00:00Z', updatedAt: '2025-01-13T11:00:00Z', isPinned: false
  },
];

const sampleDecks: FlashcardDeck[] = [
  { id: 'd1', name: 'Data Structures', description: 'Core DS concepts and operations', color: '#6366f1', cardCount: 5, mastered: 2, createdAt: '2025-01-10T08:00:00Z' },
  { id: 'd2', name: 'Spanish Vocabulary', description: 'Common Spanish words and phrases', color: '#22c55e', cardCount: 4, mastered: 1, createdAt: '2025-01-12T08:00:00Z' },
  { id: 'd3', name: 'Biology - Cell Division', description: 'Mitosis and Meiosis key terms', color: '#ec4899', cardCount: 3, mastered: 0, createdAt: '2025-01-14T08:00:00Z' },
];

const sampleFlashcards: Flashcard[] = [
  { id: 'fc1', deckId: 'd1', front: 'What is the time complexity of binary search?', back: 'O(log n) - It halves the search space each step.', difficulty: 0.3, nextReview: '2025-01-17T08:00:00Z', interval: 1, easeFactor: 2.5, reviewCount: 3, lastReviewed: '2025-01-16T08:00:00Z' },
  { id: 'fc2', deckId: 'd1', front: 'What is a hash table collision?', back: 'When two different keys hash to the same index. Resolved via chaining or open addressing.', difficulty: 0.5, nextReview: '2025-01-16T08:00:00Z', interval: 1, easeFactor: 2.3, reviewCount: 2, lastReviewed: '2025-01-15T08:00:00Z' },
  { id: 'fc3', deckId: 'd1', front: 'What is the difference between a stack and a queue?', back: 'Stack: LIFO (Last In, First Out)\nQueue: FIFO (First In, First Out)', difficulty: 0.1, nextReview: '2025-01-20T08:00:00Z', interval: 4, easeFactor: 2.7, reviewCount: 5, lastReviewed: '2025-01-16T08:00:00Z' },
  { id: 'fc4', deckId: 'd1', front: 'What is a balanced BST?', back: 'A BST where the height difference between left and right subtrees is at most 1. Examples: AVL tree, Red-Black tree.', difficulty: 0.6, nextReview: '2025-01-16T08:00:00Z', interval: 1, easeFactor: 2.1, reviewCount: 1, lastReviewed: '2025-01-15T08:00:00Z' },
  { id: 'fc5', deckId: 'd1', front: 'What is Big-O notation?', back: 'A mathematical notation describing the upper bound of an algorithm\'s growth rate as input size approaches infinity.', difficulty: 0.2, nextReview: '2025-01-18T08:00:00Z', interval: 2, easeFactor: 2.5, reviewCount: 4, lastReviewed: '2025-01-16T08:00:00Z' },
  { id: 'fc6', deckId: 'd2', front: 'Hola', back: 'Hello', difficulty: 0.1, nextReview: '2025-01-20T08:00:00Z', interval: 4, easeFactor: 2.8, reviewCount: 6, lastReviewed: '2025-01-16T08:00:00Z' },
  { id: 'fc7', deckId: 'd2', front: 'Gracias', back: 'Thank you', difficulty: 0.2, nextReview: '2025-01-19T08:00:00Z', interval: 3, easeFactor: 2.6, reviewCount: 4, lastReviewed: '2025-01-16T08:00:00Z' },
  { id: 'fc8', deckId: 'd2', front: 'Buenos días', back: 'Good morning', difficulty: 0.4, nextReview: '2025-01-17T08:00:00Z', interval: 1, easeFactor: 2.3, reviewCount: 2, lastReviewed: '2025-01-16T08:00:00Z' },
  { id: 'fc9', deckId: 'd2', front: 'Por favor', back: 'Please', difficulty: 0.3, nextReview: '2025-01-18T08:00:00Z', interval: 2, easeFactor: 2.5, reviewCount: 3, lastReviewed: '2025-01-16T08:00:00Z' },
  { id: 'fc10', deckId: 'd3', front: 'What are the phases of mitosis?', back: 'Prophase, Metaphase, Anaphase, Telophase (PMAT)', difficulty: 0.5, nextReview: '2025-01-16T08:00:00Z', interval: 1, easeFactor: 2.3, reviewCount: 1, lastReviewed: '2025-01-15T08:00:00Z' },
  { id: 'fc11', deckId: 'd3', front: 'How many daughter cells does meiosis produce?', back: '4 haploid daughter cells', difficulty: 0.7, nextReview: '2025-01-16T08:00:00Z', interval: 1, easeFactor: 2.0, reviewCount: 1, lastReviewed: '2025-01-15T08:00:00Z' },
  { id: 'fc12', deckId: 'd3', front: 'What is crossing over?', back: 'Exchange of genetic material between homologous chromosomes during Prophase I of meiosis, increasing genetic diversity.', difficulty: 0.8, nextReview: '2025-01-16T08:00:00Z', interval: 1, easeFactor: 1.8, reviewCount: 0, lastReviewed: null },
];

const sampleTasks: Task[] = [
  { id: 't1', title: 'Complete Algorithm Assignment #5', description: 'Implement quicksort and mergesort with analysis', dueDate: '2025-01-20', priority: 'high', completed: false, subtasks: [{ id: 's1', text: 'Implement quicksort', done: true }, { id: 's2', text: 'Implement mergesort', done: false }, { id: 's3', text: 'Write time complexity analysis', done: false }], category: 'Computer Science', estimatedHours: 4 },
  { id: 't2', title: 'Study for Linear Algebra Midterm', description: 'Review chapters 3-5', dueDate: '2025-01-22', priority: 'high', completed: false, subtasks: [{ id: 's4', text: 'Review eigenvalues', done: false }, { id: 's5', text: 'Practice matrix operations', done: true }, { id: 's6', text: 'Solve practice problems', done: false }], category: 'Mathematics', estimatedHours: 6 },
  { id: 't3', title: 'Read Chapter 8 - Physics', description: 'Thermodynamics introduction', dueDate: '2025-01-18', priority: 'medium', completed: false, subtasks: [{ id: 's7', text: 'Read chapter', done: false }, { id: 's8', text: 'Take notes', done: false }], category: 'Physics', estimatedHours: 2 },
  { id: 't4', title: 'Spanish Quiz Preparation', description: 'Review vocabulary for Unit 3', dueDate: '2025-01-19', priority: 'medium', completed: false, subtasks: [], category: 'Languages', estimatedHours: 1 },
  { id: 't5', title: 'Submit Lab Report', description: 'Biology lab report on cell division', dueDate: '2025-01-17', priority: 'high', completed: true, subtasks: [], category: 'Biology', estimatedHours: 3 },
];

const sampleCourses: Course[] = [
  {
    id: 'c1', title: 'Introduction to Algorithms', description: 'Master fundamental algorithms and data structures', progress: 45, thumbnail: '📊', category: 'Computer Science',
    modules: [
      { id: 'm1', title: 'Sorting Basics', quizScore: 85, lessons: [
        { id: 'l1', title: 'Introduction to Sorting', duration: '12:30', completed: true, type: 'video' },
        { id: 'l2', title: 'Bubble Sort', duration: '15:45', completed: true, type: 'video' },
        { id: 'l3', title: 'Selection Sort', duration: '10:20', completed: true, type: 'video' },
        { id: 'l4', title: 'Module Quiz', duration: '10 questions', completed: true, type: 'quiz' },
      ]},
      { id: 'm2', title: 'Advanced Sorting', quizScore: null, lessons: [
        { id: 'l5', title: 'Merge Sort Deep Dive', duration: '20:15', completed: true, type: 'video' },
        { id: 'l6', title: 'Quick Sort Analysis', duration: '18:30', completed: false, type: 'video' },
        { id: 'l7', title: 'Heap Sort', duration: '16:45', completed: false, type: 'video' },
        { id: 'l8', title: 'Module Quiz', duration: '10 questions', completed: false, type: 'quiz' },
      ]},
      { id: 'm3', title: 'Graph Algorithms', quizScore: null, lessons: [
        { id: 'l9', title: 'Graph Representations', duration: '14:00', completed: false, type: 'video' },
        { id: 'l10', title: 'BFS and DFS', duration: '22:30', completed: false, type: 'video' },
        { id: 'l11', title: 'Module Quiz', duration: '10 questions', completed: false, type: 'quiz' },
      ]},
    ]
  },
  {
    id: 'c2', title: 'Calculus Fundamentals', description: 'From limits to integrals', progress: 20, thumbnail: '📐', category: 'Mathematics',
    modules: [
      { id: 'm4', title: 'Limits & Continuity', quizScore: 90, lessons: [
        { id: 'l12', title: 'What are Limits?', duration: '15:00', completed: true, type: 'video' },
        { id: 'l13', title: 'Limit Laws', duration: '12:00', completed: true, type: 'video' },
        { id: 'l14', title: 'Module Quiz', duration: '8 questions', completed: true, type: 'quiz' },
      ]},
      { id: 'm5', title: 'Derivatives', quizScore: null, lessons: [
        { id: 'l15', title: 'Introduction to Derivatives', duration: '18:00', completed: false, type: 'video' },
        { id: 'l16', title: 'Power Rule', duration: '10:00', completed: false, type: 'video' },
        { id: 'l17', title: 'Chain Rule', duration: '14:00', completed: false, type: 'video' },
        { id: 'l18', title: 'Module Quiz', duration: '10 questions', completed: false, type: 'quiz' },
      ]},
    ]
  },
  {
    id: 'c3', title: 'Spanish for Beginners', description: 'Learn conversational Spanish', progress: 60, thumbnail: '🇪🇸', category: 'Languages',
    modules: [
      { id: 'm6', title: 'Greetings & Basics', quizScore: 95, lessons: [
        { id: 'l19', title: 'Hello & Goodbye', duration: '8:00', completed: true, type: 'video' },
        { id: 'l20', title: 'Numbers 1-100', duration: '12:00', completed: true, type: 'video' },
        { id: 'l21', title: 'Module Quiz', duration: '10 questions', completed: true, type: 'quiz' },
      ]},
      { id: 'm7', title: 'Common Phrases', quizScore: 80, lessons: [
        { id: 'l22', title: 'At the Restaurant', duration: '15:00', completed: true, type: 'video' },
        { id: 'l23', title: 'Asking for Directions', duration: '12:00', completed: true, type: 'video' },
        { id: 'l24', title: 'Module Quiz', duration: '8 questions', completed: true, type: 'quiz' },
      ]},
      { id: 'm8', title: 'Verb Conjugation', quizScore: null, lessons: [
        { id: 'l25', title: 'Present Tense Regulars', duration: '20:00', completed: false, type: 'video' },
        { id: 'l26', title: 'Irregular Verbs', duration: '18:00', completed: false, type: 'video' },
        { id: 'l27', title: 'Module Quiz', duration: '10 questions', completed: false, type: 'quiz' },
      ]},
    ]
  },
];

const sampleTrees: TreeReward[] = [
  { id: 'tr1', type: '🌳', earnedAt: '2025-01-16T10:00:00Z', sessionMinutes: 25 },
  { id: 'tr2', type: '🌲', earnedAt: '2025-01-16T14:00:00Z', sessionMinutes: 25 },
  { id: 'tr3', type: '🌴', earnedAt: '2025-01-15T09:00:00Z', sessionMinutes: 50 },
  { id: 'tr4', type: '🌸', earnedAt: '2025-01-15T16:00:00Z', sessionMinutes: 25 },
  { id: 'tr5', type: '🌱', earnedAt: '2025-01-14T11:00:00Z', sessionMinutes: 25 },
  { id: 'tr6', type: '🌿', earnedAt: '2025-01-14T15:00:00Z', sessionMinutes: 45 },
  { id: 'tr7', type: '🎋', earnedAt: '2025-01-13T10:00:00Z', sessionMinutes: 25 },
  { id: 'tr8', type: '🌻', earnedAt: '2025-01-13T14:00:00Z', sessionMinutes: 25 },
  { id: 'tr9', type: '🌳', earnedAt: '2025-01-12T09:00:00Z', sessionMinutes: 60 },
  { id: 'tr10', type: '💐', earnedAt: '2025-01-12T16:00:00Z', sessionMinutes: 25 },
];

export const useStore = create<AppState>((set, get) => ({
  currentView: 'login',
  isAuthenticated: false,
  user: null,
  
  folders: sampleFolders,
  notes: sampleNotes,
  activeNoteId: null,
  activeFolderId: null,
  
  decks: sampleDecks,
  flashcards: sampleFlashcards,
  activeDeckId: null,
  studyMode: null,
  
  focusSessions: [],
  trees: sampleTrees,
  activeTimer: null,
  
  tasks: sampleTasks,
  
  courses: sampleCourses,
  activeCourseId: null,
  
  searchQuery: '',
  
  setView: (view) => set({ currentView: view }),
  
  login: (_email, _password) => {
    set({
      isAuthenticated: true,
      currentView: 'dashboard',
      user: {
        id: uuid(),
        name: 'Alex Johnson',
        email: _email,
        avatar: '👨‍🎓',
        level: 'University',
        subjects: ['Computer Science', 'Mathematics', 'Physics'],
        dailyGoal: 'Focus for 2 hours',
        streak: 12,
        totalHours: 156,
        cardsMastered: 234,
        notesCreated: 47,
        joinDate: '2024-09-01',
        isPublic: true,
      }
    });
  },
  
  signup: (name, email, _password) => {
    set({
      isAuthenticated: true,
      currentView: 'onboarding',
      user: {
        id: uuid(),
        name,
        email,
        avatar: '👨‍🎓',
        level: '',
        subjects: [],
        dailyGoal: '',
        streak: 0,
        totalHours: 0,
        cardsMastered: 0,
        notesCreated: 0,
        joinDate: new Date().toISOString().split('T')[0],
        isPublic: true,
      }
    });
  },
  
  completeOnboarding: (level, subjects, goal) => {
    set(state => ({
      currentView: 'dashboard',
      user: state.user ? { ...state.user, level, subjects, dailyGoal: goal } : null
    }));
  },
  
  logout: () => set({ isAuthenticated: false, user: null, currentView: 'login' }),
  
  createFolder: (name, parentId) => {
    const newFolder: Folder = { id: uuid(), name, parentId, isExpanded: false };
    set(state => ({ folders: [...state.folders, newFolder] }));
  },
  
  toggleFolder: (id) => set(state => ({
    folders: state.folders.map(f => f.id === id ? { ...f, isExpanded: !f.isExpanded } : f)
  })),
  
  createNote: (folderId) => {
    const newNote: Note = {
      id: uuid(), title: 'Untitled Note', content: '', folderId, tags: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isPinned: false
    };
    set(state => ({
      notes: [...state.notes, newNote],
      activeNoteId: newNote.id,
      currentView: 'note-editor'
    }));
  },
  
  updateNote: (id, updates) => set(state => ({
    notes: state.notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n)
  })),
  
  deleteNote: (id) => set(state => ({
    notes: state.notes.filter(n => n.id !== id),
    activeNoteId: state.activeNoteId === id ? null : state.activeNoteId
  })),
  
  setActiveNote: (id) => set({ activeNoteId: id }),
  setActiveFolder: (id) => set({ activeFolderId: id }),
  
  createDeck: (name, description, color) => {
    const newDeck: FlashcardDeck = {
      id: uuid(), name, description, color: color || DECK_COLORS[Math.floor(Math.random() * DECK_COLORS.length)],
      cardCount: 0, mastered: 0, createdAt: new Date().toISOString()
    };
    set(state => ({ decks: [...state.decks, newDeck] }));
  },
  
  deleteDeck: (id) => set(state => ({
    decks: state.decks.filter(d => d.id !== id),
    flashcards: state.flashcards.filter(f => f.deckId !== id)
  })),
  
  addFlashcard: (deckId, front, back) => {
    const newCard: Flashcard = {
      id: uuid(), deckId, front, back, difficulty: 0.5,
      nextReview: new Date().toISOString(), interval: 1, easeFactor: 2.5,
      reviewCount: 0, lastReviewed: null
    };
    set(state => ({
      flashcards: [...state.flashcards, newCard],
      decks: state.decks.map(d => d.id === deckId ? { ...d, cardCount: d.cardCount + 1 } : d)
    }));
  },
  
  deleteFlashcard: (id) => {
    const card = get().flashcards.find(f => f.id === id);
    if (!card) return;
    set(state => ({
      flashcards: state.flashcards.filter(f => f.id !== id),
      decks: state.decks.map(d => d.id === card.deckId ? { ...d, cardCount: Math.max(0, d.cardCount - 1) } : d)
    }));
  },
  
  reviewFlashcard: (id, quality) => {
    // SM-2 algorithm simplified
    set(state => ({
      flashcards: state.flashcards.map(card => {
        if (card.id !== id) return card;
        let { easeFactor, interval } = card;
        easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
        if (quality < 3) {
          interval = 1;
        } else {
          if (card.reviewCount === 0) interval = 1;
          else if (card.reviewCount === 1) interval = 6;
          else interval = Math.round(interval * easeFactor);
        }
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + interval);
        return {
          ...card,
          easeFactor,
          interval,
          difficulty: Math.max(0, Math.min(1, 1 - quality / 5)),
          nextReview: nextReview.toISOString(),
          reviewCount: card.reviewCount + 1,
          lastReviewed: new Date().toISOString()
        };
      })
    }));
  },
  
  setActiveDeck: (id) => set({ activeDeckId: id }),
  setStudyMode: (mode) => set({ studyMode: mode }),
  
  startTimer: (mode, targetMinutes) => set({
    activeTimer: { running: true, seconds: 0, mode, targetSeconds: targetMinutes * 60 }
  }),
  
  stopTimer: () => set({ activeTimer: null }),
  
  completeFocusSession: (minutes, type) => {
    const tree: TreeReward = {
      id: uuid(), type: TREE_TYPES[Math.floor(Math.random() * TREE_TYPES.length)],
      earnedAt: new Date().toISOString(), sessionMinutes: minutes
    };
    const session: FocusSession = {
      id: uuid(), duration: minutes, type: type as any,
      completedAt: new Date().toISOString(), treeType: tree.type
    };
    set(state => ({
      trees: [...state.trees, tree],
      focusSessions: [...state.focusSessions, session],
      activeTimer: null,
      user: state.user ? { ...state.user, totalHours: state.user.totalHours + minutes / 60 } : null
    }));
  },
  
  addTask: (task) => set(state => ({
    tasks: [...state.tasks, { ...task, id: uuid() }]
  })),
  
  updateTask: (id, updates) => set(state => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
  })),
  
  deleteTask: (id) => set(state => ({
    tasks: state.tasks.filter(t => t.id !== id)
  })),
  
  toggleTask: (id) => set(state => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
  })),
  
  toggleSubtask: (taskId, subtaskId) => set(state => ({
    tasks: state.tasks.map(t => t.id === taskId ? {
      ...t,
      subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, done: !s.done } : s)
    } : t)
  })),
  
  setActiveCourse: (id) => set({ activeCourseId: id }),
  
  toggleLessonComplete: (courseId, moduleId, lessonId) => set(state => {
    const courses = state.courses.map(c => {
      if (c.id !== courseId) return c;
      const modules = c.modules.map(m => {
        if (m.id !== moduleId) return m;
        const lessons = m.lessons.map(l => l.id === lessonId ? { ...l, completed: !l.completed } : l);
        return { ...m, lessons };
      });
      const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
      const completedLessons = modules.reduce((sum, m) => sum + m.lessons.filter(l => l.completed).length, 0);
      const progress = Math.round((completedLessons / totalLessons) * 100);
      return { ...c, modules, progress };
    });
    return { courses };
  }),
  
  setQuizScore: (courseId, moduleId, score) => set(state => ({
    courses: state.courses.map(c => c.id !== courseId ? c : {
      ...c,
      modules: c.modules.map(m => m.id !== moduleId ? m : { ...m, quizScore: score })
    })
  })),
  
  setSearchQuery: (q) => set({ searchQuery: q }),
  
  updateProfile: (updates) => set(state => ({
    user: state.user ? { ...state.user, ...updates } : null
  })),
}));
