import React from 'react';
import { StickyNote } from 'lucide-react';

import style from './NoteField.module.css';

type Props = {
  note: string;
  setNote: (note: string) => void;
};

// Internal note for editors about open issues with the word; never shown on the public site
export default function NoteField({ note, setNote }: Props) {
  return (
    <div className={note.trim() ? style.wrapperActive : style.wrapper}>
      <label className={style.label} htmlFor="word-note">
        <StickyNote size={16} />
        Napomena
      </label>
      <textarea
        id="word-note"
        className={style.textarea}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Interna napomena za urednike, ne prikazuje se na stranici"
        rows={note.trim() ? 3 : 1}
      />
      {note.trim() && (
        <p className={style.hint}>Kada riješite napomenu, obrišite tekst i sačuvajte izmjene.</p>
      )}
    </div>
  );
}
