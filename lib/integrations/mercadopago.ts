import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import type { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";
import type { PreferenceRequest, PreferenceResponse } from "mercadopago/dist/clients/preference/commonTypes";

const EXCLUDED_PAYMENT_TYPES = [
  { id: "ticket" },
  { id: "bank_transfer" },
  { id: "atm" },
];

function createMercadoPagoClient() {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error("MERCADO_PAGO_ACCESS_TOKEN is required");
  }

  return new MercadoPagoConfig({
    accessToken,
    options: { timeout: 5000 },
  });
}

export type MercadoPagoPreferenceInput = {
  transactionId: string;
  trabajoId: string;
  amount: string;
  description: string;
  payerEmail?: string;
  baseUrl: string;
};

function buildPreferenceRequest(input: MercadoPagoPreferenceInput): PreferenceRequest {
  const baseUrl = input.baseUrl.replace(/\/$/, "");
  const decimalAmount = input.amount;

  return {
    items: [
      {
        id: input.trabajoId,
        title: input.description,
        quantity: 1,
        currency_id: "ARS",
        unit_price: Number(decimalAmount),
      },
    ],
    payer: input.payerEmail ? { email: input.payerEmail } : undefined,
    external_reference: input.transactionId,
    notification_url: `${baseUrl}/api/payments/webhook`,
    purpose: "wallet_purchase",
    payment_methods: {
      excluded_payment_types: EXCLUDED_PAYMENT_TYPES,
    },
    back_urls: {
      success: `${baseUrl}/rider/checkout/success?transactionId=${encodeURIComponent(input.transactionId)}`,
      pending: `${baseUrl}/rider/checkout/pending?transactionId=${encodeURIComponent(input.transactionId)}`,
      failure: `${baseUrl}/rider/checkout/failure?transactionId=${encodeURIComponent(input.transactionId)}`,
    },
    auto_return: "approved",
    metadata: {
      trabajoId: input.trabajoId,
    },
  };
}

export async function createMercadoPagoPreference(input: MercadoPagoPreferenceInput): Promise<PreferenceResponse> {
  const preference = new Preference(createMercadoPagoClient());

  return preference.create({
    body: buildPreferenceRequest(input),
    requestOptions: {
      idempotencyKey: input.transactionId,
    },
  });
}

export async function updateMercadoPagoPreference(
  preferenceId: string,
  input: MercadoPagoPreferenceInput,
): Promise<PreferenceResponse> {
  const preference = new Preference(createMercadoPagoClient());

  return preference.update({
    id: preferenceId,
    updatePreferenceRequest: buildPreferenceRequest(input),
    requestOptions: {
      idempotencyKey: `${input.transactionId}:update`,
    },
  });
}

export async function getMercadoPagoPayment(paymentId: string): Promise<PaymentResponse> {
  const payment = new Payment(createMercadoPagoClient());
  return payment.get({ id: paymentId });
}
