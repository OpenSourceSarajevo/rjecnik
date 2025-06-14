import { notFound } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { toDiacritical } from "@/utils/textTransformation";

import ReturnNav from "@/app/components/ReturnNav";
import ReportButton from "./ReportButton";
import MeaningCard from "./MeaningCard";
import RelatedWords from "./RelatedWords";
import Forms from "./Forms";

import style from "./page.module.css";

type WordDefinitions = {
  type: string | null;
  gender: string | null;
  examples: string[] | null;
  definition: string;
  part_of_speech: string | null;
  pronunciation_ipa: string | null;
  pronunciation_audio: string | null;
};

type WordDetails = {
  id: number;
  headword: string;
  definitions: WordDefinitions[];
  origins: string[] | null;
  alternatives: string[] | null;
  forms: WordForm[];
  synonyms: string[];
  antonyms: string[];
};

type WordForm = {
  form: string;
  name: string;
  value: string;
  category: string;
};

const Origins = ({ origins }: { origins: string[] | null }) => {
  if (!origins) return <></>;

  return (
    <div className={style.origins}>
      {origins?.map((origin: string, index: number) => (
        <span key={index} className={style.origin}>
          {origin}
        </span>
      ))}
    </div>
  );
};

const Page = async ({ params }: { params: Promise<{ word: string }> }) => {
  const { word } = await params;
  const decodedHeadword = decodeURIComponent(word);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("words_v2")
    .select(
      "id, headword, definitions, origins, alternatives, forms, synonyms, antonyms"
    )
    .eq("headword", decodedHeadword)
    .maybeSingle<WordDetails>();

  if (data === null) {
    notFound();
  }

  const { id, headword, origins, alternatives, forms, synonyms, antonyms } =
    data;

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
          <Origins origins={origins} />
        </div>

        <div className={style.section}>
          <h2 className={style.sectionTitle}>Značenja</h2>
          {data.definitions.map((details, index) => (
            <MeaningCard key={index} {...details} />
          ))}
        </div>
      </div>
      <Forms forms={forms} />
      <RelatedWords antonyms={antonyms} synonyms={synonyms} />
    </div>
  );
};

export default Page;
