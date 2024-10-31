import Link from "next/link";

import { ArrowLeft, Book } from "lucide-react";
import style from "./ReturnNav.module.css";

const ReturnNav = ({ url } : {url: string}) => {
	return (
		<div className={style.header}>
			<div className={style.logoContainer}>
				<Link href={url}>
					<button className={style.backButton}>
						<ArrowLeft className="text-white" />
					</button>
				</Link>
				<div className={style.logoWrapper}>
					<Book className="text-white" />
					<h1 className={style.title}>Bosanski Rječnik</h1>
				</div>
			</div>
		</div>
	);
};

export default ReturnNav;