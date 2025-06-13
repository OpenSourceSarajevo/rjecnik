import LoginForm from "./components/LoginForm";
import React from "react";

import style from "./page.module.css";

const Page = () => {
  return (
    <div className={style.container}>
      <LoginForm />
    </div>
  );
};

export default Page;
