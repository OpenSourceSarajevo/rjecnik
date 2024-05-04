import { createClient } from "@/utils/supabase/server";

import Card from "./components/card";
import Navbar from "./components/navbar";

import styles from "./page.module.css";

const Home = async () => {
  const supabase = createClient();
  const { data: words } = await supabase.from("words").select();

  const cards = words?.map((e, i) => (
    <Card key={i} title={e.word} description={e.meaning} />
  ));

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.grid}>{cards}</div>
      </main>
    </>
  );
};

export default Home;
