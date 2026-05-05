import type {
  ApiClient,
  Category,
  CreateCategoryInput,
  CreateFiscalYearInput,
  CreatePartnerInput,
  FiscalYear,
  FiscalYearSetting,
  GenerateFiscalYearInput,
  Partner,
  SaveFiscalYearSettingInput,
  UpdateCategoryInput,
  UpdateFiscalYearInput,
  UpdatePartnerInput,
} from "../api";

export function createMockApiClient(): ApiClient {
  const partners = createInMemoryPartnerStore();
  const categories = createInMemoryCategoryStore();
  const fiscalYears = createInMemoryFiscalYearStore();

  return {
    async health() {
      return { ok: true };
    },
    partners,
    categories,
    fiscalYears,
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

const defaultFiscalYearSetting: FiscalYearSetting = {
  startMonth: 4,
  durationMonths: 12,
  namingRule: "start_year",
};

function createInMemoryFiscalYearStore() {
  let setting: FiscalYearSetting = { ...defaultFiscalYearSetting };
  let fiscalYears: FiscalYear[] = [
    {
      id: "mock-fiscal-year-1",
      name: "2026年度",
      startMonth: "2026-04",
      endMonth: "2027-03",
    },
  ];

  return {
    async getSetting() {
      return setting;
    },
    async saveSetting(input: SaveFiscalYearSettingInput) {
      validateSetting(input);
      setting = {
        startMonth: input.startMonth,
        durationMonths: input.durationMonths,
        namingRule: input.namingRule.trim(),
      };
      return setting;
    },
    async list() {
      return sortFiscalYears(fiscalYears);
    },
    async create(input: CreateFiscalYearInput) {
      validateFiscalYear(input.name, input.startMonth, input.endMonth);
      ensurePeriodNotOverlapping(fiscalYears, undefined, input.startMonth, input.endMonth);

      const fiscalYear: FiscalYear = {
        id: `mock-fiscal-year-${crypto.randomUUID()}`,
        name: input.name.trim(),
        startMonth: input.startMonth.trim(),
        endMonth: input.endMonth.trim(),
      };
      fiscalYears = sortFiscalYears([...fiscalYears, fiscalYear]);
      return fiscalYear;
    },
    async update(input: UpdateFiscalYearInput) {
      if (!input.id.trim()) {
        throw new Error("事業年度 ID を指定してください。");
      }
      validateFiscalYear(input.name, input.startMonth, input.endMonth);
      ensurePeriodNotOverlapping(fiscalYears, input.id, input.startMonth, input.endMonth);

      const fiscalYear: FiscalYear = {
        id: input.id,
        name: input.name.trim(),
        startMonth: input.startMonth.trim(),
        endMonth: input.endMonth.trim(),
      };
      fiscalYears = sortFiscalYears(
        fiscalYears.map((item) => (item.id === fiscalYear.id ? fiscalYear : item)),
      );
      return fiscalYear;
    },
    async delete(id: string) {
      if (!id.trim()) {
        throw new Error("事業年度 ID を指定してください。");
      }
      fiscalYears = fiscalYears.filter((fiscalYear) => fiscalYear.id !== id);
    },
    async generate(input: GenerateFiscalYearInput) {
      if (input.startYear < 1900 || input.startYear > 9999) {
        throw new Error("開始年は 1900 から 9999 の範囲で指定してください。");
      }
      validateSetting(setting);

      const startMonth = formatYearMonth(input.startYear, setting.startMonth);
      const end = addMonths(input.startYear, setting.startMonth, setting.durationMonths - 1);
      const endMonth = formatYearMonth(end.year, end.month);
      const name = fiscalYearName(input.startYear, setting.namingRule);

      ensurePeriodNotOverlapping(fiscalYears, undefined, startMonth, endMonth);

      const fiscalYear: FiscalYear = {
        id: `mock-fiscal-year-${crypto.randomUUID()}`,
        name,
        startMonth,
        endMonth,
      };
      fiscalYears = sortFiscalYears([...fiscalYears, fiscalYear]);
      return fiscalYear;
    },
  };
}

function sortFiscalYears(fiscalYears: FiscalYear[]) {
  return [...fiscalYears].sort((left, right) => {
    const start = left.startMonth.localeCompare(right.startMonth);
    if (start !== 0) {
      return start;
    }
    return left.endMonth.localeCompare(right.endMonth);
  });
}

function validateSetting(input: SaveFiscalYearSettingInput) {
  if (input.startMonth < 1 || input.startMonth > 12) {
    throw new Error("開始月は 1 から 12 の範囲で指定してください。");
  }
  if (input.durationMonths < 1 || input.durationMonths > 120) {
    throw new Error("期間月数は 1 から 120 の範囲で指定してください。");
  }
  if (input.namingRule.trim() !== "start_year") {
    throw new Error("年度名の付け方が不正です。");
  }
}

function validateFiscalYear(name: string, startMonth: string, endMonth: string) {
  if (!name.trim()) {
    throw new Error("事業年度名を入力してください。");
  }
  const start = parseYearMonth(startMonth);
  const end = parseYearMonth(endMonth);
  if (compareYearMonth(start, end) > 0) {
    throw new Error("終了月は開始月以降にしてください。");
  }
}

function ensurePeriodNotOverlapping(
  fiscalYears: FiscalYear[],
  excludedId: string | undefined,
  startMonth: string,
  endMonth: string,
) {
  const start = parseYearMonth(startMonth);
  const end = parseYearMonth(endMonth);

  for (const fiscalYear of fiscalYears) {
    if (excludedId !== undefined && fiscalYear.id === excludedId) {
      continue;
    }
    const existingStart = parseYearMonth(fiscalYear.startMonth);
    const existingEnd = parseYearMonth(fiscalYear.endMonth);
    if (compareYearMonth(start, existingEnd) <= 0 && compareYearMonth(end, existingStart) >= 0) {
      throw new Error("事業年度の期間が既存の年度と重複しています。");
    }
  }
}

interface YearMonth {
  readonly year: number;
  readonly month: number;
}

function parseYearMonth(value: string): YearMonth {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error("年月は YYYY-MM 形式で入力してください。");
  }
  const year = Number.parseInt(match[1] ?? "", 10);
  const month = Number.parseInt(match[2] ?? "", 10);
  if (month < 1 || month > 12) {
    throw new Error("月は 1 から 12 の範囲で指定してください。");
  }
  return { year, month };
}

function compareYearMonth(left: YearMonth, right: YearMonth) {
  if (left.year !== right.year) {
    return left.year - right.year;
  }
  return left.month - right.month;
}

function addMonths(year: number, month: number, months: number): YearMonth {
  const total = year * 12 + (month - 1) + months;
  return {
    year: Math.floor(total / 12),
    month: (total % 12) + 1,
  };
}

function formatYearMonth(year: number, month: number) {
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}`;
}

function fiscalYearName(startYear: number, namingRule: string) {
  if (namingRule === "start_year") {
    return `${startYear}年度`;
  }
  throw new Error("年度名の付け方が不正です。");
}
