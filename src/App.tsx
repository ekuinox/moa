import { BookOpenCheck } from "lucide-react";

export function App() {
  return (
    <main className="app-shell">
      <section className="welcome-panel">
        <div className="welcome-icon" aria-hidden="true">
          <BookOpenCheck size={28} strokeWidth={1.8} />
        </div>
        <div>
          <p className="eyebrow">moa</p>
          <h1>出納帳ソフト</h1>
          <p className="description">買掛・売掛管理から実装を始めます。</p>
        </div>
      </section>
    </main>
  );
}
