import { createClient } from "@/utils/supabase/server";

import style from "./page.module.css";

const Page = async ({ params }: { params: { word: string } }) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("words")
    .select()
    .eq("word", params.word)
    .limit(1)
    .single();

  if (error) {
    console.log(error);
  }

  return (
    <div className={style.wrapper}>
      <h1 className={style.title}>{data?.word}</h1>
      <p>{data?.meaning}</p>
    </div>
  );
};

export default Page;
