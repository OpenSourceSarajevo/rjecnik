"use client";

import { signinWithGoogle } from "@/utils/actions";
import React from "react";

import style from "./LoginForm.module.css";

const LoginForm = () => {
  return (
    <div className={style.container}>
      <div className={style.loginCard}>
        <div className={style.header}>
          <h1 className={style.title}>Welcome</h1>
          <p className={style.subtitle}>Sign in with your Google account</p>
        </div>

        <form>
          <div>
            <button
              formAction={signinWithGoogle}
              className={style.googleButton}
            >
              {"Continue with Google"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
