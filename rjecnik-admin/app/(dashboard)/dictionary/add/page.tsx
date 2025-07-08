"use client";

import React, { useState } from "react";
import style from "./page.module.css";
import ToastContainer, { Toast } from "@/app/components/Toast";
import { v4 as uuidv4 } from "uuid";

export default function AddWordPage() {
  const [headword, setHeadword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const handleRemoveToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/dictionary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headword, definitions: [] }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setToasts((prev) => [
          ...prev,
          {
            id: uuidv4(),
            type: "error",
            message: data.error ? String(data.error) : `Greška: ${res.status}`,
          },
        ]);
        return;
      }
    } catch (err) {
      setToasts((prev) => [
        ...prev,
        {
          id: uuidv4(),
          type: "error",
          message: "Greška prilikom slanja: " + (err instanceof Error ? err.message : String(err)),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.container}>
      <ToastContainer toasts={toasts} onRemove={handleRemoveToast} />
      <h1>Dodaj novu riječ</h1>
      <form onSubmit={handleSubmit} className={style.form}>
        <label htmlFor="headword">Riječ</label>
        <input
          id="headword"
          type="text"
          value={headword}
          onChange={e => setHeadword(e.target.value)}
          className={style.input}
          required
        />
        <button type="submit" className={style.button} disabled={loading}>
          {loading ? "Dodavanje..." : "Dodaj"}
        </button>
      </form>
    </div>
  );
} 