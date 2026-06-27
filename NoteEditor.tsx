import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { ArrowLeft, Save, Pin, Tag, Clock, Bold, Italic, Heading1, Heading2, Code, Quote, List, CheckSquare, Minus, Image, Link2, BrainCircuit } from 'lucide-react';

export default function NoteEditor() {
  const { activeNoteId, notes, updateNote, setView, setActiveNote, folders } = useStore();
  const note = notes.find(n => n.id === activeNoteId);
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags.join(', ') || '');
  const [saved, setSaved] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (note) { setTitle(note.title); setContent(note.content); setTags(note.tags.join(', ')); }
  }, [note?.id]);

  const handleSave = () => {
    if (!activeNoteId) return;
    updateNote(activeNoteId, {
      title, content,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean)
    });
    setSaved(true);
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.getElementById('editor') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const newContent = content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(newContent);
    setSaved(false);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const renderMarkdown = (text: string) => {
    let html = text
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-gray-800 mt-4 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-gray-800 mt-5 mb-2">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-gray-900 mt-6 mb-3">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600">$1</code>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-indigo-300 pl-4 py-1 my-2 text-gray-600 bg-indigo-50/50 rounded-r">$1</blockquote>')
      .replace(/^- \[x\] (.+)$/gm, '<div class="flex items-center gap-2 my-1"><input type="checkbox" checked disabled class="rounded" /><span class="line-through text-gray-400">$1</span></div>')
      .replace(/^- \[ \] (.+)$/gm, '<div class="flex items-center gap-2 my-1"><input type="checkbox" disabled class="rounded" /><span>$1</span></div>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 my-0.5 list-disc">$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 my-0.5 list-decimal">$1</li>')
      .replace(/^---$/gm, '<hr class="my-4 border-gray-200" />')
      .replace(/\n/g, '<br />');
    
    // Handle code blocks
    html = html.replace(/```(\w+)?\s*<br \/>([\s\S]*?)```/g, '<pre class="bg-gray-900 text-green-400 p-4 rounded-xl my-3 overflow-x-auto text-sm font-mono"><code>$2</code></pre>');
    
    return html;
  };

  if (!note) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-400">Select a note to edit</p>
    </div>
  );

  const folder = folders.find(f => f.id === note.folderId);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-100 px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => { handleSave(); setActiveNote(null); setView('notes'); }}
              className="p-2 hover:bg-gray-100 rounded-xl transition">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                {folder && <><span>{folder.name}</span><span>/</span></>}
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(note.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => updateNote(note.id, { isPinned: !note.isPinned })}
              className={`p-2 rounded-xl transition ${note.isPinned ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100 text-gray-400'}`}>
              <Pin className="w-4 h-4" />
            </button>
            <button onClick={() => setShowPreview(!showPreview)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition ${showPreview ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100 text-gray-600'}`}>
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${saved ? 'bg-green-50 text-green-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
              <Save className="w-4 h-4" /> {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* Formatting toolbar */}
        {!showPreview && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {[
              { icon: Heading1, action: () => insertMarkdown('# '), label: 'H1' },
              { icon: Heading2, action: () => insertMarkdown('## '), label: 'H2' },
              { icon: Bold, action: () => insertMarkdown('**', '**'), label: 'Bold' },
              { icon: Italic, action: () => insertMarkdown('*', '*'), label: 'Italic' },
              { icon: Code, action: () => insertMarkdown('`', '`'), label: 'Code' },
              { icon: Quote, action: () => insertMarkdown('> '), label: 'Quote' },
              { icon: List, action: () => insertMarkdown('- '), label: 'List' },
              { icon: CheckSquare, action: () => insertMarkdown('- [ ] '), label: 'Todo' },
              { icon: Minus, action: () => insertMarkdown('\n---\n'), label: 'Divider' },
              { icon: Image, action: () => insertMarkdown('![alt](', ')'), label: 'Image' },
              { icon: Link2, action: () => insertMarkdown('[text](', ')'), label: 'Link' },
            ].map((btn, i) => (
              <button key={i} onClick={btn.action} title={btn.label}
                className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500 hover:text-gray-700 shrink-0">
                <btn.icon className="w-4 h-4" />
              </button>
            ))}
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <button onClick={() => {
              const lines = content.split('\n').filter(l => l.trim());
              const cards = lines.slice(0, 5).map(l => ({ front: l.slice(0, 50), back: '...' }));
              alert(`Generated ${cards.length} flashcard suggestions from your notes! (In full app, these would be added to a deck)`);
            }} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition shrink-0">
              <BrainCircuit className="w-4 h-4" /> Generate Flashcards
            </button>
          </div>
        )}
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 py-6">
          <input value={title} onChange={e => { setTitle(e.target.value); setSaved(false); }}
            className="w-full text-3xl font-bold text-gray-900 border-none outline-none placeholder-gray-300 mb-2"
            placeholder="Untitled Note" />
          
          <div className="flex items-center gap-2 mb-6">
            <Tag className="w-4 h-4 text-gray-400" />
            <input value={tags} onChange={e => { setTags(e.target.value); setSaved(false); }}
              className="text-sm text-gray-500 border-none outline-none flex-1"
              placeholder="Add tags (comma separated)" />
          </div>

          {showPreview ? (
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
          ) : (
            <textarea id="editor" value={content} onChange={e => { setContent(e.target.value); setSaved(false); }}
              className="w-full min-h-[500px] text-gray-700 leading-relaxed border-none outline-none resize-none font-mono text-sm"
              placeholder="Start writing your notes here...&#10;&#10;Supports Markdown:&#10;# Heading 1&#10;## Heading 2&#10;**bold** *italic* `code`&#10;> Blockquote&#10;- List item&#10;- [ ] Todo item&#10;- [x] Completed todo" />
          )}
        </div>
      </div>
    </div>
  );
}
