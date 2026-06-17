# Estructura del Proyecto - Repairdash Payments

Este documento describe la estructura real del repo y las responsabilidades actuales de cada capa.

## Arbol de Directorios

```text
app/
|-- layout.tsx                         # Root layout, ClerkProvider, Toaster
|-- globals.css                        # Estilos globales y tokens
|-- page.tsx                           # Home / landing
|-- error.tsx                          # Error boundary global
|-- not-found.tsx                      # 404
|-- robots.ts                          # Metadata robots
|-- sitemap.ts                         # Sitemap
|-- opengraph-image.tsx                # Imagen OG dinamica
|-- sign-in/[[...sign-in]]/page.tsx    # Pagina de login Clerk
|-- actions/
|   |-- admin.ts                       # Server Actions admin
|   |-- liquidations.ts                # Server Action legacy de comision
|   |-- profile.ts                     # Actualizacion de CBU/CVU del driver
|   +-- withdrawals.ts                 # Solicitud de retiro del driver
|-- api/
|   |-- mock-rider/payment-result/     # Mock local para callback de Rider App
|   |-- payments/
|   |   |-- checkout/route.ts          # Inicia Checkout Pro
|   |   |-- checkout/cancel/route.ts   # Cancela checkout pendiente
|   |   |-- wallet/[trabajadorId]/     # Consulta wallet del trabajador
|   |   +-- webhook/route.ts           # Webhook de Mercado Pago
|   +-- webhooks/clerk/route.ts        # Sincronizacion de usuarios Clerk -> DB
+-- (app)/
    |-- layout.tsx                     # Layout autenticado compartido
    |-- dashboard/page.tsx             # Placeholder
    |-- admin/
    |   |-- layout.tsx                 # Shell admin
    |   |-- page.tsx                   # Dashboard admin
    |   |-- drivers/page.tsx           # Listado de trabajadores
    |   |-- riders/page.tsx            # Listado de clientes/riders
    |   |-- transactions/page.tsx      # Listado y liquidacion manual
    |   +-- withdrawals/page.tsx       # Listado y aprobacion manual
    |-- driver/
    |   |-- layout.tsx                 # Shell driver
    |   |-- page.tsx                   # Dashboard driver
    |   |-- config/page.tsx            # Configuracion de CBU/CVU
    |   |-- liquidations/page.tsx      # Historial de liquidaciones
    |   +-- withdrawals/page.tsx       # Historial de retiros
    +-- rider/
        |-- layout.tsx                 # Shell rider
        |-- page.tsx                   # Dashboard y pago pendiente
        +-- checkout/
            |-- success/page.tsx       # Resultado aprobado
            |-- pending/page.tsx       # Resultado pendiente
            +-- failure/page.tsx       # Resultado fallido

components/
|-- admin/                             # Tablas, filtros, metricas y acciones admin
|-- auth/                              # Componentes auxiliares de auth
|-- driver/                            # Dashboard, retiros, liquidaciones y config driver
|-- layout/                            # Sidebars, header, topbar, nav y cuenta
|-- payments/                          # Componentes historicos/auxiliares de payments
|-- rider/                             # Dashboard, checkout result e historial rider
+-- ui/                                # Componentes reutilizables base

lib/
|-- auth.ts                            # Auth real con Clerk + Prisma User
|-- checkout-cancellation.ts           # Politica de cancelacion de checkout
|-- errors.ts                          # Helpers de errores
|-- format.ts                          # Helpers de formato general
|-- income-chart.ts                    # Normalizacion de ingresos diarios/mensuales
|-- internal-auth.ts                   # Validacion de x-internal-api-key
|-- money.ts                           # Formato monetario y Decimal helpers
|-- pagination.ts                      # Helpers de paginacion
|-- prisma.ts                          # Cliente Prisma singleton
|-- integrations/
|   |-- index.ts                       # Barrel exports
|   |-- mercadopago.ts                 # SDK Mercado Pago
|   +-- rider-callback.ts              # Callback server-to-server hacia Rider App
|-- services/
|   |-- admin.ts                       # Queries y agregaciones admin
|   |-- audit.ts                       # Audit placeholder via console.log
|   |-- balances.ts                    # Consultas y movimientos de Balance
|   |-- checkout.ts                    # Checkout, webhook, callback e idempotencia
|   |-- index.ts                       # Exporta balances, transactions y withdrawals
|   |-- liquidations.ts                # Liquidacion, comisiones y metricas driver
|   |-- rider-checkout.ts              # Resultado de checkout para rider autenticado
|   |-- rider-dashboard.ts             # Dashboard rider autenticado
|   |-- transactions.ts                # CRUD/transiciones simples de Transaction
|   |-- users.ts                       # Usuario/trabajador actual y CBU/CVU
|   +-- withdrawals.ts                 # Solicitud y aprobacion de retiros
|-- types/                             # Tipos auxiliares no espejo de modelos DB
+-- validations/                       # Validaciones Zod

prisma/
|-- schema.prisma                      # Fuente de verdad de modelos y tipos DB
|-- seed.ts                            # Seed de desarrollo
+-- migrations/                        # Migraciones versionadas

tests/
|-- balances.test.ts
|-- disputes.test.ts
|-- income-chart.test.ts
|-- transactions.test.ts
+-- validations.test.ts
```

## Arquitectura de Capas

### `prisma/schema.prisma` - Fuente de verdad

El schema Prisma es la referencia obligatoria para modelos, relaciones, enums y precision decimal. No se deben crear interfaces espejo de modelos de base de datos. Usar tipos generados:

```ts
import { Balance, Transaction, Trabajador, User, Withdrawal } from "@/generated/prisma/client";
```

Cuando una vista necesita datos de varios modelos, usar composicion en vez de aplanar entidades:

```ts
interface DashboardData {
  trabajador: Trabajador;
  balance: Balance;
}
```

### `lib/services/` - Logica de dominio y datos

Esta carpeta  contiene las queries a Prisma. 

| Archivo | Responsabilidad actual |
|---|---|
| `admin.ts` | Dashboard admin, listados paginados, filtros y agregaciones Prisma. |
| `audit.ts` | Placeholder de auditoria con `console.log`. |
| `balances.ts` | Consultas y actualizaciones de `Balance`; resumen de wallet. |
| `checkout.ts` | Reglas de checkout, idempotencia por `trabajoId`, Mercado Pago, webhook, cancelacion, callback rider y movimiento de saldos. |
| `liquidations.ts` | Liquidacion `RESERVED -> LIQUIDATED`, comisiones, cache de ingresos driver, timers y consultas autenticadas del driver. |
| `rider-dashboard.ts` | Dashboard rider; usa `getAuthUser("rider")` y Prisma. |
| `rider-checkout.ts` | Resultado de checkout rider; usa `getAuthUser("rider")` y Prisma. |
| `transactions.ts` | Operaciones simples sobre `Transaction`. |
| `users.ts` | Perfil driver; usa `getAuthUser("driver")` y Prisma. |
| `withdrawals.ts` | Solicitud/aprobacion de retiros, timer local y consultas autenticadas del driver. |

Servicios que llaman autenticacion:

- `users.ts`
- `withdrawals.ts`
- `liquidations.ts`
- `rider-dashboard.ts`
- `rider-checkout.ts`

Servicios que llaman integraciones externas:

- `checkout.ts` llama `lib/integrations/mercadopago.ts`.
- `checkout.ts` llama `lib/integrations/rider-callback.ts`.

### `lib/integrations/` - Sistemas externos

| Archivo | Responsabilidad actual |
|---|---|
| `mercadopago.ts` | Crea/actualiza preferences de Checkout Pro y consulta pagos con el SDK de Mercado Pago. Usa `MERCADO_PAGO_ACCESS_TOKEN`. |
| `rider-callback.ts` | Envia callback HTTP `PUT` a Rider App con reintentos. Usa `RIDER_PAYMENT_CALLBACK_URL` y `REPAIRDASH_API_KEY` o `RIDER_CALLBACK_API_KEY`. |
| `index.ts` | Barrel exports. |



### `lib/auth.ts` - Auth
 Usa `@clerk/nextjs/server` y consulta `User` en Prisma para resolver roles:

- `rider`
- `driver`
- `adminPayments`

`getAuthUser(requiredRole)` valida sesion, existencia del usuario en DB y rol requerido.

### `app/actions/` - Server Actions

Actuan como puente entre UI, auth, validaciones, services y revalidacion de rutas.

| Archivo | Responsabilidad actual |
|---|---|
| `admin.ts` | Cambiar comision, aprobar retiros y liquidar transacciones; valida `adminPayments`. |
| `withdrawals.ts` | Solicitar retiro; valida `driver`, input y errores de negocio. |
| `profile.ts` | Actualizar CBU/CVU; valida `driver`. |
| `liquidations.ts` | Accion legacy para actualizar comision. |

### `app/api/` - Endpoints HTTP

| Ruta | Responsabilidad actual |
|---|---|
| `POST /api/payments/checkout` | Endpoint interno para crear/reutilizar checkout. Requiere `x-internal-api-key`. |
| `PUT /api/payments/checkout/cancel` | Cancela checkout pendiente. Requiere `x-internal-api-key`. |
| `POST /api/payments/webhook` | Webhook de Mercado Pago; consulta pago real antes de mutar DB. |
| `GET /api/payments/wallet/[trabajadorId]` | Consulta wallet de trabajador. |
| `POST /api/webhooks/clerk` | Sincroniza eventos de Clerk con Prisma. |
| `PUT /api/mock-rider/payment-result` | Mock local para probar callback rider. |

### `components/` - Presentacion

| Carpeta | Que contiene |
|---|---|
| `components/admin/` | Tablas responsive, metricas, filtros, skeletons, refresh y acciones admin. |
| `components/driver/` | Balance cards, chart, retiros, liquidaciones, config de CBU/CVU y skeletons. |
| `components/rider/` | Dashboard rider, pago pendiente, historial y pantallas de resultado. |
| `components/layout/` | Shell de app: sidebars, mobile navs, header, topbar y menu de cuenta. |
| `components/ui/` | Botones, cards, modal, paginacion, status badge, skeleton y empty state. |
| `components/payments/` | Componentes auxiliares/historicos de payments. |

## Flujos Principales

### Driver

- `/driver` muestra saldos, ingresos del mes, grafico de ingresos y retiro rapido.
- `/driver/config` permite guardar `Trabajador.cbuCvu`.
- `/driver/withdrawals` lista retiros con paginacion server-side.
- `/driver/liquidations` lista transacciones liquidadas.
- `earnedThisMonth` no existe en DB: debe tratarse como dato calculado mediante agregacion.

### Rider

- `/rider` es dinamica (`force-dynamic`) y requiere usuario con rol `rider`.
- `app/(app)/rider/page.tsx` lee `transactionId` y `page` desde `searchParams`.
- `getRiderDashboardData` valida `getAuthUser("rider")`, carga `User` con `Cliente`, lista transacciones por `clientId` y pagina con `pageSize = 10`.
- Si el usuario autenticado no tiene relacion `Cliente`, se muestra `RiderSeedEmptyState`.
- Si llega `transactionId`, solo se muestra como pago pendiente si pertenece al rider autenticado y sigue en `TransactionStatus.PENDING`.
- Si no llega `transactionId`, se busca la ultima transaccion `PENDING` del rider.
- Cuando hay pago pendiente, `PendingPaymentSection` muestra monto, `trabajoId`, trabajador y transaccion.
- `PaymentActionSection` muestra el link a Mercado Pago si existe `gatewayCheckoutUrl`; si no, muestra estado de checkout no disponible.
- `TransactionHistory` lista transacciones del rider con tabla desktop, cards mobile, `RiderStatusBadge` y `PaginationControls`.
- Las paginas `/rider/checkout/success`, `/rider/checkout/pending` y `/rider/checkout/failure` usan `CheckoutResultView` con copia y tono visual segun resultado.
- Las pantallas de resultado recuperan la transaccion con `getRiderCheckoutResultData`, validando tambien `getAuthUser("rider")`.
- `CheckoutResultView` puede mostrar un link de vuelta a Rider App si esta configurado `NEXT_PUBLIC_RIDER_APP_URL`.

### Retiro

1. Driver abre `WithdrawalModal`.
2. `requestWithdrawal(amount)` valida sesion e input.
3. `createWithdrawalRequest(clerkId, amount)` valida trabajador, CBU/CVU y saldo.
4. Prisma ejecuta una transaccion atomica: debita `Balance.balanceAvailable`, crea `Withdrawal` y crea `Transaction`.
5. Se agenda aprobacion local con timer.
6. Admin puede aprobar manualmente retiros `REQUESTED` desde `/admin/withdrawals`.

### Rider y Checkout Pro

1. Rider App llama `POST /api/payments/checkout` con `x-internal-api-key`.
2. `createCheckout` valida input, cliente, trabajador y crea/reutiliza `Transaction`.
3. `mercadopago.ts` crea o actualiza la preference.
4. Payments guarda `gatewayPreferenceId` y `gatewayCheckoutUrl`.
5. Rider ve el pago pendiente en `/rider`.
6. Mercado Pago llama `POST /api/payments/webhook`.
7. Payments consulta el pago real, marca `RESERVED`, guarda `gatewayPaymentId` y suma el bruto a `Balance.balanceLocked`.
8. Payments avisa a Rider App con `sendRiderPaymentCallback`.
9. Para MVP/desarrollo, se agenda liquidacion local con `setTimeout`.

### Liquidacion

1. `runPendingLiquidations` busca transacciones `RESERVED`.
2. Lee `CommissionSettings`.
3. Calcula bruto, comision y neto con `Prisma.Decimal`.
4. Marca `Transaction` como `LIQUIDATED`, completa `commissionRate`, `commissionAmount`, `netAmount` y `liquidatedAt`.
5. Mueve saldo: resta bruto de `Balance.balanceLocked` y suma neto a `Balance.balanceAvailable`.
6. Admin puede liquidar manualmente desde `/admin/transactions`; la accion es idempotente.

### Admin

- `/admin`: metricas mensuales/diarias, estados y accion de comision.
- `/admin/transactions`: transacciones paginadas con filtros y liquidacion manual.
- `/admin/withdrawals`: retiros paginados con filtros y aprobacion manual.
- `/admin/drivers`: trabajadores con composicion `Trabajador` + `Balance`.
- `/admin/riders`: clientes con volumen pagado y actividad reciente.

