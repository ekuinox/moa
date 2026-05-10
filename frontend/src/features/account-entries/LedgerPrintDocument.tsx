import { createPortal } from "react-dom";

import { formatCurrency } from "./formatters";
import styles from "./LedgerPrintDocument.module.css";
import type { LedgerExportColumn, LedgerExportScope } from "./ledgerExport";

export interface LedgerPrintDocumentProps {
  /** CSV と同じ表示中台帳のスナップショット。印刷対象の列・行・見出しをここから組み立てる。 */
  readonly report: LedgerExportScope;
  /** 画面ヘッダと揃えて紙面上部に出す帳票見出し。 */
  readonly heading: string;
}

/** 通常画面とは別に、紙面へ出す台帳だけを描画する印刷専用ドキュメント。 */
export function LedgerPrintDocument({ heading, report }: LedgerPrintDocumentProps) {
  // 印刷専用 DOM はアプリ本体の grid/overflow の影響を避けるため body 直下へ置く。
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <section
      className={styles.document}
      data-print-document
      data-testid="ledger-print-document"
      aria-hidden="true"
    >
      <header className={styles.header}>
        <h2>{heading}</h2>
      </header>

      <table className={styles.table}>
        <colgroup>
          {report.columns.map((column) => (
            <col className={columnClassName(column)} key={column.key} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {report.columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {report.rows.map((row) => (
            <tr key={row.entryId}>
              {report.columns.map((column) => (
                <td
                  className={column.key === "amount" ? styles.amountCell : undefined}
                  key={column.key}
                >
                  {formatPrintCell(row[column.key] ?? "", column)}
                </td>
              ))}
            </tr>
          ))}
          {report.rows.length === 0 ? (
            <tr>
              <td colSpan={report.columns.length}>この条件の明細はまだ登録されていません。</td>
            </tr>
          ) : null}
        </tbody>
        <tfoot>
          <tr>
            <th colSpan={Math.max(report.columns.length - 1, 1)}>合計</th>
            <td className={styles.amountCell}>{formatPrintAmount(report.totalAmount)}</td>
          </tr>
        </tfoot>
      </table>
    </section>,
    document.body,
  );
}

function columnClassName(column: LedgerExportColumn) {
  switch (column.key) {
    case "occurredOn":
      return styles.dateCol;
    case "partner":
      return styles.partnerCol;
    case "categories":
      return styles.categoryCol;
    case "amount":
      return styles.amountCol;
    default:
      return undefined;
  }
}

function formatPrintCell(value: string, column: LedgerExportColumn) {
  return column.key === "amount" ? formatPrintAmount(value) : value;
}

function formatPrintAmount(value: string) {
  return formatCurrency(Number.parseInt(value, 10) || 0);
}
