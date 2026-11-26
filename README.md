# PeersDeck

**Africa's home for ideas, entrepreneurship and investment.**  
Built in Africa. Open to the world.

PeersDeck is a platform for founders to present ideas and businesses, build networks, discover mentors and supporters, and access appropriate growth opportunities.

## Technology
- Next.js and TypeScript
- Supabase for database, authentication and storage
- Render for hosting
- GitHub for source control

## Local development
1. Use Node.js 22 or later.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and add your Supabase project URL and publishable key.
4. Run `npm run dev`.

## Current stage
The public landing page and discovery placeholder are in place. Authentication and the founder workspace are being built next. The discovery page intentionally contains no fictitious projects, fundraising totals, or live investment offers.

## Financial and regulatory safeguards
Funding products must be separated by type (donation, reward, pre-order, loan, equity and revenue share). Investment instruments may be regulated securities. PeersDeck must use appropriately licensed partners and country-specific compliance before enabling regulated investment activity or handling funds. Campaign totals must eventually be driven by reconciled payment ledger entries, not manually entered totals. Verification is not a guarantee of profitability.

## Deployment
Render can deploy this repository using the included `render.yaml`. Configure Supabase environment variables in the Render service dashboard. Never commit secrets or expose a Supabase secret/service-role key in browser code.
