import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface TextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// Lightweight rich text editor using contenteditable and execCommand for common actions
const TextEditor: React.FC<TextEditorProps> = ({ value, onChange, placeholder }) => {
  const [html, setHtml] = useState<string>(value || '');
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHtml(value || '');
  }, [value]);

  const applyCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML;
      setHtml(newHtml);
      onChange(newHtml);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML;
      setHtml(newHtml);
      onChange(newHtml);
    }
  };

  const createLink = () => {
    const url = window.prompt('Enter URL');
    if (url) applyCommand('createLink', url);
  };

  const clearFormatting = () => {
    applyCommand('removeFormat');
  };

  return (
    <div className="border rounded-md">
      <div className="flex flex-wrap items-center gap-2 p-2">
        <Button type="button" variant="outline" size="sm" onClick={() => applyCommand('bold')}>Bold</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => applyCommand('italic')}>Italic</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => applyCommand('underline')}>Underline</Button>
        <Separator orientation="vertical" className="h-6" />
        <Button type="button" variant="outline" size="sm" onClick={() => applyCommand('insertUnorderedList')}>Bullets</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => applyCommand('insertOrderedList')}>Numbers</Button>
        <Separator orientation="vertical" className="h-6" />
        <Button type="button" variant="outline" size="sm" onClick={createLink}>Link</Button>
        <Button type="button" variant="outline" size="sm" onClick={clearFormatting}>Clear</Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[160px] p-3 text-sm focus:outline-none"
        dangerouslySetInnerHTML={{ __html: html || '' }}
        data-placeholder={placeholder || ''}
      />
    </div>
  );
};

export default TextEditor;