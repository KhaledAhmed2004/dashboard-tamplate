import React, { useEffect, useRef } from 'react';
import 'trix';
import 'trix/dist/trix.css';

interface TrixEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// React wrapper for the Trix WYSIWYG editor
const TrixEditor: React.FC<TrixEditorProps> = ({ value, onChange, placeholder }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const input = inputRef.current as any;
    const editorEl = editorRef.current as any;
    if (!input || !editorEl) return;

    // Initialize editor with existing value
    input.value = value || '';
    if (editorEl.editor) {
      editorEl.editor.loadHTML(value || '');
    }

    const handleChange = () => {
      const html = input.value || '';
      onChange(html);
    };

    editorEl.addEventListener('trix-change', handleChange);
    return () => {
      editorEl.removeEventListener('trix-change', handleChange);
    };
  }, [value, onChange]);

  useEffect(() => {
    // Keep editor content in sync when external value changes
    const input = inputRef.current as any;
    const editorEl = editorRef.current as any;
    if (!input || !editorEl) return;
    if ((input.value || '') !== (value || '')) {
      input.value = value || '';
      if (editorEl.editor) {
        editorEl.editor.loadHTML(value || '');
      }
    }
  }, [value]);

  return (
    <div className="trix-wrapper">
      <input id="trix-input" type="hidden" ref={inputRef} />
      <trix-editor
        ref={editorRef}
        input="trix-input"
        class="trix-content min-h-[160px]"
        placeholder={placeholder || 'Write content...'}
      />
    </div>
  );
};

export default TrixEditor;