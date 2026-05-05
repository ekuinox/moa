import type { ReactNode } from "react";

export interface AppCardProps {
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
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
