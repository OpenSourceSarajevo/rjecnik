"use client";

import { motion } from "framer-motion";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import styles from "./page.module.css";

import { sections } from "./sections.data";

const TermsConditions = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className={styles.termsContainer}>
      <div className={styles.contentWrapper}>
        <aside className={styles.sidebar}>
          <ul>
            {sections.map((section, index) => (
              <li key={index}>
                <a href={`#${section.title}`}>{section.title}</a>
              </li>
            ))}
          </ul>
        </aside>
        <motion.main
          className={styles.termsMain}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className={styles.termsHeader}>
            <h1 className={styles.termsTitle}>Uslovi korištenja</h1>
            <p className={styles.termsDate}>
              Datum stupanja na snagu: 2025-02-16
            </p>
          </motion.div>

          <div className={styles.termsSections}>
            <ol>
              {sections.map((section, index) => (
                <motion.section
                  key={index}
                  variants={itemVariants}
                  className={styles.termsSection}
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
    </div>
  );
};

export default TermsConditions;
