import { Settings } from "lucide-react";
import { useState } from "react";

import { AccountEntryList, SettingsTab } from "./features";

type View = "payable" | "receivable" | "cash" | "settings";

const viewTitles: Record<View, string> = {
  payable: "買掛表",
  receivable: "売掛表",
  cash: "出納",
  settings: "設定",
};

export function App() {
  const [view, setView] = useState<View>("payable");

  return (
    <main className="app-shell">
      <div className="app-layout">
        <header className="app-topbar">
          <div>
            <p className="eyebrow">moa</p>
            <h1>{viewTitles[view]}</h1>
          </div>
          <nav className="app-tabs" aria-label="画面切り替え">
            <button
              className={view === "payable" ? "app-tabs__item is-active" : "app-tabs__item"}
              type="button"
              onClick={() => setView("payable")}
            >
              買掛
            </button>
            <button
              className={view === "receivable" ? "app-tabs__item is-active" : "app-tabs__item"}
              type="button"
              onClick={() => setView("receivable")}
            >
              売掛
            </button>
            <button
              className={view === "cash" ? "app-tabs__item is-active" : "app-tabs__item"}
              type="button"
              onClick={() => setView("cash")}
            >
              出納
            </button>
            <button
              className={view === "settings" ? "app-tabs__item is-active" : "app-tabs__item"}
              type="button"
              onClick={() => setView("settings")}
              aria-label="設定"
              title="設定"
            >
              <Settings size={17} aria-hidden="true" />
            </button>
          </nav>
        </header>

        {view === "payable" ? <AccountEntryList kind="payable" /> : null}
        {view === "receivable" ? <AccountEntryList kind="receivable" /> : null}
        {view === "cash" ? (
          <section className="placeholder-panel">
            <h2>出納</h2>
            <p className="muted-text">出納画面は今後実装します。</p>
          </section>
        ) : null}
        {view === "settings" ? <SettingsTab /> : null}
      </div>
    </main>
  );
}
