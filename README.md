# CITT Stock - Backend 🚀

> API REST y lógica de negocio para la plataforma de gestión, control de inventario y trazabilidad de activos del **Centro de Innovación y Transferencia Tecnológica (CITT)** – Duoc UC Sede San Bernardo.

---

## 📌 Descripción General

Este repositorio contiene exclusivamente el código **Backend** de **CITT Stock**. El servidor está desarrollado para centralizar el control de inventario, procesar flujos de préstamos temporales, devoluciones y entregas definitivas (pedidos), y administrar el modelo multi-tenant de la organización.

---

## 🛠️ Tecnologías Utilizadas

* **Framework Principal:** [NestJS](https://nestjs.com/) (Node.js con TypeScript)
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
* **Base de Datos:** [PostgreSQL](https://www.postgresql.org/) con soporte Multi-Tenancy (Row Level Security / tenant_id) y identificadores UUID v4.
* **ORM / Conexión:** TypeORM

---

## 📂 Arquitectura de Módulos (Base de Datos & Endpoints)

El backend gestiona las siguientes 8 entidades principales del sistema:
1. **tenants:** Sedes y configuraciones globales de la organización.
2. **roles:** Niveles de permisos de acceso.
3. **users:** Miembros del centro (Administradores, Alumnos Líderes y Usuarios Globales).
4. **categories:** Clasificación de activos (Mobiliario, 3D, Talleres, Equipamiento).
5. **locations:** Casilleros físicos y espacios asignados (Ocupado / Disponible / Sin Casillero).
6. **items:** Catálogo de activos y generación de códigos únicos (IM-CITT-, 3D-CITT-, etc.).
7. **loans:** Registro de movimientos (Préstamos con fecha límite, devoluciones y pedidos definitivos).
8. **stock_movements:** Auditoría y trazabilidad histórica de entradas y salidas.

---

## 🚀 Guía de Instalación y Configuración Local

Sigue estos pasos para levantar el entorno de desarrollo del backend en tu máquina:

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/backend.git
cd backend
```

### 2. Instalar las dependencias
```bash
npm install
```

### 3. Configurar las variables de entorno
Copia `.env.example` a `.env` y configura:
```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/citt_stock_db
CITT_TENANT_ID=UUID_DE_LA_SEDE
FRONTEND_ORIGIN=http://localhost:3000
PORT=3001
DATABASE_SSL=false
JWT_SECRET=una-clave-aleatoria-de-al-menos-32-caracteres
```
`CITT_TENANT_ID` debe ser el UUID de la sede guardado en `tenants`. No se acepta un tenant enviado por el navegador: el servidor lo fija para todas las consultas y PostgreSQL lo aplica mediante RLS.

### 4. Actualizar el esquema de PostgreSQL
Ejecuta, en orden, los scripts de `database/migrations/` en el SQL Editor de tu proveedor PostgreSQL. La primera migración agrega stock, unidad y datos de consumibles; las demás agregan cantidad de préstamo y políticas RLS.
```bash
database/migrations/001_add_inventory_fields.sql
database/migrations/003_add_loan_quantity.sql
database/migrations/004_complete_inventory_schema.sql
database/migrations/002_enable_tenant_rls.sql
database/migrations/005_authentication.sql
```
Ejecuta `005_authentication.sql` conectado como propietario del esquema y en la misma sesión SQL define el tenant antes de correrla: `SET app.tenant_id = 'UUID_DE_LA_SEDE';`. La cuenta de la API no tiene privilegios para cambiar el esquema.
El usuario de conexión de la API debe ser un rol PostgreSQL dedicado que no sea superusuario ni tenga `BYPASSRLS`. RLS no puede proteger las tablas si la conexión usa un rol que omite estas políticas. Los activos existentes quedan con stock `0`; ingresa el stock inicial real antes de registrar préstamos o pedidos. El usuario de base de datos no debe ser `postgres` en producción.

### 5. Iniciar el servidor en modo desarrollo
```bash
npm run start:dev
```
El servidor estará disponible en `http://localhost:3001`; Swagger en `http://localhost:3001/api`. La API habilita CORS solo para `FRONTEND_ORIGIN`.

### 6. Crear usuarios demo locales (opcional)

La migración `005_authentication.sql` agrega los campos para RUN y escuela, además de los roles de acceso. Si necesitas las tres cuentas de demostración del frontend, crea una contraseña local y cárgalas explícitamente:
```powershell
$env:ALLOW_DEMO_ACCOUNTS = "true"
$env:NODE_ENV = "development"
$env:DEMO_PASSWORD = "tu-clave-local-de-demostracion"
npm run seed:demo
Remove-Item Env:ALLOW_DEMO_ACCOUNTS, Env:NODE_ENV, Env:DEMO_PASSWORD
```
El seed está bloqueado en producción y no incluye una contraseña predeterminada. Para mostrar las instrucciones de acceso demo en el frontend, define `NEXT_PUBLIC_ENABLE_DEMO_LOGIN=true` en su `.env.local`; no lo habilites en producción.

### 7. Conectar el frontend
En el repositorio frontend, crea `.env.local` con:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```
Inicia Next.js en `http://localhost:3000`. El inicio y registro de sesión usan `POST /auth/login` y `POST /auth/register`; la sesión se valida al restaurar con `GET /auth/me`. Las rutas de la API requieren JWT salvo las rutas públicas de autenticación. El registro crea siempre usuarios con rol `GLOBAL`.


---

## 🤝 Representantes del Proyecto

* **Contraparte Institucional / Cliente:** Paz Morales Saavedra
* **Unidad Ejecutora:** Estudiantes de la Escuela de Informática y Telecomunicaciones — Duoc UC Sede San Bernardo.
  * - Arianette Pavez
  * - Tania Gaete
