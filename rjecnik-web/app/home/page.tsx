"use client";

import { BookText, Keyboard, Volume2 } from 'lucide-react';

import Feature from "./Feature";
import Header from "./Header";
import Section from "./Section";
import FaqItem from "./FaqItem";
import SearchBar from "@/app/components/SearchBar";
import Footer from "@/app/components/Footer";

import style from "./page.module.css";

const Home = () => {
  return (
    <>
      <Header />

      <main>
        <Section id="hero" title="" className={style.hero}>
          <div className={style.textCenter}>
            <h1 className={style.heroTitle}>Bosanski Online Rječnik</h1>
            <p className={style.heroSubtitle}>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Consequuntur magni molestiae quos magnam veniam exercitationem.
            </p>
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

        <Section id="about" title="O Projektu" className={style.sectionBackground}>
          <div>
            <p className={style.mb4}>
              Bosanski Online Rječnik je sveobuhvatan digitalni resurs dizajniran za očuvanje i promociju bosanskog jezika. Naš projekat koristi najnovije web tehnologije kako bi pružio pouzdanu i pristupačnu referencu za govornike bosanskog jezika, učenike i lingviste.
            </p>
            <p>
              Izgrađen koristeći Next.js i Supabase, naš rječnik nudi robusnu platformu koja omogućava brzo pretraživanje, detaljne definicije i primjere upotrebe. Podržavamo i latinicu i ćirilicu, čineći naš resurs inkluzivnim za sve korisnike bosanskog jezika.
            </p>
          </div>
        </Section>

        <Section id="faq" title="Često Postavljana Pitanja">
  <div>
    <FaqItem
      question="Čemu služi ovaj rječnik?"
      answer="Ovo je online bosanski rječnik koji pruža definicije, gramatičke informacije, sinonime, antonime i detalje o izgovoru riječi."
    />
    <FaqItem
      question="Hoće li rječnik podržavati prijevode?"
      answer="Rječnik je fokusiran na bosanski jezik, trenutno ne planiramo podržavanje prijevoda na druge jezike."
    />
    <FaqItem
      question="Mogu li doprinijeti rječniku?"
      answer="Trenutno jedino podržavamo otvorene doprinose putem prijavljivanja grešaka na GitHubu, ali radimo na funkciji koja će omogućiti korisnicima da predlažu ispravke i dodaju nove riječi."
    />
  </div>
</Section>


        <Section id="privacy" title="Politika Privatnosti">
          <div>
            <p className={style.mb4}>
              Vaša privatnost je ključna za Bosanski Online Rječnik. Naša aplikacija koristi Supabase za upravljanje podacima, osiguravajući visok nivo sigurnosti i privatnosti. Prikupljamo samo neophodne podatke za funkcionisanje servisa.
            </p>
            <p>
              Za detalje o tome kako se upravlja vašim podacima u Supabase okruženju, uključujući sigurnosne prakse i enkripciju, molimo vas da pogledate Supabase dokumentaciju o privatnosti i sigurnosti.
            </p>
          </div>
        </Section>

        <Section id="terms" title="Uslovi Korištenja">
          <div>
            <p className={style.mb4}>
              Korištenjem Bosanskog Online Rječnika, pristajete na naše uslove korištenja. Ovaj projekat je otvorenog koda, razvijen pod određenom licencom (molimo specificirajte licencu u vašem README).
            </p>
            <p>
              Ohrabrujemo doprinose zajednici, ali molimo da poštujete smjernice za doprinos navedene u našem README fajlu. Za bilo kakvu komercijalnu upotrebu ili redistribuciju projekta, molimo vas da prvo provjerite uslove licence.
            </p>
          </div>
        </Section>
      </main>

      <Footer />
    </>
  );
};

export default Home;