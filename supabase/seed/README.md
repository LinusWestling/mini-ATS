# Supabase Seed Data

This directory contains mock data to populate the application for development and demonstration purposes.

## Files
1. `01_companies.sql`: Basic company data.
2. `02_departments.sql`: Departments linked to companies.
3. `03_recruitment_processes.sql`: Recruitment processes for planning.
4. `04_jobs.sql`: Active job postings.
5. `05_candidates.sql`: Mock candidates.
6. `06_applications.sql`: Relations between candidates and jobs with statuses.

## How to use
To apply this seed data to your local Supabase instance, you can run them in order using the Supabase Dashboard SQL Editor or by concatenating them into `supabase/seed.sql`:

```bash
# On Windows (PowerShell)
Get-Content 01_companies.sql, 02_departments.sql, 03_recruitment_processes.sql, 04_jobs.sql, 05_candidates.sql, 06_applications.sql | Set-Content ../seed.sql

# On Mac/Linux
cat 01_companies.sql 02_departments.sql 03_recruitment_processes.sql 04_jobs.sql 05_candidates.sql 06_applications.sql > ../seed.sql
```

Then run:
```bash
supabase db reset
```
