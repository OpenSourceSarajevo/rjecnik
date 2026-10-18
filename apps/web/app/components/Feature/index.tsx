import { LucideIcon } from 'lucide-react';

import style from './Feature.module.css';

interface FeatureProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  soon: boolean;
}

const Feature = ({ Icon, title, description, soon }: FeatureProps) => {
  return (
    <div className={style.card}>
      <Icon className={style.icon} size={32} />
      <h3 className={style.title}>{title}</h3>
      <p className={style.description}>{description}</p>
      {soon && <span className={style.badge}>Uskoro</span>}
    </div>
  );
};

export default Feature;
