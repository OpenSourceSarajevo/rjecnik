"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Book, Upload, Database, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

import { signOut } from "@/utils/actions";

import style from "./Navbar.module.css";

const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth");
        return;
      }
      
      setUser(user);
      setLoading(false);
    };

    getUser();
  }, [router]);

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest(`.${style.userInfo}`) && !target.closest(`.${style.dropdown}`)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isDropdownOpen]);

  if (loading) {
    return (
      <nav className={style.navbar}>
        <div className={style.header}>
          <h1 className={style.title}>
            <Book className={style.titleIcon} />
            <span>Dictionary</span>
          </h1>
        </div>
        <div className={style.navigation}>
          <ul className={style.navList}>
            {/* Loading state */}
          </ul>
        </div>
      </nav>
    );
  }

  if (!user) {
    return null;
  }

  const { user_metadata } = user;
  const { name, avatar_url } = user_metadata;

  const navItems = [
		{ path: "/dashboard", icon: LayoutDashboard, label: "Kontrolna tabla" },
		{ path: "/dictionary", icon: Book, label: "Rječnik" },
		{ path: "/upload", icon: Upload, label: "Učitaj tekst" },
		{ path: "/process", icon: Database, label: "Obradi riječi" },
  ];

  return (
		<nav className={style.navbar}>
			<div className={style.header}>
				<h1 className={style.title}>
					<Book className={style.titleIcon} />
					<span>Rječnik</span>
				</h1>
			</div>

			<div className={style.navigation}>
				<ul className={style.navList}>
					{navItems.map((item) => (
						<li key={item.path}>
							<Link href={item.path} className={style.navItem}>
								<item.icon className={style.navIcon} />
								<span>{item.label}</span>
							</Link>
						</li>
					))}
				</ul>
			</div>

			<div className={style.footer}>
				<div
					className={style.userInfo}
					onClick={() => setIsDropdownOpen(!isDropdownOpen)}
				>
					<div className={style.avatar}>
						{avatar_url && (
							<Image
								src={avatar_url}
								alt={name}
								width={25}
								height={25}
								quality={100}
							/>
						)}
					</div>
					<div className={style.userDetails}>
						<p className={style.userName}>{name}</p>
						<ChevronDown
							className={`${style.chevron} ${
								isDropdownOpen ? style.chevronUp : ""
							}`}
							size={16}
						/>
					</div>
				</div>

				{isDropdownOpen && (
					<form>
						<div className={style.dropdown}>
							<button
								onClick={signOut}
								className={style.logoutButton}
							>
								<LogOut className={style.logoutIcon} />
								<span>Sign out</span>
							</button>
						</div>
					</form>
				)}
			</div>
		</nav>
  );
};

export default Navbar;

