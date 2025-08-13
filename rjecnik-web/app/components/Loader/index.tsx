import style from './Loader.module.css';

export default function Loader() {
  return (
    <div className={style.loaderContainer}>
      <div className={style.loader}>
        <div className={style.spinner}></div>
      </div>
    </div>
  );
}
