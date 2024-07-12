import { headers } from "next/headers";

import style from "./report-button.module.css";

const getIssueReportUrl = (word: string, url: string): string => {
  return (
    process.env.NEXT_PUBLIC_GITHUB_REPOSITORY_ISSUES! +
    `/new?labels=data&projects=OpenSourceSarajevo/2&template=data.yml&title=[Data]: ${word}&rijec=${word}&url=${url}`
  );
};

const ReportButton = ({ id, word }: { id: number; word: string }) => {
  const headersList = headers();

  const host = headersList.get("host");

  const url = `${host}/rjecnik/${word}/${id}`;
  const issueUrl = getIssueReportUrl(word, url);

  return (
    <a href={issueUrl} target="_blank">
      <button className={style.button}>Prijavi grešku</button>
    </a>
  );
};

export default ReportButton;
