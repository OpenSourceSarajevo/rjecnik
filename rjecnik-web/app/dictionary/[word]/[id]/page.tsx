import { createClient } from "@/utils/supabase/server";

import ReportButton from "./report-button";

import style from "./page.module.css";

const NestedForms = ({ data }: { data: object }) => {
  return (
    <div>
      {Object.entries(data).map(([key, value], index) => (
        <div key={index}>
          <h4 className={style.formGroup}>{key}</h4>
          <Forms data={value} />
        </div>
      ))}
    </div>
  );
};

const Forms = ({ data }: { data: object }) => {
  return (
    <div className={style.forms}>
      {Object.entries(data).map(([subKey, subValue]) => (
        <p key={subKey}>
          {subKey}: {subValue}
        </p>
      ))}
    </div>
  );
};

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

  const {
    id,
    word,
    meaning,
    type,
    gender,
    origin,
    alternative,
    forms,
  }: {
    id: number;
    word: string;
    meaning: string;
    type: string | null;
    gender: string | null;
    origin: string[] | null;
    alternative: string[] | null;
    forms: string[] | null;
  } = data;

  let wordBlock = <h1 className={style.title}>{word}</h1>;
  if (alternative && alternative?.length > 0) {
    wordBlock = (
      <h1 className={style.title}>
        {word}/{alternative.join("/")}
      </h1>
    );
  }

  let genderBlock = null;
  if (gender) {
    genderBlock = <div>{gender} rod</div>;
  }

  const separator = type && gender ? "|" : null;

  let originBlock = null;
  if (origin && origin?.length > 0) {
    originBlock = (
      <div className={style.origin}>
        <h4>Porijeklo:</h4>
        {origin?.join(", ")}
      </div>
    );
  }

  let formsBlock = null;
  if (forms && forms) {
    if (type === "glagol") {
      formsBlock = (
        <div>
          <h4 className={style.formGroup}>Glagolska vremena</h4>
          {forms.map((form: string, index: number) => (
            <Forms data={JSON.parse(form)} key={index} />
          ))}
        </div>
      );
    } else {
      formsBlock = (
        <div>
          {forms.map((form: string, index: number) => (
            <NestedForms data={JSON.parse(form)} key={index} />
          ))}
        </div>
      );
    }
  }

  return (
    <div className={style.wrapper}>
      {wordBlock}
      <div className={style.info}>
        <p className={style.type}>{type}</p>
        {separator}
        {genderBlock}
      </div>
      <p>{meaning}</p>
      {originBlock}
      {formsBlock}
      <ReportButton id={id} word={word} />
    </div>
  );
};

export default Page;
