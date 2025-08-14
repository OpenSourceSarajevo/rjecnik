'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import ToastContainer, { Toast } from '@/app/components/Toast';
import style from './page.module.css';
import Button from '@/app/components/Button';

interface IngestionLog {
  id: number;
  source: string | null;
  url: string | null;
  text_hash: string;
  user_email: string;
  word_count: number;
  new_word_count: number;
  sentence_count: number;
  created_at: string;
}

export default function Page() {
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [recentUploads, setRecentUploads] = useState<IngestionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchRecentUploads();
  }, []);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      type,
      message,
      duration: type === 'error' ? 7000 : 5000,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const fetchRecentUploads = async () => {
    try {
      const { data, error } = await supabase
        .from('ingestion_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching recent uploads:', error);
        addToast('error', 'Greška pri učitavanju nedavnih uploada');
      } else {
        setRecentUploads(data || []);
      }
    } catch (error) {
      console.error('Error fetching recent uploads:', error);
      addToast('error', 'Greška pri učitavanju nedavnih uploada');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (userError || !user?.email) {
        addToast('error', 'Greška: Korisnik nije autentifikovan');
        return;
      }

      console.log(session?.access_token);

      const { error } = await supabase.functions.invoke('data-ingestion', {
        body: {
          text,
          source: source || null,
          url: url || null,
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) {
        addToast('error', `Greška: ${error.message}`);
      } else {
        addToast('success', 'Tekst uspješno poslan!');
        setText('');
        setSource('');
        setUrl('');
        // Refresh the recent uploads list
        fetchRecentUploads();
      }
    } catch (error) {
      addToast('error', `Greška: ${error instanceof Error ? error.message : 'Nepoznata greška'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toISOString();
  };

  return (
    <div className={style.container}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <h1 className={style.title}>Učitaj Tekst</h1>

      <div className={style.content}>
        <div className={style.formSection}>
          <h2>Učitaj Novi Tekst</h2>
          <form onSubmit={handleSubmit} className={style.form}>
            <div className={style.formGroup}>
              <label htmlFor="text">Sadržaj Teksta *</label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Nalijepite svoj tekst ovdje..."
                required
                className={style.textarea}
                rows={10}
              />
            </div>

            <div className={style.formRow}>
              <div className={style.formGroup}>
                <label htmlFor="source">Izvor</label>
                <input
                  id="source"
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="npr. Naslov knjige, naziv članka"
                  className={style.input}
                />
              </div>

              <div className={style.formGroup}>
                <label htmlFor="url">URL</label>
                <input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://primjer.com"
                  className={style.input}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !text.trim()}
              className={style.submitButton}
            >
              {isSubmitting ? 'Slanje...' : 'Pošalji Tekst'}
            </Button>
          </form>
        </div>

        <div className={style.recentSection}>
          <h2>Nedavna Učitavanja</h2>
          {isLoading ? (
            <p>Učitavanje nedavnih uploada...</p>
          ) : recentUploads.length === 0 ? (
            <p>Nema pronađenih nedavnih uploada.</p>
          ) : (
            <div className={style.tableContainer}>
              <table className={style.logsTable}>
                <thead>
                  <tr>
                    <th>Izvor</th>
                    <th>Riječi</th>
                    <th>Nove Riječi</th>
                    <th>Rečenice</th>
                    <th>Datum</th>
                    <th>Korisnik</th>
                    <th>URL</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUploads.map((upload) => (
                    <tr key={upload.id}>
                      <td>{upload.source || '-'}</td>
                      <td>{upload.word_count}</td>
                      <td>{upload.new_word_count}</td>
                      <td>{upload.sentence_count}</td>
                      <td>{formatDate(upload.created_at)}</td>
                      <td>{upload.user_email}</td>
                      <td>
                        {upload.url ? (
                          <a
                            href={upload.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={style.urlLink}
                          >
                            Link
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
