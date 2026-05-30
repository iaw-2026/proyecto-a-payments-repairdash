export function getRiderAppUrl() {
  const riderAppUrl = process.env.NEXT_PUBLIC_RIDER_APP_URL?.trim().replace(/\/+$/, "");

  return riderAppUrl || null;
}
