import style from "./footer.module.css";

const Footer = () => {
  return (
    <footer className={style.footer}>
      <div className={`${style.content} ${style.container}`}>
        <span className={style.text}>Open Source Sarajevo</span>

        <div className={style.links}>
          <a href="#privacy" className={style.link}>
            Privatnost
          </a>
          <a href="#terms" className={style.link}>
            Uslovi korištenja
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
