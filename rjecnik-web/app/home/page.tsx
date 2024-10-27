"use client";

import { BookText, Keyboard, Volume2 } from "lucide-react";
import Feature from "./feature";
import Header from "./header";
import Section from "./section";

import style from "./home.module.css";
import FaqItem from "./faqItem";
import SearchBar from "../components/searchBar";
import Footer from "../components/footer";

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

        <Section id="about" title="O Nama" className={style.sectionBackground}>
          <div>
            <p className={style.mb4}>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Incidunt
              libero aspernatur magnam quibusdam consequatur delectus
              laudantium. Rem, laboriosam delectus veniam assumenda labore
              ullam, voluptatibus recusandae perferendis maiores maxime,
              doloremque incidunt!
            </p>
            <p>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quidem
              obcaecati commodi error omnis autem atque iusto quibusdam tempora
              neque corporis!
            </p>
          </div>
        </Section>

        <Section id="faq" title="Često Postavljana Pitanja">
          <div>
            <FaqItem
              question="Lorem ipsum dolor sit amet?"
              answer="Lorem ipsum, dolor sit amet consectetur adipisicing elit. Excepturi eos consequuntur animi repellat sed suscipit, ratione voluptates odit aperiam iure."
            />
            <FaqItem
              question="Lorem ipsum dolor sit amet?"
              answer="Lorem ipsum, dolor sit amet consectetur adipisicing elit. Excepturi eos consequuntur animi repellat sed suscipit, ratione voluptates odit aperiam iure."
            />
            <FaqItem
              question="Lorem ipsum dolor sit amet?"
              answer="Lorem ipsum, dolor sit amet consectetur adipisicing elit. Excepturi eos consequuntur animi repellat sed suscipit, ratione voluptates odit aperiam iure."
            />
          </div>
        </Section>
      </main>

      <Footer />
    </>
  );
};

export default Home;
