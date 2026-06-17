import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const envFiles = [".env", ".env.local"];
const loadedEnv = {};

for (const envFile of envFiles) {
  const path = resolve(envFile);

  if (!existsSync(path)) {
    continue;
  }

  const lines = readFileSync(path, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, "");

    loadedEnv[key] = value;
  }
}

for (const [key, value] of Object.entries(loadedEnv)) {
  if (process.env[key] === undefined) {
    process.env[key] = value;
  }
}

const baseUrl = normalizeBaseUrl(
  process.env.CONTROL_PLANE_BASE_URL
    ?? "http://localhost:3000",
);
const apiKey = process.env.CONTROL_PLANE_API_KEY;

if (!apiKey) {
  fail("Falta CONTROL_PLANE_API_KEY en el entorno o .env.local.");
}

const checks = [];

function normalizeBaseUrl(value) {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return new URL(withProtocol).origin;
}

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
  throw new Error(message);
}

function pass(message) {
  checks.push(message);
  console.log(`OK   ${message}`);
}

function endpoint(path) {
  return new URL(path, baseUrl).toString();
}

async function readJson(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

async function request(path, options = {}) {
  const response = await fetch(endpoint(path), {
    ...options,
    headers: {
      "x-control-plane-api-key": apiKey,
      ...options.headers,
    },
  });
  const body = await readJson(response);

  return { response, body };
}

async function requestWithoutAuth(path, options = {}) {
  const response = await fetch(endpoint(path), options);
  const body = await readJson(response);

  return { response, body };
}

function assertStatus(label, result, expectedStatus) {
  if (result.response.status !== expectedStatus) {
    fail(`${label}: esperaba HTTP ${expectedStatus}, recibio ${result.response.status}. Body: ${summarizeBody(result.body)}`);
  }

  pass(`${label}: HTTP ${expectedStatus}`);
}

function assertSuccess(label, result) {
  if (!result.response.ok || result.body?.success !== true) {
    fail(`${label}: respuesta inesperada ${result.response.status}. Body: ${summarizeBody(result.body)}`);
  }

  pass(label);
}

function assertPagination(label, body, expectedPageSize) {
  const pagination = body?.pagination;

  if (
    !pagination
    || typeof pagination.totalCount !== "number"
    || typeof pagination.totalPages !== "number"
    || typeof pagination.currentPage !== "number"
    || pagination.pageSize !== expectedPageSize
  ) {
    fail(`${label}: paginacion invalida. Body: ${summarizeBody(body)}`);
  }

  pass(`${label}: paginacion valida`);
}

function summarizeBody(body) {
  const text = typeof body === "string" ? body : JSON.stringify(body);

  if (!text) {
    return "<empty>";
  }

  return text.length > 500 ? `${text.slice(0, 500)}...` : text;
}

function firstDriverId(driversBody) {
  return driversBody?.items?.[0]?.trabajador?.clerkId ?? process.env.CONTROL_PLANE_DRIVER_ID;
}

function firstRiderId(ridersBody) {
  return ridersBody?.items?.[0]?.cliente?.clerkId ?? process.env.CONTROL_PLANE_RIDER_ID;
}

console.log(`Testing Control Plane API at ${baseUrl}`);

const missingAuth = await requestWithoutAuth("/api/control-plane/summary");
assertStatus("summary sin API key", missingAuth, 401);

const wrongAuthResponse = await fetch(endpoint("/api/control-plane/summary"), {
  headers: {
    "x-control-plane-api-key": "invalid-control-plane-key",
  },
});
const wrongAuth = {
  response: wrongAuthResponse,
  body: await readJson(wrongAuthResponse),
};
assertStatus("summary con API key invalida", wrongAuth, 401);

const summary = await request("/api/control-plane/summary");
assertSuccess("summary con API key valida", summary);

const transactions = await request("/api/control-plane/transactions?page=1&pageSize=2");
assertSuccess("transactions paginado", transactions);
assertPagination("transactions", transactions.body, 2);

const withdrawals = await request("/api/control-plane/withdrawals?page=1&pageSize=2");
assertSuccess("withdrawals paginado", withdrawals);
assertPagination("withdrawals", withdrawals.body, 2);

const drivers = await request("/api/control-plane/drivers?page=1&pageSize=2");
assertSuccess("drivers paginado", drivers);
assertPagination("drivers", drivers.body, 2);

const driverId = process.env.CONTROL_PLANE_DRIVER_ID ?? firstDriverId(drivers.body);

if (driverId) {
  const driverDetail = await request(`/api/control-plane/drivers/${encodeURIComponent(driverId)}?recentLimit=2`);
  assertSuccess(`driver detail ${driverId}`, driverDetail);

  const driverFilter = await request(`/api/control-plane/drivers?q=${encodeURIComponent(driverId)}&page=1&pageSize=2`);
  assertSuccess(`drivers filtrado por clerkId ${driverId}`, driverFilter);
  assertPagination("drivers filtrado", driverFilter.body, 2);
} else {
  console.log("SKIP driver detail: no hay drivers y no se configuro CONTROL_PLANE_DRIVER_ID.");
}

const riders = await request("/api/control-plane/riders?page=1&pageSize=2");
assertSuccess("riders paginado", riders);
assertPagination("riders", riders.body, 2);

const riderId = process.env.CONTROL_PLANE_RIDER_ID ?? firstRiderId(riders.body);

if (riderId) {
  const riderFilter = await request(`/api/control-plane/riders?q=${encodeURIComponent(riderId)}&page=1&pageSize=2`);
  assertSuccess(`riders filtrado por clerkId ${riderId}`, riderFilter);
  assertPagination("riders filtrado", riderFilter.body, 2);

  const transactionFilter = await request(`/api/control-plane/transactions?q=${encodeURIComponent(riderId)}&page=1&pageSize=2`);
  assertSuccess(`transactions filtrado por rider ${riderId}`, transactionFilter);
  assertPagination("transactions filtrado por rider", transactionFilter.body, 2);
} else {
  console.log("SKIP rider filter: no hay riders y no se configuro CONTROL_PLANE_RIDER_ID.");
}

const invalidCommission = await request("/api/control-plane/commission", {
  method: "PATCH",
  headers: {
    "content-type": "application/json",
  },
  body: JSON.stringify({
    commissionRate: "100.01",
    actorClerkId: "smoke-test",
    actorEmail: "smoke-test@example.com",
    reason: "Smoke test invalid payload",
  }),
});
assertStatus("commission rechaza payload invalido sin mutar", invalidCommission, 400);

console.log(`\n${checks.length} checks OK.`);
