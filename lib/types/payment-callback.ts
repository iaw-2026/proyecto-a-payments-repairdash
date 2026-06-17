export type RiderPaymentEstado = "aceptado" | "rechazado";

export type RiderPaymentCallbackPayload = {
  id_viaje: string;
  estado: RiderPaymentEstado;
};
