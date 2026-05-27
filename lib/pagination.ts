import { redirect } from "next/navigation";

export type PageSearchParams = Record<string, string | string[] | undefined>;

export function firstSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parsePageSearchParam(value: string | string[] | undefined) {
  return Math.max(1, Number(firstSearchValue(value)) || 1);
}

export function buildPageHref({
  pathname,
  searchParams,
  page,
}: {
  pathname: string;
  searchParams: PageSearchParams;
  page: number;
}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page" || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      continue;
    }

    params.set(key, value);
  }

  params.set("page", page.toString());

  return `${pathname}?${params.toString()}`;
}

export function redirectToCanonicalPage({
  pathname,
  searchParams,
  requestedPageValue,
  currentPage,
}: {
  pathname: string;
  searchParams: PageSearchParams;
  requestedPageValue: string | string[] | undefined;
  currentPage: number;
}) {
  const rawPageValue = firstSearchValue(requestedPageValue);

  if (rawPageValue === undefined || rawPageValue === currentPage.toString()) {
    return;
  }

  redirect(buildPageHref({ pathname, searchParams, page: currentPage }));
}
