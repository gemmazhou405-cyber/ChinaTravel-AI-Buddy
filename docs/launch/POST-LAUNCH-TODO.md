# Post-Launch TODO

Items deferred from launch. Prioritize by user language distribution from analytics.

---

## P1 — Phrase card traveler-side localization

**What:** `docs/launch/phrase-cards.json` currently only has `en` for the traveler-facing line
below the zh text. When the UI is in French/German/Spanish/Japanese/Korean, that line
stays in English.

**Why deferred:** zh protection is iron-clad (zh is never touched by i18n), and English
is acceptable for launch. The traveler-facing line is secondary to the zh text shown to
locals.

**How to fix:**
1. Add `fr`, `de`, `es`, `ja`, `ko` fields to every card in `phrase-cards.json` (91 cards × 5 = 455 strings — machine translation OK per _readme)
2. In `src/data/phraseCards/index.ts`, read `i18n.language` and pick the matching field
   (fall back to `en` if missing)
3. `card.zh` and `card.pinyin` must remain identical across all locale reads — never re-derive them

**Priority signal:** check analytics for user locale breakdown at 30 days post-launch.
If >15% of sessions are non-English, start with the top locale.

---

## P2 — Service worker cache strategy

Current SW (`public/sw.js`) uses a simple cache-first strategy and caches on first visit.
After a deploy, old cached assets serve until the user clears cache or SW updates.
Consider switching to a versioned precache list (workbox or manual CACHE_VERSION bump)
so deploys immediately invalidate stale chunks.
