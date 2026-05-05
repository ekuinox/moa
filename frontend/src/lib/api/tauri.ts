import type { ApiClient } from ".";
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
  };
}
