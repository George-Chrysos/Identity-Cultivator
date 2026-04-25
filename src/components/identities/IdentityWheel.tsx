import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ArchetypeTemplate } from '@/types/identity';
import IdentityCard from './IdentityCard';

interface IdentityWheelProps {
  templates: ArchetypeTemplate[];
  boundTemplateIds: string[];
  onSelect: (template: ArchetypeTemplate) => void;
}

/**
 * Horizontal snap-scroll carousel. The card nearest the viewport centre is
 * rendered at full size; neighbours scale down. Arrow buttons (and left/right
 * keys) advance by one card.
 */
const IdentityWheel = memo(
  ({ templates, boundTemplateIds, onSelect }: IdentityWheelProps) => {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [focusedIndex, setFocusedIndex] = useState(0);

    const boundSet = useMemo(
      () => new Set(boundTemplateIds),
      [boundTemplateIds]
    );

    // Track which card is centred in the viewport by comparing each card's
    // midpoint to the scroller's midpoint on every scroll.
    const recomputeFocus = useCallback(() => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const scrollerRect = scroller.getBoundingClientRect();
      const scrollerCentre = scrollerRect.left + scrollerRect.width / 2;

      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;
      cardRefs.current.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const centre = rect.left + rect.width / 2;
        const distance = Math.abs(centre - scrollerCentre);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = idx;
        }
      });

      setFocusedIndex(nearestIndex);
    }, []);

    useEffect(() => {
      recomputeFocus();
      const scroller = scrollerRef.current;
      if (!scroller) return;

      const handle = () => recomputeFocus();
      scroller.addEventListener('scroll', handle, { passive: true });
      window.addEventListener('resize', handle);
      return () => {
        scroller.removeEventListener('scroll', handle);
        window.removeEventListener('resize', handle);
      };
    }, [recomputeFocus]);

    const scrollToIndex = useCallback((index: number) => {
      const target = cardRefs.current[index];
      const scroller = scrollerRef.current;
      if (!target || !scroller) return;
      const scrollerRect = scroller.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const delta =
        targetRect.left + targetRect.width / 2 -
        (scrollerRect.left + scrollerRect.width / 2);
      scroller.scrollBy({ left: delta, behavior: 'smooth' });
    }, []);

    const go = useCallback(
      (direction: -1 | 1) => {
        const next = Math.max(
          0,
          Math.min(templates.length - 1, focusedIndex + direction)
        );
        scrollToIndex(next);
      },
      [focusedIndex, scrollToIndex, templates.length]
    );

    // Keyboard navigation
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          go(1);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          go(-1);
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const template = templates[focusedIndex];
          if (template) onSelect(template);
        }
      },
      [go, focusedIndex, templates, onSelect]
    );

    return (
      <div
        className="relative select-none"
        tabIndex={0}
        role="listbox"
        aria-label="Archetype identities"
        onKeyDown={handleKeyDown}
      >
        {/* Side fades */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10 bg-gradient-to-r from-slate-950 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10 bg-gradient-to-l from-slate-950 to-transparent"
        />

        {/* Arrow controls */}
        <button
          type="button"
          onClick={() => go(-1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-900/70 border border-cyan-400/40 text-cyan-200 hover:bg-slate-900 hover:text-white transition-colors shadow-[0_0_16px_-4px_rgba(34,211,238,0.5)] disabled:opacity-30 disabled:cursor-not-allowed"
          disabled={focusedIndex === 0}
          aria-label="Previous archetype"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-900/70 border border-cyan-400/40 text-cyan-200 hover:bg-slate-900 hover:text-white transition-colors shadow-[0_0_16px_-4px_rgba(34,211,238,0.5)] disabled:opacity-30 disabled:cursor-not-allowed"
          disabled={focusedIndex >= templates.length - 1}
          aria-label="Next archetype"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Scroller */}
        <div
          ref={scrollerRef}
          className="flex items-center gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth py-10 px-[calc(50%-9rem)] no-scrollbar"
        >
          {templates.map((template, idx) => (
            <div
              key={template.id}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              role="option"
              aria-selected={idx === focusedIndex}
              className="snap-center"
            >
              <IdentityCard
                template={template}
                isBound={boundSet.has(template.id)}
                isFocused={idx === focusedIndex}
                onSelect={() => {
                  if (idx === focusedIndex) {
                    onSelect(template);
                  } else {
                    scrollToIndex(idx);
                  }
                }}
              />
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-2">
          {templates.map((t, idx) => (
            <button
              key={t.id}
              type="button"
              onClick={() => scrollToIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === focusedIndex
                  ? 'w-6 bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.7)]'
                  : 'w-1.5 bg-slate-600 hover:bg-slate-400'
              }`}
              aria-label={`Jump to ${t.name}`}
            />
          ))}
        </div>
      </div>
    );
  }
);

IdentityWheel.displayName = 'IdentityWheel';

export default IdentityWheel;
