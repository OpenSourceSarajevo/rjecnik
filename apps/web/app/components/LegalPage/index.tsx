import style from './LegalPage.module.css';

type LegalSection = {
  title: string;
  content: string;
};

type LegalPageProps = {
  title: string;
  effectiveDate: string;
  intro?: string;
  sections: LegalSection[];
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'dj')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const LegalPage = ({ title, effectiveDate, intro, sections }: LegalPageProps) => {
  return (
    <div className={`container ${style.page}`}>
      <header className={style.header}>
        <h1 className={style.title}>{title}</h1>
        <p className={style.date}>Datum stupanja na snagu: {effectiveDate}</p>
        {intro && <p className={style.intro}>{intro}</p>}
      </header>

      <div className={style.layout}>
        <nav className={style.toc} aria-label="Sadržaj">
          <span className={style.tocTitle}>Sadržaj</span>
          <ol>
            {sections.map((section) => (
              <li key={section.title}>
                <a href={`#${slugify(section.title)}`}>{section.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        <ol className={style.sections}>
          {sections.map((section) => (
            <li key={section.title} id={slugify(section.title)} className={style.section}>
              <h2 className={style.sectionTitle}>{section.title}</h2>
              <p className={style.sectionContent}>{section.content}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default LegalPage;
