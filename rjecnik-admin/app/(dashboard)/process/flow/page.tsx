'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, ArrowRight, Save, PartyPopper, Hash, Sparkles } from 'lucide-react';
import { IgnoreType, NewWord, WordProcessingStrategy } from '@/app/api/words/contracts';
import ToastContainer, { Toast } from '@/app/components/Toast';

import NewForm from './components/NewForm';

import style from './page.module.css';
import { Definition, Word, WordForm } from '@/app/api/dictionary/route';
import ExistingForm from './components/ExistingForm';
import NewHeadwordForm from './components/NewHeadwordForm';
import AddDefinitionForm, { NewDefinitionDraft } from './components/AddDefinitionForm';
import IgnoreForm from './components/IgnoreForm';
import Button from '@/app/components/Button';

const emptyDefinitionDraft = (): NewDefinitionDraft => ({
  type: '',
  gender: '',
  definition: '',
  examples: [],
  updateFrequency: true,
});

const emptyDefinition = (examples: string[]): Definition => ({
  type: null,
  gender: null,
  examples,
  definition: '',
  hidden_definition: '',
  part_of_speech: null,
  pronunciation_ipa: null,
  pronunciation_audio: null,
  synonyms: [],
  antonyms: [],
});

export default function Page() {
  const [assignedWords, setAssignedWords] = useState<NewWord[]>([]);
  const [processingIndex, setProcessingIndex] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [forms, setForms] = useState<WordForm[]>([]);
  const [ignoreType, setIgnoreType] = useState<IgnoreType>('ostalo');
  const [newHeadwordDefinitions, setNewHeadwordDefinitions] = useState<Definition[]>([]);
  const [newHeadwordOrigins, setNewHeadwordOrigins] = useState<string[]>([]);
  const [newHeadwordAlternatives, setNewHeadwordAlternatives] = useState<string[]>([]);
  const [newDefinitionDraft, setNewDefinitionDraft] = useState<NewDefinitionDraft>(
    emptyDefinitionDraft()
  );

  const currentWord = assignedWords[processingIndex];

  const strategyTranslations: Record<WordProcessingStrategy, string> = {
    'Frequency Only': 'Samo frekvencija',
    // "New Example": "Novi primjer",
    // "New Definition": "Nova definicija",
    'New Definition': 'Nova definicija',
    'New Form': 'Novi oblik',
    'Existing Form': 'Postojeći oblik',
    'New Headword': 'Nova riječ',
    Ignore: 'Ignoriši',
    Remove: 'Ukloni',
  };

  const strategies: WordProcessingStrategy[] = [
    'Frequency Only',
    // "New Example",
    'New Definition',
    'New Form',
    'Existing Form',
    'New Headword',
    'Ignore',
    'Remove',
  ];

  useEffect(() => {
    let ignore = false;

    Promise.resolve()
      .then(() => {
        setIsLoading(true);
        setError(null);
        return fetch('/api/words/new/my');
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (!ignore) setAssignedWords(data);
      })
      .catch(() => {
        if (!ignore) setError('Greška pri učitavanju riječi.');
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleStrategyChange = async (id: number, strategy: WordProcessingStrategy) => {
    const res = await fetch(`/api/words/new/${id}/strategy/${encodeURIComponent(strategy)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      setToasts((prev) => [
        ...prev,
        {
          id: uuidv4(),
          type: 'error',
          message: data.error ?? `Greška: ${res.status}`,
        },
      ]);
      return;
    }

    setSelectedWord(null);
    setForms([]);
    setIgnoreType('ostalo');
    setNewHeadwordOrigins([]);
    setNewHeadwordAlternatives([]);
    setNewHeadwordDefinitions(
      strategy === 'New Headword' && currentWord?.id === id
        ? [emptyDefinition(currentWord.examples)]
        : []
    );
    setNewDefinitionDraft(emptyDefinitionDraft());

    if (!strategy) {
      setAssignedWords((prev) => prev.filter((word) => word.id !== id));
      setProcessingIndex((prev) => (prev < assignedWords.length - 1 ? prev : 0));
    } else {
      const updatedWord = data as NewWord;

      setAssignedWords((prevWords) =>
        prevWords.map((word) =>
          word.id === updatedWord.id ? { ...word, strategy: updatedWord.strategy } : word
        )
      );
    }
  };

  const handleRemoveToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveStrategy = async (id: number, strategy: WordProcessingStrategy) => {
    let body: string | null = null;
    if (strategy === 'New Form') {
      body = JSON.stringify({ headword: selectedWord?.headword, forms });
    } else if (strategy === 'Existing Form') {
      body = JSON.stringify({ headword: selectedWord?.headword });
    } else if (strategy === 'New Headword') {
      body = JSON.stringify({
        definitions: newHeadwordDefinitions,
        origins: newHeadwordOrigins,
        alternatives: newHeadwordAlternatives,
        forms,
      });
    } else if (strategy === 'New Definition') {
      body = JSON.stringify({
        headword: selectedWord?.headword,
        definition: {
          type: newDefinitionDraft.type || null,
          gender: newDefinitionDraft.gender || null,
          definition: newDefinitionDraft.definition,
          examples: newDefinitionDraft.examples,
        },
        updateFrequency: newDefinitionDraft.updateFrequency,
      });
    } else if (strategy === 'Ignore') {
      body = JSON.stringify({ type: ignoreType });
    }

    const res = await fetch(`/api/words/new/${id}/strategy/${encodeURIComponent(strategy)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body,
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      setToasts((prev) => [
        ...prev,
        {
          id: uuidv4(),
          type: 'error',
          message: data.error ?? `Greška: ${res.status}`,
        },
      ]);
      return;
    }

    setForms([]);
    setSelectedWord(null);
    setIgnoreType('ostalo');
    setNewHeadwordDefinitions([]);
    setNewHeadwordOrigins([]);
    setNewHeadwordAlternatives([]);
    setNewDefinitionDraft(emptyDefinitionDraft());

    setAssignedWords((prev) => prev.filter((word) => word.id !== id));
    setProcessingIndex((prev) => (prev < assignedWords.length - 1 ? prev : 0));
  };

  if (isLoading) {
    return (
      <div className={style.stateCard}>
        <p>Učitavanje riječi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={style.stateCard}>
        <p className={style.errorText}>{error}</p>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className={style.stateCard}>
        <PartyPopper size={28} />
        <p>Nema riječi za obradu. Sve dodijeljene riječi su obrađene.</p>
      </div>
    );
  }

  const progress =
    assignedWords.length > 0 ? ((processingIndex + 1) / assignedWords.length) * 100 : 0;

  return (
    <div className={style.processingView}>
      <ToastContainer toasts={toasts} onRemove={handleRemoveToast} />

      <div className={style.header}>
        <div>
          <h1 className={style.title}>Obrada riječi</h1>
          <p className={style.subtitle}>
            Riječ {processingIndex + 1} od {assignedWords.length}
          </p>
        </div>
        <div className={style.progressTrack}>
          <div className={style.progressFill} style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className={style.card}>
        <div className={style.wordHeading}>
          <h2 className={style.headword}>{currentWord.headword}</h2>
          <div className={style.metaChips}>
            <span className={style.metaChip}>
              <Hash size={13} />
              {currentWord.count} pojavljivanja
            </span>
            {currentWord.is_new && (
              <span className={`${style.metaChip} ${style.metaChipAccent}`}>
                <Sparkles size={13} />
                Nova riječ
              </span>
            )}
          </div>
        </div>

        {currentWord.examples.length > 0 && (
          <div className={style.examplesBlock}>
            <span className={style.examplesLabel}>Primjeri</span>
            <ul className={style.examples}>
              {currentWord.examples.map((ex, i) => (
                <li key={i}>{ex}</li>
              ))}
            </ul>
          </div>
        )}

        <div className={style.strategyRow}>
          <label htmlFor="strategy" className={style.strategyLabel}>
            Strategija
          </label>
          <select
            id="strategy"
            className={style.strategySelect}
            value={(currentWord.strategy as string) || ''}
            onChange={(e) =>
              handleStrategyChange(
                currentWord.id,
                (e.target.value as WordProcessingStrategy) || null
              )
            }
          >
            <option value="">Bez strategije</option>
            {strategies.map((s) => (
              <option key={s} value={s}>
                {strategyTranslations[s]}
              </option>
            ))}
          </select>
          <Button
            className={style.navButton}
            onClick={() => handleSaveStrategy(currentWord.id, currentWord.strategy!)}
            disabled={
              !currentWord.strategy ||
              (currentWord.strategy === 'New Headword' &&
                !newHeadwordDefinitions.some((d) => d.definition.trim())) ||
              (currentWord.strategy === 'New Definition' &&
                (!selectedWord || !newDefinitionDraft.definition.trim()))
            }
          >
            <Save size={16} />
            Sačuvaj
          </Button>
        </div>

        {currentWord.strategy === 'New Form' && (
          <div className={style.strategyDetails}>
            <NewForm
              word={currentWord}
              forms={forms}
              setForms={setForms}
              selectedWord={selectedWord}
              setSelectedWord={setSelectedWord}
            />
          </div>
        )}
        {currentWord.strategy === 'Existing Form' && (
          <div className={style.strategyDetails}>
            <ExistingForm selectedWord={selectedWord} setSelectedWord={setSelectedWord} />
          </div>
        )}
        {currentWord.strategy === 'New Headword' && (
          <div className={style.strategyDetails}>
            <NewHeadwordForm
              headword={currentWord.headword}
              definitions={newHeadwordDefinitions}
              setDefinitions={setNewHeadwordDefinitions}
              origins={newHeadwordOrigins}
              setOrigins={setNewHeadwordOrigins}
              alternatives={newHeadwordAlternatives}
              setAlternatives={setNewHeadwordAlternatives}
              forms={forms}
              setForms={setForms}
            />
          </div>
        )}
        {currentWord.strategy === 'New Definition' && (
          <div className={style.strategyDetails}>
            <AddDefinitionForm
              selectedWord={selectedWord}
              setSelectedWord={setSelectedWord}
              candidateExamples={currentWord.examples}
              draft={newDefinitionDraft}
              setDraft={setNewDefinitionDraft}
            />
          </div>
        )}
        {currentWord.strategy === 'Ignore' && (
          <div className={style.strategyDetails}>
            <IgnoreForm ignoreType={ignoreType} setIgnoreType={setIgnoreType} />
          </div>
        )}
      </div>

      <div className={style.processingButtons}>
        <Button
          onClick={() => setProcessingIndex((prev) => Math.max(0, prev - 1))}
          disabled={processingIndex === 0}
          className={style.backButton}
        >
          <ArrowLeft size={16} />
          Nazad
        </Button>
        <Button
          onClick={() => setProcessingIndex((prev) => Math.min(prev + 1, assignedWords.length - 1))}
          disabled={processingIndex >= assignedWords.length - 1}
          className={style.navButton}
        >
          Sljedeće
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
