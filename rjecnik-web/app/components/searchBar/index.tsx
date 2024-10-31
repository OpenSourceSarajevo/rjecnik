import { Search } from "lucide-react";

import style from "./SearchBar.module.css";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <div className={style.container}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Unesite riječ..."
        className={style.input}
      />
      <Search className={style.icon} size={20} />
      <span className={style.badge}>Uskoro</span>
    </div>
  );
};

export default SearchBar;
