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
* **ORM / Conexión:** Prisma ORM o TypeORM (según configuración local)

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
Crea un archivo `.env` en la raíz del proyecto basándote en el entorno de tu base de datos PostgreSQL:
```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/citt_stock_db?schema=public"
PORT=3000
```

### 4. Ejecutar las migraciones / Sincronizar Prisma
Si utilizas Prisma, sincroniza la base de datos:
```bash
npx prisma db pull
npx prisma generate
```

### 5. Iniciar el servidor en modo desarrollo
```bash
npm run start:dev
```
El servidor estará disponible en `http://localhost:3000`. Puedes probar los endpoints utilizando herramientas como **Thunder Client** o Postman.

---

## 🤝 Representantes del Proyecto

* **Contraparte Institucional / Cliente:** Paz Constanza Morales Saavedra (`pc.morales@profesor.duoc.cl`)
* **Unidad Ejecutora:** Estudiantes de la Escuela de Informática y Telecomunicaciones — Duoc UC Sede San Bernardo.
  * - Arianette Pavez
  * - Tania Gaete
