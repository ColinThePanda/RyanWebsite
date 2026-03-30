export const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export function withBase(path: string) {
  if (!path) {
    return base || "/";
  }

  if (
    path.startsWith("#") ||
    path.startsWith("//") ||
    /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(path)
  ) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return base ? `${base}${normalizedPath}` : normalizedPath;
}
