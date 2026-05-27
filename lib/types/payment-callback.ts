export type RiderPaymentEstado = "aceptado" | "cancelado";

export type RiderPaymentCallbackPayload = {
  id_viaje: string;
  estado: RiderPaymentEstado;
};
