import type { ApiClient, CreatePartnerInput, Partner, UpdatePartnerInput } from "../api";

export function createMockApiClient(): ApiClient {
  const partners = createInMemoryPartnerStore();

  return {
    async health() {
      return { ok: true };
    },
    partners,
  };
}

function createInMemoryPartnerStore() {
  let partners: Partner[] = [
    {
      id: "mock-partner-1",
      name: "青木商店",
      kana: "あおきしょうてん",
    },
    {
      id: "mock-partner-2",
      name: "山田工業",
      kana: "やまだこうぎょう",
    },
  ];

  return {
    async list() {
      return sortPartners(partners);
    },
    async create(input: CreatePartnerInput) {
      const partner = {
        id: `mock-partner-${crypto.randomUUID()}`,
        name: input.name.trim(),
        kana: input.kana.trim(),
      };
      partners = sortPartners([...partners, partner]);
      return partner;
    },
    async update(input: UpdatePartnerInput) {
      const partner = {
        id: input.id,
        name: input.name.trim(),
        kana: input.kana.trim(),
      };
      partners = sortPartners(partners.map((item) => (item.id === input.id ? partner : item)));
      return partner;
    },
    async delete(id: string) {
      partners = partners.filter((partner) => partner.id !== id);
    },
  };
}

function sortPartners(partners: Partner[]) {
  return [...partners].sort((left, right) => {
    const kanaOrder = left.kana.localeCompare(right.kana, "ja");

    if (kanaOrder !== 0) {
      return kanaOrder;
    }

    return left.name.localeCompare(right.name, "ja");
  });
}
