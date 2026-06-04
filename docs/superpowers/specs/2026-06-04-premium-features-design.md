# Premium Features Design — Job Application System
Date: 2026-06-04

## Overview

Four features that elevate the app to premium ATS-level quality. No applicant account required throughout.

---

## Feature 1: Multi-Step Application Wizard

### Design
Replace the single `ApplicationForm.jsx` with a 3-step wizard using numbered circles + labels (hybrid Ashby/Greenhouse style).

**Step 1 — Infos personnelles**
- full_name, email, phone, linkedin_url (optional)

**Step 2 — CV & Motivation**
- Resume upload (existing Vercel Blob logic, reused)
- cover_letter textarea with live character count (existing)
- years_experience, availability

**Step 3 — Finaliser**
- expected_salary, heard_from, visa_sponsorship, work_authorized, start_date
- Read-only summary of all previous answers before submit
- Submit button triggers POST /api/applications

### Navigation
- Next validates current step fields only (React Hook Form trigger())
- Back never re-validates, just goes back
- Step indicator: filled circle + label for completed, active circle for current, grey for future

### Components
- `MultiStepForm.jsx` replaces `ApplicationForm.jsx` in Apply.jsx
- `StepIndicator.jsx` — standalone step nav component
- Framer Motion slide animation between steps (x: direction-aware)

### Tests
- Update `ApplicationForm.test.jsx` → `MultiStepForm.test.jsx`
- Test: step 1 validation blocks Next, step nav renders correctly, submit fires on step 3

---

## Feature 2: Application Status Tracking (no account)

### Design
After submitting, applicant gets a unique URL to check their status anytime.

**DB change:** Add `tracking_token UUID DEFAULT gen_random_uuid()` to applications table.

**New API:** `GET /api/track/[token].js`
- Returns: `{ status, job_title, full_name, created_at }` — no sensitive data
- 404 if token not found

**New page:** `src/pages/TrackApplication.jsx` at route `/track/:token`
- Shows: applicant name, job title, current status (StatusBadge), submitted date
- Status timeline: visual steps showing New → Reviewing → Interview → Offer/Rejected
- No auth required

**Email update:** POST /api/applications already sends confirmation email — add tracking link to the email body: `Check your application status: https://yoursite.com/track/<token>`

### Tests
- `api/__tests__/track.test.js` — returns data for valid token, 404 for invalid
- `src/pages/__tests__/TrackApplication.test.jsx` — renders status and job title

---

## Feature 3: Automatic Status-Change Emails

### Design
When admin changes application status via PATCH /api/admin/applications/[id], send applicant an email if status changed.

**Logic in** `api/admin/applications/[id].js`:
- If PATCH body includes `status` and it differs from current status → send email
- Query DB for applicant email + name + job_title before updating
- Send Brevo email with status-specific template

**Email templates by status:**
- `Reviewing` → "Bonne nouvelle — votre candidature est en cours d'examen"
- `Interview` → "Félicitations — vous êtes invité(e) à un entretien"
- `Offer` → "Offre d'emploi — nous souhaitons vous faire une proposition"
- `Rejected` → "Mise à jour de votre candidature"

### Tests
- Update `api/__tests__/admin-applications-id.test.js` — PATCH with status change triggers email mock

---

## Feature 4: Company Culture Section (Home page)

### Design
New section inserted between the stats strip and Open Positions on the Home page.

**Content blocks:**
1. **Headline** — "Pourquoi nous rejoindre ?" with subtitle
2. **Perks grid** — 6 benefit cards (remote, santé, formation, congés, équipement, équipe)
3. **Employee quotes** — 3 testimonial cards (name, role, quote) — static content via constants

### Implementation
- New component `src/components/CultureSection.jsx`
- Content defined in `src/lib/culture.js` (easy to edit without touching JSX)
- Framer Motion stagger animation on scroll (useInView)
- Bootstrap grid, CSS variables for colors

### Tests
- `src/components/__tests__/CultureSection.test.jsx` — renders perks and testimonials

---

## DB Migration

```sql
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS tracking_token UUID DEFAULT gen_random_uuid();

UPDATE applications SET tracking_token = gen_random_uuid() WHERE tracking_token IS NULL;
```

Run via `scripts/db-migrate.js` (new file).
