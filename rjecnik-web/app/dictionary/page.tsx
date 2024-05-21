"use client";

import { useState, useEffect } from "react";
import Card from "../components/card";
import Loader from "../components/loader";

import style from "./page.module.css";

type Word = {
  id: number;
  word: string;
  meaning: string;
};

const Dictionary = () => {
  const MAX_PER_PAGE = 5;

  const [data, setData] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(0);
  const [word, setWord] = useState("");

  const [fetchedAll, setFetchedAll] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    (async function getData() {
      var newData = await fetch(
        "/api/dictionary?" +
          new URLSearchParams({
            pageNumber: page.toString(),
            pageSize: MAX_PER_PAGE.toString(),
            word: word,
          }),
        {
          method: "GET",
        }
      ).then((res) => res.json());

      if (!!newData) setFetchedAll(true);
      setData((prevData) => [...prevData, ...newData]);
      setLoading(false);
    })();
  }, [page, word]);

  const handleScroll = () => {
    const OFFSET_PIXEL = 1;

    if (
      window.innerHeight + window.scrollY + OFFSET_PIXEL >=
        document.body.offsetHeight &&
      !fetchedAll
    ) {
      setPage((page) => page + 1);
    }
  };

  const handleChange = (value: string) => {
    setData([]);
    setWord(value);
    setPage(0);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <div>
        <div className={style.wrapper}>
          <input
            className={style.input}
            value={word}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Pretraži"
          />
        </div>
        <div className={style.list}>
          {data.map((item) => (
            <Card key={item.id} title={item.word} description={item.meaning} />
          ))}
        </div>
      </div>
    </>
  );
};

export default Dictionary;
