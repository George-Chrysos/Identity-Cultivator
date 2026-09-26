import { useState } from "react";
import { Link } from "react-router-dom";
import { conceptPath } from "@/concord/paths";
import type { EsotericConcept } from "@/concord/types";

type Point = { x: number; y: number };

const WIDTH = 400;
const HEIGHT = 460;

function stackPoints(count: number, ascend: boolean): Point[] {
  const top = 78;
  const bottom = 392;
  return Array.from({ length: count }, (_, index) => {
    const visualIndex = ascend ? count - 1 - index : index;
    const y =
      count === 1 ? (top + bottom) / 2 : top + ((bottom - top) * visualIndex) / (count - 1);
    return { x: 200, y };
  });
}

function diagramPoints(count: number): Point[] {
  if (count === 2) {
    return [
      { x: 200, y: 86 },
      { x: 200, y: 360 },
    ];
  }
  if (count === 3) {
    return [
      { x: 200, y: 78 },
      { x: 92, y: 348 },
      { x: 308, y: 348 },
    ];
  }
  return stackPoints(count, false);
}

function pointsFor(concept: EsotericConcept): Point[] {
  const count = concept.figure.nodes.length;
  if (concept.infographicType === "dantian-map") {
    const slots: Point[] = [
      { x: 200, y: 352 },
      { x: 200, y: 232 },
      { x: 292, y: 292 },
      { x: 108, y: 168 },
    ];
    return concept.figure.nodes.map((_, index) => slots[index] ?? { x: 200, y: 232 });
  }
  if (concept.infographicType === "diagram") {
    return diagramPoints(count);
  }
  return stackPoints(count, concept.figure.flow === "ascend");
}

function Vessel({ dim = false }: { dim?: boolean }) {
  return (
    <path
      d="M200 36c52 34 86 92 86 150 0 52-18 96-40 136-14 26-24 52-24 78 0 22 6 40 12 52H166c6-12 12-30 12-52 0-26-10-52-24-78-22-40-40-84-40-136 0-58 34-116 86-150z"
      fill="oklch(0.985 0.01 90)"
      stroke="currentColor"
      strokeOpacity={dim ? 0.28 : 0.45}
      strokeWidth="1.4"
    />
  );
}

export function ConceptFigure({ concept }: { concept: EsotericConcept }) {
  const points = pointsFor(concept);
  const [activeId, setActiveId] = useState(concept.figure.nodes[0]?.id ?? "");
  const active =
    concept.figure.nodes.find((node) => node.id === activeId) ?? concept.figure.nodes[0];
  const flow = concept.figure.flow ?? "descend";
  const showLoop =
    concept.infographicType === "flowchart" || concept.infographicType === "dantian-map";

  return (
    <figure className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <figcaption className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          In the map
        </figcaption>
        <p className="text-xs text-muted-foreground">Select a station</p>
      </div>
      <div className="px-3 pt-2 sm:px-6">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={concept.figure.caption}
          className="mx-auto h-auto w-full max-w-[440px] text-foreground"
        >
          <title>{concept.figure.caption}</title>
          {concept.infographicType === "dantian-map" ? <Vessel /> : null}
          {concept.infographicType === "tree" ? (
            <line
              x1="200"
              y1="58"
              x2="200"
              y2="410"
              stroke="currentColor"
              strokeOpacity="0.25"
              strokeWidth="1.5"
            />
          ) : null}
          {concept.infographicType === "diagram" && points.length === 3 ? (
            <polygon
              points={points.map((point) => `${point.x},${point.y}`).join(" ")}
              fill="oklch(0.47 0.13 30 / 0.04)"
              stroke="currentColor"
              strokeOpacity="0.28"
              strokeWidth="1.4"
            />
          ) : null}
          {showLoop && concept.infographicType === "flowchart"
            ? points.slice(0, -1).map((point, index) => {
                const next = points[index + 1];
                return (
                  <line
                    key={`link-${index}`}
                    x1={point.x}
                    y1={point.y + (flow === "ascend" ? -28 : 28)}
                    x2={next.x}
                    y2={next.y + (flow === "ascend" ? 28 : -28)}
                    stroke="currentColor"
                    strokeOpacity="0.35"
                    strokeWidth="1.4"
                    markerEnd="url(#arrow)"
                  />
                );
              })
            : null}
          {flow === "cycle" && concept.infographicType === "flowchart" && points.length >= 2 ? (
            <path
              d={`M${points[0].x + 78} ${points[0].y} C 360 140, 360 320, ${points[points.length - 1].x + 78} ${points[points.length - 1].y}`}
              fill="none"
              className="concord-dash"
              stroke="oklch(0.47 0.13 30)"
              strokeWidth="1.5"
            />
          ) : null}
          {concept.infographicType === "dantian-map" ? (
            <ellipse
              cx="200"
              cy="240"
              rx="46"
              ry="132"
              fill="none"
              className="concord-dash"
              stroke="oklch(0.47 0.13 30)"
              strokeWidth="1.5"
            />
          ) : null}
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0 0 L8 4 L0 8 z" fill="currentColor" fillOpacity="0.55" />
            </marker>
          </defs>
          {concept.figure.nodes.map((node, index) => {
            const point = points[index];
            const selected = node.id === active?.id;
            const wide = concept.infographicType === "flowchart";
            return (
              <g
                key={node.id}
                role="button"
                tabIndex={0}
                className="cursor-pointer outline-none"
                aria-label={`${node.label}. ${node.detail}`}
                onMouseEnter={() => setActiveId(node.id)}
                onFocus={() => setActiveId(node.id)}
                onClick={() => setActiveId(node.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActiveId(node.id);
                  }
                }}
              >
                {wide ? (
                  <rect
                    x={point.x - 86}
                    y={point.y - 26}
                    width="172"
                    height="52"
                    rx="26"
                    fill={selected ? "oklch(0.47 0.13 30)" : "oklch(0.985 0.008 90)"}
                    stroke={selected ? "oklch(0.47 0.13 30)" : "currentColor"}
                    strokeOpacity={selected ? 1 : 0.35}
                  />
                ) : (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={selected ? 16 : 13}
                    fill={selected ? "oklch(0.47 0.13 30)" : "oklch(0.985 0.008 90)"}
                    stroke={selected ? "oklch(0.47 0.13 30)" : "currentColor"}
                    strokeOpacity={selected ? 1 : 0.45}
                    strokeWidth="1.5"
                  />
                )}
                <text
                  x={wide ? point.x : point.x + (point.x > 230 ? -24 : 24)}
                  y={wide ? point.y + 5 : point.y + 5}
                  textAnchor={wide ? "middle" : point.x > 230 ? "end" : "start"}
                  fill={wide && selected ? "white" : "currentColor"}
                  fontSize="15"
                  fontFamily="var(--font-serif), Georgia, serif"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="space-y-1 border-t border-border px-4 py-4 sm:px-6" aria-live="polite">
        <p className="font-serif text-lg text-foreground">{active?.label}</p>
        <p className="max-w-prose text-sm leading-6 text-muted-foreground">{active?.detail}</p>
        {active?.conceptId && active.conceptId !== concept.id ? (
          <Link
            to={conceptPath(active.conceptId)}
            className="inline-block pt-1 text-sm text-cinnabar underline decoration-cinnabar/30 underline-offset-4"
          >
            Open {active.label}
          </Link>
        ) : null}
        <p className="pt-2 text-sm leading-6 text-muted-foreground">{concept.figure.caption}</p>
      </div>
    </figure>
  );
}
