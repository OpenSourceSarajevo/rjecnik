import { LucideIcon } from "lucide-react";

import style from "./feature.module.css";

interface FeatureProps {
  Icon: LucideIcon;
  title: string;
  description: string;
}

const Feature = ({ Icon, title, description }: FeatureProps) => {
  return (
    <div className={style.card}>
      <Icon className={style.icon} size={32} />
      <h3 className={style.title}>{title}</h3>
      <p className={style.description}>{description}</p>
      <span className={style.badge}>Uskoro</span>
    </div>
  );
};

export default Feature;
