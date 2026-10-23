import style from './Section.module.css';

interface SectionProps {
  id: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  centered?: boolean;
  children: React.ReactNode;
}

const Section = ({ id, eyebrow, title, subtitle, centered = false, children }: SectionProps) => {
  return (
    <section id={id} className={style.section}>
      <div className="container">
        <div className={`${style.heading} ${centered ? style.centered : ''}`}>
          {eyebrow && <span className={style.eyebrow}>{eyebrow}</span>}
          {title && <h2 className={style.title}>{title}</h2>}
          {subtitle && <p className={style.subtitle}>{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  );
};

export default Section;
