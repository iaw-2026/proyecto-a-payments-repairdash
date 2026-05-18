# Estructura del Proyecto — Repairdash Payments

## 📁 Árbol de Directorios

```
app/
├── layout.tsx                       # Root layout (fonts, Toaster)
├── globals.css                      # Design tokens (purple/magenta theme)
├── page.tsx                         # Landing / home
├── (app)/                           # Route group autenticado
│   ├── layout.tsx                   # Wrapper compartido
│   ├── driver/
│   │   ├── layout.tsx               # Sidebar + MobileBottomNav
│   │   ├── page.tsx                 # Dashboard (balance, gráfico, retiro rápido)
│   │   ├── withdrawals/
│   │   │   ├── page.tsx             # Historial de retiros (paginación server-side)
│   │   │   └── loading.tsx          # Skeleton de tabla
│   │   └── liquidations/
│   │       └── page.tsx             # Historial de liquidaciones
│   ├── rider/                       # Dashboard y checkout del rider
│   ├── admin/                       # Dashboard admin, retiros, drivers y riders
│   └── dashboard/                   # Placeholder
├── actions/
│   ├── admin.ts                     # Server Actions admin (comision)
│   ├── withdrawals.ts               # Server Action: solicitar retiro
│   └── liquidations.ts              # Server Action: actualizar comision
├── api/
│   └── payments/                    # API routes (placeholders)
├── sign-in/                         # Auth pages (placeholder)
└── sign-up/

components/
├── admin/                           # Componentes del dominio Admin
│   ├── AdminCommissionAction.tsx     # Card + modal para modificar comision
│   ├── AdminDashboardMetrics.tsx     # Cards y resumen de metricas admin
│   ├── AdminTableFilters.tsx         # Filtros reutilizables por searchParams
│   ├── AdminWithdrawalsTable.tsx     # Tabla responsive de retiros
│   ├── AdminDriversTable.tsx         # Tabla responsive de drivers
│   └── AdminRidersTable.tsx          # Tabla responsive de riders
├── driver/                          # Componentes del dominio Driver
│   ├── BalanceCards.tsx              # Tarjetas de saldo (available, locked, earned)
│   ├── IncomeChart.tsx              # Gráfico de ingresos (Recharts)
│   ├── QuickWithdrawalAction.tsx    # Card con botón de retiro rápido
│   ├── WithdrawalModal.tsx          # Modal para confirmar retiro
│   └── WithdrawalTable.tsx          # Tabla de historial de retiros
├── layout/                          # Shell de la app
│   ├── AppSidebar.tsx                # Sidebar base reutilizable
│   ├── AdminSidebar.tsx              # Sidebar admin (items admin)
│   ├── Topbar.tsx                   # Barra superior
│   ├── DriverSidebar.tsx            # Sidebar desktop
│   ├── MobileBottomNav.tsx          # Nav inferior mobile
│   └── RoleNav.tsx                  # Navegación por rol
├── ui/                              # Componentes genéricos reutilizables
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── MetricCard.tsx
│   ├── PaginationControls.tsx       # Paginación con searchParams
│   ├── EmptyState.tsx
│   └── StatusBadge.tsx
└── payments/                        # Placeholder

lib/
├── prisma.ts                        # Cliente Prisma singleton
├── mock-auth.ts                     # Mock de Clerk (devuelve user_driver_1)
├── auth.ts                          # Placeholder Clerk
├── money.ts                         # Utilidades de formato monetario
├── errors.ts                        # Helpers de error
├── services/                        # Lógica de negocio (ver abajo)
│   ├── withdrawals.ts
│   ├── admin.ts                     # Queries/agregaciones admin
│   ├── balances.ts
│   ├── transactions.ts
│   ├── liquidations.ts              # Liquidar RESERVED -> LIQUIDATED
│   └── users.ts
├── mocks/                           # Datos mock para desarrollo
├── validations/                     # Esquemas de validación
├── integrations/                    # Mercado Pago (placeholder)
└── types/                           # Tipos auxiliares

prisma/
├── schema.prisma                    # Fuente de verdad de los modelos
└── seed.ts                          # Datos iniciales de desarrollo
```

---

## 🧠 Arquitectura de Capas

### `lib/services/` — Lógica de Negocio

Contiene las funciones que hablan directamente con la base de datos vía Prisma. **No conocen nada de Next.js** (ni rutas, ni formularios, ni auth). Son puras y reutilizables.

| Responsabilidad | Ejemplo |
|---|---|
| Queries con Prisma (`findMany`, `count`) | `getWithdrawals(page, pageSize)` |
| Transacciones atómicas (`$transaction`) | `createWithdrawalRequest(clerkId, amount)` |
| Validaciones de negocio | Verificar saldo suficiente |
| Aritmética con `Decimal` | Debitar balance sin errores de redondeo |

### `app/actions/` — Server Actions

Actúan como **puente entre la UI y los services**. Se invocan desde formularios o botones del cliente.

| Responsabilidad | Ejemplo |
|---|---|
| Obtener el usuario autenticado | `getAuthUser()` |
| Validar inputs del formulario | Verificar que el monto sea positivo |
| Llamar a uno o más services | `createWithdrawalRequest(...)` |
| `revalidatePath` / `redirect` | Refrescar el dashboard post-retiro |
| Mapear errores técnicos → mensajes UI | `INSUFFICIENT_BALANCE` → "Saldo insuficiente" |

### `components/` — Presentación

| Carpeta | Qué contiene |
|---|---|
| `components/driver/` | Componentes específicos del dominio Driver |
| `components/ui/` | Componentes genéricos reutilizables en cualquier vista |
| `components/layout/` | Shell de la app (sidebar, topbar, nav) |

### Tipos

Los tipos de los modelos de base de datos se importan **siempre** desde Prisma Client generado:

```typescript
import { Withdrawal, WithdrawalStatus } from "@/generated/prisma";
```

No se crean interfaces manuales que dupliquen modelos de la DB (`AGENTS.md` Rule 1).

---

## 🚗 Driver — Estado Actual

### Dashboard (`/driver`)
- Tarjetas de balance (disponible, reservado, ganado este mes).
- Gráfico de ingresos mensuales con Recharts.
- Botón de retiro rápido → abre `WithdrawalModal` → ejecuta Server Action.

### Historial de Retiros (`/driver/withdrawals`)
- Tabla con paginación **server-side** (`skip`/`take` en Prisma).
- Página actual extraída de `?page=N` en la URL.
- `loading.tsx` con skeleton que refleja la estructura de la tabla.
- Empty state cuando no hay registros.
- Componente `PaginationControls` reutilizable (Client Component con `usePathname` + `useSearchParams`).

### Flujo de Retiro
1. Driver hace click en "Retirar" → `WithdrawalModal` (Client Component).
2. Modal invoca Server Action `requestWithdrawal(amount)`.
3. Action valida auth + input → llama a `createWithdrawalRequest` (Service).
4. Service ejecuta transacción atómica: valida saldo → debita balance → crea Withdrawal → crea Transaction.
5. Action ejecuta `revalidatePath("/driver")` → dashboard se actualiza.

---

## Admin - MVP Operativo

### Rutas
- `/admin`: dashboard con metricas mensuales, estados de transacciones, saldos agregados y accion rapida para modificar comision.
- `/admin/withdrawals`: listado paginado de retiros con filtros por busqueda, estado y fechas. No aprueba ni rechaza retiros.
- `/admin/drivers`: listado paginado de trabajadores con composicion `Trabajador` + `Balance`.
- `/admin/riders`: listado paginado de clientes/riders con volumen pagado y actividad reciente.

No hay pantalla admin de transacciones ni disputas en el MVP.

### Backend
- `lib/services/admin.ts` contiene las queries Prisma, agregaciones, filtros y paginacion del admin.
- Las paginas admin no hacen queries directas a Prisma; solo llaman services.
- `app/actions/admin.ts` contiene Server Actions del admin. Hoy maneja la actualizacion de comision y valida `adminPayments`.
- Las metricas calculadas salen de agregaciones Prisma y deben mantener el comentario `// TODO: Dato calculado mediante agregacion`.

### UI y navegacion
- `components/layout/AppSidebar.tsx` es la sidebar base reutilizable.
- `DriverSidebar` y `AdminSidebar` solo definen items y reutilizan `AppSidebar`.
- Las secciones admin viven en sidebar, no en topbar.
- `components/admin/AdminTableFilters.tsx` centraliza filtros por URL para reutilizarlos con `PaginationControls`.
- Las tablas admin siguen el patron de Driver/Rider: tabla desktop + cards mobile + empty state.

### Reglas de datos
- No crear interfaces espejo de modelos Prisma.
- Usar tipos generados desde Prisma Client.
- No aplanar `Trabajador` y `Balance`; usar composicion.
- No calcular dinero con `number`; mantener `Prisma.Decimal` y formatear al renderizar.

---

## Payments - Checkout Pro

### Flujo principal
1. Rider App inicia el pago con `POST /api/payments/checkout`.
   - Debe enviar `x-internal-api-key`.
   - El body incluye `trabajoId`, `clientId`, `trabajadorId`, `amount` como string decimal y `description`.
2. `app/api/payments/checkout/route.ts` valida la API key y delega en `lib/services/checkout.ts`.
3. `lib/services/checkout.ts` valida datos, crea o reutiliza `Transaction` por `trabajoId`, y llama a Mercado Pago.
4. `lib/integrations/mercadopago.ts` crea la preference de Checkout Pro.
   - Mercado Pago genera `preferenceId`.
   - Payments guarda `gatewayPreferenceId` y `gatewayCheckoutUrl`.
   - `external_reference` queda apuntando a `Transaction.id`.
   - `notification_url` apunta a `/api/payments/webhook`.
5. El endpoint de checkout responde `201` con JSON y `redirectUrl` hacia `/rider?transactionId=...`.
6. Rider App redirige el navegador del usuario a `redirectUrl`.
7. `app/(app)/rider/page.tsx` muestra el resumen y el boton para continuar a Mercado Pago usando `gatewayCheckoutUrl`.
8. Cuando el usuario paga, Mercado Pago llama a `POST /api/payments/webhook`.
9. `app/api/payments/webhook/route.ts` recibe `data.id`, consulta el pago real en Mercado Pago y vuelve a `lib/services/checkout.ts`.
10. Si el pago esta aprobado, Payments marca la transaccion como `RESERVED`, guarda `gatewayPaymentId` / `reservedAt` y suma el bruto a `Balance.balanceLocked`.
11. Despues de persistir la DB, Payments avisa a Rider App con `sendRiderPaymentCallback`.
12. Para desarrollo/MVP, Payments agenda `schedulePendingLiquidations()` con `setTimeout` de 5 segundos.

### Flujo de Liquidacion con Comision

1. `lib/services/checkout.ts` recibe pago aprobado y guarda el bruto en `balanceLocked`.
2. `schedulePendingLiquidations()` espera 5 segundos y llama `runPendingLiquidations({ delayMs: 0 })`.
3. `lib/services/liquidations.ts` busca transacciones `RESERVED`, lee `CommissionSettings` y calcula bruto, comision y neto con `Prisma.Decimal`.
4. En una transaccion atomica, marca la `Transaction` como `LIQUIDATED`, guarda `commissionRate`, `commissionAmount`, `netAmount` y `liquidatedAt`.
5. En esa misma transaccion, mueve saldo: resta el bruto de `Balance.balanceLocked` y suma el neto a `Balance.balanceAvailable`.
6. Antes de produccion, reemplazar el `setTimeout` por el endpoint protegido `POST /api/cron/liquidations`.

### Archivos principales
| Archivo | Responsabilidad |
|---|---|
| `lib/services/checkout.ts` | Reglas de negocio del checkout, idempotencia por `trabajoId`, procesamiento de webhook y actualizacion de balances. |
| `lib/services/liquidations.ts` | Reglas de liquidacion, calculo de comision y movimiento de `balanceLocked` a `balanceAvailable`. |
| `lib/integrations/mercadopago.ts` | Conexion con SDK de Mercado Pago para crear preferences y consultar pagos. |
| `lib/integrations/rider-callback.ts` | POST server-to-server hacia Rider App con el resultado del pago. |
| `lib/validations/checkout.ts` | Validacion Zod del contrato de checkout. |
| `lib/internal-auth.ts` | Validacion de `x-internal-api-key` para endpoints internos. |
| `app/api/payments/checkout/route.ts` | Endpoint externo llamado por Rider App para iniciar el checkout. |
| `app/api/payments/webhook/route.ts` | Endpoint llamado por Mercado Pago con notificaciones de pago. |
| `app/api/cron/liquidations/route.ts` | Endpoint protegido para reemplazar el timer por cron antes de produccion. |
| `app/(app)/rider/page.tsx` | Pantalla Rider y confirmacion previa a Mercado Pago. |

### Variables de entorno
```env
MERCADO_PAGO_ACCESS_TOKEN="TEST-..."
APP_URL="https://tu-url-publica.ngrok-free.dev"
PAYMENTS_INTERNAL_API_KEY="..."
RIDER_PAYMENT_CALLBACK_URL="https://rider-app/api/payments/result"
REPAIRDASH_API_KEY="..."
```

Para pruebas locales sin Rider App real, `RIDER_PAYMENT_CALLBACK_URL` puede apuntar a un mock local, por ejemplo `http://127.0.0.1:4000/api/payments/result`.

---

## 🚀 Pendientes

- [ ] Integrar Clerk (reemplazar `mock-auth.ts`)
- [ ] Completar pantallas finales de retorno Mercado Pago (`success`, `pending`, `failure`)
- [x] Vista de Liquidaciones
- [x] Panel Admin basico de comision
- [ ] Tests
