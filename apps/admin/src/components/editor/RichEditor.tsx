import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import clsx from 'clsx';

interface RichEditorProps {
  content: object | null;
  onChange: (json: object) => void;
  placeholder?: string;
}

const toolbarBtn = (active: boolean) =>
  clsx(
    'px-2 py-1 rounded text-xs font-medium transition-colors',
    active
      ? 'bg-accent text-bg-primary'
      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]',
  );

export function RichEditor({ content, onChange, placeholder }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder ?? 'Start writing...' }),
    ],
    content: content ?? undefined,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[200px] prose prose-invert max-w-none text-[var(--text-muted)] leading-relaxed',
      },
    },
  });

  // Sync external content changes (e.g. locale tab switch)
  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    const incoming = JSON.stringify(content);
    if (current !== incoming) {
      editor.commands.setContent(content ?? '');
    }
  }, [content]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!editor) return null;

  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden focus-within:border-[var(--border-hover)]">
      {/* Toolbar */}
      <div className="flex gap-1 px-3 py-2 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <button type="button" className={toolbarBtn(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button type="button" className={toolbarBtn(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
        <button type="button" className={toolbarBtn(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button type="button" className={toolbarBtn(editor.isActive('heading', { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
        <button type="button" className={toolbarBtn(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
        <button type="button" className={toolbarBtn(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
        <button type="button" className={toolbarBtn(editor.isActive('blockquote'))} onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝</button>
        <button type="button" className={toolbarBtn(false)} onClick={() => editor.chain().focus().undo().run()}>↩</button>
        <button type="button" className={toolbarBtn(false)} onClick={() => editor.chain().focus().redo().run()}>↪</button>
      </div>
      {/* Content area */}
      <div className="px-4 py-3 bg-[var(--bg-card)]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
