const GTM_CONTAINER_ID_PATTERN = /^GTM-[A-Z0-9]+$/;

export function getGtmContainerId(value?: string): string | null {
  const candidate = arguments.length === 0 ? process.env.NEXT_PUBLIC_GTM_ID : value;
  return candidate && GTM_CONTAINER_ID_PATTERN.test(candidate) ? candidate : null;
}
