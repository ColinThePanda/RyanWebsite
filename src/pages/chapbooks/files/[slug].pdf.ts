import { readFile } from "node:fs/promises";
import {
  getChapbookBySlug,
  getChapbookEntries,
  getChapbookPdfFilePath,
} from "@/lib/chapbooks";

export function getStaticPaths() {
  return getChapbookEntries().map((entry) => ({
    params: { slug: entry.slug },
  }));
}

export async function GET({ params }: { params: { slug: string } }) {
  const entry = getChapbookBySlug(params.slug);

  if (!entry) {
    return new Response("Not found", { status: 404 });
  }

  const pdfBuffer = await readFile(getChapbookPdfFilePath(entry.pdfFileName));

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${entry.pdfFileName}"`,
    },
  });
}
