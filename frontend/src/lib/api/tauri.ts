import type { AccountEntry, AccountEntryKind, ApiClient } from ".";
import { commands } from "./bindings.generated";

export function createTauriApiClient(): ApiClient {
  return {
    async health() {
      return { ok: await commands.backendHealth() };
    },
    partners: {
      list() {
        return commands.listPartners();
      },
      create(input) {
        return commands.createPartner(input);
      },
      update(input) {
        return commands.updatePartner(input);
      },
      async delete(id) {
        await commands.deletePartner(id);
      },
    },
    categories: {
      list() {
        return commands.listCategories();
      },
      create(input) {
        return commands.createCategory(input);
      },
      update(input) {
        return commands.updateCategory(input);
      },
      async delete(id) {
        await commands.deleteCategory(id);
      },
    },
    fiscalYears: {
      getSetting() {
        return commands.getFiscalYearSetting();
      },
      saveSetting(input) {
        return commands.saveFiscalYearSetting(input);
      },
      list() {
        return commands.listFiscalYears();
      },
      create(input) {
        return commands.createFiscalYear(input);
      },
      update(input) {
        return commands.updateFiscalYear(input);
      },
      async delete(id) {
        await commands.deleteFiscalYear(id);
      },
      generate(input) {
        return commands.generateFiscalYear(input);
      },
    },
    accountEntries: {
      async list() {
        return (await commands.listAccountEntries()).map(toAccountEntry);
      },
      async create(input) {
        return toAccountEntry(await commands.createAccountEntry(input));
      },
      async update(input) {
        return toAccountEntry(await commands.updateAccountEntry(input));
      },
      async delete(id) {
        await commands.deleteAccountEntry(id);
      },
    },
  };
}

function toAccountEntry(entry: {
  readonly id: string;
  readonly kind: string;
  readonly occurredOn: string;
  readonly partnerId: string;
  readonly categoryId: string;
  readonly description: string;
  readonly amount: number;
}): AccountEntry {
  return {
    ...entry,
    kind: entry.kind as AccountEntryKind,
  };
}
