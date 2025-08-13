import Link from 'next/link';
import style from './Footer.module.css';
import { Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className={style.footer}>
      <div className={`${style.content} ${style.container}`}>
        <a
          href="https://github.com/OpenSourceSarajevo"
          target="_blank"
          rel="noopener noreferrer"
          className={style.githubLink}
        >
          <Github size={20} className={style.githubIcon} />
          <span className={style.text}>Open Source Sarajevo</span>
        </a>

        <div className={style.links}>
          <Link href="/privatnost" className={style.link}>
            Privatnost
          </Link>
          <Link href="/uslovi-koristenja" className={style.link}>
            Uslovi korištenja
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
