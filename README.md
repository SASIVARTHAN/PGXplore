# PGXplore

A PG (Paying Guest) finder website for Chennai, built from your ChatGPT conversation spec.

## Project Structure

```
pg_website/
├── frontend/                 ← React app (UI + logic)
│   ├── index.html            ← HTML entry
│   ├── src/
│   │   ├── pages/            ← Route pages
│   │   ├── components/       ← Reusable UI
│   │   ├── data/pgData.js    ← Sample PG listings (JS)
│   │   ├── utils/            ← Vacancy logic, localStorage
│   │   └── styles/app.css    ← Custom CSS
│   └── src/index.css         ← Tailwind CSS
└── database/
    └── schema.sql            ← PostgreSQL schema (Phase 2)
```

## Features (User Side — Phase 1)

- **Entry page** — Continue as User or Login as Privileged Account
- **Home** — Hero, featured PGs, popular areas, recently updated/added, why PGXplore
- **Listings** — Search, filters (area, gender, rent, food, AC, vacancies), sort, skeleton loading
- **PG Detail** — Multi-image gallery, vacancy by sharing type, amenities, food type, reviews, similar PGs
- **Save PG** — localStorage (no login needed)
- **Recently viewed** — tracked automatically
- **Report incorrect info** — modal + localStorage
- **Privileged Accounts login** — demo dashboard with listing table
- **Mobile responsive** — bottom nav on mobile

## Vacancy Display

Instead of "Available: 5 / Total: 20", each PG shows:

- 🟢 Entire Single Room Available
- 🟢 2 Beds Available in Double Sharing
- 🔴 Triple Sharing Full

## Run Locally

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Privileged Accounts Demo Login

- Email: `admin@pgxplore.com`
- Password: `admin123`

## Build for Production

```bash
cd frontend
npm run build
npm run preview
```

## Phase 2 (Not Yet Built)

- Node.js + Express API
- PostgreSQL database (schema ready in `database/schema.sql`)
- Real admin CRUD for listings
- Image upload (Cloudinary/S3)
