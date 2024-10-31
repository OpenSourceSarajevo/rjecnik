import { BookOpen } from "lucide-react";

import style from "./Header.module.css";
import Link from "next/link";

const Header = () => {
  return (
    <header className={style.header}>
      <nav className={`${style.container} ${style.nav}`}>
        <div className={style.logo}>
          <BookOpen
            className="logo-icon"
            size={24}
            color="var(--color-primary)"
          />
          <span className={style.logoText}>Bosanski Rječnik</span>
        </div>
        <div className={style.navLinks}>
          <a href="#about" className={style.navLink}>
            O projektu
          </a>
          <a href="#faq" className={style.navLink}>
            FAQ
          </a>
          <Link href="/rjecnik" className={`${style.btn} ${style.btnPrimary}`}>
            Rječnik
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
