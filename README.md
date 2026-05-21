# Consultation CRM Backend

CommonJS + Express + Sequelize + MySQL backend for public consultation website forms and CRM dashboard.

## Setup

```bash
npm install
cp .env.example .env
```

Create database and tables:

```bash
mysql -u root -p < sql/schema.sql
```

Create admin user:

```bash
npm run seed:admin
```

Run server:

```bash
npm run dev
```

Default admin:

```txt
admin@example.com
Admin@12345
```

## Main APIs

Public website:

```txt
POST /api/public/consultation
POST /api/public/contact
POST /api/public/newsletter
```

CRM:

```txt
POST   /api/auth/login
GET    /api/auth/me
GET    /api/dashboard
GET    /api/leads
GET    /api/leads/:id
POST   /api/leads
PUT    /api/leads/:id
PATCH  /api/leads/:id/status
PATCH  /api/leads/:id/assign
DELETE /api/leads/:id
GET    /api/users
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
GET    /api/access/roles
GET    /api/access/permissions
```
