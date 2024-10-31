import React from "react";

import style from "./alert.module.css";

const Alert = () => {
  const githubUrl =
		process.env.NEXT_PUBLIC_GITHUB_REPOSITORY! + "/issues";

  return (
		<div className={`${style.alert} ${style.warning}`}>
			<div className={style.warning}>
				<WarningIcon />
			</div>
			<span className="alert-message">
				Riječi za aplikaciju su preuzete iz{" "}
				<a
					className={style.link}
					href="https://archive.org/details/RjenikBosanskogJezikaInstitutZaJezikSarajevo2007."
					target="_blank"
				>
					{" "}
					Rječnika bosanskog jezika
				</a>{" "}
				koristeći software za čitanje i procesiranje pdf-a što je
				uzrokovalo da podaci imaju mnogo grešaka. Sve probleme možete
				prijaviti na{" "}
				<a className={style.link} href={githubUrl} target="_blank">
					GitHub-u
				</a>
			</span>
		</div>
  );
};

const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
  >
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>
);

export default Alert;
