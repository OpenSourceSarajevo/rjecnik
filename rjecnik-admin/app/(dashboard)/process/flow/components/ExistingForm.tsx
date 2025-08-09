import { Word, WordForm } from "@/app/api/dictionary/route";
import { useEffect, useState } from "react";

import style from "./ExistingForm.module.css";

type ExistingFormProps = {
	className?: string;
	selectedWord: Word | null;
	setSelectedWord: React.Dispatch<React.SetStateAction<Word | null>>;
};

const ExistingForm: React.FC<ExistingFormProps> = ({
	className,
	selectedWord,
	setSelectedWord,
}) => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Word[]>([]);
	const [forms, setForms] = useState<WordForm[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!query) {
			setResults([]);
			return;
		}
		const timeout = setTimeout(async () => {
			const res = await fetch(
				`/api/dictionary?pageNumber=0&pageSize=5&word=${query}`
			);
			const data = await res.json();
			setResults(data);
		}, 300);
	
		return () => clearTimeout(timeout);
	}, [query]);
	
	// Fetch single word details when selectedWord changes
	useEffect(() => {
		if (!selectedWord) return;
		(async () => {
			const res = await fetch(`/api/dictionary/${selectedWord.headword}`);
			if (res.ok) {
				const data = await res.json();
				setForms(data.forms as WordForm[] || []); // optionally set forms if present
				setIsLoading(false);
			}
		})();
	}, [selectedWord, setForms]);

	return (
		<div className={`${style.container} ${className}`}>
			{!selectedWord && (
				<div className={style.searchSection}>
					<label>Pronađi riječ:</label>
					<input
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className={style.input}
					/>
					<ul className={style.results}>
						{results.map((word) => (
							<li
								key={word.id}
								onClick={() => {
									setIsLoading(true);
									setSelectedWord(word);
								}}
								className={style.resultItem}
							>
								{word.headword}
							</li>
						))}
					</ul>
				</div>
			)}

			{selectedWord && (
				<div>
					<h3 className={style.headword}>
						Riječ: {selectedWord.headword}
					</h3>

					{!isLoading && (
						<div className={style.forms}>
							<div className={style.formSection}>
								<h4 className={style.formsSectionHeading}>
									Oblici
								</h4>
								<table className={style.formsTable}>
									<thead>
										<tr className={style.tableHeader}>
											<th>Kategorija</th>
											<th>Oblik</th>
											<th>Naziv</th>
											<th>Vrijednost</th>
										</tr>
									</thead>
									<tbody>
										{forms?.map((f, i) => (
											<tr
												key={i}
												className={style.tableRow}
											>
												<td>{f.category}</td>
												<td>{f.form}</td>
												<td>{f.name}</td>
												<td>{f.value}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default ExistingForm;
