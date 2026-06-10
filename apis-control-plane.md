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

### Query Params

- `q`: busca por transaccion, trabajo, rider, driver, email, preference o payment id.
- `status`: uno de `PENDING`, `RESERVED`, `LIQUIDATED`, `TRANSFERRED`, `DISPUTED`, `REFUNDED`, `FAILED`.
- `from`: fecha inicial `YYYY-MM-DD`, aplicada sobre `createdAt`.
- `to`: fecha final `YYYY-MM-DD`, aplicada sobre `createdAt`.
- `page`: pagina pedida.
- `pageSize`: filas por pagina.

### Ejemplo

```http
GET /api/control-plane/transactions?status=RESERVED&q=juan&page=1&pageSize=20
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

### Query Params

- `q`: busca por retiro, driver, email o nombre.
- `status`: uno de `REQUESTED`, `APPROVED`, `REJECTED`.
- `from`: fecha inicial `YYYY-MM-DD`, aplicada sobre `createdAt`.
- `to`: fecha final `YYYY-MM-DD`, aplicada sobre `createdAt`.
- `page`: pagina pedida.
- `pageSize`: filas por pagina.

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

### Query Params

- `q`: busca por `clerkId`, email, nombre o CBU/CVU.
- `page`: pagina pedida.
- `pageSize`: filas por pagina.

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

### Query Params

- `recentLimit`: cantidad de transacciones y retiros recientes. Default: `5`. Maximo: `20`.

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

### Query Params

- `q`: busca por `clerkId`, email o nombre.
- `page`: pagina pedida.
- `pageSize`: filas por pagina.

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

### Headers

```http
content-type: application/json
x-control-plane-api-key: <CONTROL_PLANE_API_KEY>
```

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
