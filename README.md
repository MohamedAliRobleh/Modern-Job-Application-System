# Modern Job Application System

A full-stack careers page with resume upload, job listings, and an admin dashboard.

## Stack

- **Frontend:** React 18 + Vite, Bootstrap 5.3, React Router v6, React Hook Form, Framer Motion, react-hot-toast
- **Auth:** Clerk (admin dashboard protection)
- **Database:** Neon Postgres (raw SQL via `@neondatabase/serverless`)
- **File storage:** Vercel Blob (resume uploads)
- **Email:** Brevo (applicant confirmation + admin notification)
- **Hosting:** Vercel (frontend + serverless API functions)

## Features

- Public job listings with search and filter
- Job detail pages with apply CTA
- Resume upload (PDF/DOC/DOCX, max 5 MB)
- Application form with cover letter and optional fields
- Email confirmation to applicant and admin on submission
- Admin dashboard (Clerk-protected) with:
  - Stats cards (total, new, interview, this week)
  - Paginated applications table with search/filter
  - Inline status updates
  - Expandable rows with full application details
  - Notes modal and delete with confirmation
  - CSV export

## Getting Started

```bash
npm install
npm run dev
```

## Environment Variables

Create a `.env.local` file with:

```
VITE_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
BREVO_API_KEY=
ADMIN_EMAIL=
```

## Testing

```bash
npm test
```

## Deployment

Deploy to Vercel. Set all environment variables in the Vercel project settings. The `vercel.json` rewrite rule ensures React Router works correctly.
