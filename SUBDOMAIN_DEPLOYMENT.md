# Symone Subdomain Deployment Guide

## Overview

The Symone frontend supports conditional builds for subdomain deployment:

| Subdomain | Build Command | Output Directory | Content |
|-----------|--------------|------------------|---------|
| `app.symone.com` | `npm run build:app` | `dist-app/` | User Dashboard + Marketing |
| `admin.symone.com` | `npm run build:admin` | `dist-admin/` | Admin Panel only |
| Development | `npm run dev` | N/A | Everything |

---

## Build Commands

### User Dashboard (app.symone.com)
```bash
npm run build:app
```
Output: `dist-app/`

Includes:
- Marketing pages (/, /features, /pricing, /docs, /contact)
- User authentication (/login, /signup, /signin)
- User Dashboard (/dashboard/*)

### Admin Panel (admin.symone.com)
```bash
npm run build:admin
```
Output: `dist-admin/`

Includes:
- Admin login (/admin/login)
- Admin Dashboard (/admin/*)
- Redirects `/` to `/admin/login`

### Combined (Development)
```bash
npm run dev
# or
npm run build
```
Includes all routes for local development.

---

## Deployment Options

### Option 1: Vercel (Recommended)

Create two Vercel projects:

**App Project:**
```bash
# vercel.json for app.symone.com
{
  "buildCommand": "npm run build:app",
  "outputDirectory": "dist-app"
}
```

**Admin Project:**
```bash
# vercel.json for admin.symone.com
{
  "buildCommand": "npm run build:admin",
  "outputDirectory": "dist-admin"
}
```

### Option 2: Cloudflare Pages

Create two Pages projects:
- Project 1: `symone-app` → Build: `npm run build:app` → Directory: `dist-app`
- Project 2: `symone-admin` → Build: `npm run build:admin` → Directory: `dist-admin`

### Option 3: Single Server with Nginx

```nginx
# app.symone.com
server {
    server_name app.symone.com;
    root /var/www/symone/dist-app;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# admin.symone.com
server {
    server_name admin.symone.com;
    root /var/www/symone/dist-admin;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## API Configuration

Both subdomains connect to the same backend API. Update the API URL in your environment:

```bash
# .env.production for app.symone.com
VITE_API_URL=https://api.symone.com

# .env.production for admin.symone.com  
VITE_API_URL=https://api.symone.com
```

The backend already supports both:
- `/auth/*` → User authentication
- `/admin/*` → Admin authentication
- CORS allows both subdomains

---

## CORS Configuration

Update the FastAPI backend to allow both subdomains:

```python
# src/gateway/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://app.symone.com",
        "https://admin.symone.com",
        "https://api.symone.com",
        # Development
        "http://localhost:8080",
        "http://localhost:8081",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## DNS Setup

Point your domain's DNS records:

| Type | Name | Value |
|------|------|-------|
| A/CNAME | app | [Your app server/CDN] |
| A/CNAME | admin | [Your admin server/CDN] |
| A/CNAME | api | [Your API server] |

---

## Future: Split into Separate Apps

When ready to fully separate the apps:

1. Create `symone-app/` with only user dashboard code
2. Create `symone-admin/` with only admin panel code
3. Create `symone-shared/` for shared components (npm workspace)

This gives you:
- Smaller bundle sizes
- Independent deployments
- Separate CI/CD pipelines
