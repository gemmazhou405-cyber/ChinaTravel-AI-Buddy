# October23: Separate personal-service prices from message passes

User reported that the pricing page's9.90 display could be interpreted as the price of the linked Fiverr personal itinerary service. The supplied screenshot shows a different Fiverr package amount; no external service price or exchange rate is inferred or copied into the site.

Clarify two existing products, without changing prices, checkout destinations, free route-check scope or fulfilment: shared Lin boxes state that personal reviews/reworks have separate Fiverr prices and digital message passes do not include that service. Rename the Fiverr button to "See personal planning prices on Fiverr". Before the existing pricing-page cards, show "Buddy AI message passes" and an explicit exclusion of Lin's personal review/rework. Add the same scope to homepage and in-tool pass displays. Shared JSON feeds React and raw HTML, including the pricing fallback/FAQ. Preserve Cloudflare's contact-only email exclusion and direct mailto.

Validation: typecheck/i18n,build and78-page quality audit pass;lint passes with the existing PricingPlans Fast Refresh warning. Digital amounts remain9.90/29.90; no personal-service starting price is asserted. No new indexable URL or sitemap change, no ranking/enquiry/sale effect claimed. Existing SEO observation windows are retained; this is a pricing-scope correction, not a price experiment.

Release: pending formal verification.
