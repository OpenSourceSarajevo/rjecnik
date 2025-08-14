'use client';

import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { NewWord, WordProcessingStrategy } from '@/app/api/words/contracts';
import ToastContainer, { Toast } from '@/app/components/Toast';

import NewForm from './components/NewForm';

import style from './page.module.css';
import { Word, WordForm } from '@/app/api/dictionary/route';
import ExistingForm from './components/ExistingForm';
import Button from '@/app/components/Button';

export default function Page() {
  const [assignedWords, setAssignedWords] = useState<NewWord[]>([]);
  const [processingIndex, setProcessingIndex] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [forms, setForms] = useState<WordForm[]>([]);

  const currentWord = assignedWords[processingIndex];

  const strategyTranslations: Record<WordProcessingStrategy, string> = {
    'Frequency Only': 'Samo frekvencija',
    // "New Example": "Novi primjer",
    // "New Definition": "Nova definicija",
    'New Form': 'Novi oblik',
    'Existing Form': 'Postojeći oblik',
    // "New Headword": "Nova riječ",
    // Ignore: "Ignoriši",
    Remove: 'Ukloni',
  };

  const strategies: WordProcessingStrategy[] = [
    'Frequency Only',
    // "New Example",
    // "New Definition",
    'New Form',
    'Existing Form',
    // "New Headword",
    // "Ignore",
    'Remove',
  ];

  const fetchAssignedWords = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/words/new/my');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setAssignedWords(data);
    } catch {
      setError('Greška pri učitavanju riječi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignedWords();
  }, [fetchAssignedWords]);

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

    setAssignedWords((prev) => prev.filter((word) => word.id !== id));
    setProcessingIndex((prev) => (prev < assignedWords.length - 1 ? prev : 0));
  };

  if (!currentWord) return <p>Nema riječi za obradu.</p>;

  if (isLoading) {
    return <p>Učitavanje riječi...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div className={style.processingView}>
      <ToastContainer toasts={toasts} onRemove={handleRemoveToast} />
      <div className={style.header}>
        <h2>
          Obrada riječi {processingIndex + 1} / {assignedWords.length}
        </h2>
        <div className={style.spacer}></div>
        <select
          id="strategy"
          className={style.strategySelect}
          value={(currentWord.strategy as string) || ''}
          onChange={(e) =>
            handleStrategyChange(currentWord.id, (e.target.value as WordProcessingStrategy) || null)
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
          className={style.saveButton}
          onClick={() => handleSaveStrategy(currentWord.id, currentWord.strategy!)}
          disabled={!currentWord.strategy}
        >
          Sačuvaj
        </Button>
      </div>
      <div className={style.info}>
        <p>
          <strong>Riječ:</strong> {currentWord.headword}
        </p>
        <p>
          <strong>Pojavljivanja:</strong> {currentWord.count}
        </p>
        <p>
          <strong>Nova:</strong> {currentWord.is_new ? 'Da' : 'Ne'}
        </p>
        <p>
          <strong>Primjeri:</strong>
        </p>
        <ul>
          {currentWord.examples.map((ex, i) => (
            <li key={i}>{ex}</li>
          ))}
        </ul>
      </div>

      <div className={style.processingButtons}>
        <Button
          onClick={() => setProcessingIndex((prev) => Math.max(0, prev - 1))}
          disabled={processingIndex === 0}
        >
          Nazad
        </Button>
        <Button
          onClick={() => setProcessingIndex((prev) => Math.min(prev + 1, assignedWords.length - 1))}
          disabled={processingIndex >= assignedWords.length - 1}
        >
          Sljedeće
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
    </div>
  );
}
