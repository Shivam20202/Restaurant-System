# Shivam — Restaurant Reservation System

A full-stack restaurant reservation management system with role-based access (Customer and Admin), real-time table availability, and overlap prevention. Built as two separate projects: a Node/Express backend with MongoDB Atlas and a React 19 + Vite frontend with Tailwind CSS 4.3.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6, Tailwind CSS 4.3, React Router 7 |
| Backend | Node.js, Express 4, Mongoose 8 (MVC structure) |
| Database | MongoDB Atlas |
| Auth | JWT (stateless), bcryptjs password hashing |
| Fonts | Inter (body), Playfair Display (headings) |

---

## Project Structure

```
project/
├── backend/                       # Express API (MVC structure)
│   ├── src/
│   │   ├── config/db.js           # Mongoose connection
│   │   ├── controllers/           # Business logic (MVC controllers)
│   │   │   ├── authController.js
│   │   │   ├── tableController.js
│   │   │   └── reservationController.js  # Validation + overlap detection
│   │   ├── middleware/auth.js     # requireAuth + requireAdmin
│   │   ├── models/                # Mongoose schemas (MVC models)
│   │   │   ├── User.js
│   │   │   ├── Table.js
│   │   │   ├── Reservation.js
│   │   │   └── Restaurant.js
│   │   ├── routes/                # Route wiring (thin, delegates to controllers)
│   │   │   ├── authRoutes.js
│   │   │   ├── tableRoutes.js
│   │   │   └── reservationRoutes.js
│   │   ├── utils/jwt.js
│   │   └── server.js
│   ├── scripts/seed.js           # Seeds 8 restaurants, tables, users, reservations
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── lib/
│   │   │   ├── api.js             # API client (fetch wrapper)
│   │   │   └── auth.jsx           # Auth context provider
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx       # Includes role selection
│   │   │   ├── Reserve.jsx
│   │   │   ├── MyReservations.jsx
│   │   │   ├── AdminReservations.jsx
│   │   │   └── AdminTables.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- A MongoDB Atlas account (free tier works)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your MongoDB Atlas connection string
npm run seed    # Seeds 8 restaurants, tables, users, and sample reservations
npm run dev     # Starts API on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev     # Starts dev server on http://localhost:5173
```

The frontend proxies `/api` requests to `http://localhost:5000` during development (configured in `vite.config.js`). For production, set `VITE_API_URL` to your deployed backend URL.

### 3. Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@saveur.com | admin123 |
| Admin | jane@saveur.com | jane123 |
| Customer | john@example.com | john123 |
| Customer | alice@example.com | alice123 |
| Customer | bob@example.com | bob123 |
| Customer | carol@example.com | carol123 |

---

## Data Model

### User
```js
{
  _id: ObjectId,
  email: String,        // unique, lowercased
  password: String,     // bcrypt hash
  name: String,
  role: String,         // "customer" | "admin"
  createdAt: Date
}
```

### Table
```js
{
  _id: ObjectId,
  restaurantId: ObjectId,
  name: String,         // e.g. "Window Booth 1"
  seats: Number,        // seating capacity
  location: String,     // "Window", "Main Hall", "Patio", "Bar", "Private"
  isActive: Boolean,    // soft-disable without deleting
  createdAt: Date
}
```

### Reservation
```js
{
  _id: ObjectId,
  userId: ObjectId,          // the customer who booked
  tableId: ObjectId,        // the booked table
  restaurantId: ObjectId,
  date: String,             // "YYYY-MM-DD"
  time: String,              // "HH:MM"
  partySize: Number,        // number of guests
  durationMinutes: Number,   // default 90
  status: String,            // "confirmed" | "cancelled" | "completed" | "no_show"
  specialRequest: String,    // optional
  guestName: String,         // denormalized for admin view
  createdAt: Date
}
```

### Restaurant (seed data)
```js
{
  _id: ObjectId,
  name: String,
  cuisine: String,
  city: String,
  image: String,    // Pexels image URL
  createdAt: Date
}
```

### Key Design Decisions
- **Denormalized guest name** on the reservation — the admin dashboard can display guest names without a join per row.
- **Duration on each reservation** — defaulting to 90 minutes. This makes overlap detection flexible if different restaurants or services use different durations later.
- **Soft-delete for tables** (`isActive` flag) — existing reservations keep their table reference; the table just stops appearing in availability.
- **Role stored on the user document** — simple and sufficient for two roles. No separate roles collection needed.

---

## Role-Based Access (User vs Admin)

### Customer
- **Sign up** choosing the "Customer" role at registration.
- **Create a reservation** — pick date, time slot, party size; the system shows only tables with enough seats and no conflicting booking.
- **View their own reservations** — upcoming and past, separated.
- **Cancel their own reservations** — only confirmed future reservations can be cancelled.
- Cannot access `/admin/*` routes (redirected to home).

### Admin
- **Sign up** choosing the "Admin" role at registration (or use a seeded admin account).
- **View all reservations** across all customers, with search and status filtering.
- **Filter by date** — a date picker narrows the table to a specific day.
- **Update any reservation's status** — confirmed, completed, no-show, cancelled via inline dropdown.
- **Delete any reservation** permanently.
- **Manage tables** — add, edit, activate/deactivate, or delete tables.
- The admin interface is visually distinguished with an "Admin Dashboard" badge and a different navigation menu.


## Reservation & Availability Logic

This is the core validation area. All checks run on the backend; the frontend provides a responsive UI that reflects availability.

### Validation Steps (in `POST /api/reservations`)

1. **Required fields** — `tableId`, `date`, `time`, `partySize` must all be present.
2. **Table exists and is active** — inactive tables cannot be booked.
3. **Party size is a positive integer** — must be ≥ 1.
4. **Capacity check** — `partySize` must not exceed `table.seats`. Returns a clear error: `"Table 'Window Booth 1' seats 2 guests — not enough for 5"`.
5. **No past dates** — the reservation date must be today or later.
6. **Time format** — must match `HH:MM`.
7. **Overlap detection** — queries all confirmed reservations for the same table on the same date, then checks for time overlap using the formula:
   ```
   newStart < existingEnd  AND  existingStart < newEnd
   ```
   where `start` = reservation time and `end` = start + `durationMinutes` (default 90 min). If any overlap is found, returns a 409 conflict.

### Frontend Availability Display
- When the customer selects a date, the frontend fetches all reservations for that date.
- Time slots where all qualifying tables are already booked are visually disabled.
- When a time is selected, only tables with sufficient seats and no booking conflict at that time are shown as selectable.

### Cancellation
- Customers can cancel only their own confirmed future reservations.
- Admins can update any reservation's status (including cancelling) or delete it entirely.

---

## Assumptions

1. **Single restaurant per deployment** — the seed creates 8 restaurants with tables, but the reservation flow operates on the full table pool. The `restaurantId` field is stored for future multi-restaurant support.
2. **Fixed 90-minute reservation duration** — all reservations occupy 90 minutes. This is configurable per reservation in the data model but not exposed in the UI.
3. **Simple password policy** — per the assignment requirements, no strong password requirements are enforced. Any non-empty password is accepted.
4. **Self-registration for both roles** — users can choose "Customer" or "Admin" at signup. In a production system, admin creation would be restricted.
5. **Time slots are predefined** — 13 fixed slots from 12:00 to 21:00 in 30-minute increments during lunch and dinner hours.
6. **No email verification** — accounts are immediately active upon registration.
7. **JWT stored in localStorage** — sufficient for this assignment. Production would use httpOnly cookies.

---

## Known Limitations

1. **No multi-restaurant selection in the UI** — the data model supports it, but the reservation form books from the full table pool rather than filtering by restaurant.
2. **Fixed time slots** — customers pick from predefined slots rather than arbitrary times.
3. **No table combination** — a party of 10 cannot book two 6-seat tables; they must find a single table that seats them.
4. **No real-time updates** — if another customer books a table while you're on the form, you won't see it until you refresh or change the date.
5. **Admin role is self-selectable** — anyone can register as admin. Production would require an invitation or admin-promotion flow and also admin cannot create reservation.
6. **Restaurant images use a shared Pexels URL** — the seed uses the same image URL for all restaurants to keep the seed script simple. Replace with unique URLs for production.
7. **No pagination** — the admin dashboard loads all reservations at once. Fine for the seed dataset, but would need pagination for production scale.

---

## Areas for Improvement

1. **Multi-restaurant support** — add a restaurant selector to the reservation flow, filter tables by restaurant, and show restaurant cards on the home page.
2. **Arbitrary reservation times** — let customers pick any time and compute availability dynamically.
3. **Table combination logic** — allow splitting large parties across adjacent tables.
4. **Real-time availability** — use WebSockets or polling to update availability as other customers book.
5. **Email notifications** — send confirmation and reminder emails using a service like Resend or SendGrid.
6. **Admin invitation flow** — restrict admin account creation to existing admins.
7. **Pagination and sorting** — add server-side pagination for the admin reservations table.
8. **Dashboard analytics** — charts for occupancy rates, peak hours, and revenue.
9. **Recurring reservations** — let customers book weekly or monthly recurring tables.
10. **Waitlist** — when a table is fully booked, let customers join a waitlist and get notified on cancellation.
