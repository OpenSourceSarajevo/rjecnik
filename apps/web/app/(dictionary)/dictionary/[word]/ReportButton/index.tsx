import { Flag } from 'lucide-react';

import style from './ReportButton.module.css';

const getIssueReportUrl = (word: string, url: string): string => {
  return (
    process.env.NEXT_PUBLIC_GITHUB_REPOSITORY! +
    `/issues/new?labels=data&projects=OpenSourceSarajevo/2&template=data.yml&title=${encodeURIComponent(`[Data]: ${word}`)}&rijec=${encodeURIComponent(word)}&url=${encodeURIComponent(url)}`
  );
};

const ReportButton = ({ word }: { word: string }) => {
  // Built from the site URL rather than the request host so the word page can be cached
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/rjecnik/${encodeURIComponent(word)}`;
  const issueUrl = getIssueReportUrl(word, url);

  return (
    <a
      href={issueUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={style.button}
      aria-label={`Prijavi grešku za riječ ${word}`}
    >
      <Flag className={style.icon} aria-hidden="true" />
      <span>Prijavi grešku</span>
    </a>
  );
};

export default ReportButton;
