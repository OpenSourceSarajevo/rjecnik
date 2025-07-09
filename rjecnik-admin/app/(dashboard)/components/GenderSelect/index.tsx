import React from "react";
import style from "./GenderSelect.module.css";

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
};

const GenderSelect: React.FC<Props> = ({ value, onChange, className, placeholder = "Spol" }) => {
  return (
    <select
      value={value}
      className={`${style.select} ${className || ""}`}
      onChange={e => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      <option value="muški">Muški</option>
      <option value="ženski">Ženski</option>
      <option value="srednji">Srednji</option>
    </select>
  );
};

export default GenderSelect; 