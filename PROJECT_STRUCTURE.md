# Estructura del Proyecto Reorganizada

## ✅ Reorganización Completada

El proyecto ha sido reorganizado de una estructura plana a una arquitectura modular y escalable, lista para la extensión de features en semanas siguientes.

## 📁 Estructura de Directorios

```
src/
├── app/                          # Next.js App Router
│   ├── globals.css              # Estilos globales
│   ├── layout.tsx               # Root layout con AppHeader
│   ├── page.tsx                 # Home page
│   ├── rider/
│   │   └── page.tsx             # Dashboard del cliente (viewer)
│   ├── driver/
│   │   └── page.tsx             # Dashboard del trabajador (viewer)
│   └── api/
│       └── payments/
│           ├── checkout         # POST: crear transacción
│           ├── [transactionId]/estado  # GET: estado de transacción
│           ├── wallet/[trabajadorId]   # GET: saldo del trabajador
│           └── retiro           # POST: solicitar retiro
│
├── components/                  # Componentes React organizados
│   ├── index.ts                # Barril export principal
│   ├── layout/                 # Componentes de layout
│   │   ├── index.ts
│   │   └── AppHeader.tsx       # Header navegable (extraído de layout.tsx)
│   ├── ui/                     # Componentes UI reutilizables
│   │   └── index.ts            # TODO: Button, Card, Badge, etc.
│   └── payments/               # Componentes específicos de pagos
│       └── index.ts            # TODO: CheckoutForm, TransactionTable, etc.
│
├── lib/                         # Utilidades y servicios
│   ├── prisma.ts               # Cliente Prisma singleton (PostgreSQL)
│   ├── auth.ts                 # Auth utilities (placeholder Week 2)
│   ├── services/               # Capas de lógica de negocio
│   │   ├── index.ts
│   │   ├── transactions.ts     # Crear y transicionar transacciones
│   │   ├── balances.ts         # Operaciones de saldo
│   │   └── withdrawals.ts      # Solicitudes de retiro
│   ├── validations/            # Esquemas de validación
│   │   ├── index.ts
│   │   ├── checkout.ts         # Validar entrada de checkout
│   │   └── withdrawal.ts       # Validar entrada de retiro
│   └── integrations/           # Integraciones externas
│       ├── index.ts
│       └── mercado-pago.ts     # Mercado Pago API (placeholder Week 2)
│
└── tests/                       # Archivos de test
    └── (placeholder)

prisma/
├── schema.prisma              # Modelos Prisma (User, Transaction, Balance, etc.)
└── seed.ts                    # Poblador de datos de demostración

config files (root):
├── next.config.ts
├── tsconfig.json             # Path alias @/* -> ./src/*
├── tailwind.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── prisma.config.ts          # Seed runner config
└── package.json

docs:
├── AGENTS.md                 # Guía para agents
├── CLAUDE.md                 # Referencias de Claude
└── PROJECT_STRUCTURE.md      # Este archivo
```

## 🔑 Cambios Principales

### 1. **Componentes Extraídos**
   - `src/components/layout/AppHeader.tsx` - Header navegable (antes inline en layout.tsx)
   - Estructura preparada para: UI components, Payment domain components

### 2. **Servicios de Negocio**
   - `src/lib/services/transactions.ts` - CRUD y transiciones de transacciones
   - `src/lib/services/balances.ts` - Operaciones de saldo y validaciones
   - `src/lib/services/withdrawals.ts` - Gestión de retiros

### 3. **Validaciones**
   - `src/lib/validations/checkout.ts` - Esquemas de checkout (TODO: Zod Week 2)
   - `src/lib/validations/withdrawal.ts` - Esquemas de retiro

### 4. **Autenticación**
   - `src/lib/auth.ts` - Placeholder para integración Clerk (Week 2)

### 5. **Integraciones**
   - `src/lib/integrations/mercado-pago.ts` - Placeholder para API MP (Week 2)

## ✨ Beneficios de esta Estructura

1. **Separación de Responsabilidades**
   - `components/` - Presentación
   - `lib/services/` - Lógica de negocio
   - `lib/validations/` - Validación de datos
   - `lib/integrations/` - Acceso a sistemas externos

2. **Escalabilidad**
   - Fácil agregar nuevas páginas en `app/`
   - Reutilizar servicios desde cualquier ruta
   - Crecer el árbol de componentes sin conflictos

3. **Testabilidad**
   - Servicios aislados y puro funcionales
   - Componentes independientes
   - Ready para unit + integration tests

4. **Path Aliases**
   - Imports limpios: `@/lib/services`, `@/components/layout`, etc.
   - Refactoring seguro sin rutas relativas

## 🚀 Próximos Pasos (Week 2+)

- [ ] Integrar Clerk en `lib/auth.ts` y middleware
- [ ] Completar API Mercado Pago en `lib/integrations/mercado-pago.ts`
- [ ] Agregar validaciones Zod en `lib/validations/`
- [ ] Crear componentes UI en `components/ui/`
- [ ] Crear componentes de dominio en `components/payments/`
- [ ] Agregar rutas admin en `app/admin/`
- [ ] Setup de tests en `src/tests/`

## ✅ Status de Build

- **TypeScript**: ✓ Compila exitosamente
- **Routes**: ✓ Todas las rutas reconocidas
- **Imports**: ✓ Path aliases funcionando
- **Prisma**: ✓ Cliente singleton listo
- **Seed**: ✓ Ready para reproducir datos

```
✓ Compiled successfully
✓ Finished TypeScript in 1615ms    
✓ Collecting page data using 11 workers
✓ Generating static pages using 8 routes
```
