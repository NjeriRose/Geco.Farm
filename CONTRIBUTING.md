# Contributing to Geco Farm

## Development Setup

1. Follow the setup steps in [README.md](./README.md)
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes and test locally
4. Run lint: `npm run lint`
5. Run build: `npm run build`
6. Commit with clear messages: `git commit -m "feat: add feature description"`
7. Push and create a pull request

## Coding Standards

### TypeScript
- Strict mode enabled — no `any` types
- All interfaces defined in `src/types/database.ts`
- Use the existing type definitions rather than creating ad-hoc types

### React
- Functional components with hooks only
- Custom hooks in `src/hooks/` for all data operations
- Use `AuthContext` and `FarmContext` for global state
- Prefer composition over prop drilling

### Styling
- Tailwind CSS utility classes
- Mobile-first: start with mobile styles, add `md:` and `lg:` breakpoints
- Use the custom CSS classes from `src/index.css`: `card`, `btn-primary`, `input-base`, etc.
- Minimum touch target: 44px (`min-h-[44px]`)

### Currency
- All money values in Kenyan Shillings (KES)
- Use `formatKES()` from `src/lib/utils.ts` for display
- Database columns use `_kes` suffix: `amount_kes`, `cost_kes`, etc.
- Display format: `KSh 1,234`

### Naming Conventions
- Files: PascalCase for components (`Button.tsx`), camelCase for hooks (`useCrops.ts`)
- Components: PascalCase (`StatCard`, `DataTable`)
- Hooks: camelCase with `use` prefix (`usePlantings`)
- Database columns: snake_case (`planting_date`, `seed_cost_kes`)
- Constants: UPPER_SNAKE_CASE for arrays (`KENYAN_COUNTIES`)

## Project Architecture

```
Supabase (Auth + Postgres + RLS)
         ↕
   supabase.ts (client)
         ↕
   hooks/ (data layer)
         ↕
   contexts/ (global state)
         ↕
   pages/ → components/
```

## Adding a New Module

1. Define types in `src/types/database.ts`
2. Add database table via SQL migration in `supabase/migrations/`
3. Create a custom hook in `src/hooks/`
4. Create page component(s) in `src/pages/your-module/`
5. Add route in `src/App.tsx`
6. Add nav link in `src/components/layout/Sidebar.tsx` and `MobileNav.tsx`
7. Add constants to `src/lib/constants.ts`

## Commit Message Format

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation
- `style:` — Formatting
- `refactor:` — Code restructuring
- `chore:` — Build/config changes
