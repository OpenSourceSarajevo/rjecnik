import { notFound } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { toDiacritical } from "@/utils/textTransformation";

import ReturnNav from "@/app/components/ReturnNav";
import ReportButton from "./ReportButton";

import style from "./page.module.css";

const NestedForms = ({ data }: { data: object }) => {
  return Object.entries(data).map(([key, value], index) => (
    <div className={style.formColumn} key={index}>
      <h3 className={style.formTitle}>{toDiacritical(key)}</h3>
      <Forms data={value} />
    </div>
  ));
};

const Forms = ({ data }: { data: object }) => {
  return (
    <table className={style.formTable}>
      <tbody>
        {Object.entries(data).map(([key, value]) => (
          <tr key={key}>
            <td className={style.formKey}>{key}</td>
            <td className={style.formValue}>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

type WordDetails = {
  id: number;
  headword: string;
  origins: string[] | null;
  alternatives: string[] | null;
};

const Page = async ({ params }: { params: { word: string } }) => {
  const decodedHeadword = decodeURIComponent(params.word);

  const supabase = createClient();
  const { data, error } = await supabase
    .from("words_v2")
    .select("id, headword, origins, alternatives")
    .eq("headword", decodedHeadword)
    .maybeSingle<WordDetails>();

  if (error) {
    console.log(error);
  }

  if (data === null) {
    notFound();
  }

  const { id, headword, origins, alternatives } = data;

  let wordBlock = <h1 className={style.word}>{headword}</h1>;
  if (alternatives && alternatives?.length > 0) {
    wordBlock = (
      <h1 className={style.word}>
        {headword}/{alternatives.join("/")}
      </h1>
    );
  }

  return (
    <div className={style.wrapper}>
      <div className={style.nav}>
        <ReturnNav url={"/rjecnik"} />
        <div className={style.splitter} />
        <ReportButton word={headword} />
      </div>
      <div className={style.container}>
        <div className={style.header}>
          <div className={style.wordInfo}>{wordBlock}</div>
          <div className={style.origins}>
            {origins?.map((origin: string, index: number) => (
              <span key={index} className={style.origin}>
                {origin}
              </span>
            ))}
          </div>
        </div>

        <div className={style.section}>
          <h2 className={style.sectionTitle}>Značenje</h2>
        </div>
      </div>
    </div>
  );
};

export default Page;
