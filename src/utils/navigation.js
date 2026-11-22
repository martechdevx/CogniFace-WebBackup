export function getSafeInternalPath(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return null;
  }

  const destination = new URL(value, window.location.origin);
  if (destination.origin !== window.location.origin) return null;

  return `${destination.pathname}${destination.search}${destination.hash}`;
}
