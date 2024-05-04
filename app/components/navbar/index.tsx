import styles from "./navbar.module.css";

const Navbar = () => {
  return (
    <nav className={styles.nav}>
      <div className={styles.separator}></div>
      <div className={styles.item}>Home</div>
      <div className={styles.item}>Dictionary</div>
      <div className={styles.item}>Contact</div>
    </nav>
  );
};

export default Navbar;
