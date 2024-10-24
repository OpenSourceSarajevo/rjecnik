// import { createClient } from "@/utils/supabase/server";

// import Card from "./components/card";

import styles from "./page.module.css";
import Dictionary from "./dictionary/page";

const Home = async () => {
  // const supabase = createClient();
  // const { data: words } = await supabase.from("words").select();

  // const cards = words?.map((e, i) => (
  //   <Card key={e.id} id={e.id} title={e.word} description={e.meaning} />
  // ));

  return (
    <>
      <main className={styles.main}>
        {/* <div className={styles.grid}>{cards}</div> */}
        <Dictionary />
      </main>
    </>
  );
};

export default Home;
