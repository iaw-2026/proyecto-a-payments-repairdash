# APIs Payments App - Checkout Pro

## 1. Iniciar Pago

**Endpoint:** `POST /api/payments/checkout`

**App origen:** Rider App  
**App destino:** Payments App  
**Objetivo:** iniciar el checkout de un trabajo.

Payments crea o reutiliza una transaccion interna por `trabajoId`, crea una preference de Mercado Pago Checkout Pro y redirige al usuario a la pantalla Rider de Payments con el pago seleccionado.

El pago no queda aprobado en este endpoint. La confirmacion real llega despues por webhook de Mercado Pago.

### Headers

```http
content-type: application/json
x-internal-api-key: <PAYMENTS_INTERNAL_API_KEY>
```

### Body

```json
{
  "trabajoId": "trabajo_123",
  "clientId": "user_rider_1",
  "trabajadorId": "user_driver_1",
  "amount": "15000.50",
  "description": "Servicio de reparacion"
}
```

### Reglas

- `transactionId` lo genera Payments. Rider App no debe enviarlo.
- `trabajoId` lo envia Rider App y funciona como clave idempotente.
- Un `trabajoId` tiene un solo pago activo.
- `amount` debe viajar como string decimal, no como number.
- `clientId` y `trabajadorId` deben existir en Payments.
- Si Rider reintenta el mismo `trabajoId` con los mismos datos, Payments reutiliza el checkout.
- Si Rider reintenta el mismo `trabajoId` con distinto monto, cliente o trabajador, Payments responde `409`.

### Respuesta Exitosa

Payments responde con redirect:

```http
303 See Other
Location: https://payments-app/rider?transactionId=<transactionId>
```

La pantalla Rider de Payments muestra el resumen del pago. Cuando el usuario confirma, Payments lo redirige a Mercado Pago.

### Errores Posibles

#### 400 Bad Request

Cuando el body no cumple el contrato esperado.

```json
{
  "success": false,
  "errorCode": "INVALID_CHECKOUT_PAYLOAD",
  "message": "Datos de checkout invalidos."
}
```

#### 401 Unauthorized

Cuando falta o es invalida la API key interna.

```json
{
  "success": false,
  "errorCode": "UNAUTHORIZED",
  "message": "API key interna invalida o ausente."
}
```

#### 404 Not Found

Cuando `clientId`, `trabajadorId` o el balance del trabajador no existen en Payments.

```json
{
  "success": false,
  "errorCode": "CLIENT_NOT_FOUND",
  "message": "El cliente no existe en Payments."
}
```

```json
{
  "success": false,
  "errorCode": "WORKER_NOT_FOUND",
  "message": "El trabajador no existe en Payments."
}
```

```json
{
  "success": false,
  "errorCode": "WORKER_BALANCE_NOT_FOUND",
  "message": "El trabajador no tiene balance configurado."
}
```

#### 409 Conflict

Cuando ya existe un pago para el mismo `trabajoId` pero con datos diferentes, o cuando el pago ya fue completado.

```json
{
  "success": false,
  "errorCode": "PAYMENT_ALREADY_EXISTS",
  "message": "Ya existe un proceso de pago para este trabajo con datos diferentes."
}
```

```json
{
  "success": false,
  "errorCode": "PAYMENT_ALREADY_COMPLETED",
  "message": "El pago de este trabajo ya fue confirmado."
}
```

```json
{
  "success": false,
  "errorCode": "PAYMENT_NOT_RETRYABLE",
  "message": "El pago de este trabajo no puede reintentarse."
}
```

#### 415 Unsupported Media Type

Cuando el request no llega como `application/json`.

```json
{
  "success": false,
  "errorCode": "UNSUPPORTED_CONTENT_TYPE",
  "message": "El checkout externo solo acepta application/json."
}
```

#### 500 Internal Server Error

Cuando falta configuracion interna o falla algo inesperado.

```json
{
  "success": false,
  "errorCode": "INTERNAL_AUTH_NOT_CONFIGURED",
  "message": "La autenticacion interna de Payments no esta configurada."
}
```

```json
{
  "success": false,
  "errorCode": "CHECKOUT_CREATION_FAILED",
  "message": "No se pudo crear el checkout."
}
```

#### 502 Bad Gateway

Cuando Mercado Pago no devuelve una preference o una URL de checkout valida.

```json
{
  "success": false,
  "errorCode": "PREFERENCE_NOT_CREATED",
  "message": "Mercado Pago no devolvio preferenceId."
}
```

```json
{
  "success": false,
  "errorCode": "CHECKOUT_URL_NOT_CREATED",
  "message": "Mercado Pago no devolvio una URL de checkout."
}
```

## 2. Callback de Resultado Hacia Rider App

**Endpoint:** definido por Rider App y configurado en Payments como `RIDER_PAYMENT_CALLBACK_URL`.

**Ejemplo:** `POST https://rider-app/api/payments/result`

**App origen:** Payments App  
**App destino:** Rider App  
**Objetivo:** avisar a Rider App el resultado del pago.

Mercado Pago notifica a Payments por webhook. Payments consulta el pago real en Mercado Pago, actualiza su base de datos y luego envia este callback a Rider App.

Rider App debe procesar este callback de forma idempotente, porque Mercado Pago puede reenviar webhooks y Payments puede reintentar el callback.

### Headers Enviados por Payments

```http
content-type: application/json
x-internal-api-key: <RIDER_CALLBACK_API_KEY>
```

### Payload Aprobado

```json
{
  "transactionId": "txn_123",
  "trabajoId": "trabajo_123",
  "paymentStatus": "APPROVED",
  "reason": "accredited",
  "paidAt": "2026-05-10T04:19:28.000Z"
}
```

### Payload Rechazado

```json
{
  "transactionId": "txn_123",
  "trabajoId": "trabajo_123",
  "paymentStatus": "REJECTED",
  "reason": "cc_rejected_other_reason",
  "paidAt": null
}
```

### Payload Pendiente

```json
{
  "transactionId": "txn_123",
  "trabajoId": "trabajo_123",
  "paymentStatus": "PENDING",
  "reason": "waiting_payment_confirmation",
  "paidAt": null
}
```

### Respuesta Esperada de Rider App

```json
{
  "ok": true
}
```

Status HTTP esperado: `200 OK` o cualquier `2xx`.

Para pruebas locales sin Rider App real, Payments incluye un mock temporal:

```env
RIDER_PAYMENT_CALLBACK_URL="http://localhost:3000/api/mock-rider/payment-result"
```

Ese endpoint esta en `app/api/mock-rider/payment-result/route.ts`. Debe borrarse cuando Rider App exponga su callback real.

### Reintentos

Payments intenta enviar el callback hasta 3 veces si Rider App responde error o no responde.

### Estados Posibles de `paymentStatus`

- `PENDING`: pago pendiente o en proceso.
- `APPROVED`: pago acreditado.
- `REJECTED`: pago rechazado o cancelado.
- `REFUNDED`: pago devuelto.

## 3. Flujo Resumido

1. Rider App llama `POST /api/payments/checkout`.
2. Payments crea la transaccion y la preference de Mercado Pago.
3. Payments redirige a `/rider?transactionId=...`.
4. El usuario confirma y va a Mercado Pago.
5. Mercado Pago procesa el pago.
6. Mercado Pago redirige al usuario a una pantalla de Payments.
7. Mercado Pago llama el webhook de Payments.
8. Payments actualiza `Transaction` y `Balance`.
9. Payments envia el callback a Rider App con `paymentStatus`.
