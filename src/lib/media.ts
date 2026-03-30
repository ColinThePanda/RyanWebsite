import { withBase } from "@/lib/base";
import { parseSortDate } from "@/lib/dates";

export type MediaCollection = "songs" | "videos" | "photos" | "author-photos";

type MediaKind = "audio" | "video" | "image";
type SupportedCollection = MediaCollection | "albums";
type MetadataEntry = {
  title: string;
  date: string;
};

type AlbumMetaEntry = {
  slug: string;
  title: string;
  date: string;
  tracks: Array<{
    file: string;
    slug: string;
    title: string;
    date: string;
  }>;
};

const songFiles = import.meta.glob("../content/songs/*.{mp3,m4a,wav,ogg,flac,aac}", {
  eager: true,
  import: "default",
  query: "?url",
}) as Record<string, string>;

const videoFiles = import.meta.glob("../content/videos/*.{mp4,webm,m4v,mov}", {
  eager: true,
  import: "default",
  query: "?url",
}) as Record<string, string>;

const photoFiles = import.meta.glob("../content/photos/*.{jpg,jpeg,png,webp,gif,avif}", {
  eager: true,
  import: "default",
  query: "?url",
}) as Record<string, string>;

const authorPhotoFiles = import.meta.glob("../content/author-photos/*.{jpg,jpeg,png,webp,gif,avif}", {
  eager: true,
  import: "default",
  query: "?url",
}) as Record<string, string>;

const collectionMetaModules = import.meta.glob("../content/{songs,videos,photos,author-photos}/_meta.json", {
  eager: true,
  import: "default",
}) as Record<string, Record<string, MetadataEntry>>;

const albumMetaModules = import.meta.glob("../content/albums/_meta.json", {
  eager: true,
  import: "default",
}) as Record<string, AlbumMetaEntry[]>;

const albumTrackFiles = import.meta.glob("../content/albums/*/*.{mp3,m4a,wav,ogg,flac,aac}", {
  eager: true,
  import: "default",
  query: "?url",
}) as Record<string, string>;

export interface MediaEntry {
  collection: MediaCollection;
  slug: string;
  title: string;
  date: string;
  url: string;
  assetUrl: string;
  kind: MediaKind;
}

export interface AlbumTrack {
  albumSlug: string;
  slug: string;
  title: string;
  date: string;
  url: string;
  assetUrl: string;
}

export interface AlbumEntry {
  slug: string;
  title: string;
  date: string;
  url: string;
  tracks: AlbumTrack[];
}

const songs = loadMediaCollection(
  "songs",
  "audio",
  songFiles,
);
const videos = loadMediaCollection(
  "videos",
  "video",
  videoFiles,
);
const photos = loadMediaCollection(
  "photos",
  "image",
  photoFiles,
);
const authorPhotos = loadMediaCollection(
  "author-photos",
  "image",
  authorPhotoFiles,
);
const albums = loadAlbums();

const mediaEntries = {
  songs,
  videos,
  photos,
  "author-photos": authorPhotos,
} satisfies Record<MediaCollection, MediaEntry[]>;

export function getMediaEntries(collection: MediaCollection): MediaEntry[] {
  return mediaEntries[collection];
}

export function getStaticMediaPaths(collection: MediaCollection) {
  return getMediaEntries(collection).map((entry) => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}

export function getAlbums(): AlbumEntry[] {
  return albums;
}

export function getStaticAlbumPaths() {
  return albums.map((album) => ({
    params: { album: album.slug },
    props: { album },
  }));
}

export function getStaticAlbumTrackPaths() {
  return albums.flatMap((album) =>
    album.tracks.map((track) => ({
      params: { album: album.slug, track: track.slug },
      props: { album, track },
    })),
  );
}

function loadMediaCollection(
  collection: MediaCollection,
  kind: MediaKind,
  files: Record<string, string>,
) {
  const metadata = loadCollectionMetadata(collection);
  const usedKeys = new Set<string>();

  const entries = Object.entries(files).map(([filePath, assetUrl]) => {
    const slug = extractFlatSlug(filePath, collection);
    const meta = metadata[slug];

    if (!meta) {
      throw new Error(`Missing metadata entry for ${collection}/${slug}`);
    }

    usedKeys.add(slug);
    validateMetadata(meta, `${collection}/${slug}`);

    return {
      collection,
      slug,
      title: meta.title,
      date: meta.date,
      url: withBase(`/${collection}/${slug}`),
      assetUrl,
      kind,
    } satisfies MediaEntry;
  });

  for (const slug of Object.keys(metadata)) {
    if (!usedKeys.has(slug)) {
      throw new Error(`Metadata entry "${slug}" in ${collection}/_meta.json has no matching file`);
    }
  }

  return entries.sort(compareDatedEntries);
}

function loadAlbums() {
  const albumMeta = albumMetaModules["../content/albums/_meta.json"];

  if (!albumMeta) {
    throw new Error('Missing metadata file: src/content/albums/_meta.json');
  }

  const trackFileMap = new Map<string, string>();

  for (const [filePath, assetUrl] of Object.entries(albumTrackFiles)) {
    const match = filePath.match(/albums\/([^/]+)\/([^/]+)$/);

    if (!match) {
      throw new Error(`Unsupported album track path: ${filePath}`);
    }

    const [, albumSlug, fileName] = match;
    trackFileMap.set(`${albumSlug}/${fileName}`, assetUrl);
  }

  const seenAlbums = new Set<string>();

  return albumMeta
    .map((album) => {
      validateAlbum(album);

      if (seenAlbums.has(album.slug)) {
        throw new Error(`Duplicate album slug detected: ${album.slug}`);
      }

      seenAlbums.add(album.slug);

      const seenTracks = new Set<string>();
      const tracks = album.tracks.map((track) => {
        validateMetadata(track, `albums/${album.slug}/${track.slug}`);

        if (seenTracks.has(track.slug)) {
          throw new Error(`Duplicate track slug "${track.slug}" in album "${album.slug}"`);
        }

        seenTracks.add(track.slug);

        if (track.file.includes("/") || track.file.includes("\\")) {
          throw new Error(`Album track file "${track.file}" must stay inside album folder "${album.slug}"`);
        }

        const assetUrl = trackFileMap.get(`${album.slug}/${track.file}`);

        if (!assetUrl) {
          throw new Error(`Album track file "${track.file}" is missing for album "${album.slug}"`);
        }

        return {
          albumSlug: album.slug,
          slug: track.slug,
          title: track.title,
          date: track.date,
          url: withBase(`/albums/${album.slug}/${track.slug}`),
          assetUrl,
        } satisfies AlbumTrack;
      });

      return {
        slug: album.slug,
        title: album.title,
        date: album.date,
        url: withBase(`/albums/${album.slug}`),
        tracks,
      } satisfies AlbumEntry;
    })
    .sort(compareDatedEntries);
}

function loadCollectionMetadata(collection: SupportedCollection) {
  const metadataPath = `../content/${collection}/_meta.json`;
  const metadata = collectionMetaModules[metadataPath];

  if (!metadata) {
    throw new Error(`Missing metadata file: src/content/${collection}/_meta.json`);
  }

  return metadata;
}

function extractFlatSlug(filePath: string, collection: MediaCollection) {
  const match = filePath.match(new RegExp(`${collection}/([^/]+)\\.[^/.]+$`));

  if (!match) {
    throw new Error(`Unsupported ${collection} file path: ${filePath}`);
  }

  return match[1];
}

function validateMetadata(metadata: MetadataEntry, label: string) {
  if (!metadata || typeof metadata !== "object") {
    throw new Error(`Invalid metadata entry for ${label}`);
  }

  if (typeof metadata.title !== "string" || !metadata.title.trim()) {
    throw new Error(`Missing title for ${label}`);
  }

  if (typeof metadata.date !== "string" || !metadata.date.trim()) {
    throw new Error(`Missing date for ${label}`);
  }

  parseSortDate(metadata.date, label);
}

function validateAlbum(album: AlbumMetaEntry) {
  if (typeof album.slug !== "string" || !album.slug.trim()) {
    throw new Error("Each album in albums/_meta.json must have a slug");
  }

  validateMetadata(album, `albums/${album.slug}`);

  if (!Array.isArray(album.tracks)) {
    throw new Error(`Album "${album.slug}" must have a tracks array`);
  }
}

function compareDatedEntries<T extends { date: string; title: string }>(a: T, b: T) {
  const dateDelta = parseSortDate(b.date) - parseSortDate(a.date);

  if (dateDelta !== 0) {
    return dateDelta;
  }

  return a.title.localeCompare(b.title);
}
