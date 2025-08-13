import { useEffect, useState } from "react";
import { Word } from "@/app/api/dictionary/route";

import style from "./NewExample.module.css";

type NewExampleProps = {
    headword: string;
    className?: string;
    selectedWord: Word | null;
    setSelectedWord: React.Dispatch<React.SetStateAction<Word | null>>;
}

const NewExample: React.FC<NewExampleProps> = ({ headword, className, selectedWord, setSelectedWord }) => {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
		if (!headword) return;
		(async () => {
			const res = await fetch(`/api/dictionary/${headword}`);
			if (res.ok) {
				const data = await res.json();
				setSelectedWord(data);
				setIsLoading(false);
			}
		})();
	}, [headword, setSelectedWord]);

    return (
		<div className={`${style.container} ${className}`}>
			{!isLoading && <div>{selectedWord?.headword}</div>}
		</div>
	);
}

export default NewExample;