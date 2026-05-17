import type { RiderPaymentCallbackPayload } from "@/lib/types/payment-callback";

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendRiderPaymentCallback(payload: RiderPaymentCallbackPayload) {
  const callbackUrl = process.env.RIDER_PAYMENT_CALLBACK_URL;
  const apiKey = process.env.REPAIRDASH_API_KEY?.trim() || process.env.RIDER_CALLBACK_API_KEY?.trim();

  if (!callbackUrl || !apiKey) {
    console.warn("Rider payment callback skipped: missing callback URL or API key.");
    return { sent: false };
  }

  const body = JSON.stringify(payload);
  const retryDelays = [0, 500, 1500];
  let lastError: unknown = null;

  for (const delay of retryDelays) {
    if (delay > 0) {
      await wait(delay);
    }

    try {
      const response = await fetch(callbackUrl, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
        },
        body,
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        return { sent: true };
      }

      lastError = new Error(`Rider callback failed with status ${response.status}`);
    } catch (error) {
      lastError = error;
    }
  }

  console.warn("Rider payment callback failed after retries.", lastError);
  return { sent: false };
}
