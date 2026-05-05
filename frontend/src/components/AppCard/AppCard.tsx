import type { ReactNode } from "react";

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
    <section className="app-card">
      <header className="app-card__header">
        <div>
          <h2 className="app-card__title">{title}</h2>
          {description ? <p className="app-card__description">{description}</p> : null}
        </div>
        {actions ? <div className="app-card__actions">{actions}</div> : null}
      </header>
      <div className="app-card__body">{children}</div>
    </section>
  );
}
