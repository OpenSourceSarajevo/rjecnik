"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { links } from "./links";

import styles from "./navbar.module.css";

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <div className={styles.separator}></div>
      {links.map((link) => {
        return (
          <Link key={link.name} href={link.href}>
            <div
              className={`${styles.item} ${
                pathname === link.href ? styles.active : ""
              }`}
            >
              {link.name}
            </div>
          </Link>
        );
      })}
    </nav>
  );
};

export default Navbar;
