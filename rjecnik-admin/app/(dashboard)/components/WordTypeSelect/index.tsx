import React from "react";
import style from "./WordTypeSelect.module.css";

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
};

const WordTypeSelect: React.FC<Props> = ({ value, onChange, className, placeholder = "Vrsta riječi" }) => {
  return (
    <select
      value={value}
      className={`${style.select} ${className || ""}`}
      onChange={e => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      <option value="imenica">Imenica</option>
      <option value="pridjev">Pridjev</option>
      <option value="zamjenica">Zamjenica</option>
      <option value="broj">Broj</option>
      <option value="glagol">Glagol</option>
      <option value="prilog">Prilog</option>
      <option value="prijedlog">Prijedlog</option>
      <option value="veznik">Veznik</option>
      <option value="uzvik">Uzvik</option>
      <option value="riječca">Riječca</option>
    </select>
  );
};

export default WordTypeSelect; 