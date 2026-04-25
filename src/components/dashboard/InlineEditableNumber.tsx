import { useEffect, useRef, useState } from 'react';

interface InlineEditableNumberProps {
  value: number;
  min?: number;
  max?: number;
  className?: string;
  inputClassName?: string;
  onCommit: (next: number) => void;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export const InlineEditableNumber = ({
  value,
  min = 0,
  max = 100,
  className,
  inputClassName,
  onCommit,
}: InlineEditableNumberProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!editing) setDraft(String(value));
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
    const parsed = Number(draft);
    const next = Number.isFinite(parsed) ? clamp(Math.round(parsed), min, max) : value;
    onCommit(next);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(String(value));
    setEditing(false);
  };

  if (!editing) {
    return (
      <button type="button" onClick={() => setEditing(true)} className={className}>
        {value}
      </button>
    );
  }

  return (
    <input
      ref={inputRef}
      type="number"
      value={draft}
      min={min}
      max={max}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') cancel();
      }}
      className={inputClassName}
    />
  );
};

