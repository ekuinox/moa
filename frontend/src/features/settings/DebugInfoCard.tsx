import useSWR from "swr";

import { Text } from "../../components";
import { apiClient } from "../../lib/api";
import styles from "./DebugInfoCard.module.css";

const debugInfoRows = [
  ["バージョン", "appVersion"],
  ["コミット", "commitHash"],
  ["ビルド日時", "buildTimestamp"],
  ["DB パス", "databasePath"],
] as const;

/** アプリの調査に使うビルド情報と DB パスを表示する。 */
export function DebugInfoCard() {
  const { data, error, isLoading } = useSWR("debug-info", () => apiClient.debugInfo.get());

  if (error) {
    return <Text tone="error">デバッグ情報の読み込みに失敗しました。</Text>;
  }

  if (isLoading || !data) {
    return <p className={styles.muted}>読み込み中です。</p>;
  }

  return (
    <dl className={styles.list}>
      {debugInfoRows.map(([label, key]) => (
        <div className={styles.row} key={key}>
          <dt>{label}</dt>
          <dd>{data[key]}</dd>
        </div>
      ))}
    </dl>
  );
}
