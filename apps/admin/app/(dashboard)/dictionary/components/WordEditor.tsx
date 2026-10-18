'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Save, BookOpen, ListTree, Layers } from 'lucide-react';
import DefinitionsForm from './DefinitionsForm';
import FormsForm from './FormsForm';
import OriginsForm from './OriginsForm';
import AlternativesForm from './AlternativesForm';
import { Definition, WordForm } from '@/app/api/dictionary/route';
import Button from '@/app/components/Button';
import style from './WordEditor.module.css';

type Props = {
  headword: string;
  setHeadword: (headword: string) => void;
  origins: string[];
  setOrigins: React.Dispatch<React.SetStateAction<string[]>>;
  alternatives: string[];
  setAlternatives: React.Dispatch<React.SetStateAction<string[]>>;
  definitions: Definition[];
  setDefinitions: React.Dispatch<React.SetStateAction<Definition[]>>;
  forms: WordForm[];
  setForms: React.Dispatch<React.SetStateAction<WordForm[]>>;
  loading: boolean;
  submitLabel: string;
  loadingLabel: string;
  onSubmit: () => void;
};

const SECTIONS = [
  { id: 'osnovno', label: 'Osnovno', icon: BookOpen },
  { id: 'definicije', label: 'Definicije', icon: ListTree },
  { id: 'oblici', label: 'Oblici', icon: Layers },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

const WordEditor: React.FC<Props> = ({
  headword,
  setHeadword,
  origins,
  setOrigins,
  alternatives,
  setAlternatives,
  definitions,
  setDefinitions,
  forms,
  setForms,
  loading,
  submitLabel,
  loadingLabel,
  onSubmit,
}) => {
  const [headwordError, setHeadwordError] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>('osnovno');
  const headwordRef = useRef<HTMLInputElement>(null);
  const sectionRefs = useRef<Partial<Record<SectionId, HTMLElement | null>>>({});
  // While scrolling to a clicked section, keep it highlighted instead of the ones passed on the way
  const isNavigatingRef = useRef(false);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const counts: Partial<Record<SectionId, number>> = {
    definicije: definitions.length,
    oblici: forms.length,
  };

  // Highlight the last section whose top has passed the upper quarter of the screen. At the bottom
  // of the scroll area the last section wins, since a short one can never scroll up that far.
  useEffect(() => {
    const handleScroll = (e: Event) => {
      if (isNavigatingRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = setTimeout(() => {
          isNavigatingRef.current = false;
        }, 150);
        return;
      }

      const container = e.target instanceof Element ? e.target : document.scrollingElement;
      if (!container) return;

      const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 2;
      if (atBottom) {
        setActiveSection(SECTIONS[SECTIONS.length - 1].id);
        return;
      }

      const threshold = window.innerHeight * 0.25;
      let current: SectionId = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = sectionRefs.current[s.id];
        if (el && el.getBoundingClientRect().top <= threshold) current = s.id;
      }
      setActiveSection(current);
    };

    // Scroll events don't bubble, so listen in the capture phase to catch the dashboard's scroll area
    document.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener('scroll', handleScroll, { capture: true });
      clearTimeout(navigationTimeoutRef.current);
    };
  }, []);

  const scrollToSection = (id: SectionId) => {
    setActiveSection(id);
    isNavigatingRef.current = true;
    // Fallback for when the section is already in place and no scroll events fire
    clearTimeout(navigationTimeoutRef.current);
    navigationTimeoutRef.current = setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1000);
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headword.trim()) {
      setHeadwordError(true);
      headwordRef.current?.focus();
      return;
    }
    onSubmit();
  };

  // On a single long form, Enter in a text field would save the whole word
  const preventImplicitSubmit = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      e.preventDefault();
    }
  };

  return (
    <form className={style.form} onSubmit={handleSubmit} onKeyDown={preventImplicitSubmit}>
      <div className={style.toolbar}>
        <nav className={style.sectionNav} aria-label="Sekcije">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={activeSection === s.id ? style.navItemActive : style.navItem}
              onClick={() => scrollToSection(s.id)}
              aria-current={activeSection === s.id ? 'true' : undefined}
            >
              <s.icon size={14} />
              {s.label}
              {counts[s.id] !== undefined && <span className={style.navCount}>{counts[s.id]}</span>}
            </button>
          ))}
        </nav>
        <Button type="submit" disabled={loading} className={style.saveButton}>
          <Save size={16} />
          {loading ? loadingLabel : submitLabel}
        </Button>
      </div>

      <section
        id="osnovno"
        ref={(el) => {
          sectionRefs.current.osnovno = el;
        }}
        className={style.section}
      >
        <div className={style.sectionHeader}>
          <span className={style.sectionIcon}>
            <BookOpen size={16} />
          </span>
          <h2 className={style.sectionTitle}>Osnovno</h2>
        </div>

        <div className={style.fieldGroup}>
          <label htmlFor="headword">Riječ</label>
          <input
            id="headword"
            ref={headwordRef}
            type="text"
            value={headword}
            onChange={(e) => {
              setHeadword(e.target.value);
              if (headwordError && e.target.value.trim()) setHeadwordError(false);
            }}
            className={headwordError ? `${style.input} ${style.inputError}` : style.input}
            required
          />
        </div>

        <div className={style.subsection}>
          <h3 className={style.subsectionTitle}>Porijeklo</h3>
          <OriginsForm origins={origins} setOrigins={setOrigins} />
        </div>

        <div className={style.subsection}>
          <h3 className={style.subsectionTitle}>Alternativni oblici</h3>
          <AlternativesForm alternatives={alternatives} setAlternatives={setAlternatives} />
        </div>
      </section>

      <section
        id="definicije"
        ref={(el) => {
          sectionRefs.current.definicije = el;
        }}
        className={style.section}
      >
        <div className={style.sectionHeader}>
          <span className={style.sectionIcon}>
            <ListTree size={16} />
          </span>
          <h2 className={style.sectionTitle}>Definicije</h2>
        </div>
        <DefinitionsForm definitions={definitions} setDefinitions={setDefinitions} />
      </section>

      <section
        id="oblici"
        ref={(el) => {
          sectionRefs.current.oblici = el;
        }}
        className={style.section}
      >
        <div className={style.sectionHeader}>
          <span className={style.sectionIcon}>
            <Layers size={16} />
          </span>
          <h2 className={style.sectionTitle}>Oblici</h2>
        </div>
        <FormsForm forms={forms} setForms={setForms} />
      </section>
    </form>
  );
};

export default WordEditor;
