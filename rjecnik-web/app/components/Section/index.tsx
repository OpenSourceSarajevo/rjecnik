import style from "./Section.module.css";

interface SectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Section = ({ id, title, children, className = "" }: SectionProps) => {
  return (
    <section id={id} className={`${style.section} ${className}`}>
      <div className={style.container}>
        {title && <h2 className={style.sectionTitle}>{title}</h2>}
        {children}
      </div>
    </section>
  );
};

export default Section;
