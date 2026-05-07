import type { ReactNode } from "react";

import styles from "./AppCard.module.css";

/** 業務画面で使う標準カードの表示内容。 */
export interface AppCardProps {
  /** カード見出し。 */
  readonly title: string;
  /** 見出し下に表示する補足説明。 */
  readonly description?: string;
  /** 見出し右側に表示する操作要素。 */
  readonly actions?: ReactNode;
  /** カード本文。 */
  readonly children: ReactNode;
}

export function AppCard({ title, description, actions, children }: AppCardProps) {
  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>{title}</h2>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
