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
│   │       └── page.tsx             # Placeholder
│   ├── rider/                       # Placeholder
│   ├── admin/                       # Placeholder
│   └── dashboard/                   # Placeholder
├── actions/
│   └── withdrawals.ts               # Server Action: solicitar retiro
├── api/
│   └── payments/                    # API routes (placeholders)
├── sign-in/                         # Auth pages (placeholder)
└── sign-up/

components/
├── driver/                          # Componentes del dominio Driver
│   ├── BalanceCards.tsx              # Tarjetas de saldo (available, locked, earned)
│   ├── IncomeChart.tsx              # Gráfico de ingresos (Recharts)
│   ├── QuickWithdrawalAction.tsx    # Card con botón de retiro rápido
│   ├── WithdrawalModal.tsx          # Modal para confirmar retiro
│   └── WithdrawalTable.tsx          # Tabla de historial de retiros
├── layout/                          # Shell de la app
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
│   ├── balances.ts
│   ├── transactions.ts
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
5. El endpoint de checkout responde con redirect `303` a `/rider/checkout/confirmacion?transactionId=...`.
6. `app/(app)/rider/checkout/confirmacion/page.tsx` muestra el resumen y el boton para continuar a Mercado Pago usando `gatewayCheckoutUrl`.
7. Cuando el usuario paga, Mercado Pago llama a `POST /api/payments/webhook`.
8. `app/api/payments/webhook/route.ts` recibe `data.id`, consulta el pago real en Mercado Pago y vuelve a `lib/services/checkout.ts`.
9. Si el pago esta aprobado, Payments marca la transaccion como `RESERVED`, guarda `gatewayPaymentId` y suma el monto a `Balance.balanceLocked`.
10. Despues de persistir la DB, Payments avisa a Rider App con `sendRiderPaymentCallback`.

### Archivos principales
| Archivo | Responsabilidad |
|---|---|
| `lib/services/checkout.ts` | Reglas de negocio del checkout, idempotencia por `trabajoId`, procesamiento de webhook y actualizacion de balances. |
| `lib/integrations/mercadopago.ts` | Conexion con SDK de Mercado Pago para crear preferences y consultar pagos. |
| `lib/integrations/rider-callback.ts` | POST server-to-server hacia Rider App con el resultado del pago. |
| `lib/validations/checkout.ts` | Validacion Zod del contrato de checkout. |
| `lib/internal-auth.ts` | Validacion de `x-internal-api-key` para endpoints internos. |
| `app/api/payments/checkout/route.ts` | Endpoint externo llamado por Rider App para iniciar el checkout. |
| `app/api/payments/webhook/route.ts` | Endpoint llamado por Mercado Pago con notificaciones de pago. |
| `app/(app)/rider/checkout/confirmacion/page.tsx` | Pantalla de Payments previa a Mercado Pago. |

### Variables de entorno
```env
MERCADO_PAGO_ACCESS_TOKEN="TEST-..."
APP_URL="https://tu-url-publica.ngrok-free.dev"
PAYMENTS_INTERNAL_API_KEY="..."
RIDER_PAYMENT_CALLBACK_URL="https://rider-app/api/payments/result"
RIDER_CALLBACK_API_KEY="..."
```

Para pruebas locales sin Rider App real, `RIDER_PAYMENT_CALLBACK_URL` puede apuntar a un mock local, por ejemplo `http://127.0.0.1:4000/api/payments/result`.

---

## 🚀 Pendientes

- [ ] Integrar Clerk (reemplazar `mock-auth.ts`)
- [ ] Completar pantallas finales de retorno Mercado Pago (`success`, `pending`, `failure`)
- [ ] Vista de Liquidaciones
- [ ] Panel Admin
- [ ] Tests
