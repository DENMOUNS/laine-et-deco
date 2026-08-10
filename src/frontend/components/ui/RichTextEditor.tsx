import { useEffect, useRef, useState } from 'react';

interface RichTextEditorProps {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ name, defaultValue = '', placeholder = 'Écrire le contenu...', className = '' }: RichTextEditorProps) {
  const [content, setContent] = useState(defaultValue);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const hiddenRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setContent(defaultValue);
    if (editorRef.current) {
      editorRef.current.innerHTML = defaultValue || '';
    }
  }, [defaultValue]);

  useEffect(() => {
    if (hiddenRef.current) {
      hiddenRef.current.value = content || '';
    }
  }, [content]);

  const updateContent = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const format = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value);
    updateContent();
    editorRef.current?.focus();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2 rounded-2xl border border-primary/10 bg-secondary/50 p-2">
        <button type="button" className="rounded-lg border border-primary/10 px-3 py-1 text-sm font-semibold hover:bg-primary/10" onClick={() => format('bold')}>
          B
        </button>
        <button type="button" className="rounded-lg border border-primary/10 px-3 py-1 text-sm font-semibold hover:bg-primary/10" onClick={() => format('italic')}>
          I
        </button>
        <button type="button" className="rounded-lg border border-primary/10 px-3 py-1 text-sm font-semibold hover:bg-primary/10" onClick={() => format('underline')}>
          U
        </button>
        <button type="button" className="rounded-lg border border-primary/10 px-3 py-1 text-sm font-semibold hover:bg-primary/10" onClick={() => format('insertUnorderedList')}>
          • Liste
        </button>
        <button type="button" className="rounded-lg border border-primary/10 px-3 py-1 text-sm font-semibold hover:bg-primary/10" onClick={() => {
          const url = window.prompt('URL du lien');
          if (url) format('createLink', url);
        }}>
          Lien
        </button>
      </div>
      <div className="relative rounded-2xl border border-primary/10 bg-secondary/50">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={updateContent}
          className="min-h-[260px] p-4 text-sm leading-6 outline-none"
          style={{ whiteSpace: 'pre-wrap' }}
        />
        {!content && (
          <div className="pointer-events-none absolute inset-0 p-4 text-sm text-primary/40">
            {placeholder}
          </div>
        )}
      </div>
      <input ref={hiddenRef} type="hidden" name={name} value={content} />
    </div>
  );
}
