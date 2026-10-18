'use client';

import React, { useState } from 'react';
import ToastContainer, { Toast } from '@/app/components/Toast';
import { v4 as uuidv4 } from 'uuid';
import WordEditor from '../components/WordEditor';
import { Definition, WordForm } from '@/app/api/dictionary/route';

import style from './page.module.css';

export default function AddWordPage() {
  const [headword, setHeadword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [origins, setOrigins] = useState<string[]>([]);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [forms, setForms] = useState<WordForm[]>([]);

  const handleRemoveToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        headword,
        definitions: definitions.map((d) => ({
          ...d,
          type: d.type || null,
          gender: d.gender || null,
          examples: d.examples,
          part_of_speech: d.part_of_speech || null,
          pronunciation_ipa: null,
          pronunciation_audio: null,
          synonyms: d.synonyms,
          antonyms: d.antonyms,
        })),
        forms: forms,
        alternatives: alternatives,
        origins: origins,
        synonyms: definitions.flatMap((d) => d.synonyms),
        antonyms: definitions.flatMap((d) => d.antonyms),
      };

      const res = await fetch('/api/dictionary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setToasts((prev) => [
          ...prev,
          {
            id: uuidv4(),
            type: 'error',
            message: data.error ? String(data.error) : `Greška: ${res.status}`,
          },
        ]);
        return;
      }
      setToasts((prev) => [
        ...prev,
        {
          id: uuidv4(),
          type: 'success',
          message: 'Riječ uspješno dodana!',
        },
      ]);
      setHeadword('');
      setDefinitions([]);
      setForms([]);
      setOrigins([]);
      setAlternatives([]);
    } catch (err) {
      setToasts((prev) => [
        ...prev,
        {
          id: uuidv4(),
          type: 'error',
          message: 'Greška prilikom slanja: ' + (err instanceof Error ? err.message : String(err)),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.container}>
      <ToastContainer toasts={toasts} onRemove={handleRemoveToast} />

      <div className={style.header}>
        <h1 className={style.title}>Dodaj novu riječ</h1>
        <p className={style.subtitle}>Unesi osnovne podatke, definicije i gramatičke oblike</p>
      </div>

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
        submitLabel="Dodaj riječ"
        loadingLabel="Dodavanje..."
        onSubmit={handleSubmit}
      />
    </div>
  );
}
