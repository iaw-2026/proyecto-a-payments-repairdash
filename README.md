# Payments App - Repairdash

Modulo de pagos de Repairdash, una aplicacion web orientada a gestionar cobros de trabajos, balances de trabajadores, liquidaciones, retiros y administracion financiera.

Proyecto desarrollado en Next.js para la materia Ingenieria de Aplicaciones Web - UNS, 2026.

Para mayor información sobre las apis se puede consultar [apis.md](apis.md) o la etapa 1 y para mayor información del backend se puede consultar [PROJECT_STRUCTURE.MD](PROJECT_STRUCTURE.md)

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

## Flujos principales

La app ya se encuentra conectada con todas las APIs reales, se dejo el mock para ver como fue el desarrollo. Se conectó con riderApp y driverApp consume un GET. Por esta razón conviene probar los casos de uso con los flujos reales.

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

### Flujo completo con Rider App (aclaraciones necesarias para testearlo)

1. Iniciar sesion en Rider App con una cuenta habilitada.
2. Crear o seleccionar un trabajo que requiera pago.
3. Rider App llama a Payments para crear el checkout. (Asegurarse previamente de no estar logeado en paymentsApp o estarlo pero con la cuenta con rol rider desde la que se pide el trabajo, sino la redirección funciona pero no te deja pagar porque te muestra la vista del rol que tenés, o si estas en otra cuenta rider no te muestra el pago correspondiente).
4. El usuario es redirigido a Payments y luego a Mercado Pago. Si no pago todavía puede cancelar el checkout y rider app le avisa
a Payments app a través de un PUT para que cambie el estado del pago a failed impidiendo que sea pagado en MercadoPago.
4.  Si el usuario rompiera el flujo de redirección, no pasa nada porque paymentsApp levanta el último pago pendiente si no hay un id en la url. Es imposible que un usuario tenga dos pagos pendientes realmente, porque rider App no permite tener más de un pedido activo, si se puede si se enviaran peticiones mediante postman.
5. Al pagar, Mercado Pago notifica a Payments por webhook.
6. Payments actualiza la transaccion, mueve el saldo del trabajador y avisa el resultado a Rider App mediante callback (put).
7. El resultado se puede revisar desde el panel de rider, driver o administrador segun corresponda.

### Prueba manual desde Postman

Tambien se puede iniciar un pago sin pasar por Rider App llamando directamente al endpoint interno, pero es recomedable y más fácil probar el flujo completo. Además se deberá solicitar la API KEY. Para mirar la documentacion de las apis mirar [apis.md](apis.md) 


## Accesos

El login se realiza desde `/sign-in`. La autenticacion usa Clerk y la app redirige automaticamente segun el rol del usuario.
La app no permite crear usuarios, estos se deben crear desde sus aplicaciones principales, esto es para no generar inconsistencias.
Los roles son los asignados en clerk y luego se guardan y chequean en la BD.

Roles disponibles:

| Rol | Acceso |
|---|---|
| Administrador de pagos | Cuenta habilitada con rol `adminPayments` |
| Driver / trabajador | Cuenta habilitada con rol `driver` |
| Rider / usuario final | Cuenta habilitada con rol `rider` |

## Usuario admin:
mail: adminpayments+clerk_test@iaw.com
contraseña: iawuser#

## Usuario driver: (el mismo es utilizado por driverApp para tener mas transacciones cargadas)
mail: driver+clerk_test@iaw.com
contraseña: iawuser#

## Usuario rider: (el mismo es utilizado por riderApp para tener mas transacciones cargadas)
mail: rider+clerk_test@iaw.com
contraseña: iawuser#


## cuenta de mercado pago de test para comprar:

usuario: TESTUSER4726867390927051026

contraseña: asUVHQxXZS

codigo de verificacion: 439411

Para probar pagos se puede usar el dinero en cuenta o:

| Tipo | Numero | Codigo | Vencimiento | DNI |
| --- | --- | --- | --- | --- |
| Mastercard credito | 5031 7557 3453 0604 | 123 | 11/30 | 1234567 |
| Mastercard debito | 5287 3383 1025 3304 | 123 | 11/30 | 1234567 |

Para probar resultados, completar el nombre del titular con:

| Resultado esperado | Nombre del titular |
| --- | --- |
| Aprobado | APRO |
| Rechazado | OTHE, FUND o EXPI |
| Pendiente | CONT |

## Lighthouse
Se corrieron los test durante todo el desarrollo, buscando el máximo posible en accesibilidad y rendimiento. Este último, disminuye en mobile version por características del test. Luego el SEO intentó ser mejorado pero al estar todo bloqueado por clerk no se logró subir su nota salvo en la landing page que es de 100, lo mismo ocurre con Recomendaciones debido a clerk.