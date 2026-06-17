<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 🛡️ PROTOCOLO DE TIPADO ESTRICTO Y ARQUITECTURA DE DATOS

## 1. Única Fuente de Verdad (Single Source of Truth)
* **Referencia Obligatoria:** El archivo `prisma/schema.prisma` es la LEY SUPREMA. Antes de generar cualquier código, el agente DEBE leer este archivo.
* **Prohibición de "Interfaces Espejo":** Queda terminantemente prohibido crear interfaces manuales que dupliquen modelos de la base de datos. 
* **Uso de Prisma Client:** Se deben importar los tipos generados automáticamente:
    `import { User, Trabajador, Balance, Transaction, Withdrawal } from "@/generated/prisma";`

## 2. Separación de Dominios (Trabajador vs. Balance)
* **Modularidad Estricta:** El agente debe respetar la relación 1:1 del esquema. 
    * **Modelo Trabajador:** Gestiona identidad y datos de transferencia (`cbuCvu`).
    * **Modelo Balance:** Gestiona puramente estados contables (`balanceAvailable`, `balanceLocked`).
* **No "Flattening":** No aplanar ambos modelos en una sola interfaz. Si una vista (como el Dashboard) requiere ambos, se debe usar composición:
    ```typescript
    interface DashboardData {
      trabajador: Trabajador;
      balance: Balance;
    }
    ```

## 3. Integridad Financiera (Precisión Decimal)
* **Manejo de Montos:** Dado que el esquema usa `@db.Decimal(12,2)`, el agente debe tratar los montos como tipos `Decimal` (de la librería `decimal.js` o la provista por Prisma).
* **Prohibición de Tipo 'Number':** No se deben realizar cálculos de saldos o transacciones usando el tipo primitivo `number` de JavaScript para evitar errores de redondeo de coma flotante.

## 4. Gestión de Datos Calculados y Mocks
* **Atributos Dinámicos:** Campos como `earnedThisMonth` no existen en la DB. El agente debe tratarlos como datos calculados en el servidor mediante agregaciones de Prisma (`_sum`) y marcarlos con el comentario: `// TODO: Dato calculado mediante agregación`.
* **Consistencia de Naming:** Usar estrictamente los nombres del esquema (ej. `balanceLocked` y NO `reserved`).

## 5. Procedimiento de Error
* Si el agente detecta una inconsistencia entre una petición del usuario y el `schema.prisma`, debe detenerse y solicitar la actualización del esquema antes de proceder con el código de aplicación.