export function getDriverAppUrl() {
  const driverAppUrl = process.env.NEXT_PUBLIC_DRIVER_APP_URL?.trim().replace(/\/+$/, "");

  return driverAppUrl || null;
}
