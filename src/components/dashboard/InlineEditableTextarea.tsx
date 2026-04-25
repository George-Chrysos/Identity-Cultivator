import { useEffect, useRef, useState } from 'react';

interface InlineEditableTextareaProps {
  value: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  rows?: number;
  onCommit: (next: string) => void;
}

export const InlineEditableTextarea = ({
  value,
  placeholder,
  className,
  inputClassName,
  rows = 5,
  onCommit,
}: InlineEditableTextareaProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) {
      queueMicrotask(() => {
        ref.current?.focus();
        ref.current?.setSelectionRange(ref.current.value.length, ref.current.value.length);
      });
    }
  }, [editing]);

  const commit = () => {
    onCommit(draft);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (!editing) {
    return (
      <button type="button" onClick={() => setEditing(true)} className={`text-left w-full ${className ?? ''}`}>
        {value?.length ? (
          <span className="whitespace-pre-wrap">{value}</span>
        ) : (
          <span className="text-slate-500">{placeholder}</span>
        )}
      </button>
    );
  }

  return (
    <textarea
      ref={ref}
      rows={rows}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Escape') cancel();
      }}
      placeholder={placeholder}
      className={inputClassName}
    />
  );
};
