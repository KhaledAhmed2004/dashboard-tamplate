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
    if (!input) return;

    // Initialize value
    input.value = value || '';

    const handleChange = (event: any) => {
      const html = event.target?.value || '';
      onChange(html);
    };

    input.addEventListener('trix-change', handleChange);
    return () => {
      input.removeEventListener('trix-change', handleChange);
    };
  }, [value, onChange]);

  useEffect(() => {
    // Update editor content if external value changes
    const input = inputRef.current as any;
    if (!input) return;
    if (input.value !== value) {
      input.value = value || '';
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