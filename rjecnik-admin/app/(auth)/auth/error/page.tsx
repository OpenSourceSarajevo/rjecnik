//import { div, div, div, div } from "@/components/ui/div";
import style from "./page.module.css";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <div className={style.container}>
      <div className={style.cardWrapper}>
        <div className={style.div}>
          <div>
            <div>
              <div className={style.title}>Sorry, something went wrong.</div>
            </div>
            <div>
              {params?.error ? (
                <p className={style.message}>Code error: {params.error}</p>
              ) : (
                <p className={style.message}>An unspecified error occurred.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
