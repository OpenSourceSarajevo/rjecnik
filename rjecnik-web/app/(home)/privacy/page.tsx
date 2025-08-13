'use client';

import { motion } from 'framer-motion';
import styles from './page.module.css';
import { useState, useEffect } from 'react';

import { sections } from './sections.data';

const PrivacyPolicy = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  return (
    <div className={styles.privacyContainer}>
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
            <p className={styles.privacyDate}>Datum stupanja na snagu: 2025-02-16</p>
            <p className={styles.privacyIntro}>
              Ova Politika privatnosti objašnjava kako prikupljamo, koristimo i štitimo vaše podatke
              kada koristite Bosanski Online Rječnik.
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
    </div>
  );
};

export default PrivacyPolicy;
