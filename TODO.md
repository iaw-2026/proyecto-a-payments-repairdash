# Tareas Pendientes — Repairdash Payments

## 🔧 Mejoras Técnicas

- [ ] **Autogenerar IDs en el schema** — Agregar `@default(uuid())` a los modelos `Transaction` y `Withdrawal` en `prisma/schema.prisma`. Después, eliminar el `import { randomUUID }` y las asignaciones manuales de `id` en `lib/services/withdrawals.ts` y `lib/services/transactions.ts`. Requiere migración (`npx prisma migrate dev`).
- [ ] Modularizar el Empty State del historial de retiros a un componente genérico en `components/ui/`
- [ ] Modularizar el Page Header (etiqueta + título + descripción) que se repite en todas las secciones del Driver

## 🔐 Autenticación

- [ ] Integrar Clerk — reemplazar `lib/mock-auth.ts` por `@clerk/nextjs/server`
- [ ] Configurar middleware de protección de rutas

## 💸 Funcionalidades

- [ ] Vista de Liquidaciones (`/driver/liquidations`)
- [ ] Panel Admin (`/admin`)
- [ ] Filtros por estado y fecha en el historial de retiros (server-side)

## 🧪 Testing

- [ ] Setup de tests
- [ ] Tests unitarios para services (withdrawals, balances)
- [ ] Tests de integración para Server Actions
