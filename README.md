# Payments App - Repairdash

Modulo de pagos de Repairdash, una aplicacion web orientada a gestionar cobros de trabajos, balances de trabajadores, liquidaciones, retiros y administracion financiera.

Proyecto desarrollado en Next.js para la materia Ingenieria de Aplicaciones Web - UNS, 2026.

Para mayor información sobre las apis se puede consultar apis.md o la etapa 1 y para mayor información del backend se puede consultar PROJECT_STRUCTURE.MD

## Deploy
https://proyecto-a-payments-repairdash.vercel.app

El proyecto se encuentra totalmente actualizado en rama main.



## Descripcion general

La aplicacion centraliza el flujo financiero del ecosistema Repairdash:

- Creacion de checkouts de pago para riders.
- Integracion con Mercado Pago Checkout Pro.
- Procesamiento de webhooks y actualizacion de estados de transacciones.
- Gestion de balances disponibles y retenidos de trabajadores.
- Liquidacion de comisiones de la plataforma.
- Solicitud y aprobacion de retiros.
- Panel administrativo para transacciones, trabajadores, riders y retiros.

## Enfoque arquitectonico

El proyecto usa Next.js App Router, Clerk para autenticacion, Prisma como capa de datos y PostgreSQL como base de datos.

Organizacion principal:

- `app/`: paginas, layouts, server actions y API routes.
- `components/`: componentes de interfaz para admin, driver, rider y UI reutilizable.
- `lib/services/`: logica de negocio de balances, checkout, liquidaciones, retiros y administracion.
- `lib/integrations/`: integracion con Mercado Pago y callbacks hacia Rider App.
- `prisma/`: schema y migraciones de base de datos.

## Flujos principales

### Pago de rider

Repairdash/Rider App solicita un checkout interno. Payments crea o reutiliza una transaccion pendiente, genera la preferencia en Mercado Pago y expone el link de pago al rider. Si un pago falla, se avisa a riderApp a traves del PUT y se cancela el trabajo, por decisión de RiderApp.

### Webhook y liquidacion

Mercado Pago notifica el resultado del pago. Payments consulta el pago real, actualiza la transaccion, mueve el monto al balance retenido del trabajador y luego liquida aplicando la comision configurada.

### Retiro de trabajador

El trabajador consulta su balance disponible, carga su CBU/CVU y solicita un retiro. El admin puede aprobar manualmente las solicitudes pendientes.

### Administracion

El administrador puede ver metricas, transacciones, trabajadores, riders, solicitudes de retiro y ejecutar acciones manuales como liquidar transacciones o aprobar retiros, antes de que se hagan automáticamente o si se quedarán trabadas.

## Cómo probar casos de uso

La app se puede probar de dos formas: desde el flujo completo con Rider App o disparando los endpoints internos desde Postman.

### Flujo vista administrador
El administrador podra modificar la comisión de liquidación cobrada a los drivers y podrá liquidar transacciones desde el boton que aparece en la tabla que las lista junto con su estado. Además, podra aprobar los retiros pendientes, desde la tabla retiros. Para poder hacer esto tiene que haber pasado menos de 30 segundos ya que esas acciones se disparán automaticamente, salvo algún error que ocurra con el servidor y se pierda el timer.

### Flujo completo vista driver
Un driver iniciará sesión y podrá hacer retiros, ver sus balances y  sus liquidaciones.

### Flujo completo con Rider App

1. Iniciar sesion en Rider App con una cuenta habilitada.
2. Crear o seleccionar un trabajo que requiera pago.
3. Rider App llama a Payments para crear el checkout.
4. El usuario es redirigido a Payments y luego a Mercado Pago. Si no pago todavía puede cancelar el checkout y rider app le avisa
a Payments app a través de un PUT para que cambie el estado del pago a failed impidiendo que sea pagado en MercadoPago.
4.  Si el usuario rompiera el flujo de redirección, no pasa nada porque paymentsApp levanta el último pago pendiente si no hay un id en la url. Es imposible que un usuario tenga dos pagos pendientes realmente, porque rider App no permite tener más de un pedido activo, si se puede si se enviaran peticiones mediante postman.
5. Al pagar, Mercado Pago notifica a Payments por webhook.
6. Payments actualiza la transaccion, mueve el saldo del trabajador y avisa el resultado a Rider App mediante callback.
7. El resultado se puede revisar desde el panel de rider, driver o administrador segun corresponda.

### Prueba manual desde Postman

Tambien se puede iniciar un pago sin pasar por Rider App llamando directamente al endpoint interno:

```http
POST https://proyecto-a-payments-repairdash.vercel.app/api/payments/checkout
content-type: application/json
x-internal-api-key: <PAYMENTS_INTERNAL_API_KEY>
```

Body de ejemplo:

```json
{
  "trabajoId": "trabajo_demo_001",
  "clientId": "<CLERK_ID_RIDER>",
  "trabajadorId": "<CLERK_ID_DRIVER>",
  "amount": "15000.50",
  "description": "Servicio de reparacion"
}
```

La respuesta devuelve un `redirectUrl`. Para continuar la prueba, abrir esa URL en el navegador con una sesion de rider iniciada y completar el pago en Mercado Pago.

Para consultar la wallet de un trabajador desde Postman:

```http
GET https://proyecto-a-payments-repairdash.vercel.app/api/payments/wallet/<CLERK_ID_DRIVER>
x-internal-api-key: <PAYMENTS_INTERNAL_API_KEY>
```

Importante: `clientId` y `trabajadorId` deben existir en Payments, y el monto debe enviarse como string decimal.



## Scripts utiles

```bash
pnpm dev        # Iniciar servidor de desarrollo
pnpm build      # Compilar para produccion
pnpm start      # Iniciar servidor de produccion
pnpm db:deploy  # Ejecutar migraciones en deploy
pnpm lint       # Ejecutar ESLint
```

## Accesos

El login se realiza desde `/sign-in`. La autenticacion usa Clerk y la app redirige automaticamente segun el rol del usuario.
La app no permite crear usuarios, estos se deben crear desde sus aplicaciones principales, esto es para no generar inconsistencias.


Roles disponibles:

| Rol | Acceso |
|---|---|
| Administrador de pagos | Cuenta habilitada con rol `adminPayments` |
| Driver / trabajador | Cuenta habilitada con rol `driver` |
| Rider / usuario final | Cuenta habilitada con rol `rider` |

## Usuario admin:
mail: pruebaadminp+clerk_test@gmail.com
contraseña: adminPayments1234


## cuenta de mercado pago de test para comprar:

usuario: TESTUSER4726867390927051026

contraseña: asUVHQxXZS

codigo de verificacion: 439411

Si se desea fallar un pago usar tarjeta mastercard terminada en 3304 con codigo de seguridad 123, 
para pagar correctamente usar dinero en cuenta o tarjeta mastercard terminada en 4602 con codigo 123.
