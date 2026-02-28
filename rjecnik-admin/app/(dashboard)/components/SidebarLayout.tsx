'use client';

import { useState } from 'react';
import Navbar from './Navbar';
import style from '../layout.module.css';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={style.container}>
      <Navbar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed((c) => !c)} />
      <main className={`${style.main} ${isCollapsed ? style.mainCollapsed : ''}`}>{children}</main>
    </div>
  );
}
