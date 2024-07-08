import { createClient } from "@/utils/supabase/server";

import style from "./page.module.css";

const Page = async ({ params }: { params: { word: string; id: number } }) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("words")
    .select()
    .eq("id", params.id)
    .maybeSingle();

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
