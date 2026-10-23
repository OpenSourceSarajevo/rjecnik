'use client';

import React, { useEffect, useRef, useState } from 'react';
import isEqual from 'lodash/isEqual';
import { SendHorizontal, Sparkles, Square, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { ChatStreamEvent } from '@/app/api/words/[id]/chat/route';
import Button from '@/app/components/Button';
import type { ChatTurn } from '@/utils/ai/assistant';
import { SHORTCUTS } from '@/utils/ai/shortcuts';
import {
  toWordContext,
  type WordContext,
  type WordDraft,
  type WordProposal,
} from '@/utils/ai/wordProposal';
import ProposalSummary from './ProposalSummary';
import style from './WordChatPanel.module.css';

type ChatMessage =
  | { id: string; role: 'user'; instruction: string; word: WordContext }
  | {
      id: string;
      role: 'assistant';
      status: 'streaming' | 'done' | 'error';
      text: string;
      proposal?: WordProposal;
    };

type AssistantMessage = Extract<ChatMessage, { role: 'assistant' }>;

type Props = {
  wordId: string;
  // The current, possibly unsaved, form contents; sent with every message
  draft: WordDraft;
  // Replaces the form contents; saving stays up to the editor
  onApply: (draft: WordDraft) => void;
  open: boolean;
  onClose: () => void;
};

type AppliedProposal = { messageId: string; previous: WordDraft; result: WordDraft };

// Stays below the route's limit of 20 turns, leaving room for the new message
const MAX_HISTORY_TURNS = 18;

const CONNECTION_ERROR = 'Veza s asistentom je prekinuta. Pokušajte ponovo.';

// Only completed exchanges are sent back: failed or stopped ones are left out, so the history
// alternates editor and assistant turns
const toHistory = (messages: ChatMessage[]): ChatTurn[] => {
  const turns: ChatTurn[] = [];
  messages.forEach((message, i) => {
    const question = messages[i - 1];
    if (message.role !== 'assistant' || !message.proposal || question?.role !== 'user') return;
    turns.push(
      { role: 'user', instruction: question.instruction, word: question.word },
      { role: 'assistant', proposal: message.proposal }
    );
  });
  return turns.slice(-MAX_HISTORY_TURNS);
};

const errorMessageForStatus = (status: number, error?: string) => {
  if (status === 401) return 'Sesija je istekla. Prijavite se ponovo.';
  if (status === 403) return 'Nemate dozvolu za korištenje asistenta.';
  if ((status === 404 || status === 429) && error) return error;
  return `Greška: ${status}`;
};

// The chat route answers with newline-delimited JSON events
async function* readEvents(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) return;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (line.trim()) yield JSON.parse(line) as ChatStreamEvent;
    }
  }
}

const WordChatPanel: React.FC<Props> = ({ wordId, draft, onApply, open, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastApplied, setLastApplied] = useState<AppliedProposal | null>(null);
  // Identifies this chat in the stored conversations
  const [conversationId] = useState(() => uuidv4());
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Stop a running request when leaving the page
  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  const send = async (instruction: string) => {
    const text = instruction.trim();
    if (!text || isStreaming) return;

    const word = toWordContext(draft);
    const replyId = uuidv4();
    const conversation: ChatTurn[] = [
      ...toHistory(messages),
      { role: 'user', instruction: text, word },
    ];
    const updateReply = (patch: (message: AssistantMessage) => Partial<AssistantMessage>) =>
      setMessages((prev) =>
        prev.map((m) => (m.id === replyId && m.role === 'assistant' ? { ...m, ...patch(m) } : m))
      );

    setMessages((prev) => [
      ...prev,
      { id: uuidv4(), role: 'user', instruction: text, word },
      { id: replyId, role: 'assistant', status: 'streaming', text: '' },
    ]);
    setInput('');
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`/api/words/${wordId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, conversation }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        updateReply(() => ({
          status: 'error',
          text: errorMessageForStatus(res.status, data?.error),
        }));
        return;
      }

      let finished = false;
      for await (const event of readEvents(res.body)) {
        if (event.type === 'reply') {
          updateReply((m) => ({ text: m.text + event.text }));
        } else if (event.type === 'proposal') {
          finished = true;
          updateReply(() => ({
            status: 'done',
            text: event.proposal.reply,
            proposal: event.proposal,
          }));
        } else {
          finished = true;
          updateReply(() => ({ status: 'error', text: event.message }));
        }
      }
      if (!finished) updateReply(() => ({ status: 'error', text: CONNECTION_ERROR }));
    } catch {
      updateReply(() => ({
        status: 'error',
        text: controller.signal.aborted ? 'Odgovor je zaustavljen.' : CONNECTION_ERROR,
      }));
    } finally {
      abortRef.current = null;
      setIsStreaming(false);
    }
  };

  const apply = (messageId: string, result: WordDraft) => {
    setLastApplied({ messageId, previous: draft, result });
    onApply(result);
  };

  const undo = () => {
    if (!lastApplied) return;
    onApply(lastApplied.previous);
    setLastApplied(null);
  };

  // Undo is only offered while the form is unchanged since applying, so it can't discard edits
  // made afterwards
  const canUndo = lastApplied !== null && isEqual(draft, lastApplied.result);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  // Enter sends, Shift+Enter starts a new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <aside className={style.panel} hidden={!open} aria-label="Asistent">
      <div className={style.header}>
        <span className={style.headerIcon}>
          <Sparkles size={16} />
        </span>
        <h2 className={style.title}>Asistent</h2>
        <button
          type="button"
          className={style.closeButton}
          onClick={onClose}
          aria-label="Zatvori asistenta"
        >
          <X size={16} />
        </button>
      </div>

      <div className={style.messages} ref={listRef} aria-live="polite">
        {messages.length === 0 && (
          <p className={style.empty}>
            Napišite uputu ili izaberite prečicu. Asistent vidi trenutno stanje forme, uključujući
            nesačuvane izmjene, i predlaže izmjene koje pregledate prije primjene.
          </p>
        )}
        {messages.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className={style.userMessage}>
              {m.instruction}
            </div>
          ) : (
            <div
              key={m.id}
              className={
                m.status === 'error'
                  ? style.errorMessage
                  : m.proposal?.word
                    ? style.proposalMessage
                    : style.assistantMessage
              }
            >
              {m.text || <span className={style.thinking}>Asistent razmišlja</span>}
              {m.proposal?.word && (
                <ProposalSummary
                  draft={draft}
                  word={m.proposal.word}
                  applied={lastApplied?.messageId === m.id}
                  canUndo={lastApplied?.messageId === m.id && canUndo}
                  onApply={(result) => apply(m.id, result)}
                  onUndo={undo}
                />
              )}
            </div>
          )
        )}
      </div>

      <div className={style.shortcuts}>
        {SHORTCUTS.map(({ instruction }) => (
          <button
            key={instruction}
            type="button"
            className={style.shortcut}
            disabled={isStreaming}
            onClick={() => send(instruction)}
          >
            {instruction}
          </button>
        ))}
      </div>

      <form className={style.composer} onSubmit={handleSubmit}>
        <textarea
          className={style.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Napišite uputu..."
          rows={2}
          aria-label="Uputa asistentu"
        />
        {isStreaming ? (
          <Button
            type="button"
            className={style.sendButton}
            onClick={() => abortRef.current?.abort()}
            aria-label="Zaustavi odgovor"
          >
            <Square size={16} />
          </Button>
        ) : (
          <Button
            type="submit"
            className={style.sendButton}
            disabled={!input.trim()}
            aria-label="Pošalji"
          >
            <SendHorizontal size={16} />
          </Button>
        )}
      </form>
    </aside>
  );
};

export default WordChatPanel;
