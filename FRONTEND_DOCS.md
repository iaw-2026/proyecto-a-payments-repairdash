# Repairdash Payments — Documentación Frontend

> Última actualización: Mayo 2025  
> Estado: En desarrollo — Dashboard del Driver (Fase 2 completada)

---

## Índice

1. [Stack y Tecnologías](#stack)
2. [Design System](#design-system)
3. [Estructura de Archivos](#estructura)
4. [Layout Global](#layout-global)
5. [Dashboard del Driver](#dashboard-driver)
6. [Mocks y TODOs para datos reales](#mocks-todos)
7. [Componentes UI reutilizables](#componentes-ui)

---

## 1. Stack y Tecnologías {#stack}

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 16.2.4 (App Router) | Framework principal |
| React | 19 | UI |
| TypeScript | 5 | Tipado estricto |
| Tailwind CSS | v4 | Estilos (via `@theme inline`) |
| Prisma | 7 | ORM — PostgreSQL |
| Recharts | latest | Gráficos del dashboard |
| Outfit | Google Fonts | Fuente principal |
| IBM Plex Mono | Google Fonts | Fuente monoespaciada (IDs, códigos) |

---

## 2. Design System {#design-system}

### Paleta de colores

Definida en [`app/globals.css`](./app/globals.css) como CSS custom properties bajo `@theme inline`.  
Tailwind las consume como `bg-surface`, `text-accent`, etc.

| Token | Variable CSS | Hex | Uso |
|---|---|---|---|
| `background` | `--color-background` | `#271033` | Fondo principal de la app |
| `foreground` | `--color-foreground` | `#FFFFFF` | Texto primario, headings |
| `surface` | `--color-surface` | `#3E1A55` | Fondo de cards y containers |
| `surface-elevated` | `--color-surface-elevated` | `#4C2168` | Cards en hover, modals |
| `sidebar` | `--color-sidebar` | `#1A0B25` | Fondo exclusivo del sidebar |
| `secondary` | `--color-secondary` | `#C392DD` | Texto de cuerpo, labels |
| `muted` | `--color-muted` | `#8D62A5` | Texto terciario, placeholders |
| `border` | `--color-border` | `rgba(141,98,165,0.25)` | Bordes de cards e inputs |
| `accent` | `--color-accent` | `#F500F1` | CTAs, active states, highlights |
| `accent-hover` | `--color-accent-hover` | `#FF33F3` | Hover de elementos accent |
| `accent-subtle` | `--color-accent-subtle` | `rgba(245,0,241,0.08)` | Fondos sutiles accent |
| `success` | `--color-success` | `#34D399` | Saldo disponible, estados OK |
| `warning` | `--color-warning` | `#FBBF24` | Saldo reservado, pendientes |
| `danger` | `--color-danger` | `#F87171` | Errores, rechazos, disputas |

### Tipografía

| Rol | Fuente | Variable CSS |
|---|---|---|
| Cuerpo / UI | Outfit (400, 500, 600, 700) | `--font-outfit` |
| Monoespaciado | IBM Plex Mono (400, 500) | `--font-ibm-plex-mono` |

### Border Radius (estilo "contenido/profesional")

| Elemento | Valor |
|---|---|
| Cards grandes | `rounded-xl` (0.75rem) |
| Botones, badges | `rounded-md` (0.375rem) |
| Inputs | `rounded-md` |
| Elementos internos | `rounded-lg` (0.5rem) |

### Animaciones disponibles

Clases utilitarias definidas en `globals.css`:

```css
.animate-fade-in     /* opacity 0 → 1, 300ms */
.animate-slide-up    /* fade + translateY 8px → 0, 400ms */
.animate-slide-in-left  /* fade + translateX -12px → 0, 300ms */
```

---

## 3. Estructura de Archivos {#estructura}

```
app/
├── layout.tsx                  # Root layout: html, body, fuentes, globals.css
├── globals.css                 # Design system completo (tokens, animaciones, scrollbar)
├── page.tsx                    # Landing page (sin sidebar)
│
└── (app)/                      # Route group: rutas autenticadas con Topbar
    ├── layout.tsx              # Shell con <Topbar />
    │
    └── driver/
        ├── layout.tsx          # Layout del driver: <DriverSidebar> + <MobileBottomNav>
        ├── page.tsx            # Dashboard principal del driver ← Fase 2 completada
        ├── withdrawals/
        │   └── page.tsx        # Página de retiros (placeholder)
        └── liquidations/
            └── page.tsx        # Página de liquidaciones (placeholder)

components/
├── layout/
│   ├── Topbar.tsx              # Barra superior con logo y role nav
│   ├── DriverSidebar.tsx       # Sidebar lateral del driver (Client Component)
│   └── MobileBottomNav.tsx     # Bottom tabs para mobile (Client Component)
│
├── driver/                     # Componentes exclusivos del driver
│   ├── BalanceCards.tsx        # 3 MetricCards: disponible, reservado, total mes
│   └── IncomeChart.tsx         # Gráfico de área (Recharts) — ingresos 7 días
│
└── ui/                         # Componentes genéricos reutilizables
    └── MetricCard.tsx          # Card de métrica: icono + label + valor + color

lib/
├── types/
│   └── driver.ts               # Interfaces TS: BalanceData, IncomeDataPoint, TransactionRow
├── mocks/
│   └── driver-mocks.ts         # Datos mock del dashboard (ver sección TODOs)
├── services/                   # Lógica de negocio (Prisma)
├── validations/                # Esquemas de validación
└── prisma.ts                   # Cliente Prisma singleton
```

---

## 4. Layout Global {#layout-global}

### Jerarquía de layouts

```
app/layout.tsx          (Root)
  └─ html + body + fuentes + globals.css
  └─ app/(app)/layout.tsx     (App shell)
       └─ <Topbar /> arriba
       └─ app/(app)/driver/layout.tsx   (Driver shell)
            └─ <DriverSidebar />  → desktop (≥ lg)
            └─ <MobileBottomNav /> → mobile (< lg)
            └─ <main> {children} </main>
```

### Planos de profundidad (contraste)

```
Sidebar  #1A0B25  (más oscuro)
   ↓
Fondo    #271033  (base)
   ↓
Cards    #3E1A55  (más claro — bg-surface)
   ↓
Strip    #F500F1  (accent top border de 2px en MetricCards)
```

---

## 5. Dashboard del Driver {#dashboard-driver}

**Archivo:** [`app/(app)/driver/page.tsx`](./app/(app)/driver/page.tsx)

### Qué renderiza actualmente

1. **Header** — Saludo con nombre del driver (dato real de Prisma)
2. **BalanceCards** — 3 tarjetas de balance
3. **IncomeChart** — Gráfico de área (últimos 7 días)
4. **Quick Action card** — Botón "Ir a Retiros" → `/driver/withdrawals`

### Flujo de datos

```
Prisma DB
  └─ user.trabajador.balance.balanceAvailable  → BalanceCards (REAL)
  └─ user.trabajador.balance.balanceLocked     → BalanceCards (REAL)

lib/mocks/driver-mocks.ts
  └─ MOCK_EARNED_THIS_MONTH                    → BalanceCards (MOCK ⚠️)
  └─ MOCK_INCOME_CHART                         → IncomeChart  (MOCK ⚠️)
```

---

## 6. Mocks y TODOs para datos reales {#mocks-todos}

> Todos los items marcados con ⚠️ deben reemplazarse cuando el modelo de datos esté completo.

### `lib/mocks/driver-mocks.ts`

#### `MOCK_EARNED_THIS_MONTH`

```ts
// ⚠️ TODO: Reemplazar con query real
// Sumar transacciones LIQUIDATED del mes actual para el trabajadorId
export const MOCK_EARNED_THIS_MONTH = 187_500;
```

**Query sugerida cuando esté el schema:**
```ts
const earned = await prisma.transaction.aggregate({
  where: {
    trabajadorId: driver.clerkId,
    status: "LIQUIDATED",
    createdAt: {
      gte: startOfMonth(new Date()),
      lte: endOfMonth(new Date()),
    },
  },
  _sum: { amount: true },
});
```

---

#### `MOCK_INCOME_CHART`

```ts
// ⚠️ TODO: Reemplazar con query real
// Agrupar transacciones LIQUIDATED por día (últimos 7 días)
export const MOCK_INCOME_CHART: IncomeDataPoint[] = [ ... ];
```

**Query sugerida cuando esté el schema:**
```ts
// Requiere: timestamps en Transaction, campo de fecha consistente
// Agrupar con prisma.$queryRaw o procesar en memoria con date-fns
const last7Days = await prisma.transaction.findMany({
  where: {
    trabajadorId: driver.clerkId,
    status: "LIQUIDATED",
    createdAt: { gte: subDays(new Date(), 7) },
  },
  orderBy: { createdAt: "asc" },
});
// Luego agrupar por día con reduce() y formatear como IncomeDataPoint[]
```

---

### `app/(app)/driver/withdrawals/page.tsx`

> ⚠️ Placeholder actual — pendiente de diseño completo.

**Pendiente:**
- Tabla de retiros con columnas: ID, Monto, Estado, Fecha
- Formulario de solicitud de retiro (monto + confirmación)
- Filtro por estado: `REQUESTED | APPROVED | REJECTED`
- Conectar con `POST /api/payments/retiro`

---

### `app/(app)/driver/liquidations/page.tsx`

> ⚠️ Placeholder actual — pendiente de diseño completo.

**Pendiente:**
- Tabla de liquidaciones agrupadas por período
- Resumen: total bruto, descuentos, neto liquidado
- Requiere nuevo modelo en Prisma o campo `liquidatedAt` en Transaction

---

### `components/layout/DriverSidebar.tsx`

> ⚠️ El nombre e info del driver están hardcodeados.

**Pendiente:**
- Reemplazar el avatar "D" y el label "Driver" hardcodeado por datos reales del usuario autenticado (Clerk integration — Week 2)

---

### `components/layout/MobileBottomNav.tsx`

> ⚠️ Los links están hardcodeados para el rol "driver".

**Pendiente:**
- Cuando haya autenticación real (Clerk), leer el rol del usuario y mostrar el nav correspondiente (driver / rider / admin)

---

## 7. Componentes UI reutilizables {#componentes-ui}

### `MetricCard`

```tsx
import { MetricCard } from "@/components/ui/MetricCard";

<MetricCard
  icon={<svg>...</svg>}
  label="Saldo Disponible"
  value="$24.300"
  valueColor="text-success"   // opcional, default: text-foreground
  subtitle="Disponible para retirar"  // opcional
/>
```

**Props:**

| Prop | Tipo | Requerido | Default |
|---|---|---|---|
| `icon` | `ReactNode` | ✅ | — |
| `label` | `string` | ✅ | — |
| `value` | `string` | ✅ | — |
| `valueColor` | `string` | ❌ | `"text-foreground"` |
| `subtitle` | `string` | ❌ | — |

**Colores semánticos disponibles:** `text-success`, `text-warning`, `text-danger`, `text-accent`, `text-secondary`, `text-foreground`

---

### `IncomeChart`

```tsx
import { IncomeChart } from "@/components/driver/IncomeChart";
import type { IncomeDataPoint } from "@/lib/types/driver";

const data: IncomeDataPoint[] = [
  { day: "Lun", amount: 24300 },
  { day: "Mar", amount: 18700 },
  // ...
];

<IncomeChart data={data} />
```

> ⚠️ Client Component — usar solo dentro de páginas del App Router, no en layouts.

---

### `BalanceCards`

```tsx
import { BalanceCards } from "@/components/driver/BalanceCards";
import type { BalanceData } from "@/lib/types/driver";

const data: BalanceData = {
  available: 45000,
  reserved: 12300,
  earnedThisMonth: 187500,
  currency: "ARS",
};

<BalanceCards data={data} />
```

---

*Documentación generada durante el desarrollo del rediseño frontend — Mayo 2025.*
