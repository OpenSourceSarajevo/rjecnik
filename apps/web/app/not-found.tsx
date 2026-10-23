import Link from 'next/link';

import SearchForm from './components/SearchForm';

import style from './not-found.module.css';

const NotFound = () => {
  return (
    <div className={`container ${style.page}`}>
      <span className={style.code}>404</span>
      <h1 className={style.title}>Stranica nije pronađena</h1>
      <p className={style.text}>
        Riječ ili stranica koju tražite ne postoji. Pokušajte je pronaći putem pretrage.
      </p>
      <div className={style.search}>
        <SearchForm />
      </div>
      <Link href="/" className={style.home}>
        Nazad na početnu
      </Link>
    </div>
  );
};

export default NotFound;
