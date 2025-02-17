"use client";

import { motion } from "framer-motion";
import Header from '@/app/home/Header';
import Footer from '@/app/components/Footer';
import styles from './page.module.css';

const TermsConditions = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const sections = [
    { title: "1. Prihvatanje uslova", content: "Korištenjem ove web stranice, saglasni ste sa ovim uslovima. Ako se ne slažete, molimo vas da ne koristite stranicu." },
    { title: "2. Korištenje sadržaja", content: "Ovaj rječnik možete koristiti za lične i edukativne svrhe." },
    { title: "3. Licenca", content: "Ovaj rječnik i kod koji pokreće web stranicu su objavljeni pod GNU General Public License (GPL). To znači da imate pravo da koristite, distribuirate i mijenjate kod pod uslovom da zadržite istu licencu." },
    { title: "4. Odricanje od odgovornosti", content: "Ovaj rječnik se pruža 'takav kakav jeste', bez garancija tačnosti. Ne snosimo odgovornost za pogrešna tumačenja, greške ili zastarjele informacije." },
    { title: "5. Ograničenje odgovornosti", content: "Ne odgovaramo za bilo kakav gubitak ili štetu nastalu korištenjem web stranice." },
    { title: "6. Izmjene uslova", content: "Zadržavamo pravo ažuriranja ovih uslova. Nastavak korištenja web stranice znači prihvatanje ažuriranih uslova." }
  ];

  return (
    <div className={styles.termsContainer}>
      <Header />
      <div className={styles.contentWrapper}>
        <aside className={styles.sidebar}>
          <ul>
            {sections.map((section, index) => (
              <li key={index}>{section.title}</li>
            ))}
          </ul>
        </aside>
        <motion.main className={styles.termsMain} initial="hidden" animate="visible" variants={containerVariants}>
          <motion.div variants={itemVariants} className={styles.termsHeader}>
            <h1 className={styles.termsTitle}>Uslovi korištenja</h1>
            <p className={styles.termsDate}>Datum stupanja na snagu: 2025-02-16</p>
          </motion.div>

          <div className={styles.termsSections}>
            {sections.map((section, index) => (
              <motion.section key={index} variants={itemVariants} className={styles.termsSection}>
                <h2 className={styles.sectionTitle}>{section.title}</h2>
                <p className={styles.sectionContent}>{section.content}</p>
              </motion.section>
            ))}
          </div>
        </motion.main>
      </div>
      <Footer />
    </div>
  );
};

export default TermsConditions;
