import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import SearchForm from '../components/SearchForm';
import Section from './Section';
import FaqItem from './FaqItem';
import Guide from './Guide';

import style from './page.module.css';

const suggestions = ['sevdah', 'merhamet', 'ćuprija', 'avlija', 'džezva'];

const faq = [
  {
    question: 'Čemu služi ovaj rječnik?',
    answer:
      'Ovo je online bosanski rječnik koji pruža definicije, gramatičke informacije, sinonime, antonime i detalje o izgovoru riječi.',
  },
  {
    question: 'Hoće li rječnik podržavati prijevode?',
    answer:
      'Rječnik je fokusiran na bosanski jezik, trenutno ne planiramo podržavanje prijevoda na druge jezike.',
  },
  {
    question: 'Mogu li doprinijeti rječniku?',
    answer:
      'Trenutno jedino podržavamo otvorene doprinose putem prijavljivanja grešaka na GitHubu, ali radimo na funkciji koja će omogućiti korisnicima da predlažu ispravke i dodaju nove riječi.',
  },
];

const Home = () => {
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_REPOSITORY;

  return (
    <>
      <section className={style.hero}>
        <div className={`container ${style.heroText}`}>
          <h1 className={style.heroTitle}>
            Rječnik <span className={style.accent}>bosanskog jezika</span>
          </h1>
          <p className={style.heroSubtitle}>Pronađite značenje, oblike i srodne riječi.</p>

          <SearchForm size="lg" />

          <div className={style.suggestions}>
            <span className={style.suggestionsLabel}>Probajte:</span>
            {suggestions.map((word) => (
              <Link
                key={word}
                href={`/rjecnik?q=${encodeURIComponent(word)}`}
                className={style.suggestion}
              >
                {word}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Section id="vodic" title="Vodič" centered>
        <Guide />
      </Section>

      <Section id="o-projektu" title="O projektu">
        <div className={style.aboutText}>
          <p>
            Bosanski online rječnik je sveobuhvatan digitalni resurs dizajniran za očuvanje i
            promociju bosanskog jezika. Cilj nam je pružiti pouzdanu i pristupačnu referencu za
            govornike bosanskog jezika, učenike i lingviste.
          </p>
          <p>
            Projekat je u potpunosti otvorenog koda i razvija ga zajednica volontera okupljena oko
            Open Source Sarajevo. Svako može pregledati kod, predložiti poboljšanje ili prijaviti
            grešku.
          </p>
        </div>
      </Section>

      <section className="container">
        <div className={style.cta}>
          <div>
            <h2 className={style.ctaTitle}>Pomozite nam da rječnik bude bolji</h2>
            <p className={style.ctaText}>
              Pronašli ste grešku u definiciji ili nedostaje riječ? Javite nam, svaka prijava
              pomaže.
            </p>
          </div>
          <div className={style.ctaActions}>
            <a
              href={`${githubUrl}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className={style.buttonPrimary}
            >
              Prijavi grešku <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <Section id="faq" title="Često postavljana pitanja">
        <div>
          {faq.map((item) => (
            <FaqItem key={item.question} question={item.question} answer={item.answer} />
          ))}
        </div>
      </Section>
    </>
  );
};

export default Home;
