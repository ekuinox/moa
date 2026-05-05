import { useState } from "react";

import { CategoryMaster, FiscalYearSettings, PartnerMaster } from "./features";

type View = "partners" | "categories" | "fiscalYears";

const viewTitles: Record<View, string> = {
  partners: "取引先マスタ",
  categories: "種別マスタ",
  fiscalYears: "事業年度設定",
};

export function App() {
  const [view, setView] = useState<View>("partners");

  return (
    <main className="app-shell">
      <div className="app-layout">
        <header className="page-header">
          <p className="eyebrow">moa</p>
          <h1>{viewTitles[view]}</h1>
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
            <button
              className={view === "fiscalYears" ? "master-nav__item is-active" : "master-nav__item"}
              type="button"
              onClick={() => setView("fiscalYears")}
            >
              事業年度
            </button>
          </nav>
        </header>

        {view === "partners" ? <PartnerMaster /> : null}
        {view === "categories" ? <CategoryMaster /> : null}
        {view === "fiscalYears" ? <FiscalYearSettings /> : null}
      </div>
    </main>
  );
}
