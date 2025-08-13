'use client';

import React, { useState } from 'react';
import ToastContainer, { Toast } from '@/app/components/Toast';
import { v4 as uuidv4 } from 'uuid';
import DefinitionsForm from '../components/DefinitionsForm';
import FormsForm from '../components/FormsForm';
import OriginsForm from '../components/OriginsForm';
import AlternativesForm from '../components/AlternativesForm';
import { Definition } from '@/app/api/dictionary/route';

import style from './page.module.css';

export default function AddWordPage() {
  const [headword, setHeadword] = useState('');
  const [headwordError, setHeadwordError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [step, setStep] = useState(1); // Stepper state

  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [origins, setOrigins] = useState<string[]>([]);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  type FormType = {
    form: string;
    name: string;
    value: string;
    category: string;
  };
  const [forms, setForms] = useState<FormType[]>([]);

  const handleRemoveToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleNext = () => {
    if (step === 1 && !headword.trim()) {
      setHeadwordError(true);
      return;
    }
    setHeadwordError(false);
    setStep((prev) => Math.min(prev + 1, 3));
  };
  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && !headword.trim()) {
      setHeadwordError(true);
      return;
    }
    setHeadwordError(false);
    if (step < 3) {
      handleNext();
      return;
    }
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
      setStep(1);
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
      <h1 className={style.title}>Dodaj novu riječ</h1>
      <form onSubmit={handleSubmit} className={style.form}>
        <div className={style.stepper}>
          <div className={step >= 1 ? style.lineActive : style.line}></div>
          <div className={step >= 2 ? style.lineActive : style.line}></div>
          <div className={step >= 3 ? style.lineActive : style.line}></div>
        </div>
        {step === 1 && (
          <>
            <label htmlFor="headword" className={style.sectionLabel}>
              Riječ
            </label>
            <input
              id="headword"
              type="text"
              value={headword}
              onChange={(e) => {
                setHeadword(e.target.value);
                if (headwordError && e.target.value.trim()) setHeadwordError(false);
              }}
              className={headwordError ? `${style.input} ${style.inputError}` : style.input}
              required
            />
            <div className={style.sectionLabel}>Porijeklo</div>
            <OriginsForm origins={origins} setOrigins={setOrigins} className={style.block} />
            <div className={style.sectionLabel}>Alternativni oblici</div>
            <AlternativesForm
              alternatives={alternatives}
              setAlternatives={setAlternatives}
              className={style.block}
            />
          </>
        )}
        {step === 2 && (
          <>
            <div className={style.sectionLabel}>Definicije</div>
            <DefinitionsForm
              definitions={definitions}
              setDefinitions={setDefinitions}
              className={style.block}
            />
          </>
        )}
        {step === 3 && (
          <>
            <div className={style.sectionLabel}>Oblici</div>
            <FormsForm forms={forms} setForms={setForms} className={style.block} />
          </>
        )}
        <div className={style.buttonRow}>
          {step > 1 && (
            <button type="button" className={style.button} onClick={handleBack} disabled={loading}>
              Nazad
            </button>
          )}
          {step < 3 && (
            <button type="button" className={style.button} onClick={handleNext} disabled={loading}>
              Dalje
            </button>
          )}
          {step === 3 && (
            <button type="submit" className={style.button} disabled={loading}>
              {loading ? 'Dodavanje...' : 'Dodaj'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
