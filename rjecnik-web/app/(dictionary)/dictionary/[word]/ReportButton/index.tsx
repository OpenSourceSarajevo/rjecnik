import { headers } from "next/headers";
import { Flag } from "lucide-react";

import style from "./ReportButton.module.css";

const getIssueReportUrl = (word: string, url: string): string => {
  return (
    process.env.NEXT_PUBLIC_GITHUB_REPOSITORY! +
    `/issues/new?labels=data&projects=OpenSourceSarajevo/2&template=data.yml&title=[Data]: ${word}&rijec=${word}&url=${url}`
  );
};

const ReportButton = async ({ word }: { word: string }) => {
  const headersList = await headers();

  const host = headersList.get("host");

  const url = `${host}/rjecnik/${word}`;
  const issueUrl = getIssueReportUrl(word, url);

  return (
    <a href={issueUrl} target="_blank">
      <button
        className={style.button}
        aria-label={`Prijavi grešku za riječ ${word}`}
      >
        <Flag className={style.icon} />
        <span>Prijavi grešku</span>
      </button>
    </a>
  );
};

export default ReportButton;
