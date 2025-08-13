import Navbar from './components/Navbar';
import style from './layout.module.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={style.container}>
      <Navbar />
      <main className={style.main}>{children}</main>
    </div>
  );
}
