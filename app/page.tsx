import Card from "./components/card";
import styles from "./page.module.css";

const Home = () => {
  const cards = [...Array(8)].map((e, i) => (
    <Card
      key={i}
      title="Docs"
      description="Find in-depth information about Next.js features and API."
    />
  ));

  return (
    <main className={styles.main}>
      <div className={styles.grid}>{cards}</div>
    </main>
  );
};

export default Home;
