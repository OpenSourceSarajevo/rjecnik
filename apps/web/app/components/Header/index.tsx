import Link from 'next/link';
import { BookOpen } from 'lucide-react';

import style from './Header.module.css';

const Header = () => {
  return (
    <header className={style.header}>
      <nav className={`container ${style.nav}`} aria-label="Glavna navigacija">
        <Link href="/" className={style.logo}>
          <span className={style.logoMark}>
            <BookOpen size={18} aria-hidden="true" />
          </span>
          <span className={style.logoText}>Rječnik</span>
        </Link>

        <div className={style.navLinks}>
          <Link href="/#o-projektu" className={style.navLink}>
            O projektu
          </Link>
          <Link href="/#faq" className={style.navLink}>
            FAQ
          </Link>
          <Link href="/rjecnik" className={style.cta}>
            Otvori rječnik
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
