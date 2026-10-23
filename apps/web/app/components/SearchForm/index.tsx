import { Search } from 'lucide-react';

import style from './SearchForm.module.css';

type SearchFormProps = {
  size?: 'md' | 'lg';
  autoFocus?: boolean;
};

// Plain GET form so search works before (and without) JavaScript
const SearchForm = ({ size = 'md', autoFocus = false }: SearchFormProps) => {
  return (
    <form action="/rjecnik" method="get" role="search" className={`${style.form} ${style[size]}`}>
      <Search className={style.icon} size={size === 'lg' ? 22 : 18} aria-hidden="true" />
      <input
        type="search"
        name="q"
        placeholder="Pretraži riječ…"
        aria-label="Pretraži riječ"
        autoComplete="off"
        autoFocus={autoFocus}
        className={style.input}
      />
      <button type="submit" className={style.button}>
        Traži
      </button>
    </form>
  );
};

export default SearchForm;
