'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import ToastContainer, { Toast } from '@/app/components/Toast';
import WordEditor from '../components/WordEditor';
import WordChatPanel from './components/WordChatPanel';
import NoteField from './components/NoteField';
import { Definition, WordForm } from '@/app/api/dictionary/route';

import style from './page.module.css';

export default function UpdateWordPage() {
  const params = useParams();
  const { id } = params;

  const [headword, setHeadword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [origins, setOrigins] = useState<string[]>([]);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [forms, setForms] = useState<WordForm[]>([]);
  const [note, setNote] = useState('');
  const [chatOpen, setChatOpen] = useState(false);

  // Temp state until synonyms and antonyms get migrated to definitions
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [antonyms, setAntonyms] = useState<string[]>([]);

  // Fetch word by id
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/dictionary?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setHeadword(data.headword || '');
          setDefinitions(data.definitions || []);
          setForms(data.forms ?? []);
          setOrigins(data.origins || []);
          setAlternatives(data.alternatives || []);
          setSynonyms(data.synonyms || []);
          setAntonyms(data.antonyms || []);
          setNote(data.note ?? '');
        } else {
          setToasts((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              type: 'error',
              message: data.error || 'Greška pri učitavanju riječi.',
            },
          ]);
        }
      })
      .catch(() => {
        setToasts((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'error',
            message: 'Greška pri učitavanju riječi.',
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleRemoveToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        headword,
        definitions: definitions.map((d: Definition) => ({
          ...d,
          type: d.type || null,
          gender: d.gender || null,
          examples: d.examples?.length ? d.examples : [],
          part_of_speech: d.part_of_speech || null,
          pronunciation_ipa: d.pronunciation_ipa || null,
          pronunciation_audio: d.pronunciation_audio || null,
          synonyms: d.synonyms,
          antonyms: d.antonyms,
        })),
        forms,
        alternatives,
        origins,
        synonyms: synonyms,
        antonyms: antonyms,
        note: note.trim() || null,
      };
      const res = await fetch(`/api/dictionary?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setToasts((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'error',
            message: data.error ? String(data.error) : `Greška: ${res.status}`,
          },
        ]);
        return;
      }
      setToasts((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'success',
          message: 'Riječ uspješno ažurirana!',
        },
      ]);
    } catch (err: unknown) {
      setToasts((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'error',
          message: 'Greška prilikom slanja: ' + (err instanceof Error ? err.message : String(err)),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={chatOpen ? style.containerWithChat : style.container}>
      <ToastContainer toasts={toasts} onRemove={handleRemoveToast} />

      <div className={style.layout}>
        <div className={style.editor}>
          <div className={style.header}>
            <h1 className={style.title}>
              <span className={style.titleTrail}>Ažuriraj riječ</span>
              {headword && (
                <>
                  <span className={style.titleSeparator}>/</span>
                  <span className={style.titleCurrent}>{headword}</span>
                </>
              )}
            </h1>
            <p className={style.subtitle}>
              Izmijeni osnovne podatke, definicije i gramatičke oblike
            </p>
          </div>

          <NoteField note={note} setNote={setNote} />

          <WordEditor
            headword={headword}
            setHeadword={setHeadword}
            origins={origins}
            setOrigins={setOrigins}
            alternatives={alternatives}
            setAlternatives={setAlternatives}
            definitions={definitions}
            setDefinitions={setDefinitions}
            forms={forms}
            setForms={setForms}
            loading={loading}
            submitLabel="Sačuvaj izmjene"
            loadingLabel="Ažuriranje..."
            onSubmit={handleSubmit}
            toolbarActions={
              <button
                type="button"
                className={chatOpen ? style.assistantToggleActive : style.assistantToggle}
                onClick={() => setChatOpen((open) => !open)}
                aria-pressed={chatOpen}
              >
                <Sparkles size={16} />
                Asistent
              </button>
            }
          />
        </div>

        {/* Kept mounted while closed so the conversation survives closing the panel */}
        <WordChatPanel
          wordId={String(id)}
          draft={{ headword, origins, alternatives, definitions, forms }}
          onApply={(draft) => {
            setOrigins(draft.origins);
            setAlternatives(draft.alternatives);
            setDefinitions(draft.definitions);
            setForms(draft.forms);
          }}
          open={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      </div>
    </div>
  );
}
