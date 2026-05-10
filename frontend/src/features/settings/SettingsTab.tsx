import { AppCard } from "../../components";
import { CategoryChipEditor } from "../categories/CategoryChipEditor";
import { DebugInfoCard } from "./DebugInfoCard";
import { FiscalYearStartMonthCard } from "./FiscalYearStartMonthCard";
import styles from "./SettingsTab.module.css";

/** 設定タブ。種別と事業年度の基本ルールをひとつの画面で扱う。 */
export function SettingsTab() {
  return (
    <div className={styles.layout}>
      <AppCard
        title="種別"
        description="クリックで編集、Enter で確定。フォーカスを外すと元に戻ります。"
      >
        <CategoryChipEditor />
      </AppCard>
      <AppCard title="年度" description="事業年度の開始月を設定します。">
        <FiscalYearStartMonthCard />
      </AppCard>
      <AppCard title="デバッグ情報">
        <DebugInfoCard />
      </AppCard>
    </div>
  );
}
