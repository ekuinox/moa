import type {
  AccountEntry,
  AccountEntryKind,
  ApiClient,
  Category,
  CreateAccountEntryInput,
  CreateCategoryInput,
  CreatePartnerInput,
  Partner,
  SaveSettingsInput,
  Settings,
  UpdateAccountEntryInput,
  UpdateCategoryInput,
  UpdatePartnerInput,
} from "../api";

export function createMockApiClient(): ApiClient {
  const partners = createInMemoryPartnerStore();
  const categories = createInMemoryCategoryStore();
  const settings = createInMemorySettingsStore();
  const accountEntries = createInMemoryAccountEntryStore();

  return {
    async health() {
      return { ok: true };
    },
    debugInfo: {
      async get() {
        return {
          appVersion: "0.1.0",
          commitHash: "mock",
          buildTimestamp: "mock",
          databasePath: "mock",
        };
      },
    },
    partners,
    categories,
    settings,
    accountEntries,
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

function createInMemorySettingsStore() {
  let settings: Settings = { fiscalYearStartMonth: 4 };

  return {
    async get() {
      return settings;
    },
    async save(input: SaveSettingsInput) {
      if (input.fiscalYearStartMonth < 1 || input.fiscalYearStartMonth > 12) {
        throw new Error("開始月は 1 から 12 の範囲で指定してください。");
      }
      settings = { fiscalYearStartMonth: input.fiscalYearStartMonth };
      return settings;
    },
  };
}

function createInMemoryAccountEntryStore() {
  let accountEntries: AccountEntry[] = [
    {
      id: "mock-account-entry-1",
      kind: "payable",
      occurredOn: "2026-05-01",
      partnerId: "mock-partner-1",
      categoryIds: ["mock-category-1"],
      description: "初期仕入",
      amount: 12000,
    },
    {
      id: "mock-account-entry-2",
      kind: "receivable",
      occurredOn: "2026-05-03",
      partnerId: "mock-partner-2",
      categoryIds: ["mock-category-2"],
      description: "初期売上",
      amount: 24000,
    },
  ];

  return {
    async list() {
      return sortAccountEntries(accountEntries);
    },
    async create(input: CreateAccountEntryInput) {
      validateAccountEntry(input);
      const entry: AccountEntry = {
        id: `mock-account-entry-${crypto.randomUUID()}`,
        kind: input.kind,
        occurredOn: input.occurredOn.trim(),
        partnerId: input.partnerId.trim(),
        categoryIds: normalizeCategoryIds(input.categoryIds),
        description: input.description.trim(),
        amount: input.amount,
      };
      accountEntries = sortAccountEntries([...accountEntries, entry]);
      return entry;
    },
    async update(input: UpdateAccountEntryInput) {
      if (!input.id.trim()) {
        throw new Error("明細 ID を指定してください。");
      }
      validateAccountEntry(input);
      const entry: AccountEntry = {
        id: input.id,
        kind: input.kind,
        occurredOn: input.occurredOn.trim(),
        partnerId: input.partnerId.trim(),
        categoryIds: normalizeCategoryIds(input.categoryIds),
        description: input.description.trim(),
        amount: input.amount,
      };
      accountEntries = sortAccountEntries(
        accountEntries.map((item) => (item.id === input.id ? entry : item)),
      );
      return entry;
    },
    async delete(id: string) {
      accountEntries = accountEntries.filter((entry) => entry.id !== id);
    },
  };
}

function sortAccountEntries(entries: AccountEntry[]) {
  return [...entries].sort((left, right) => right.occurredOn.localeCompare(left.occurredOn));
}

function normalizeCategoryIds(ids: readonly string[]): readonly string[] {
  return ids.map((id) => id.trim()).filter((id) => id.length > 0);
}

function validateAccountEntry(input: {
  readonly kind: AccountEntryKind;
  readonly occurredOn: string;
  readonly partnerId: string;
  readonly categoryIds: readonly string[];
  readonly amount: number;
}) {
  if (input.kind !== "payable" && input.kind !== "receivable") {
    throw new Error("区分は買掛または売掛を指定してください。");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.occurredOn.trim())) {
    throw new Error("発生日は YYYY-MM-DD 形式で入力してください。");
  }
  if (!input.partnerId.trim()) {
    throw new Error("取引先を指定してください。");
  }
  const seen = new Set<string>();
  for (const id of input.categoryIds) {
    const trimmed = id.trim();
    if (trimmed.length === 0) {
      throw new Error("空の種別 ID は指定できません。");
    }
    if (seen.has(trimmed)) {
      throw new Error("同じ種別を重複して指定することはできません。");
    }
    seen.add(trimmed);
  }
  if (input.amount < 0) {
    throw new Error("金額は 0 以上で入力してください。");
  }
}
