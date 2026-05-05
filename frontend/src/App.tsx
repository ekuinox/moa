import { useState } from "react";

import { CategoryMaster, PartnerMaster } from "./features";

export function App() {
  const [view, setView] = useState<"partners" | "categories">("partners");

  return (
    <main className="app-shell">
      <div className="app-layout">
        <header className="page-header">
          <p className="eyebrow">moa</p>
          <h1>{view === "partners" ? "取引先マスタ" : "種別マスタ"}</h1>
          <nav className="master-nav" aria-label="マスタ切り替え">
            <button
              className={view === "partners" ? "master-nav__item is-active" : "master-nav__item"}
              type="button"
              onClick={() => setView("partners")}
            >
              取引先
            </button>
            <button
              className={view === "categories" ? "master-nav__item is-active" : "master-nav__item"}
              type="button"
              onClick={() => setView("categories")}
            >
              種別
            </button>
          </nav>
        </header>

        {view === "partners" ? <PartnerMaster /> : <CategoryMaster />}
      </div>
    </main>
  );
}
