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
  };
}
