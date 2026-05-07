import { useState } from "react";

import styles from "./App.module.css";
import { Text } from "./components";
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
    <main className={styles.shell}>
      <div className={styles.layout}>
        <header className={styles.topbar}>
          <div>
            <Text tone="eyebrow">moa</Text>
            <h1>{viewTitles[view]}</h1>
          </div>
          <nav className={styles.tabs} aria-label="画面切り替え">
            <button
              className={
                view === "payable" ? `${styles.tabItem} ${styles.tabItemActive}` : styles.tabItem
              }
              type="button"
              onClick={() => setView("payable")}
            >
              買掛
            </button>
            <button
              className={
                view === "receivable" ? `${styles.tabItem} ${styles.tabItemActive}` : styles.tabItem
              }
              type="button"
              onClick={() => setView("receivable")}
            >
              売掛
            </button>
            <button
              className={
                view === "cash" ? `${styles.tabItem} ${styles.tabItemActive}` : styles.tabItem
              }
              type="button"
              onClick={() => setView("cash")}
            >
              出納
            </button>
            <button
              className={
                view === "settings" ? `${styles.tabItem} ${styles.tabItemActive}` : styles.tabItem
              }
              type="button"
              onClick={() => setView("settings")}
            >
              設定
            </button>
          </nav>
        </header>

        {view === "payable" ? <AccountEntryList kind="payable" /> : null}
        {view === "receivable" ? <AccountEntryList kind="receivable" /> : null}
        {view === "cash" ? (
          <section className={styles.placeholderPanel}>
            <h2>出納</h2>
            <Text>出納画面は今後実装します。</Text>
          </section>
        ) : null}
        {view === "settings" ? <SettingsTab /> : null}
      </div>
    </main>
  );
}
