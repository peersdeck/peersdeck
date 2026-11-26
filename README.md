# PeersDeck

**A home for founders, ideas and opportunities.** Built in Africa. Open to the world.

PeersDeck is an early-stage founder discovery platform. Visitors can browse public projects without an account. Members can register, create private project drafts and publish founder-submitted project profiles.

## Technology
- Next.js 16 and TypeScript
- Supabase Auth and PostgreSQL with row-level security
- Render hosting and automatic deployment from GitHub `main`

## Local development
1. Use Node.js 22 or later.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
5. Run `npm run dev`.

## Current MVP
- Public landing page and public project discovery.
- Clearly labelled, removable fictional demonstration cards (not real companies, users, funding or transactions).
- Email/password signup, login, session refresh and logout.
- Automatic profile row creation when an Auth user is created.
- Founder workspace and private project drafts.
- Project creation with overview, problem, solution, business model, category, country, stage and website.
- Optional immediate public publishing.
- Public project detail pages with founder information.
- Supabase row-level security: anonymous visitors can read published projects and their founders' public profiles; members can manage their own projects.

## Important limitations before commercial launch
- PeersDeck does not currently accept money, process investments, issue loans, facilitate equity, or verify project claims.
- Published project content is founder-submitted and should be moderated before the platform is promoted at scale.
- No messaging, mentor matching, comments, follows, payment ledger, KYC, investor onboarding or admin moderation console is enabled yet.
- Configure Supabase Auth email confirmation and a reliable production email provider before onboarding the public.
- Add country-specific legal review and appropriately licensed partners before introducing any donation, lending, equity, reward, pre-order or investment products.
- Do not treat founder-provided funding figures as verified payment totals. Any future campaign totals must come from reconciled payment records.

## Security
- Only the Supabase publishable key belongs in browser environment variables.
- Never expose the Supabase secret/service-role key in client code.
- Exposed public tables have RLS enabled. Review policies and Supabase advisors whenever the data model changes.
