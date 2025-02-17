"use client";

import { motion } from "framer-motion";
import Header from "@/app/home/Header";
import Footer from "@/app/components/Footer";
import styles from "./page.module.css";
import { useState, useEffect } from "react";

const PrivacyPolicy = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const sections = [
    {
      title: "Prikupljanje podataka",
      content:
        "Prikupljamo minimalne korisničke podatke radi poboljšanja funkcionalnosti web stranice, uključujući anonimne analitičke podatke putem Vercel Analytics za praćenje performansi.",
    },
    {
      title: "Upotreba podataka",
      content:
        "Prikupljeni podaci nam pomažu da razumijemo kako korisnici koriste web stranicu, poboljšamo brzinu, upotrebljivost i sadržaj te održavamo sigurnost servisa.",
    },
    {
      title: "Treće strane",
      content:
        "Koristimo Vercel Analytics za praćenje performansi, ali ovaj servis ne prikuplja lične podatke korisnika.",
    },
    {
      title: "Kolačići",
      content:
        "Moguće je da koristimo kolačiće za analizu performansi web stranice. Kolačiće možete kontrolisati putem postavki vašeg pretraživača.",
    },
    {
      title: "Sigurnost podataka",
      content:
        "Poduzimamo razumne mjere kako bismo zaštitili vaše podatke i spriječili neovlašteni pristup.",
    },
    {
      title: "Vaša prava",
      content:
        "Pošto prikupljamo minimalne podatke, nemamo korisničke račune ili sistem praćenja korisnika. Ako imate pitanja, kontaktirajte nas za pojašnjenje.",
    },
    {
      title: "Izmjene politike privatnosti",
      content:
        "Politika privatnosti može biti ažurirana. Sve izmjene će biti objavljene na ovoj stranici.",
    },
  ];

  return (
    <div className={styles.privacyContainer}>
      <Header />
      <div className={styles.contentWrapper}>
        {!isMobile && (
          <aside className={styles.sidebar}>
            <ul>
              {sections.map((section, index) => (
                <li key={index}>
                  <a href={`#${section.title}`}>{section.title}</a>
                </li>
              ))}
            </ul>
          </aside>
        )}
        <motion.main
          className={styles.privacyMain}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className={styles.privacyHeader}>
            <h1 className={styles.privacyTitle}>Politika privatnosti</h1>
            <p className={styles.privacyDate}>
              Datum stupanja na snagu: 2025-02-16
            </p>
            <p className={styles.privacyIntro}>
              Ova Politika privatnosti objašnjava kako prikupljamo, koristimo i
              štitimo vaše podatke kada koristite Bosanski Online Rječnik.
            </p>
          </motion.div>

          <div className={styles.privacySections}>
            <ol>
              {sections.map((section, index) => (
                <motion.section
                  key={index}
                  variants={itemVariants}
                  className={styles.privacySection}
                >
                  <h2 id={section.title} className={styles.sectionTitle}>
                    <li>{section.title}</li>
                  </h2>

                  <p className={styles.sectionContent}>{section.content}</p>
                </motion.section>
              ))}
            </ol>
          </div>
        </motion.main>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
