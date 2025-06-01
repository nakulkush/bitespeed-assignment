# Bitespeed Identity Reconciliation API

> A Node.js-based service to unify and manage customer identities using contact information

## 🚀 API Endpoints

* Base URL: (https://bitespeed-assignment-ktbc.onrender.com)
* POST /identify – Identify or link customer profiles
* GET /health – Check service availability

## 📖 Introduction

This Express + TypeScript backend service helps maintain a unified customer identity by connecting records that share the same email or phone number. It manages relationships between primary and secondary contacts, allowing businesses to get a single view of their customer across multiple interactions.

## 🛠️ Technology Stack

* Backend: Node.js + Express + TypeScript
* Database: PostgreSQL using Prisma ORM
* Input Validation: Zod
* Deployment: Render.com
* Key Add-ons: CORS support, structured error responses, clean shutdown on exit

## 📡 Endpoint Description

### POST /identify

Analyzes and links provided contact information with existing data or creates new entries accordingly.

Example Request:

```json
{
  "email": "customer@example.com",
  "phoneNumber": "123456789"
}
```

Successful Response:

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["customer@example.com", "alt@example.com"],
    "phoneNumbers": ["123456789", "987654321"],
    "secondaryContactIds": [2, 3]
  }
}
```

Error Example (Invalid Input):

```json
{
  "error": "Invalid input",
  "details": [/* Validation error messages from Zod */]
}
```

### GET /health

Returns current health status of the service.

Example Output:

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## ⚙️ Identity Resolution Logic

This service applies the following rules for identity consolidation:

1. No Match Found – A new primary contact is created
2. Match Found – Returns existing consolidated record
3. Partial Match – Adds new details as a secondary contact
4. Multiple Primaries – Merges them with the oldest contact as the main record

Key Features:

* 🔁 Deduplication of customer contacts
* 🔗 Linking secondary identities to a primary
* 🔍 Smart merging of related records
* 🗑️ Supports soft deletes via deletedAt column
* 🔒 Validations handled by Zod
* ⚠️ Descriptive and structured error reporting

## 🧰 Setup Instructions

To run locally:

Clone & Install:

```bash
git clone https://github.com/yourusername/bitespeed-identity-reconciliation.git
cd bitespeed-identity-reconciliation
npm install
```

Environment Setup:

```bash
echo 'DATABASE_URL="postgresql://user:pass@localhost:5432/bitespeed_db"' > .env
echo 'PORT=3000' >> .env
```

Initialize the database:

```bash
npx prisma migrate dev
npx prisma generate
```

Run the app:

```bash
npm run dev    # For development
npm start      # For production
```

## 🌐 Render Deployment Guide

Steps:

1. Connect GitHub repo to Render
2. Set service type to “Web Service”
3. Use this Build command:
   npm install && npx prisma generate && npm run build
4. Start command:
   npm start
5. Add environment variables:
   DATABASE\_URL=postgresql://\[your-render-db-url]
   NODE\_ENV=production

## 📁 Project Structure

The main source files are organized as follows:

src/
├── app.ts        // Express app and middleware config
├── server.ts     // Server initialization and shutdown logic
├── db.ts         // Handles database logic for merging and linking
├── types.ts      // Types and Zod schemas
└── prisma/
└── schema.prisma  // Prisma DB model definition

## 📦 NPM Scripts

Available commands:

* npm run dev – Start dev server with hot reload
* npm run build – Compile TypeScript to JavaScript
* npm start – Launch production server
* npm run db\:migrate – Apply DB migrations
* npm run db\:studio – Open Prisma Studio interface

## ⚡ Performance & Architecture Notes

* Efficient DB pooling via Prisma
* Graceful termination using signal handlers
* Cross-origin requests are supported
* Validations prevent invalid or unsafe input
* Uses soft deletion to avoid data loss

---

🔗 Links:

* Live API: (https://bitespeed-assignment-ktbc.onrender.com/identify)
* GitHub: (https://github.com/nakulkush/bitespeed-assignment)
* Health Check: (https://bitespeed-assignment-ktbc.onrender.com/health)

