"use client";

import { BookText, Keyboard, Volume2 } from "lucide-react";

import Feature from "./Feature";
import Header from "./Header";
import Section from "./Section";
import FaqItem from "./FaqItem";
import SearchBar from "@/app/components/SearchBar";
import Footer from "@/app/components/Footer";

import style from "./page.module.css";

const Home = () => {
  const faq = [
    {
      question: "Čemu služi ovaj rječnik?",
      answer:
        "Ovo je online bosanski rječnik koji pruža definicije, gramatičke informacije, sinonime, antonime i detalje o izgovoru riječi.",
    },
    {
      question: "Hoće li rječnik podržavati prijevode?",
      answer:
        "Rječnik je fokusiran na bosanski jezik, trenutno ne planiramo podržavanje prijevoda na druge jezike.",
    },
    {
      question: "Mogu li doprinijeti rječniku?",
      answer:
        "Trenutno jedino podržavamo otvorene doprinose putem prijavljivanja grešaka na GitHubu, ali radimo na funkciji koja će omogućiti korisnicima da predlažu ispravke i dodaju nove riječi.",
    },
  ];

  return (
    <>
      <Header />

      <main>
        <Section id="hero" title="" className={style.hero}>
          <div className={style.textCenter}>
            <h1 className={style.heroTitle}>Bosanski Online Rječnik</h1>
          </div>

          <div className={style.mb4}>
            <SearchBar value={""} onChange={() => {}} />
          </div>

          <div className={style.featuresGrid}>
            <Feature
              Icon={BookText}
              title="Definicije"
              description="Detaljne definicije sa primjerima upotrebe u svakodnevnom govoru"
            />
            <Feature
              Icon={Volume2}
              title="Izgovor"
              description="Audio zapisi izvornih govornika za pravilno učenje izgovora"
            />
            <Feature
              Icon={Keyboard}
              title="Latinica i Ćirilica"
              description="Podrška za oba pisma bosanskog jezika"
            />
          </div>
        </Section>

        <Section
          id="o-projektu"
          title="O Projektu"
          className={style.sectionBackground}
        >
          <div>
            <p className={style.mb4}>
              Bosanski Online Rječnik je sveobuhvatan digitalni resurs
              dizajniran za očuvanje i promociju bosanskog jezika. Naš projekat
              koristi najnovije web tehnologije kako bi pružio pouzdanu i
              pristupačnu referencu za govornike bosanskog jezika, učenike i
              lingviste.
            </p>
            <p>
              Izgrađen koristeći Next.js i Supabase, naš rječnik nudi robusnu
              platformu koja omogućava brzo pretraživanje, detaljne definicije i
              primjere upotrebe. Podržavamo i latinicu i ćirilicu, čineći naš
              resurs inkluzivnim za sve korisnike bosanskog jezika.
            </p>
          </div>
        </Section>

        <Section id="faq" title="Često Postavljana Pitanja">
          <div>
            {faq.map((i) => (
              <FaqItem
                key={i.question}
                question={i.question}
                answer={i.answer}
              />
            ))}
          </div>
        </Section>
      </main>

      <Footer />
    </>
  );
};

export default Home;
