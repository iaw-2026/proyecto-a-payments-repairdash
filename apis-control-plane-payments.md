# APIs Control Plane - Payments App

Estos endpoints son internos y server-to-server. Los consume Control Plane desde su backend, no desde el browser del usuario.

Payments es la fuente de verdad de sus datos. Control Plane puede cachear respuestas en Redis/KV, pero la validacion, los filtros y la paginacion reales se ejecutan en Payments contra su base de datos.

## Autenticacion

Todos los endpoints usan una API key exclusiva para Control Plane.

```http
x-control-plane-api-key: <CONTROL_PLANE_API_KEY>
```

Payments debe tener configurada la variable:

```env
CONTROL_PLANE_API_KEY="valor-secreto"
```

Errores comunes:

- `401 Unauthorized`: falta el header o la API key es invalida.
- `500 Internal Server Error`: `CONTROL_PLANE_API_KEY` no esta configurada en Payments.

Respuesta de error:

```json
{
  "success": false,
  "errorCode": "UNAUTHORIZED",
  "message": "API key de Control Plane invalida o ausente."
}
```

## Reglas Globales

### Uso desde Control Plane

Estas APIs se llaman desde el backend de Control Plane. No deben llamarse desde componentes client ni desde el browser, porque la API key quedaria expuesta.

Variables sugeridas en Control Plane:

```env
PAYMENTS_BASE_URL="http://localhost:3000"
PAYMENTS_CONTROL_PLANE_API_KEY="mismo-valor-que-CONTROL_PLANE_API_KEY-en-Payments"
```

Ejemplo base:

```ts
await fetch(`${process.env.PAYMENTS_BASE_URL}/api/control-plane/summary`, {
  headers: {
    "x-control-plane-api-key": process.env.PAYMENTS_CONTROL_PLANE_API_KEY!,
  },
  cache: "no-store",
});
```

### Filtros

Control Plane elige los filtros y los manda por query string. Payments valida esos valores y ejecuta el filtro real contra su DB.

Los listados nunca devuelven una tabla completa sin paginar.

### Paginacion

Todos los listados son paginados.

Query params:

- `page`: pagina pedida. Default: `1`.
- `pageSize`: filas por pagina. Default: `10`. Maximo: `50`.

Respuesta paginada:

```json
{
  "success": true,
  "items": [],
  "pagination": {
    "totalCount": 0,
    "totalPages": 1,
    "currentPage": 1,
    "pageSize": 10
  }
}
```

### Identidad

Todas las filas de usuarios devuelven `clerkId`. El nombre y el email son para busqueda y visualizacion, no identifican de forma unica.

### Dinero

Todos los montos viajan como string decimal con 2 decimales.

```json
{
  "amount": "15000.00"
}
```

## GET /api/control-plane/summary

Devuelve un resumen operativo actual de Payments.

### Request

```http
GET /api/control-plane/summary
x-control-plane-api-key: <CONTROL_PLANE_API_KEY>
```

### Headers

| Header | Requerido | Valor |
| --- | --- | --- |
| `x-control-plane-api-key` | Si | API key compartida entre Control Plane y Payments |

### Query Params

No recibe query params.

### Body

No recibe body.

### Ejemplo Desde Control Plane

```ts
export async function getPaymentsSummary() {
  const response = await fetch(`${PAYMENTS_BASE_URL}/api/control-plane/summary`, {
    headers: {
      "x-control-plane-api-key": PAYMENTS_CONTROL_PLANE_API_KEY,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudo consultar el resumen de Payments.");
  }

  return response.json();
}
```

### Respuesta Exitosa

```json
{
  "success": true,
  "generatedAt": "2026-06-10T12:00:00.000Z",
  "commission": {
    "id": "platform",
    "commissionRate": "10.00",
    "updatedAt": "2026-06-10T12:00:00.000Z"
  },
  "transactionsByStatus": {
    "PENDING": 2,
    "RESERVED": 3,
    "LIQUIDATED": 10,
    "TRANSFERRED": 1,
    "DISPUTED": 0,
    "REFUNDED": 0,
    "FAILED": 4
  },
  "withdrawalsByStatus": {
    "REQUESTED": 1,
    "APPROVED": 8,
    "REJECTED": 0
  },
  "users": {
    "riders": 12,
    "drivers": 7
  }
}
```

No incluye metricas historicas ni volumen financiero agregado.

## GET /api/control-plane/transactions

Lista transacciones de Payments. Siempre responde paginado.

### Request

```http
GET /api/control-plane/transactions?q=<texto>&status=<estado>&from=<YYYY-MM-DD>&to=<YYYY-MM-DD>&page=1&pageSize=10
x-control-plane-api-key: <CONTROL_PLANE_API_KEY>
```

### Headers

| Header | Requerido | Valor |
| --- | --- | --- |
| `x-control-plane-api-key` | Si | API key compartida entre Control Plane y Payments |

### Query Params

| Param | Requerido | Default | Descripcion |
| --- | --- | --- | --- |
| `q` | No | - | Busca por transaccion, trabajo, rider, driver, email, preference o payment id |
| `status` | No | - | Uno de `PENDING`, `RESERVED`, `LIQUIDATED`, `TRANSFERRED`, `DISPUTED`, `REFUNDED`, `FAILED` |
| `from` | No | - | Fecha inicial `YYYY-MM-DD`, aplicada sobre `createdAt` |
| `to` | No | - | Fecha final `YYYY-MM-DD`, aplicada sobre `createdAt` |
| `page` | No | `1` | Pagina pedida |
| `pageSize` | No | `10` | Filas por pagina. Maximo `50` |

### Body

No recibe body.

### Ejemplo

```http
GET /api/control-plane/transactions?status=RESERVED&q=juan&page=1&pageSize=20
x-control-plane-api-key: <CONTROL_PLANE_API_KEY>
```

### Ejemplo Desde Control Plane

```ts
export async function getPaymentsTransactions(params: {
  q?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set("q", params.q);
  if (params.status) searchParams.set("status", params.status);
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);
  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("pageSize", String(params.pageSize ?? 10));

  const response = await fetch(
    `${PAYMENTS_BASE_URL}/api/control-plane/transactions?${searchParams}`,
    {
      headers: {
        "x-control-plane-api-key": PAYMENTS_CONTROL_PLANE_API_KEY,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("No se pudieron consultar las transacciones de Payments.");
  }

  return response.json();
}
```

### Respuesta Exitosa

```json
{
  "success": true,
  "items": [
    {
      "transaction": {
        "id": "txn_123",
        "trabajoId": "trabajo_456",
        "amount": "15000.00",
        "status": "RESERVED",
        "clientId": "user_rider_123",
        "trabajadorId": "user_driver_456",
        "gatewayPreferenceId": "pref_123",
        "gatewayCheckoutUrl": "https://...",
        "gatewayPaymentId": "payment_123",
        "createdAt": "2026-06-10T12:00:00.000Z",
        "reservedAt": "2026-06-10T12:01:00.000Z",
        "liquidatedAt": null,
        "commissionRate": null,
        "commissionAmount": null,
        "netAmount": null
      },
      "cliente": {
        "clerkId": "user_rider_123",
        "email": "rider@test.com",
        "fullName": "Rider Test",
        "role": "rider"
      },
      "trabajador": {
        "clerkId": "user_driver_456",
        "email": "driver@test.com",
        "fullName": "Driver Test",
        "role": "driver"
      }
    }
  ],
  "pagination": {
    "totalCount": 1,
    "totalPages": 1,
    "currentPage": 1,
    "pageSize": 20
  }
}
```

## GET /api/control-plane/withdrawals

Lista solicitudes de retiro. Siempre responde paginado y es solo lectura.

### Request

```http
GET /api/control-plane/withdrawals?q=<texto>&status=<estado>&from=<YYYY-MM-DD>&to=<YYYY-MM-DD>&page=1&pageSize=10
x-control-plane-api-key: <CONTROL_PLANE_API_KEY>
```

### Headers

| Header | Requerido | Valor |
| --- | --- | --- |
| `x-control-plane-api-key` | Si | API key compartida entre Control Plane y Payments |

### Query Params

| Param | Requerido | Default | Descripcion |
| --- | --- | --- | --- |
| `q` | No | - | Busca por retiro, driver, email o nombre |
| `status` | No | - | Uno de `REQUESTED`, `APPROVED`, `REJECTED` |
| `from` | No | - | Fecha inicial `YYYY-MM-DD`, aplicada sobre `createdAt` |
| `to` | No | - | Fecha final `YYYY-MM-DD`, aplicada sobre `createdAt` |
| `page` | No | `1` | Pagina pedida |
| `pageSize` | No | `10` | Filas por pagina. Maximo `50` |

### Body

No recibe body.

### Ejemplo Desde Control Plane

```ts
export async function getPaymentsWithdrawals(params: {
  q?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set("q", params.q);
  if (params.status) searchParams.set("status", params.status);
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);
  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("pageSize", String(params.pageSize ?? 10));

  const response = await fetch(
    `${PAYMENTS_BASE_URL}/api/control-plane/withdrawals?${searchParams}`,
    {
      headers: {
        "x-control-plane-api-key": PAYMENTS_CONTROL_PLANE_API_KEY,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("No se pudieron consultar los retiros de Payments.");
  }

  return response.json();
}
```

### Respuesta Exitosa

```json
{
  "success": true,
  "items": [
    {
      "withdrawal": {
        "id": "wd_123",
        "trabajadorId": "user_driver_456",
        "amount": "5000.00",
        "status": "REQUESTED",
        "createdAt": "2026-06-10T12:00:00.000Z"
      },
      "trabajador": {
        "clerkId": "user_driver_456",
        "cbuCvu": "000000310001..."
      },
      "user": {
        "clerkId": "user_driver_456",
        "email": "driver@test.com",
        "fullName": "Driver Test",
        "role": "driver"
      }
    }
  ],
  "pagination": {
    "totalCount": 1,
    "totalPages": 1,
    "currentPage": 1,
    "pageSize": 10
  }
}
```

## GET /api/control-plane/drivers

Lista trabajadores. Siempre responde paginado.

### Request

```http
GET /api/control-plane/drivers?q=<texto>&page=1&pageSize=10
x-control-plane-api-key: <CONTROL_PLANE_API_KEY>
```

### Headers

| Header | Requerido | Valor |
| --- | --- | --- |
| `x-control-plane-api-key` | Si | API key compartida entre Control Plane y Payments |

### Query Params

| Param | Requerido | Default | Descripcion |
| --- | --- | --- | --- |
| `q` | No | - | Busca por `clerkId`, email, nombre o CBU/CVU |
| `page` | No | `1` | Pagina pedida |
| `pageSize` | No | `10` | Filas por pagina. Maximo `50` |

### Body

No recibe body.

### Ejemplo Desde Control Plane

```ts
export async function getPaymentsDrivers(params: {
  q?: string;
  page?: number;
  pageSize?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set("q", params.q);
  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("pageSize", String(params.pageSize ?? 10));

  const response = await fetch(
    `${PAYMENTS_BASE_URL}/api/control-plane/drivers?${searchParams}`,
    {
      headers: {
        "x-control-plane-api-key": PAYMENTS_CONTROL_PLANE_API_KEY,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("No se pudieron consultar los drivers de Payments.");
  }

  return response.json();
}
```

### Respuesta Exitosa

```json
{
  "success": true,
  "items": [
    {
      "trabajador": {
        "clerkId": "user_driver_456",
        "cbuCvu": "000000310001..."
      },
      "user": {
        "clerkId": "user_driver_456",
        "email": "driver@test.com",
        "fullName": "Driver Test",
        "role": "driver"
      },
      "balance": {
        "trabajadorId": "user_driver_456",
        "balanceAvailable": "12000.00",
        "balanceLocked": "3000.00",
        "updatedAt": "2026-06-10T12:00:00.000Z"
      },
      "withdrawalCount": 2,
      "transactionCount": 5,
      "latestActivityAt": "2026-06-10T12:00:00.000Z"
    }
  ],
  "pagination": {
    "totalCount": 1,
    "totalPages": 1,
    "currentPage": 1,
    "pageSize": 10
  }
}
```

## GET /api/control-plane/drivers/:trabajadorId

Devuelve detalle financiero operativo de un trabajador.

### Request

```http
GET /api/control-plane/drivers/:trabajadorId?recentLimit=5
x-control-plane-api-key: <CONTROL_PLANE_API_KEY>
```

### Headers

| Header | Requerido | Valor |
| --- | --- | --- |
| `x-control-plane-api-key` | Si | API key compartida entre Control Plane y Payments |

### Path Params

| Param | Requerido | Descripcion |
| --- | --- | --- |
| `trabajadorId` | Si | `clerkId` del trabajador |

### Query Params

| Param | Requerido | Default | Descripcion |
| --- | --- | --- | --- |
| `recentLimit` | No | `5` | Cantidad de transacciones y retiros recientes. Maximo `20` |

### Body

No recibe body.

### Ejemplo Desde Control Plane

```ts
export async function getPaymentsDriverDetail(trabajadorId: string) {
  const response = await fetch(
    `${PAYMENTS_BASE_URL}/api/control-plane/drivers/${encodeURIComponent(trabajadorId)}?recentLimit=5`,
    {
      headers: {
        "x-control-plane-api-key": PAYMENTS_CONTROL_PLANE_API_KEY,
      },
      cache: "no-store",
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("No se pudo consultar el detalle del driver en Payments.");
  }

  return response.json();
}
```

### Respuesta Exitosa

```json
{
  "success": true,
  "trabajador": {
    "clerkId": "user_driver_456",
    "cbuCvu": "000000310001..."
  },
  "user": {
    "clerkId": "user_driver_456",
    "email": "driver@test.com",
    "fullName": "Driver Test",
    "role": "driver"
  },
  "balance": {
    "trabajadorId": "user_driver_456",
    "balanceAvailable": "12000.00",
    "balanceLocked": "3000.00",
    "total": "15000.00",
    "updatedAt": "2026-06-10T12:00:00.000Z"
  },
  "recentTransactions": [],
  "recentWithdrawals": []
}
```

### Errores

- `404 Not Found`: no existe el trabajador.

## GET /api/control-plane/riders

Lista riders. Siempre responde paginado.

### Request

```http
GET /api/control-plane/riders?q=<texto>&page=1&pageSize=10
x-control-plane-api-key: <CONTROL_PLANE_API_KEY>
```

### Headers

| Header | Requerido | Valor |
| --- | --- | --- |
| `x-control-plane-api-key` | Si | API key compartida entre Control Plane y Payments |

### Query Params

| Param | Requerido | Default | Descripcion |
| --- | --- | --- | --- |
| `q` | No | - | Busca por `clerkId`, email o nombre |
| `page` | No | `1` | Pagina pedida |
| `pageSize` | No | `10` | Filas por pagina. Maximo `50` |

### Body

No recibe body.

### Ejemplo Desde Control Plane

```ts
export async function getPaymentsRiders(params: {
  q?: string;
  page?: number;
  pageSize?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set("q", params.q);
  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("pageSize", String(params.pageSize ?? 10));

  const response = await fetch(
    `${PAYMENTS_BASE_URL}/api/control-plane/riders?${searchParams}`,
    {
      headers: {
        "x-control-plane-api-key": PAYMENTS_CONTROL_PLANE_API_KEY,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("No se pudieron consultar los riders de Payments.");
  }

  return response.json();
}
```

### Respuesta Exitosa

```json
{
  "success": true,
  "items": [
    {
      "cliente": {
        "clerkId": "user_rider_123"
      },
      "user": {
        "clerkId": "user_rider_123",
        "email": "rider@test.com",
        "fullName": "Rider Test",
        "role": "rider"
      },
      "transactionCount": 4,
      "volumePaid": "25000.00",
      "latestTransactionAt": "2026-06-10T12:00:00.000Z"
    }
  ],
  "pagination": {
    "totalCount": 1,
    "totalPages": 1,
    "currentPage": 1,
    "pageSize": 10
  }
}
```

No hay endpoint detalle de rider en v1.

## PATCH /api/control-plane/commission

Actualiza la comision vigente. Es la unica mutacion de Control Plane v1.

### Request

```http
PATCH /api/control-plane/commission
content-type: application/json
x-control-plane-api-key: <CONTROL_PLANE_API_KEY>
```

### Headers

```http
content-type: application/json
x-control-plane-api-key: <CONTROL_PLANE_API_KEY>
```

| Header | Requerido | Valor |
| --- | --- | --- |
| `content-type` | Si | `application/json` |
| `x-control-plane-api-key` | Si | API key compartida entre Control Plane y Payments |

### Query Params

No recibe query params.

### Body

```json
{
  "commissionRate": "10.00",
  "actorClerkId": "user_admin_control",
  "actorEmail": "admin-control@test.com",
  "reason": "Ajuste operativo aprobado"
}
```

### Reglas

- `commissionRate` debe ser string decimal entre `0` y `100`.
- Puede tener hasta 2 decimales.
- `actorClerkId`, `actorEmail` y `reason` son obligatorios para trazabilidad.

### Ejemplo Desde Control Plane

```ts
export async function updatePaymentsCommission(input: {
  commissionRate: string;
  actorClerkId: string;
  actorEmail: string;
  reason: string;
}) {
  const response = await fetch(`${PAYMENTS_BASE_URL}/api/control-plane/commission`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      "x-control-plane-api-key": PAYMENTS_CONTROL_PLANE_API_KEY,
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudo actualizar la comision en Payments.");
  }

  return response.json();
}
```

### Respuesta Exitosa

```json
{
  "success": true,
  "commission": {
    "id": "platform",
    "commissionRate": "10.00",
    "updatedAt": "2026-06-10T12:00:00.000Z"
  }
}
```

### Errores

- `400 Bad Request`: body invalido.
- `415 Unsupported Media Type`: el body no es JSON.

## Fuera De Alcance V1

No se exponen estos endpoints:

- `GET /api/control-plane/commission`
- `GET /api/control-plane/wallets/:trabajadorId`
- `GET /api/control-plane/riders/:clerkId`
- `GET /api/control-plane/transactions/:id`
- `GET /api/control-plane/withdrawals/:id`

Tampoco se exponen acciones para:

- Liquidar transacciones.
- Aprobar retiros.
- Reembolsar pagos.
- Resolver disputas.
- Cambiar balances manualmente.
