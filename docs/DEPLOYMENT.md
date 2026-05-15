# Geco Farm — Deployment Guide

## Prerequisites

- A Supabase project (free plan works for development)
- A hosting platform (Vercel, Netlify, or any static hosting)
- OpenWeather API key (free tier: 1000 calls/day)

## 1. Supabase Setup

### Create Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project in your organization
3. Note your **Project URL** and **anon key** from Settings → API

### Run Migrations

1. Open SQL Editor in Supabase Dashboard
2. Paste and run `supabase/migrations/001_initial_schema.sql`
3. Paste and run `supabase/migrations/002_seed_data.sql`

### Enable Auth

Supabase Auth is enabled by default. For production:

1. Go to Authentication → Providers
2. Enable Email/Password (already enabled by default)
3. Configure email templates in Authentication → Email Templates
4. Optionally enable email confirmation in Authentication → Settings

## 2. Environment Variables

Set these in your hosting platform's environment settings:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_OPENWEATHER_API_KEY=your-api-key
```

**Do not** set `SUPABASE_SERVICE_ROLE_KEY` in the frontend — it's only for server-side admin operations.

## 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_OPENWEATHER_API_KEY

# Deploy to production
vercel --prod
```

Or connect your GitHub repo in the Vercel dashboard for auto-deploys on push.

**Build settings:**
- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite

## 4. Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --dir=dist --prod
```

Or connect via Netlify dashboard. Add a `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

The redirect rule is essential for client-side routing (React Router).

## 5. Production Checklist

- [ ] Run database migrations on production Supabase
- [ ] Set all `VITE_*` environment variables
- [ ] Verify `.env` is NOT committed to git
- [ ] Enable email confirmation in Supabase Auth settings
- [ ] Set up custom SMTP for transactional emails (optional)
- [ ] Configure redirect rules for SPA routing
- [ ] Test on mobile devices
- [ ] Set up Supabase database backups (automatic on paid plans)

## 6. SPA Routing

Since Geco Farm is a Single Page Application (React Router), you need redirect rules so that direct URL access (e.g., `/dashboard`) serves `index.html`:

**Vercel**: Automatic with default settings.

**Netlify**: Add the redirect in `netlify.toml` (shown above).

**Nginx**:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Apache**: Add `.htaccess`:
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```
