import type {
  ApiClient,
  Category,
  CreateCategoryInput,
  CreatePartnerInput,
  Partner,
  UpdateCategoryInput,
  UpdatePartnerInput,
} from "../api";

export function createMockApiClient(): ApiClient {
  const partners = createInMemoryPartnerStore();
  const categories = createInMemoryCategoryStore();

  return {
    async health() {
      return { ok: true };
    },
    partners,
    categories,
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

function createInMemoryCategoryStore() {
  let categories: Category[] = [
    {
      id: "mock-category-1",
      name: "材料費",
    },
    {
      id: "mock-category-2",
      name: "工賃",
    },
  ];

  return {
    async list() {
      return sortCategories(categories);
    },
    async create(input: CreateCategoryInput) {
      const category = {
        id: `mock-category-${crypto.randomUUID()}`,
        name: input.name.trim(),
      };
      categories = sortCategories([...categories, category]);
      return category;
    },
    async update(input: UpdateCategoryInput) {
      const category = {
        id: input.id,
        name: input.name.trim(),
      };
      categories = sortCategories(
        categories.map((item) => (item.id === input.id ? category : item)),
      );
      return category;
    },
    async delete(id: string) {
      categories = categories.filter((category) => category.id !== id);
    },
  };
}

function sortCategories(categories: Category[]) {
  return [...categories].sort((left, right) => left.name.localeCompare(right.name, "ja"));
}
