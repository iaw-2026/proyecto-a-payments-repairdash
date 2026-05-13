import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import type { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";
import type { PreferenceResponse } from "mercadopago/dist/clients/preference/commonTypes";

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

export async function createMercadoPagoPreference(input: MercadoPagoPreferenceInput): Promise<PreferenceResponse> {
  const preference = new Preference(createMercadoPagoClient());
  const baseUrl = input.baseUrl.replace(/\/$/, "");
  const decimalAmount = input.amount;

  return preference.create({
    body: {
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
      back_urls: {
        success: `${baseUrl}/rider/checkout/success?transactionId=${encodeURIComponent(input.transactionId)}`,
        pending: `${baseUrl}/rider/checkout/pending?transactionId=${encodeURIComponent(input.transactionId)}`,
        failure: `${baseUrl}/rider/checkout/failure?transactionId=${encodeURIComponent(input.transactionId)}`,
      },
      auto_return: "approved",
      metadata: {
        trabajoId: input.trabajoId,
      },
    },
    requestOptions: {
      idempotencyKey: input.transactionId,
    },
  });
}

export async function getMercadoPagoPayment(paymentId: string): Promise<PaymentResponse> {
  const payment = new Payment(createMercadoPagoClient());
  return payment.get({ id: paymentId });
}
