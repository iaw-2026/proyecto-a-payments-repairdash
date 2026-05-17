export type RiderPaymentEstado = "aceptado" | "cancelado";

export type RiderPaymentCallbackPayload = {
  id_viaje: number;
  estado: RiderPaymentEstado;
};
