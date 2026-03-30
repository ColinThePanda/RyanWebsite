import { withBase } from "@/lib/base";
import { parseSortDate } from "@/lib/dates";

export type TextCollection =
  | "poems"
  | "essays"
  | "notes"
  | "artist-statements"
  | "miscellaneous";

export interface TextEntry {
  collection: TextCollection;
  slug: string;
  title: string;
  date?: string;
  summary?: string;
  order?: number;
  draft: boolean;
  body: string;
  url: string;
}

type FrontmatterValue = boolean | number | string;
type FrontmatterMap = Record<string, FrontmatterValue>;

const rawEntries = import.meta.glob("../content/{poems,essays,notes,artist-statements,miscellaneous}/*.{md,txt}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const entries = Object.entries(rawEntries).map(([filePath, rawContent]) =>
  createTextEntry(filePath, rawContent),
);

assertUniqueEntries(entries);

export function getEntries(collection: TextCollection): TextEntry[] {
  return entries
    .filter((entry) => entry.collection === collection && !entry.draft)
    .sort(compareEntries);
}

export function getStaticTextPaths(collection: TextCollection) {
  return getEntries(collection).map((entry) => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}

function createTextEntry(filePath: string, rawContent: string): TextEntry {
  const match = filePath.match(
    /(poems|essays|notes|artist-statements|miscellaneous)\/([^/]+)\.(md|txt)$/,
  );

  if (!match) {
    throw new Error(`Unsupported writing path: ${filePath}`);
  }

  const [, collection, slug] = match;
  const { frontmatter, body } = parseFile(rawContent);
  const title = readRequiredString(frontmatter.title, "title", filePath);
  const date = readOptionalString(frontmatter.date, "date", filePath);
  const summary = readOptionalString(frontmatter.summary, "summary", filePath);
  const order = readOptionalNumber(frontmatter.order, "order", filePath);
  const draft = readOptionalBoolean(frontmatter.draft, "draft", filePath) ?? false;
  if (date) {
    parseSortDate(date, filePath);
  }

  return {
    collection: collection as TextCollection,
    slug,
    title,
    date,
    summary,
    order,
    draft,
    body,
    url: withBase(`/${collection}/${slug}`),
  };
}

function parseFile(rawContent: string) {
  const normalized = rawContent.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) {
    throw new Error("Every writing file must start with frontmatter wrapped in --- lines.");
  }

  const [, frontmatterBlock, bodyBlock] = match;

  return {
    frontmatter: parseFrontmatter(frontmatterBlock),
    body: bodyBlock.replace(/^\n+/, "").trimEnd(),
  };
}

function parseFrontmatter(frontmatterBlock: string): FrontmatterMap {
  const frontmatter: FrontmatterMap = {};

  for (const rawLine of frontmatterBlock.split("\n")) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) {
      throw new Error(`Invalid frontmatter line: "${rawLine}"`);
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (!key) {
      throw new Error(`Invalid frontmatter key in line: "${rawLine}"`);
    }

    frontmatter[key] = coerceValue(value);
  }

  return frontmatter;
}

function coerceValue(value: string): FrontmatterValue {
  const unwrapped = unwrapQuotes(value);

  if (unwrapped === "true") {
    return true;
  }

  if (unwrapped === "false") {
    return false;
  }

  if (/^-?\d+(\.\d+)?$/.test(unwrapped)) {
    return Number(unwrapped);
  }

  return unwrapped;
}

function unwrapQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function readRequiredString(value: FrontmatterValue | undefined, key: string, filePath: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Expected "${key}" to be a non-empty string in ${filePath}`);
  }

  return value;
}

function readOptionalString(
  value: FrontmatterValue | undefined,
  key: string,
  filePath: string,
) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`Expected "${key}" to be a string in ${filePath}`);
  }

  return value;
}

function readOptionalNumber(
  value: FrontmatterValue | undefined,
  key: string,
  filePath: string,
) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`Expected "${key}" to be a number in ${filePath}`);
  }

  return value;
}

function readOptionalBoolean(
  value: FrontmatterValue | undefined,
  key: string,
  filePath: string,
) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "boolean") {
    throw new Error(`Expected "${key}" to be a boolean in ${filePath}`);
  }

  return value;
}

function compareEntries(a: TextEntry, b: TextEntry) {
  const dateDelta = parseSortDate(b.date) - parseSortDate(a.date);

  if (dateDelta !== 0) {
    return dateDelta;
  }

  const orderDelta = normalizeOrder(a.order) - normalizeOrder(b.order);

  if (orderDelta !== 0) {
    return orderDelta;
  }

  return a.title.localeCompare(b.title);
}

function normalizeOrder(value?: number) {
  return value ?? Number.POSITIVE_INFINITY;
}

function assertUniqueEntries(allEntries: TextEntry[]) {
  const seen = new Set<string>();

  for (const entry of allEntries) {
    const key = `${entry.collection}:${entry.slug}`;

    if (seen.has(key)) {
      throw new Error(`Duplicate writing slug detected: ${key}`);
    }

    seen.add(key);
  }
}
