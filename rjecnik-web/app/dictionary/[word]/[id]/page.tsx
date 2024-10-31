import { createClient } from "@/utils/supabase/server";
import { toDiacritical } from "@/utils/textTransformation";

import ReturnNav from "../../../components/returnNav";
import ReportButton from "./report-button";

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

  let wordBlock = <h1 className={style.word}>{word}</h1>;
  if (alternative && alternative?.length > 0) {
    wordBlock = (
		<h1 className={style.word}>
			{word}/{alternative.join("/")}
		</h1>
	);
  }

  let wordType = (
		<p className={style.wordType}>
			{data.type}
		</p>
  );
  if (gender) {
    wordType = <p className={style.wordType}>{data.type}, {gender} rod</p>;
  }

  let formsBlock = null;
  if (forms) {
    if (type === "glagol") {
      formsBlock = (
			<div className={style.section}>
				<h2 className={style.sectionTitle}>Glagolska vremena</h2>
				<div className={style.formColumn}>
					<div className={style.formContainer}>
						{forms.map((form: string, index: number) => (
							<Forms data={JSON.parse(form)} key={index} />
						))}
					</div>
				</div>
			</div>
		);
    } else {
      formsBlock = (
			<div className={style.section}>
				<h2 className={style.sectionTitle}>Padeži</h2>
				<div className={style.formContainer}>
					{forms.map((form: string, index: number) => (
						<NestedForms data={JSON.parse(form)} key={index} />
					))}
				</div>
			</div>
		);
    }
  }

  return (
		<div className={style.wrapper}>
			<div className={style.nav}>
				<ReturnNav url={"/rjecnik"}/>
				<div className={style.spliter}/>
				<ReportButton id={id} word={word} />
			</div>
			<div className={style.container}>
				<div className={style.header}>
					<div className={style.wordInfo}>
						{wordBlock}
						{wordType}
					</div>
					<div className={style.origins}>
						{origin?.map((o: string, index: number) => (
							<span key={index} className={style.origin}>
								{o}
							</span>
						))}
					</div>
				</div>

				<div className={style.section}>
					<h2 className={style.sectionTitle}>Značenje</h2>
					<div className={style.definitionCard}>{meaning}</div>
				</div>

				{formsBlock}
			</div>
		</div>
  );
};

export default Page;
