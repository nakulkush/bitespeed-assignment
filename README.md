# Bitespeed Identity Reconciliation API

> A Node.js-based microservice to unify customer contact details across multiple data entries

## 🚀 API Endpoints

* *Base URL:* https://bitespeed-assignment-ktbc.onrender.com
* *Identify Contact:* POST /identify
* *Health Status:* GET /health

## 📖 Description

This backend service—built with TypeScript and Express—intelligently identifies and merges customer records based on email and/or phone numbers. It keeps track of primary and linked secondary contacts to provide a consistent customer profile across different touchpoints.

## 🛠 Technology Stack

* *Runtime:* Node.js with TypeScript
* *Framework:* Express.js
* *Database:* PostgreSQL (managed via Prisma ORM)
* *Validation:* Zod for schema enforcement
* *Hosting:* Render.com
* *Other Features:* CORS enabled, structured error responses, safe shutdown handling

## 📡 API Reference

### POST /identify

Unifies provided email and/or phone data with existing contact records, or creates a new one.

*Request Example:*

json
{
  "email": "customer@example.com",
  "phoneNumber": "123456789"
}


*Success Response (200 OK):*

json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["customer@example.com", "alt@example.com"],
    "phoneNumbers": ["123456789", "987654321"],
    "secondaryContactIds": [2, 3]
  }
}


*Validation Error Response (400):*

json
{
  "error": "Invalid input",
  "details": [/* Zod schema error details */]
}


### GET /health

Returns basic health status of the service.

*Sample Output:*

json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z"
}


## 🧠 Core Logic Summary

The contact reconciliation flow works as follows:

1. *Fresh Entry:* Creates a new primary record if no match exists
2. *Match Found:* Returns existing grouped contact data
3. *Partial Info:* Adds as secondary record if partial match (email/phone)
4. *Conflict Resolution:* Merges multiple primaries by keeping the earliest as the main one

*Highlights:*

* ✅ Eliminates contact duplication
* ✅ Handles multiple identities via linking
* ✅ Merges multiple entries dynamically
* ✅ Supports soft deletion with deletedAt
* ✅ Strong request validation using Zod
* ✅ Full-stack error reporting

## ⚙ Setup Guide

### Local Development

bash
# Clone repo and install dependencies
git clone https://github.com/yourusername/bitespeed-identity-reconciliation.git
cd bitespeed-identity-reconciliation
npm install

# Setup environment variables
echo 'DATABASE_URL="postgresql://user:pass@localhost:5432/bitespeed_db"' > .env
echo 'PORT=3000' >> .env

# Initialize database
npx prisma migrate dev
npx prisma generate

# Run development or production server
npm run dev    # Dev mode with live reload
npm start      # Prod mode


## 🚀 Deployment on Render

### Steps to Deploy

1. Connect your GitHub repo on Render
2. Set service type to *Web Service*
3. Define build command:

   
   npm install && npx prisma generate && npm run build
   
4. Set start command:

   
   npm start
   
5. Configure environment variables:

   
   DATABASE_URL=postgresql://[your-db-url]
   NODE_ENV=production
   

## 📁 Project Layout


src/
├── app.ts        # Core Express setup & routes
├── server.ts     # Initializes HTTP server and handles signals
├── db.ts         # Handles contact merge logic and DB access
├── types.ts      # Type definitions and Zod schema
└── prisma/
    └── schema.prisma  # Prisma DB schema definition


## 🧪 Scripts

bash
npm run dev         # Starts dev server with hot reloading
npm run build       # Compiles TypeScript
npm start           # Runs production server
npm run db:migrate  # Applies DB migrations
npm run db:studio   # Launches Prisma Studio UI


## ⚡ Optimization Details

* Utilizes Prisma’s connection pooling
* Supports graceful shutdown with signal handling
* Enables cross-origin requests for client access
* Validates and sanitizes inputs using Zod
* Preserves soft-deleted records with deletedAt

---

*🔗 Links:* [Live API](https://bitespeed-assignment-ktbc.onrender.com/identify) • [GitHub Repo](https://github.com/nakulkush/bitespeed-assignment) • [Health Endpoint](https://bitespeed-assignment-ktbc.onrender.com/health)

---

