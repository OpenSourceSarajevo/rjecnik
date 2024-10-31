"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { links } from "./links";

import style from "./Navbar.module.css";

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className={style.nav}>
      <div className={style.separator}></div>
      {links.map((link) => {
        return (
          <Link key={link.name} href={link.href}>
            <div
              className={`${style.item} ${
                pathname === link.href ? style.active : ""
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
