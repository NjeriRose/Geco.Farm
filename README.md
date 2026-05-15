# Geco Farm — Farm Management System for Kenya

A comprehensive, mobile-first farm management system built for Kenyan farmers. Track crops, livestock, inventory, finances, tasks, and weather — all in Kenyan Shillings (KSh) with local agricultural context.

## Features

- **Dashboard** — At-a-glance farm overview with revenue, expenses, active crops, livestock count, and weather
- **Crops Management** — Track plantings by field, season, and crop type (40+ Kenyan varieties)
- **Livestock Management** — Manage animals with health records, production tracking (30+ Kenyan breeds)
- **Inventory** — Track supplies with low-stock alerts and transaction history
- **Financial Tracking** — Expenses and sales in KES, M-Pesa references, profit/loss analysis
- **Task Management** — Prioritized farm tasks with due dates, categories, and completion tracking
- **Weather** — Real-time weather and 5-day forecast via OpenWeather API
- **Reports & Export** — PDF reports (jsPDF) and CSV export for financials, crops, livestock
- **Settings** — Profile management, farm details, GPS coordinates for weather

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS (mobile-first) |
| Backend | Supabase (Auth, Database, RLS) |
| Charts | Chart.js + react-chartjs-2 |
| PDF Reports | jsPDF + jspdf-autotable |
| File Export | file-saver |
| Icons | lucide-react |
| Notifications | react-hot-toast |
| Routing | React Router v6 |
| Date Utilities | date-fns |
| HTTP Client | axios (weather API) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A Supabase project (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/NjeriRose/Geco.Farm.git
cd Geco.Farm
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENWEATHER_API_KEY=your-openweather-api-key
```

Get your Supabase credentials from [supabase.com/dashboard](https://supabase.com/dashboard) → Project Settings → API.

Get an OpenWeather API key from [openweathermap.org](https://openweathermap.org/api) (free tier, 1000 calls/day).

### 3. Set Up Database

Run the SQL migrations in your Supabase SQL Editor (Dashboard → SQL Editor):

1. Run `supabase/migrations/001_initial_schema.sql` — Creates all tables, RLS policies, and triggers
2. Run `supabase/migrations/002_seed_data.sql` — Seeds crop types, livestock breeds, and inventory categories

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 5. Build for Production

```bash
npm run build
npm run preview  # preview the production build locally
```

## Project Structure

```
src/
├── lib/               # Core utilities
│   ├── supabase.ts    # Supabase client
│   ├── utils.ts       # Formatting (KSh, dates, phone numbers)
│   └── constants.ts   # Kenyan counties, categories, statuses
├── types/             # TypeScript interfaces for all 20 database tables
├── contexts/          # React contexts
│   ├── AuthContext.tsx # Authentication state & methods
│   └── FarmContext.tsx # Active farm selection & multi-farm support
├── hooks/             # Custom React hooks (CRUD operations)
│   ├── useFarms.ts
│   ├── useFields.ts
│   ├── useCrops.ts
│   ├── useLivestock.ts
│   ├── useInventory.ts
│   ├── useFinancials.ts
│   ├── useTasks.ts
│   ├── useWeather.ts
│   └── useDashboard.ts
├── components/
│   ├── ui/            # Reusable UI components (Button, Input, Modal, DataTable, etc.)
│   ├── layout/        # App layout (Sidebar, MobileNav, Header)
│   └── charts/        # Chart.js chart components
├── pages/             # Page components organized by module
│   ├── auth/          # Login, Register, Forgot Password
│   ├── onboarding/    # Farm Setup wizard
│   ├── dashboard/     # Main dashboard
│   ├── crops/         # Crop management
│   ├── livestock/     # Livestock management
│   ├── inventory/     # Inventory management
│   ├── finances/      # Financial tracking
│   ├── tasks/         # Task management
│   ├── weather/       # Weather page
│   ├── reports/       # Reports & exports
│   └── settings/      # Settings
├── services/          # External services
│   ├── weatherService.ts  # OpenWeather API integration
│   ├── pdfService.ts      # PDF report generation
│   └── exportService.ts   # CSV export utility
├── App.tsx            # Router & providers
├── main.tsx           # Entry point
└── index.css          # Tailwind + custom styles
```

## Database Schema

20 tables with Row-Level Security (RLS):

| Table | Description |
|-------|------------|
| `profiles` | User profiles (extends Supabase auth) |
| `farms` | Farm details with county, GPS, size |
| `farm_members` | Multi-tenant: owner, manager, worker roles |
| `fields` | Farm fields with soil type, irrigation |
| `crop_types` | Reference: 40+ Kenyan crop varieties |
| `plantings` | Crop plantings by field and season |
| `harvests` | Harvest records with quality grades |
| `livestock_types` | Reference: 30+ Kenyan livestock breeds |
| `livestock` | Individual animals with health tracking |
| `livestock_health_records` | Vaccinations, treatments, checkups |
| `production_records` | Milk, eggs, honey production |
| `inventory_categories` | Reference: inventory categories |
| `inventory` | Farm supplies with reorder alerts |
| `inventory_transactions` | Stock in/out transactions |
| `expenses` | Farm expenses (KES, M-Pesa support) |
| `sales` | Revenue tracking with buyer details |
| `tasks` | Farm task management |
| `activity_log` | Audit trail of farm activities |

All financial columns use `_kes` suffix (e.g., `amount_kes`, `seed_cost_kes`).

## Kenyan Agricultural Context

- **Currency**: All amounts in Kenyan Shillings (KSh), formatted as `KSh 1,234`
- **Counties**: All 47 Kenyan counties in selection dropdowns
- **Crops**: 40+ varieties including maize, beans, tea, coffee, sukuma wiki, potatoes
- **Livestock**: 30+ breeds including Friesian, Boran, Toggenburg, Kienyeji chicken, Nile tilapia
- **Seasons**: Long Rains (Mar–May), Short Rains (Oct–Dec), Irrigated, Year Round
- **Payments**: Cash, M-Pesa, Bank Transfer, Cheque, Credit
- **Phone format**: +254 7XX XXX XXX

## Mobile-First Design

Built for smartphone access (the primary way most African farmers go online):

- Bottom tab navigation on phones
- Card-based layouts instead of tables on small screens
- 44px minimum touch targets
- Full-screen modals that slide up from bottom
- Responsive breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- Safe area support for notched devices

## Security

- Row-Level Security (RLS) on every table ensures users only access their own farm data
- Multi-tenant isolation via `farm_members` table
- Auth handled by Supabase (email/password with email verification)
- Environment variables for all secrets (never hardcoded)
- `.env` excluded from git via `.gitignore`

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # ESLint check
npm run preview  # Preview production build
```

## License

Private — Geco Farm.
