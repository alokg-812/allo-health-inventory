# Allo Health Internship Assignment

A full-stack inventory reservation system built using React, Node.js, Express, Prisma, and PostgreSQL.

The goal of this project was to prevent overselling of products during checkout when multiple users try reserving the same inventory at the same time.

---

# Tech Stack

Frontend:
- React
- Vite
- Tailwind CSS

Backend:
- Node.js
- Express.js
- Prisma ORM

Database:
- PostgreSQL (Neon)

Deployment:
- Frontend → Vercel
- Backend → Render

---

# API Routes

| Method | Route |
|---|---|
| GET | `/api/products` |
| GET | `/api/warehouses` |
| POST | `/api/reservations` |
| POST | `/api/reservations/:id/confirm` |
| POST | `/api/reservations/:id/release` |

---

# Concurrency Handling

The main challenge in this assignment was preventing race conditions.

Example:
- Only 1 unit available
- Multiple users try reserving simultaneously

To solve this, I used:
- PostgreSQL transactions
- `SELECT ... FOR UPDATE` row locking

This ensures:
- only one reservation succeeds
- remaining requests safely return `409 Conflict`

I also created a concurrency test script:

```bash
node scripts/testConcurrency.js
````

Result:

```txt
201 → 1 success
409 → 19 failures
```

This confirms that overselling is prevented.

---

# Reservation Expiry

Reservations expire automatically after 10 minutes.

I used:

* `expiresAt` field
* `node-cron` job running every minute

Expired reservations are released back into inventory automatically.

---

# Running Locally

## Backend

```bash
cd server
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

## Frontend

```bash
cd client
npm install
npm run dev
```

---

# Environment Variables

## server/.env

```env
DATABASE_URL=
PORT=4000
CLIENT_URL=
```

## client/.env

```env
VITE_API_URL=
```

---

# Deployment

Frontend: Vercel

Backend: Render

Database: Neon PostgreSQL

