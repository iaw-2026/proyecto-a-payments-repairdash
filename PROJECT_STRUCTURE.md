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

## 🚀 Pendientes

- [ ] Integrar Clerk (reemplazar `mock-auth.ts`)
- [ ] Integración Mercado Pago
- [ ] Vista de Liquidaciones
- [ ] Panel Admin
- [ ] Tests
