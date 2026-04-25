import { useEffect, useRef, useState } from 'react';

interface InlineEditableTextProps {
  value: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  onCommit: (next: string) => void;
}

export const InlineEditableText = ({
  value,
  placeholder,
  className,
  inputClassName,
  onCommit,
}: InlineEditableTextProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) {
      queueMicrotask(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [editing]);

  const commit = () => {
    const next = draft.trim();
    onCommit(next);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={className}
      >
        {value?.length ? value : <span className="text-slate-500">{placeholder}</span>}
      </button>
    );
  }

  return (
    <input
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') cancel();
      }}
      placeholder={placeholder}
      className={inputClassName}
    />
  );
};

