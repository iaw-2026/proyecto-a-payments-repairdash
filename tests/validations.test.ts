import test from "node:test";
import assert from "node:assert/strict";
import { ZodError } from "zod";
import {
  validateCancelCheckout,
  validateCheckout,
} from "../lib/validations/checkout";
import {
  validateAuthenticatedWithdrawal,
  validateWithdrawal,
} from "../lib/validations/withdrawal";

test("validateCheckout trims ids and applies default description", () => {
  const input = validateCheckout({
    trabajoId: " trabajo-1 ",
    clientId: " client-1 ",
    trabajadorId: " worker-1 ",
    amount: "1500.50",
  });

  assert.deepEqual(input, {
    trabajoId: "trabajo-1",
    clientId: "client-1",
    trabajadorId: "worker-1",
    amount: "1500.50",
    description: "Servicio de reparacion",
  });
});

test("validateCheckout rejects zero and amounts with more than two decimals", () => {
  assert.throws(
    () =>
      validateCheckout({
        trabajoId: "trabajo-1",
        clientId: "client-1",
        trabajadorId: "worker-1",
        amount: "0.00",
      }),
    ZodError,
  );
  assert.throws(
    () =>
      validateCheckout({
        trabajoId: "trabajo-1",
        clientId: "client-1",
        trabajadorId: "worker-1",
        amount: "10.999",
      }),
    ZodError,
  );
});

test("validateCancelCheckout requires a non-empty trabajoId", () => {
  assert.deepEqual(validateCancelCheckout({ trabajoId: " trabajo-1 " }), {
    trabajoId: "trabajo-1",
  });
  assert.throws(() => validateCancelCheckout({ trabajoId: " " }), ZodError);
});

test("withdrawal validations normalize comma decimals and reject invalid money", () => {
  assert.deepEqual(
    validateAuthenticatedWithdrawal({ amount: "123,45" }),
    { amount: "123.45" },
  );
  assert.deepEqual(
    validateWithdrawal({ trabajadorId: " worker-1 ", amount: "10,50" }),
    { trabajadorId: "worker-1", amount: "10.50" },
  );
  assert.throws(
    () => validateAuthenticatedWithdrawal({ amount: "-1.00" }),
    ZodError,
  );
  assert.throws(
    () => validateAuthenticatedWithdrawal({ amount: "1.001" }),
    ZodError,
  );
});
