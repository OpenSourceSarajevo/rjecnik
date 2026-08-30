'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { UploadCloud, Link2, Tag, Clock, Send, FileText } from 'lucide-react';
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

function HistorySkeleton() {
  return (
    <div className={style.historyList}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={`${style.historyItem} ${style.skeleton}`} />
      ))}
    </div>
  );
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

  const fetchRecentUploads = useCallback(async () => {
    setIsLoading(true);
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
  }, [supabase]);

  useEffect(() => {
    Promise.resolve().then(() => fetchRecentUploads());
  }, [fetchRecentUploads]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
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
        fetchRecentUploads();
      }
    } catch (error) {
      addToast('error', `Greška: ${error instanceof Error ? error.message : 'Nepoznata greška'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = useMemo(
    () => (text.trim() ? text.trim().split(/\s+/).length : 0),
    [text]
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('bs-BA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={style.container}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className={style.header}>
        <h1 className={style.title}>Učitaj tekst</h1>
        <p className={style.subtitle}>Dodaj novi tekst kako bi se riječi obradile i uvrstile u rječnik</p>
      </div>

      <div className={style.content}>
        <div className={style.formSection}>
          <div className={style.sectionHeading}>
            <div className={style.sectionIcon}>
              <UploadCloud size={18} />
            </div>
            <h2>Novi tekst</h2>
          </div>

          <form onSubmit={handleSubmit} className={style.form}>
            <div className={style.formGroup}>
              <div className={style.labelRow}>
                <label htmlFor="text">Sadržaj teksta *</label>
                <span className={style.wordCount}>
                  {wordCount.toLocaleString('bs-BA')} {wordCount === 1 ? 'riječ' : 'riječi'}
                </span>
              </div>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Nalijepite svoj tekst ovdje..."
                required
                className={style.textarea}
                rows={12}
              />
            </div>

            <div className={style.formRow}>
              <div className={style.formGroup}>
                <label htmlFor="source">
                  <Tag size={14} className={style.labelIcon} />
                  Izvor
                </label>
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
                <label htmlFor="url">
                  <Link2 size={14} className={style.labelIcon} />
                  URL
                </label>
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
              <Send size={16} />
              {isSubmitting ? 'Slanje...' : 'Pošalji tekst'}
            </Button>
          </form>
        </div>

        <div className={style.recentSection}>
          <div className={style.sectionHeading}>
            <div className={style.sectionIcon}>
              <Clock size={18} />
            </div>
            <h2>Nedavna učitavanja</h2>
          </div>

          {isLoading ? (
            <HistorySkeleton />
          ) : recentUploads.length === 0 ? (
            <div className={style.emptyState}>
              <FileText size={28} />
              <p>Nema pronađenih nedavnih uploada.</p>
            </div>
          ) : (
            <ul className={style.historyList}>
              {recentUploads.map((upload) => (
                <li key={upload.id} className={style.historyItem}>
                  <div className={style.historyMain}>
                    <span className={style.historySource}>
                      {upload.url ? (
                        <a
                          href={upload.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={style.urlLink}
                        >
                          {upload.source || upload.url}
                        </a>
                      ) : (
                        upload.source || 'Bez naziva'
                      )}
                    </span>
                    <span className={style.historyDate}>{formatDate(upload.created_at)}</span>
                  </div>
                  <div className={style.historyMeta}>
                    <span className={style.metaBadge}>{upload.word_count} riječi</span>
                    <span className={`${style.metaBadge} ${style.metaBadgeAccent}`}>
                      +{upload.new_word_count} novih
                    </span>
                    <span className={style.metaBadge}>{upload.sentence_count} rečenica</span>
                    <span className={style.historyUser}>{upload.user_email}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
