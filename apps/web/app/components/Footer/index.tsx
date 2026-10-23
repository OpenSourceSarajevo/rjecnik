import Link from 'next/link';
import { BookOpen } from 'lucide-react';

import GithubIcon from '../GithubIcon';

import style from './Footer.module.css';

const Footer = () => {
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_REPOSITORY;

  return (
    <footer className={style.footer}>
      <div className={`container ${style.content}`}>
        <div className={style.brand}>
          <Link href="/" className={style.logo}>
            <BookOpen size={18} className={style.logoIcon} aria-hidden="true" />
            <span>Rječnik bosanskog jezika</span>
          </Link>
          <p className={style.tagline}>
            Otvoreni, besplatni rječnik koji razvija zajednica{' '}
            <a
              href="https://github.com/OpenSourceSarajevo"
              target="_blank"
              rel="noopener noreferrer"
              className={style.inlineLink}
            >
              Open Source Sarajevo
            </a>
            .
          </p>
        </div>

        <nav className={style.columns} aria-label="Podnožje">
          <div className={style.column}>
            <h2 className={style.columnTitle}>Rječnik</h2>
            <Link href="/rjecnik" className={style.link}>
              Pretraga
            </Link>
            <Link href="/#o-projektu" className={style.link}>
              O projektu
            </Link>
            <Link href="/#faq" className={style.link}>
              Česta pitanja
            </Link>
          </div>
          <div className={style.column}>
            <h2 className={style.columnTitle}>Zajednica</h2>
            <a href={githubUrl} target="_blank" rel="noopener noreferrer" className={style.link}>
              <GithubIcon size={14} /> GitHub
            </a>
            <a
              href={`${githubUrl}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className={style.link}
            >
              Prijavi grešku
            </a>
          </div>
          <div className={style.column}>
            <h2 className={style.columnTitle}>Pravno</h2>
            <Link href="/privatnost" className={style.link}>
              Privatnost
            </Link>
            <Link href="/uslovi-koristenja" className={style.link}>
              Uslovi korištenja
            </Link>
          </div>
        </nav>
      </div>

      <div className={style.bottomBar}>
        <div className={`container ${style.bottom}`}>
          <span>© {new Date().getFullYear()} Open Source Sarajevo</span>
          <span>Objavljeno pod GPL licencom</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
