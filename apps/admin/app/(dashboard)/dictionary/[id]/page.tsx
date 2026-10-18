'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Check, ArrowLeft, ArrowRight, Save, BookOpen, ListTree, Layers } from 'lucide-react';
import ToastContainer, { Toast } from '@/app/components/Toast';
import DefinitionsForm from '../components/DefinitionsForm';
import FormsForm from '../components/FormsForm';
import OriginsForm from '../components/OriginsForm';
import AlternativesForm from '../components/AlternativesForm';
import { Word, Definition } from '@/app/api/dictionary/route';
import Button from '@/app/components/Button';

import style from '../add/page.module.css';

const STEPS = [
  { label: 'Osnovno', icon: BookOpen },
  { label: 'Definicije', icon: ListTree },
  { label: 'Oblici', icon: Layers },
];

export default function UpdateWordPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [headword, setHeadword] = useState('');
  const [headwordError, setHeadwordError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [step, setStep] = useState(1);
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [origins, setOrigins] = useState<string[]>([]);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [forms, setFormsRaw] = useState<NonNullable<Word['forms']> | null>([]);

  // Temp state until synonyms and antonyms get migrated to definitions
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [antonyms, setAntonyms] = useState<string[]>([]);

  // Wrapper to match FormsForm expected setter signature
  const setForms: React.Dispatch<
    React.SetStateAction<{ form: string; name: string; value: string; category: string }[]>
  > = (value) => {
    if (typeof value === 'function') {
      setFormsRaw((prev) => value(prev ?? []));
    } else {
      setFormsRaw(value);
    }
  };

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
          setFormsRaw(data.forms ?? []);
          setOrigins(data.origins || []);
          setAlternatives(data.alternatives || []);
          setSynonyms(data.synonyms || []);
          setAntonyms(data.antonyms || []);
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
  const handleStepClick = (stepNum: number) => {
    if (stepNum === step) return;
    if (stepNum > 1 && !headword.trim()) {
      setHeadwordError(true);
      return;
    }
    setHeadwordError(false);
    setStep(stepNum);
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
        forms: forms ?? [],
        alternatives,
        origins,
        synonyms: synonyms,
        antonyms: antonyms,
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
      router.push('/dictionary');
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
    <div className={style.container}>
      <ToastContainer toasts={toasts} onRemove={handleRemoveToast} />

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
        <p className={style.subtitle}>Izmijeni osnovne podatke, definicije i gramatičke oblike</p>
      </div>

      <div className={style.card}>
        <form className={style.form} onSubmit={handleSubmit}>
          <div className={style.stepper}>
            {STEPS.map((s, idx) => {
              const stepNum = idx + 1;
              const isDone = step > stepNum;
              const isActive = step === stepNum;
              return (
                <React.Fragment key={s.label}>
                  {idx > 0 && (
                    <div className={step > idx ? style.stepConnectorActive : style.stepConnector} />
                  )}
                  <button
                    type="button"
                    className={style.stepClickable}
                    onClick={() => handleStepClick(stepNum)}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    <div
                      className={
                        isDone ? style.stepCircleDone : isActive ? style.stepCircleActive : style.stepCircle
                      }
                    >
                      {isDone ? <Check size={16} /> : <s.icon size={16} />}
                    </div>
                    <span className={isActive || isDone ? style.stepLabelActive : style.stepLabel}>
                      {s.label}
                    </span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {step === 1 && (
            <>
              <div className={style.fieldGroup}>
                <label htmlFor="headword">Riječ</label>
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
              </div>

              <div className={style.sectionHeading}>
                <h2>Porijeklo</h2>
              </div>
              <OriginsForm origins={origins} setOrigins={setOrigins} className={style.block} />

              <div className={style.sectionHeading}>
                <h2>Alternativni oblici</h2>
              </div>
              <AlternativesForm
                alternatives={alternatives}
                setAlternatives={setAlternatives}
                className={style.block}
              />
            </>
          )}
          {step === 2 && (
            <>
              <div className={style.sectionHeading}>
                <h2>Definicije</h2>
              </div>
              <DefinitionsForm
                definitions={definitions}
                setDefinitions={setDefinitions}
                className={style.block}
              />
            </>
          )}
          {step === 3 && (
            <>
              <div className={style.sectionHeading}>
                <h2>Oblici</h2>
              </div>
              <FormsForm forms={forms ?? []} setForms={setForms} className={style.block} />
            </>
          )}

          <div className={step === 1 ? `${style.buttonRow} ${style.buttonRowEnd}` : style.buttonRow}>
            {step > 1 && (
              <Button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className={style.backButton}
              >
                <ArrowLeft size={16} />
                Nazad
              </Button>
            )}
            {step < 3 && (
              <Button type="button" onClick={handleNext} disabled={loading} className={style.navButton}>
                Dalje
                <ArrowRight size={16} />
              </Button>
            )}
            {step === 3 && (
              <Button type="submit" disabled={loading} className={style.navButton}>
                <Save size={16} />
                {loading ? 'Ažuriranje...' : 'Sačuvaj izmjene'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
