import { useState } from "react";
import { useSWRConfig } from "swr";

import { apiClient, type Partner } from "../../lib/api";
import { PartnerDialog, type PartnerDialogInput } from "../partners";
import styles from "./AccountEntryList.module.css";
import { LedgerPanel } from "./LedgerPanel";
import { LedgerPartnerRail } from "./LedgerPartnerRail";
import { LedgerPeriodTabs } from "./LedgerPeriodTabs";
import type { AccountEntryListProps } from "./types";
import { useAccountEntryLedger } from "./useAccountEntryLedger";

/** 買掛/売掛の台帳画面を、制御 hook が返す表示モデルから組み立てる。 */
export function AccountEntryList({ kind }: AccountEntryListProps) {
  const ledger = useAccountEntryLedger(kind);
  const { mutate } = useSWRConfig();
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | undefined>();

  function openPartnerAddDialog() {
    setEditingPartner(undefined);
    setIsPartnerDialogOpen(true);
  }

  function openPartnerEditDialog(partner: Partner) {
    setEditingPartner(partner);
    setIsPartnerDialogOpen(true);
  }

  function closePartnerDialog() {
    setEditingPartner(undefined);
    setIsPartnerDialogOpen(false);
  }

  async function handleSavePartner(input: PartnerDialogInput) {
    if (input.id) {
      const partner = await apiClient.partners.update({
        id: input.id,
        name: input.name,
        kana: input.kana,
      });
      await mutate("partners");
      ledger.selectPartner(partner.id);
    } else {
      const partner = await apiClient.partners.create({
        name: input.name,
        kana: input.kana,
      });
      await mutate("partners");
      ledger.selectPartner(partner.id);
    }

    closePartnerDialog();
  }

  async function handleDeletePartner(partner: Partner) {
    const confirmed = window.confirm(`${partner.name}を削除しますか？`);
    if (!confirmed) {
      return;
    }

    await apiClient.partners.delete(partner.id);
    await mutate("partners");

    if (ledger.selectedPartnerId === partner.id) {
      ledger.selectPartner("all");
    }

    closePartnerDialog();
  }

  return (
    <div className={styles.screen}>
      <LedgerPartnerRail
        partners={ledger.partners}
        selectedPartnerId={ledger.selectedPartnerId}
        onSelectPartner={ledger.selectPartner}
        onAddPartner={openPartnerAddDialog}
        onEditPartner={openPartnerEditDialog}
      />

      <section className={styles.workspace} aria-label={`${ledger.title}明細`}>
        <LedgerPeriodTabs
          monthTabs={ledger.monthTabs}
          selectedMonth={ledger.selectedMonth}
          onSelectMonth={ledger.selectMonth}
        />
        <LedgerPanel ledger={ledger} />
      </section>
      <PartnerDialog
        isOpen={isPartnerDialogOpen}
        partner={editingPartner}
        onCancel={closePartnerDialog}
        onSave={handleSavePartner}
        onDelete={handleDeletePartner}
      />
    </div>
  );
}
