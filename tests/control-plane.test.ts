import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { validateControlPlaneApiKey } from "@/lib/control-plane-auth";
import {
  CONTROL_PLANE_DEFAULT_PAGE,
  CONTROL_PLANE_DEFAULT_PAGE_SIZE,
  CONTROL_PLANE_MAX_PAGE_SIZE,
  getControlPlanePagination,
  parseControlPlaneCommissionPayload,
} from "@/lib/control-plane-utils";

const originalControlPlaneApiKey = process.env.CONTROL_PLANE_API_KEY;

afterEach(() => {
  if (originalControlPlaneApiKey === undefined) {
    delete process.env.CONTROL_PLANE_API_KEY;
    return;
  }

  process.env.CONTROL_PLANE_API_KEY = originalControlPlaneApiKey;
});

test("validateControlPlaneApiKey rejects requests when env is missing", async () => {
  delete process.env.CONTROL_PLANE_API_KEY;

  const response = validateControlPlaneApiKey(new Request("http://payments.test/api/control-plane/summary"));

  assert.equal(response?.status, 500);
  assert.deepEqual(await response?.json(), {
    success: false,
    errorCode: "CONTROL_PLANE_AUTH_NOT_CONFIGURED",
    message: "La autenticacion de Control Plane no esta configurada.",
  });
});

test("validateControlPlaneApiKey rejects missing or invalid headers", async () => {
  process.env.CONTROL_PLANE_API_KEY = "secret";

  const missing = validateControlPlaneApiKey(new Request("http://payments.test/api/control-plane/summary"));
  const invalid = validateControlPlaneApiKey(
    new Request("http://payments.test/api/control-plane/summary", {
      headers: {
        "x-control-plane-api-key": "wrong",
      },
    }),
  );

  assert.equal(missing?.status, 401);
  assert.equal(invalid?.status, 401);
  assert.deepEqual(await invalid?.json(), {
    success: false,
    errorCode: "UNAUTHORIZED",
    message: "API key de Control Plane invalida o ausente.",
  });
});

test("validateControlPlaneApiKey accepts the configured key", () => {
  process.env.CONTROL_PLANE_API_KEY = "secret";

  const response = validateControlPlaneApiKey(
    new Request("http://payments.test/api/control-plane/summary", {
      headers: {
        "x-control-plane-api-key": "secret",
      },
    }),
  );

  assert.equal(response, null);
});

test("getControlPlanePagination applies defaults and caps page size", () => {
  assert.deepEqual(getControlPlanePagination(new URLSearchParams()), {
    page: CONTROL_PLANE_DEFAULT_PAGE,
    pageSize: CONTROL_PLANE_DEFAULT_PAGE_SIZE,
  });

  assert.deepEqual(getControlPlanePagination(new URLSearchParams("page=3&pageSize=1000")), {
    page: 3,
    pageSize: CONTROL_PLANE_MAX_PAGE_SIZE,
  });

  assert.deepEqual(getControlPlanePagination(new URLSearchParams("page=-1&pageSize=0")), {
    page: 1,
    pageSize: 1,
  });
});

test("parseControlPlaneCommissionPayload accepts decimal strings with actor context", () => {
  const parsed = parseControlPlaneCommissionPayload({
    commissionRate: "10,50",
    actorClerkId: " user_admin ",
    actorEmail: " admin@test.com ",
    reason: " Ajuste operativo ",
  });

  assert.ok(parsed);
  assert.equal(parsed.commissionRate.toFixed(2), "10.50");
  assert.equal(parsed.actorClerkId, "user_admin");
  assert.equal(parsed.actorEmail, "admin@test.com");
  assert.equal(parsed.reason, "Ajuste operativo");
});

test("parseControlPlaneCommissionPayload rejects unsafe commission payloads", () => {
  assert.equal(
    parseControlPlaneCommissionPayload({
      commissionRate: 10,
      actorClerkId: "user_admin",
      actorEmail: "admin@test.com",
      reason: "Ajuste",
    }),
    null,
  );
  assert.equal(
    parseControlPlaneCommissionPayload({
      commissionRate: "100.01",
      actorClerkId: "user_admin",
      actorEmail: "admin@test.com",
      reason: "Ajuste",
    }),
    null,
  );
  assert.equal(
    parseControlPlaneCommissionPayload({
      commissionRate: "10.001",
      actorClerkId: "user_admin",
      actorEmail: "admin@test.com",
      reason: "Ajuste",
    }),
    null,
  );
  assert.equal(
    parseControlPlaneCommissionPayload({
      commissionRate: "10.00",
      actorClerkId: "",
      actorEmail: "admin@test.com",
      reason: "Ajuste",
    }),
    null,
  );
});
