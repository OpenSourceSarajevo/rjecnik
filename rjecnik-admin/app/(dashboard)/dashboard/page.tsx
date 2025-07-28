"use client";
import React, { useEffect, useState } from "react";


import style from "./page.module.css";

type Stats = {
	words: number;
	definitions: number;
	forms: number;
	missing_definitions?: number;
	recent_words?: number;
};

type TypeBreakdownItem = {
	type: string;
	count: number;
};

export default function Page() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [typeBreakdown, setTypeBreakdown] = useState<TypeBreakdownItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Greška pri učitavanju statistike.");
        const data = await res.json();
        setStats(data.stats);
		setTypeBreakdown(data.type_breakdown);
      } catch {
        setError("Greška pri učitavanju statistike.");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
		<div>
			<h1 className={style.title}>Kontrolna tabla</h1>
			{loading ? (
				<p>Učitavanje...</p>
			) : error ? (
				<p style={{ color: "red" }}>{error}</p>
			) : stats ? (
				<>
					<div className={style.statsContainer}>
						<div className={style.statBlock}>
							<div className={style.statLabel}>Riječi</div>
							<div className={style.statValue}>{stats.words}</div>
						</div>
						<div className={style.statBlock}>
							<div className={style.statLabel}>Definicije</div>
							<div className={style.statValue}>
								{stats.definitions}
							</div>
						</div>
						<div className={style.statBlock}>
							<div className={style.statLabel}>Oblici</div>
							<div className={style.statValue}>{stats.forms}</div>
						</div>
					</div>

					<h2 className={style.subTitle}>Raspodjela tipova</h2>
					<div className={style.typeBreakdownGrid}>
						{typeBreakdown.map(({ type, count }) => (
							<div key={type} className={style.statBlock}>
								<div className={style.statLabel}>{type}</div>
								<div className={style.statValue}>{count}</div>
							</div>
						))}
					</div>
				</>
			) : null}
		</div>
  );
}
