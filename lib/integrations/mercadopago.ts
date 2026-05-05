export async function createCheckout() {
  return { ok: true, provider: "mercadopago" };
}

export async function getCheckoutStatus() {
  return { status: "pending" };
}

export async function createWithdrawalTransfer() {
  return { ok: true };
}

export async function getTransferStatus() {
  return { status: "pending" };
}