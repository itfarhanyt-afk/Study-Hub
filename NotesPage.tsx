import { useState } from 'react';
import { useStore } from '../store';
import { FolderOpen, ChevronRight, ChevronDown, Plus, FileText, Search, Pin, Trash2, MoreVertical, FolderPlus } from 'lucide-react';

export default function NotesPage() {
  const { folders, notes, setView, setActiveNote, createNote, createFolder, toggleFolder, deleteNote, updateNote, activeFolderId, setActiveFolder } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [contextMenu, setContextMenu] = useState<string | null>(null);

  const filteredNotes = notes.filter(n =>
    (!activeFolderId || n.folderId === activeFolderId) &&
    (!searchTerm || n.title.toLowerCase().includes(searchTerm.toLowerCase()) || n.content.toLowerCase().includes(searchTerm.toLowerCase()) || n.tags.some(t => t.includes(searchTerm.toLowerCase())))
  );

  const getRootFolders = () => folders.filter(f => f.parentId === null);
  const getChildFolders = (parentId: string) => folders.filter(f => f.parentId === parentId);
  const getFolderNoteCount = (folderId: string): number => {
    const directNotes = notes.filter(n => n.folderId === folderId).length;
    const childFolders = getChildFolders(folderId);
    return directNotes + childFolders.reduce((sum, f) => sum + getFolderNoteCount(f.id), 0);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim(), activeFolderId);
      setNewFolderName('');
      setShowNewFolder(false);
    }
  };

  const renderFolder = (folder: typeof folders[0], depth: number = 0) => {
    const children = getChildFolders(folder.id);
    const noteCount = getFolderNoteCount(folder.id);
    const isActive = activeFolderId === folder.id;

    return (
      <div key={folder.id}>
        <button
          onClick={() => { setActiveFolder(isActive ? null : folder.id); toggleFolder(folder.id); }}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          {children.length > 0 ? (
            folder.isExpanded ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />
          ) : <div className="w-4" />}
          <FolderOpen className="w-4 h-4 shrink-0 text-yellow-500" />
          <span className="flex-1 text-left truncate">{folder.name}</span>
          <span className="text-xs text-gray-400">{noteCount}</span>
        </button>
        {folder.isExpanded && children.map(child => renderFolder(child, depth + 1))}
      </div>
    );
  };

  const templates = [
    { name: '📝 Lecture Notes', desc: 'Structured lecture template' },
    { name: '📖 Book Summary', desc: 'Chapter-by-chapter summary' },
    { name: '🔬 Lab Report', desc: 'Scientific lab report format' },
    { name: '📋 Project Plan', desc: 'Project planning outline' },
    { name: '📊 Revision Outline', desc: 'Exam revision structure' },
  ];

  return (
    <div className="flex h-full">
      {/* Sidebar - Folders */}
      <div className="w-64 border-r border-gray-100 bg-white flex flex-col shrink-0 hidden md:flex">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">Folders</h3>
            <button onClick={() => setShowNewFolder(true)} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
              <FolderPlus className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          {showNewFolder && (
            <div className="flex gap-2 mb-2">
              <input value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Folder name" autoFocus />
              <button onClick={handleCreateFolder} className="px-2 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
                Add
              </button>
            </div>
          )}
          <button onClick={() => setActiveFolder(null)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${!activeFolderId ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <FileText className="w-4 h-4" />
            <span className="flex-1 text-left">All Notes</span>
            <span className="text-xs text-gray-400">{notes.length}</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {getRootFolders().map(f => renderFolder(f))}
        </div>

        {/* Templates */}
        <div className="p-4 border-t border-gray-100">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Templates</h4>
          <div className="space-y-1">
            {templates.map((t, i) => (
              <button key={i} onClick={() => createNote(activeFolderId)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition text-left">
                <span className="text-xs">{t.name.split(' ')[0]}</span>
                <span className="truncate">{t.name.split(' ').slice(1).join(' ')}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 lg:p-6 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {activeFolderId ? folders.find(f => f.id === activeFolderId)?.name : 'All Notes'}
            </h2>
            <button onClick={() => createNote(activeFolderId)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition active:scale-95">
              <Plus className="w-4 h-4" /> New Note
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Search notes by title, content, or tags..." />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No notes yet</h3>
              <p className="text-gray-400 mb-4">Create your first note to get started</p>
              <button onClick={() => createNote(activeFolderId)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
                Create Note
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map(note => (
                <div key={note.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all cursor-pointer group relative"
                  onClick={() => { setActiveNote(note.id); setView('note-editor'); }}>
                  <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={e => { e.stopPropagation(); updateNote(note.id, { isPinned: !note.isPinned }); }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg"><Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'text-indigo-600 fill-indigo-600' : 'text-gray-400'}`} /></button>
                    <button onClick={e => { e.stopPropagation(); setContextMenu(contextMenu === note.id ? null : note.id); }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg"><MoreVertical className="w-3.5 h-3.5 text-gray-400" /></button>
                  </div>
                  {contextMenu === note.id && (
                    <div className="absolute top-10 right-3 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-10">
                      <button onClick={e => { e.stopPropagation(); deleteNote(note.id); setContextMenu(null); }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  )}
                  {note.isPinned && <span className="text-xs mb-2 inline-block">📌 Pinned</span>}
                  <h3 className="font-semibold text-gray-900 mb-2 truncate">{note.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-3 mb-3">{note.content.replace(/[#*`>[\]()]/g, '').slice(0, 150)}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">{tag}</span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{new Date(note.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
