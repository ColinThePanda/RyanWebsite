import { join } from "node:path";
import { withBase } from "@/lib/base";
import { parseSortDate } from "@/lib/dates";

type ChapbookMetadataEntry = {
  title: string;
  date: string;
  pdfUrl: string;
  contentWarning?: string;
};

const CHAPBOOK_METADATA_PATH = "../content/chapbooks/_meta.json";
const CHAPBOOK_CONTENT_PREFIX = "../content/chapbooks/";
const CHAPBOOK_FILES_ROUTE_PREFIX = "/chapbooks/files";
const chapbookFiles = new Set(Object.keys(import.meta.glob("../content/chapbooks/*.pdf")));

const chapbookMetaModules = import.meta.glob("../content/chapbooks/_meta.json", {
  eager: true,
  import: "default",
}) as Record<string, Record<string, ChapbookMetadataEntry>>;

export interface ChapbookEntry {
  slug: string;
  title: string;
  date: string;
  url: string;
  gateUrl: string;
  pdfUrl: string;
  pdfFileName: string;
  contentWarning?: string;
}

const chapbooks = loadChapbooks();

export function getChapbookEntries() {
  return chapbooks;
}

export function getStaticChapbookWarningPaths() {
  return chapbooks
    .filter((entry) => entry.contentWarning)
    .map((entry) => ({
      params: { slug: entry.slug },
      props: { entry },
    }));
}

function loadChapbooks() {
  const metadata = chapbookMetaModules[CHAPBOOK_METADATA_PATH];

  if (!metadata) {
    throw new Error("Missing metadata file: src/content/chapbooks/_meta.json");
  }

  const usedFiles = new Set<string>();

  const entries = Object.entries(metadata).map(([slug, meta]) => {
    validateSlug(slug);
    validateMetadata(meta, slug);

    if (meta.pdfUrl.includes("/") || meta.pdfUrl.includes("\\")) {
      throw new Error(`Chapbook "${slug}" pdfUrl must stay inside src/content/chapbooks`);
    }

    const filePath = `${CHAPBOOK_CONTENT_PREFIX}${meta.pdfUrl}`;

    if (!chapbookFiles.has(filePath)) {
      throw new Error(`Missing PDF "${meta.pdfUrl}" for chapbook "${slug}"`);
    }

    usedFiles.add(filePath);

    const gateUrl = withBase(`/chapbooks/${slug}`);
    const servedPdfUrl = withBase(`${CHAPBOOK_FILES_ROUTE_PREFIX}/${slug}.pdf`);

    return {
      slug,
      title: meta.title,
      date: meta.date,
      url: meta.contentWarning ? gateUrl : servedPdfUrl,
      gateUrl,
      pdfUrl: servedPdfUrl,
      pdfFileName: meta.pdfUrl,
      contentWarning: meta.contentWarning,
    } satisfies ChapbookEntry;
  });

  for (const filePath of chapbookFiles) {
    if (!usedFiles.has(filePath)) {
      throw new Error(`PDF "${filePath.replace(CHAPBOOK_CONTENT_PREFIX, "")}" has no metadata entry`);
    }
  }

  return entries.sort(compareChapbooks);
}

function validateSlug(slug: string) {
  if (!slug.trim()) {
    throw new Error("Each chapbook metadata entry must have a non-empty slug");
  }
}

function validateMetadata(metadata: ChapbookMetadataEntry, slug: string) {
  if (!metadata || typeof metadata !== "object") {
    throw new Error(`Invalid chapbook metadata for "${slug}"`);
  }

  if (typeof metadata.title !== "string" || !metadata.title.trim()) {
    throw new Error(`Missing title for chapbook "${slug}"`);
  }

  if (typeof metadata.date !== "string" || !metadata.date.trim()) {
    throw new Error(`Missing date for chapbook "${slug}"`);
  }

  if (typeof metadata.pdfUrl !== "string" || !metadata.pdfUrl.trim()) {
    throw new Error(`Missing pdfUrl for chapbook "${slug}"`);
  }

  if (metadata.contentWarning !== undefined && typeof metadata.contentWarning !== "string") {
    throw new Error(`Expected contentWarning to be a string for chapbook "${slug}"`);
  }

  parseSortDate(metadata.date, `chapbooks/${slug}`);
}

function compareChapbooks(a: ChapbookEntry, b: ChapbookEntry) {
  const dateDelta = parseSortDate(b.date) - parseSortDate(a.date);

  if (dateDelta !== 0) {
    return dateDelta;
  }

  return a.title.localeCompare(b.title);
}

export function getChapbookBySlug(slug: string) {
  return chapbooks.find((entry) => entry.slug === slug);
}

export function getChapbookPdfFilePath(fileName: string) {
  return join(process.cwd(), "src", "content", "chapbooks", fileName);
}
