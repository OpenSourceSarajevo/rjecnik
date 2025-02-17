import style from "./Footer.module.css";
import { Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className={style.footer}>
      <div className={`${style.content} ${style.container}`}>
        <a href="https://github.com/OpenSourceSarajevo" target="_blank" rel="noopener noreferrer" className={style.githubLink}>
          <Github size={20} className={style.githubIcon} />
          <span className={style.text}>Open Source Sarajevo</span>
        </a>

        <div className={style.links}>
          <a href="/privacy" className={style.link}>
            Privatnost
          </a>
          <a href="/terms" className={style.link}>
            Uslovi korištenja
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
