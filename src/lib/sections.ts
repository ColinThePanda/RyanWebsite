import { plainTitle } from "@/lib/styled-titles";

export const sectionLabels = {
  poems: {
    label: "poems",
    titleSegments: [
      { text: "po" },
      { text: "e", className: "text-red-500" },
      { text: "ms" },
    ],
  },
  essays: {
    label: "essais",
    titleSegments: [
      { text: "essa" },
      { text: "i", className: "text-lime-300" },
      { text: "s" },
    ],
  },
  notes: {
    label: "notes",
    titleSegments: plainTitle("notes"),
  },
  chapbooks: {
    label: "chapbooks",
    titleSegments: plainTitle("chapbooks"),
  },
  songs: {
    label: "/s\u0251\u014Bz/",
    titleSegments: plainTitle("/s\u0251\u014Bz/"),
  },
  "author-photos": {
    label: "(author) photo(n)s",
    titleSegments: [
      { text: "(author) ", className: "text-[0.6em] text-lime-300" },
      { text: "photo" },
      { text: "(n)", className: "text-red-500" },
      { text: "s" },
    ],
  },
  photos: {
    label: "photo(n)s",
    titleSegments: [
      { text: "photo" },
      { text: "(n)", className: "text-red-500" },
      { text: "s" },
    ],
  },
  videos: {
    label: "vide\u014Ds",
    titleSegments: [
      { text: "vide" },
      { text: "\u014D", className: "text-cyan-300" },
      { text: "s" },
    ],
  },
  "artist-statements": {
    label: "artist statements",
    titleSegments: plainTitle("artist statements"),
  },
  albums: {
    label: "labums",
    titleSegments: plainTitle("labums"),
  },
  miscellaneous: {
    label: "miscellaneous",
    titleSegments: [{ text: "miscellaneous", className: "text-lime-300" }],
  },
} as const;

export type SectionKey = keyof typeof sectionLabels;
