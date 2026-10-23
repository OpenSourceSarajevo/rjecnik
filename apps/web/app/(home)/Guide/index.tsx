'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Flag, Volume2 } from 'lucide-react';

import WordEntry, { type WordDetails } from '@/app/components/WordEntry';

import style from './Guide.module.css';

// Snapshot of a real entry, trimmed to the first two meanings
const sampleWord: Omit<WordDetails, 'id'> = {
  headword: 'kuća',
  alternatives: [],
  origins: [],
  definitions: [
    {
      type: 'imenica',
      gender: 'ženski',
      definition: 'zgrada namijenjena za stanovanje',
      examples: [
        'Na kraju sela sagradili su novu kuću od kamena.',
        'Kuća ima dva sprata i veliko dvorište.',
      ],
      synonyms: [],
      antonyms: [],
      part_of_speech: null,
      pronunciation_ipa: null,
      pronunciation_audio: null,
    },
    {
      type: 'imenica',
      gender: 'ženski',
      definition: 'vladarska ili plemićka porodica kroz više pokoljenja; dinastija, loza',
      examples: [
        'Kotromanići su bili vladarska kuća srednjovjekovne Bosne.',
        'Habsburška kuća vladala je stoljećima velikim dijelom Evrope.',
      ],
      synonyms: ['dinastija', 'loza'],
      antonyms: [],
      part_of_speech: null,
      pronunciation_ipa: null,
      pronunciation_audio: null,
    },
  ],
  forms: [
    ['nominativ', 'kuća', 'kuće'],
    ['genitiv', 'kuće', 'kuća'],
    ['dativ', 'kući', 'kućama'],
    ['akuzativ', 'kuću', 'kuće'],
    ['vokativ', 'kućo', 'kuće'],
    ['lokativ', 'kući', 'kućama'],
    ['instrumental', 'kućom', 'kućama'],
  ].flatMap(([name, singular, plural]) => [
    { form: 'jednina', name, value: singular, category: 'padež' },
    { form: 'množina', name, value: plural, category: 'padež' },
  ]),
};

type Callout = {
  title: string;
  description: string;
  side: 'left' | 'right';
  // Not available yet, shown with a placeholder in the preview
  soon?: boolean;
  // Finds the element in the preview the arrow points to
  target: (preview: HTMLElement) => Element | null | undefined;
};

const last = <T extends Element>(list: NodeListOf<T>) => list[list.length - 1];

// Ordered top to bottom as they appear in the preview
const callouts: Callout[] = [
  {
    title: 'Riječ',
    description: 'Uz alternativne oblike i porijeklo, kada su poznati.',
    side: 'left',
    target: (preview) => preview.querySelector('h1'),
  },
  {
    title: 'Izgovor',
    description: 'Audio zapisi izvornih govornika.',
    side: 'left',
    soon: true,
    target: (preview) => preview.querySelector('[data-guide="pronunciation"]'),
  },
  {
    title: 'Latinica i ćirilica',
    description: 'Prikaz riječi na oba pisma bosanskog jezika.',
    side: 'right',
    soon: true,
    target: (preview) => preview.querySelector('[data-guide="script"]'),
  },
  {
    title: 'Vrsta riječi i rod',
    description: 'Navedeni su za svako značenje posebno.',
    side: 'left',
    target: (preview) => preview.querySelector('ol > li span'),
  },
  {
    title: 'Primjeri upotrebe',
    description: 'Rečenice koje pokazuju riječ u kontekstu.',
    side: 'left',
    target: (preview) => preview.querySelector('blockquote'),
  },
  {
    title: 'Sinonimi i antonimi',
    description: 'Vezani uz značenje, vode do drugih riječi.',
    side: 'right',
    target: (preview) => last(preview.querySelectorAll('ol a')),
  },
  {
    title: 'Oblici riječi',
    description: 'Padeži za imenice, glagolska vremena za glagole.',
    side: 'right',
    target: (preview) => last(preview.querySelectorAll('table')),
  },
];

// Callouts sit beside the preview only when there is room for them
const WIDE_QUERY = '(min-width: 1100px)';
const CALLOUT_GAP = 16;
const TARGET_OFFSET = 10;

type Overlay = {
  wide: boolean;
  width: number;
  height: number;
  arrows: { d: string; soon: boolean }[];
  pins: { x: number; y: number; n: number; soon: boolean }[];
};

const Guide = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const calloutRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const markerId = useId();
  const soonMarkerId = useId();

  useEffect(() => {
    const stage = stageRef.current;
    const preview = previewRef.current;
    if (!stage || !preview) return;

    const layout = () => {
      const wide = window.matchMedia(WIDE_QUERY).matches;
      const stageRect = stage.getBoundingClientRect();
      const nextBottom = { left: 0, right: 0 };
      const arrows: Overlay['arrows'] = [];
      const pins: Overlay['pins'] = [];

      callouts.forEach((callout, i) => {
        const item = calloutRefs.current[i];
        const target = callout.target(preview);
        if (!item || !target) return;
        const soon = callout.soon ?? false;

        const rect = target.getBoundingClientRect();
        // Parts inside a meaning card are reached from the card's edge so the
        // arrow or pin doesn't cover the card's own contents
        const leftEdge = (target.closest('li') ?? target).getBoundingClientRect().left;
        const targetY = rect.top + rect.height / 2 - stageRect.top;
        const targetX =
          callout.side === 'left'
            ? leftEdge - stageRect.left - TARGET_OFFSET
            : rect.right - stageRect.left + TARGET_OFFSET;

        if (!wide) {
          item.style.removeProperty('--y');
          pins.push({ x: leftEdge - stageRect.left - 14, y: targetY, n: i + 1, soon });
          return;
        }

        // Center the callout title on its target without overlapping the previous callout
        const titleOffset = 16;
        const top = Math.max(targetY - titleOffset, nextBottom[callout.side]);
        nextBottom[callout.side] = top + item.offsetHeight + CALLOUT_GAP;
        item.style.setProperty('--y', `${top}px`);

        const startY = top + titleOffset;
        const startX =
          callout.side === 'left' ? item.offsetLeft + item.offsetWidth + 12 : item.offsetLeft - 12;
        const bend = (targetX - startX) / 2;
        arrows.push({
          d: `M ${startX} ${startY} C ${startX + bend} ${startY}, ${targetX - bend} ${targetY}, ${targetX} ${targetY}`,
          soon,
        });
      });

      setOverlay({ wide, width: stageRect.width, height: stageRect.height, arrows, pins });
    };

    layout();
    const observer = new ResizeObserver(layout);
    observer.observe(stage);
    document.fonts?.ready.then(layout);

    return () => observer.disconnect();
  }, []);

  const href = `/rjecnik/${encodeURIComponent(sampleWord.headword)}`;

  return (
    <div className={style.guide}>
      <div ref={stageRef} className={style.stage}>
        <figure className={style.window}>
          <div className={style.windowBar} aria-hidden="true">
            <span className={style.dots}>
              <span />
              <span />
              <span />
            </span>
            <span className={style.url}>{decodeURIComponent(href)}</span>
          </div>

          {/* Real entry components, made non-interactive since this is only a preview */}
          <div ref={previewRef} className={style.preview} inert>
            <WordEntry
              word={sampleWord}
              action={
                <span className={style.reportButton}>
                  <Flag size={14} />
                  Prijavi grešku
                </span>
              }
              meta={
                <div className={style.placeholders}>
                  <span className={style.placeholder} data-guide="pronunciation">
                    <Volume2 size={14} />
                    Poslušaj izgovor
                  </span>
                  <span className={style.placeholder} data-guide="script">
                    <span className={style.scriptActive}>Latinica</span>
                    <span>Ћирилица</span>
                  </span>
                </div>
              }
            />
          </div>

          <figcaption className={style.caption}>
            <Link href={href} className={style.captionLink}>
              Otvori riječ „{sampleWord.headword}“ <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </figcaption>
        </figure>

        <ol className={style.callouts}>
          {callouts.map((callout, i) => (
            <li
              key={callout.title}
              ref={(el) => {
                calloutRefs.current[i] = el;
              }}
              className={`${style.callout} ${callout.side === 'left' ? style.left : style.right} ${callout.soon ? style.soon : ''}`}
            >
              <h3 className={style.calloutTitle}>
                {callout.title}
                {callout.soon && <span className={style.soonBadge}>Uskoro</span>}
              </h3>
              <p className={style.calloutText}>{callout.description}</p>
            </li>
          ))}
        </ol>

        {overlay && (
          <svg
            className={style.overlay}
            width={overlay.width}
            height={overlay.height}
            viewBox={`0 0 ${overlay.width} ${overlay.height}`}
            aria-hidden="true"
          >
            <defs>
              <marker
                id={markerId}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" className={style.arrowHead} />
              </marker>
              <marker
                id={soonMarkerId}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" className={style.arrowHeadSoon} />
              </marker>
            </defs>

            {overlay.wide &&
              overlay.arrows.map((arrow, i) => (
                <path
                  key={i}
                  d={arrow.d}
                  className={arrow.soon ? style.arrowSoon : style.arrow}
                  markerEnd={`url(#${arrow.soon ? soonMarkerId : markerId})`}
                />
              ))}

            {!overlay.wide &&
              overlay.pins.map((pin) => (
                <g key={pin.n}>
                  <circle
                    cx={pin.x}
                    cy={pin.y}
                    r="10"
                    className={pin.soon ? style.pinSoon : style.pin}
                  />
                  <text x={pin.x} y={pin.y} className={style.pinText}>
                    {pin.n}
                  </text>
                </g>
              ))}
          </svg>
        )}
      </div>
    </div>
  );
};

export default Guide;
