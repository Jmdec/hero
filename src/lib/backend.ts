export function getBackendBaseUrl() {
  const configured = process.env.LARAVEL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  return configured.replace(/\/+$/g, "");
}

export function getBackendApiBaseUrl() {
  const base = getBackendBaseUrl();
  return base.endsWith("/api") ? base : `${base}/api`;
}

export function getBackendApiUrl(path: string) {
  const root = getBackendApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${root}${normalizedPath}`;
}

export function getBackendAppBaseUrl() {
  const base = getBackendBaseUrl();
  return base.endsWith("/api") ? base.replace(/\/api$/, "") : base;
}

export function getBackendAppUrl(path: string) {
  const root = getBackendAppBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${root}${normalizedPath}`;
}
