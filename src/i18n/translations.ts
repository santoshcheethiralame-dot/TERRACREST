export type Lang = 'en' | 'kn'

type Entry = { en: string; kn: string }

/* ============================================================
   Translation dictionary — EN / KN, keyed by screen.namespace.
   Domain and legal shorthand (FSI, GDV, KYC, NDA-era terms now
   removed, CoA, PDF) stay in Latin script even in Kannada rows —
   that is how these terms are actually used in Bengaluru
   commercial real estate, in Kannada speech and writing alike.
   Proper nouns (Terracrest, firm names, registration numbers)
   are never transliterated. Place names ARE translated, since
   most are Kannada names to begin with (Devanahalli, etc.).
   ============================================================ */

export const translations: Record<string, Entry> = {
  // --- shared nav / chrome (reused across Landing, AppShell, footer) ---
  'nav.platform': { en: 'Platform', kn: 'ವೇದಿಕೆ' },
  'nav.intelligence': { en: 'Intelligence', kn: 'ಬುದ್ಧಿಮತ್ತೆ' },
  'nav.access': { en: 'Access', kn: 'ಪ್ರವೇಶ' },
  'nav.memberAccess': { en: 'Member Access', kn: 'ಸದಸ್ಯ ಪ್ರವೇಶ' },
  'cta.requestIntro': { en: 'Request an introduction', kn: 'ಪರಿಚಯಕ್ಕಾಗಿ ವಿನಂತಿಸಿ' },

  // --- hero ---
  'hero.eyebrow': { en: 'By invitation only — 20–200 principals — Bengaluru', kn: 'ಆಹ್ವಾನದ ಮೇರೆಗೆ ಮಾತ್ರ — 20–200 ಪ್ರಧಾನರು — ಬೆಂಗಳೂರು' },
  'hero.line1': { en: 'The market', kn: 'ನೀವು ಎಂದಿಗೂ' },
  'hero.line2': { en: 'you were never', kn: 'ನೋಡಬಾರದೆಂದಿದ್ದ' },
  'hero.line3': { en: 'meant to see.', kn: 'ಮಾರುಕಟ್ಟೆ.' },
  'hero.body': {
    en: 'A private advisory for land that never lists. Every parcel is walked and verified on the ground. Every principal is known to us by name — never brokered in the open.',
    kn: 'ಎಂದಿಗೂ ಪಟ್ಟಿಯಾಗದ ಭೂಮಿಗಾಗಿ ಒಂದು ಖಾಸಗಿ ಸಲಹಾ ಸೇವೆ. ಪ್ರತಿ ಭೂಖಂಡವನ್ನೂ ನಮ್ಮ ತಂಡ ಖುದ್ದಾಗಿ ನಡೆದು ಪರಿಶೀಲಿಸುತ್ತದೆ. ಪ್ರತಿ ಪ್ರಧಾನರೂ ನಮಗೆ ಹೆಸರಿನಿಂದ ಗೊತ್ತು — ಎಂದೂ ಬಹಿರಂಗವಾಗಿ ಮಧ್ಯಸ್ಥಿಕೆ ಮಾಡುವುದಿಲ್ಲ.',
  },

  // --- marquee tape ---
  'tape.jointDevelopment': { en: 'Joint development', kn: 'ಜಂಟಿ ಅಭಿವೃದ್ಧಿ' },
  'tape.warehouse': { en: 'Warehouse', kn: 'ಗೋದಾಮು' },
  'tape.bigLand': { en: 'Big land', kn: 'ವಿಶಾಲ ಭೂಮಿ' },
  'tape.verifiedGround': { en: 'Verified on the ground', kn: 'ಸ್ಥಳದಲ್ಲೇ ಪರಿಶೀಲಿಸಲಾಗಿದೆ' },
  'tape.membersOnly': { en: 'Members-only access', kn: 'ಸದಸ್ಯರಿಗೆ ಮಾತ್ರ ಪ್ರವೇಶ' },
  'tape.zeroListings': { en: 'Zero public listings', kn: 'ಸಾರ್ವಜನಿಕ ಪಟ್ಟಿ ಇಲ್ಲ' },
  'tape.bengaluru': { en: 'Bengaluru', kn: 'ಬೆಂಗಳೂರು' },

  // --- stats band ---
  'stats.principalsLabel': { en: 'Principals, ever', kn: 'ಒಟ್ಟು ಪ್ರಧಾನರು' },
  'stats.kycLabel': { en: 'In-person KYC', kn: 'ಖುದ್ದು ಕೆವೈಸಿ' },
  'stats.r2Label': { en: 'Valuation model R²', kn: 'ಮೌಲ್ಯಮಾಪನ ಮಾದರಿ R²' },
  'stats.listingsK': { en: 'Zero', kn: 'ಶೂನ್ಯ' },
  'stats.listingsLabel': { en: 'Public listings', kn: 'ಸಾರ್ವಜನಿಕ ಪಟ್ಟಿಗಳು' },

  // --- platform section ---
  'platform.eyebrow': { en: 'The platform', kn: 'ವೇದಿಕೆ' },
  'platform.title1': { en: 'Not a portal.', kn: 'ಇದು ಪೋರ್ಟಲ್ ಅಲ್ಲ.' },
  'platform.title2': { en: 'A principal.', kn: 'ಇದೊಂದು ಪ್ರಧಾನ.' },

  'row1.title': { en: "Walked before it's shown.", kn: 'ತೋರಿಸುವ ಮೊದಲು ನಡೆದು ನೋಡಲಾಗುತ್ತದೆ.' },
  'row1.body': {
    en: 'No parcel goes live until our team walks the land, inspects the title chain, and confirms every survey number against the record. Nothing here is scraped, syndicated, or self-listed — the book is small because the bar is high.',
    kn: 'ನಮ್ಮ ತಂಡ ಭೂಮಿಯನ್ನು ಖುದ್ದಾಗಿ ನಡೆದು, ಒಡೆತನದ ದಾಖಲೆ ಪರಿಶೀಲಿಸಿ, ಪ್ರತಿ ಸರ್ವೆ ನಂಬರ್ ಅನ್ನು ದಾಖಲೆಯೊಂದಿಗೆ ತಾಳೆ ನೋಡುವವರೆಗೆ ಯಾವ ಭೂಖಂಡವೂ ಪ್ರಕಟವಾಗುವುದಿಲ್ಲ. ಇಲ್ಲಿ ಯಾವುದೂ ಸ್ಕ್ರ್ಯಾಪ್ ಮಾಡಿದ್ದಲ್ಲ, ಸ್ವಯಂ-ಪಟ್ಟಿ ಮಾಡಿದ್ದಲ್ಲ — ಗುಣಮಟ್ಟ ಎತ್ತರವಿರುವ ಕಾರಣ ಪಟ್ಟಿ ಚಿಕ್ಕದಾಗಿದೆ.',
  },

  'row2.title': { en: 'Verified once. Open always.', kn: 'ಒಮ್ಮೆ ಪರಿಶೀಲನೆ. ಸದಾ ಪೂರ್ಣ ಪ್ರವೇಶ.' },
  'row2.body': {
    en: 'Membership itself is the gate — verified once, in person, by the desk. From there, every parcel opens in full: exact location, ownership, and the complete document vault, enforced by the server itself, not hidden in the interface.',
    kn: 'ಸದಸ್ಯತ್ವವೇ ಮುಖ್ಯದ್ವಾರ — ಡೆಸ್ಕ್‌ನಿಂದ ಒಮ್ಮೆ, ಖುದ್ದಾಗಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ. ಅಲ್ಲಿಂದ ಮುಂದೆ, ಪ್ರತಿ ಭೂಖಂಡವೂ ಪೂರ್ಣವಾಗಿ ತೆರೆದುಕೊಳ್ಳುತ್ತದೆ — ನಿಖರ ಸ್ಥಳ, ಒಡೆತನ, ಮತ್ತು ಸಂಪೂರ್ಣ ದಾಖಲೆ ಕೋಶ — ಇಂಟರ್ಫೇಸ್‌ನಲ್ಲಿ ಅಲ್ಲ, ಸ್ವತಃ ಸರ್ವರ್‌ನಿಂದಲೇ ಜಾರಿಗೊಳಿಸಲಾಗಿದೆ.',
  },

  'row3.title': { en: 'Priced by a model that learns.', kn: 'ಕಲಿಯುವ ಮಾದರಿಯಿಂದ ಬೆಲೆ ನಿಗದಿ.' },
  'row3.body': {
    en: "A parametric engine models every parcel's development value live — then a learned model corrects it, trained on what our empanelled architects actually sign. Every delivery sharpens the corpus. The number comes with calibrated uncertainty, never false precision.",
    kn: 'ಒಂದು ಪ್ಯಾರಾಮೆಟ್ರಿಕ್ ಎಂಜಿನ್ ಪ್ರತಿ ಭೂಖಂಡದ ಅಭಿವೃದ್ಧಿ ಮೌಲ್ಯವನ್ನು ನೇರವಾಗಿ ಲೆಕ್ಕ ಹಾಕುತ್ತದೆ — ನಂತರ ಕಲಿತ ಮಾದರಿಯೊಂದು ನಮ್ಮ ಪಟ್ಟಿಯಲ್ಲಿರುವ ವಾಸ್ತುಶಿಲ್ಪಿಗಳು ನಿಜವಾಗಿ ಅಂಗೀಕರಿಸಿದ್ದನ್ನು ಆಧರಿಸಿ ಅದನ್ನು ಸರಿಪಡಿಸುತ್ತದೆ. ಪ್ರತಿ ವಿತರಣೆಯೂ ಮಾಹಿತಿ ಸಂಗ್ರಹವನ್ನು ಇನ್ನಷ್ಟು ನಿಖರಗೊಳಿಸುತ್ತದೆ. ಸಂಖ್ಯೆಯೊಂದಿಗೆ ಅಳೆದ ಅನಿಶ್ಚಿತತೆ ಇರುತ್ತದೆ, ಸುಳ್ಳು ನಿಖರತೆ ಎಂದಿಗೂ ಇಲ್ಲ.',
  },

  'row4.title': { en: 'Signed off by a human.', kn: 'ಮನುಷ್ಯನ ಅಂಗೀಕಾರದೊಂದಿಗೆ.' },
  'row4.body': {
    en: "Machine speed, human credibility. Commission the empanelled architect from the Studio and a stamped, buildable figure returns beside the model's — variance shown, drawings issued to your deal room.",
    kn: 'ಯಂತ್ರದ ವೇಗ, ಮನುಷ್ಯನ ವಿಶ್ವಾಸಾರ್ಹತೆ. ಸ್ಟುಡಿಯೋದಿಂದಲೇ ಪಟ್ಟಿಯಲ್ಲಿರುವ ವಾಸ್ತುಶಿಲ್ಪಿಯನ್ನು ನಿಯೋಜಿಸಿ — ಮುದ್ರೆಯೊತ್ತಿದ, ನಿರ್ಮಾಣ-ಸಿದ್ಧ ಅಂಕಿ ಮಾದರಿಯ ಅಂಕಿಯ ಪಕ್ಕದಲ್ಲೇ ಬರುತ್ತದೆ — ವ್ಯತ್ಯಾಸ ತೋರಿಸಲಾಗುತ್ತದೆ, ರೇಖಾಚಿತ್ರಗಳು ನಿಮ್ಮ ಡೀಲ್ ರೂಮ್‌ಗೆ ತಲುಪುತ್ತವೆ.',
  },

  // --- row visuals ---
  'visual.manifestCaption': { en: 'Verification manifest', kn: 'ಪರಿಶೀಲನಾ ಪಟ್ಟಿ' },
  'visual.manifestRow1k': { en: 'Title chain traced', kn: 'ಒಡೆತನದ ಸರಪಳಿ ಪತ್ತೆಹಚ್ಚಲಾಗಿದೆ' },
  'visual.manifestRow1v': { en: '30 yrs · clean', kn: '30 ವರ್ಷ · ನಿರ್ಮಲ' },
  'visual.manifestRow2k': { en: 'Survey nos. cross-checked', kn: 'ಸರ್ವೆ ನಂಬರ್ ತಾಳೆ ಪರಿಶೀಲನೆ' },
  'visual.manifestRow2v': { en: 'DTP record', kn: 'ಡಿಟಿಪಿ ದಾಖಲೆ' },
  'visual.manifestRow3k': { en: 'Encumbrance certificate', kn: 'ಋಣಭಾರ ಪ್ರಮಾಣಪತ್ರ' },
  'visual.manifestRow3v': { en: 'nil charges', kn: 'ಯಾವುದೇ ಹೊರೆ ಇಲ್ಲ' },
  'visual.manifestRow4k': { en: 'Site walked', kn: 'ಸ್ಥಳ ಪರಿಶೀಲನೆ' },
  'visual.manifestRow4v': { en: '12 Jun 2026', kn: '12 ಜೂನ್ 2026' },
  'visual.manifestFooter': { en: 'Physically verified — Terracrest site team', kn: 'ಖುದ್ದು ಪರಿಶೀಲಿಸಲಾಗಿದೆ — ಟೆರಾಕ್ರೆಸ್ಟ್ ಸ್ಥಳ ತಂಡ' },

  'visual.membershipCaption': { en: 'Membership verification · one-time', kn: 'ಸದಸ್ಯತ್ವ ಪರಿಶೀಲನೆ · ಒಮ್ಮೆ ಮಾತ್ರ' },
  'visual.membershipRow1k': { en: 'Referred by an existing principal', kn: 'ಈಗಿರುವ ಪ್ರಧಾನರಿಂದ ಶಿಫಾರಸು' },
  'visual.membershipRow1v': { en: 'network', kn: 'ಜಾಲ' },
  'visual.membershipRow2k': { en: 'Identity verified in person', kn: 'ಗುರುತು ಖುದ್ದು ಪರಿಶೀಲನೆ' },
  'visual.membershipRow2v': { en: 'KYC', kn: 'ಕೆವೈಸಿ' },
  'visual.membershipRow3k': { en: 'Bank / CA reference checked', kn: 'ಬ್ಯಾಂಕ್ / ಸಿಎ ಉಲ್ಲೇಖ ಪರಿಶೀಲನೆ' },
  'visual.membershipRow3v': { en: 'financial', kn: 'ಆರ್ಥಿಕ' },
  'visual.membershipRow4k': { en: 'Credentials issued by the desk', kn: 'ಡೆಸ್ಕ್‌ನಿಂದ ಪ್ರಮಾಣಪತ್ರ ವಿತರಣೆ' },
  'visual.membershipRow4v': { en: 'issued', kn: 'ವಿತರಿಸಲಾಗಿದೆ' },
  'visual.membershipFooter': { en: 'Verified once — open in full, every time after', kn: 'ಒಮ್ಮೆ ಪರಿಶೀಲಿಸಿದ ಮೇಲೆ — ಪ್ರತಿ ಬಾರಿಯೂ ಪೂರ್ಣ ಪ್ರವೇಶ' },

  'visual.modelCaption': { en: 'Valuation model · ridge regression', kn: 'ಮೌಲ್ಯಮಾಪನ ಮಾದರಿ · ರಿಡ್ಜ್ ರಿಗ್ರೆಶನ್' },
  'visual.modelHoldout': { en: 'holdout', kn: 'ಹೋಲ್ಡ್‌ಔಟ್' },
  'visual.modelBar1': { en: 'High-rise premium floors', kn: 'ಎತ್ತರದ ಪ್ರೀಮಿಯಂ ಮಹಡಿಗಳು' },
  'visual.modelBar2': { en: 'FSI', kn: 'FSI' },
  'visual.modelBar3': { en: 'Sale price assumption', kn: 'ಮಾರಾಟ ಬೆಲೆ ಅಂದಾಜು' },
  'visual.modelBar4': { en: 'Floor-plate efficiency', kn: 'ಫ್ಲೋರ್-ಪ್ಲೇಟ್ ದಕ್ಷತೆ' },
  'visual.modelFooter': { en: 'Every architect delivery becomes a labelled training example.', kn: 'ಪ್ರತಿ ವಾಸ್ತುಶಿಲ್ಪಿ ವಿತರಣೆಯೂ ತರಬೇತಿ ದತ್ತಾಂಶದ ಒಂದು ಉದಾಹರಣೆಯಾಗುತ್ತದೆ.' },

  'visual.architectCaption': { en: 'Stage two · architect validation', kn: 'ಹಂತ ಎರಡು · ವಾಸ್ತುಶಿಲ್ಪಿ ದೃಢೀಕರಣ' },
  'visual.studioModelLabel': { en: 'Studio model', kn: 'ಸ್ಟುಡಿಯೋ ಮಾದರಿ' },
  'visual.architectStampedLabel': { en: 'Architect · stamped', kn: 'ವಾಸ್ತುಶಿಲ್ಪಿ · ಮುದ್ರೆಯೊತ್ತಿದ' },
  'visual.varianceLabel': { en: 'Variance to model', kn: 'ಮಾದರಿಗೆ ವ್ಯತ್ಯಾಸ' },

  // --- studio tease ---
  'studioTease.eyebrow': { en: 'The feasibility studio', kn: 'ಕಾರ್ಯಸಾಧ್ಯತಾ ಸ್ಟುಡಿಯೋ' },
  'studioTease.title1': { en: 'Model the profit', kn: 'ಶುಲ್ಕ ಪಾವತಿಗೆ ಮೊದಲೇ' },
  'studioTease.title2': { en: 'before the fee.', kn: 'ಲಾಭ ಲೆಕ್ಕ ಹಾಕಿ.' },
  'studioTease.body': {
    en: "Draw a parcel's massing from its own by-laws, assign materials surface by surface, and watch a three-zone development value resolve live — corrected by the model, banded by its uncertainty.",
    kn: 'ಭೂಖಂಡದ ಸ್ವಂತ ನಿಯಮಗಳಿಂದಲೇ ಕಟ್ಟಡ ವಿನ್ಯಾಸ ರಚಿಸಿ, ಮೇಲ್ಮೈವಾರು ಸಾಮಗ್ರಿ ಆಯ್ಕೆಮಾಡಿ, ಮೂರು-ವಲಯ ಅಭಿವೃದ್ಧಿ ಮೌಲ್ಯ ನೇರವಾಗಿ ಮೂಡುವುದನ್ನು ನೋಡಿ — ಮಾದರಿಯಿಂದ ಸರಿಪಡಿಸಲ್ಪಟ್ಟ, ಅನಿಶ್ಚಿತತೆಯ ವ್ಯಾಪ್ತಿಯೊಂದಿಗೆ.',
  },
  'studioTease.cta': { en: 'Enter the studio', kn: 'ಸ್ಟುಡಿಯೋ ಪ್ರವೇಶಿಸಿ' },
  'studioTease.tickerLocation': { en: 'JD-BLR-2026-012 · DEVANAHALLI', kn: 'JD-BLR-2026-012 · ದೇವನಹಳ್ಳಿ' },

  // --- GDV ticker (shared: landing tease + Studio app) ---
  'ticker.live': { en: 'Live', kn: 'ಲೈವ್' },
  'ticker.ndvLabel': { en: 'ML-adjusted NDV · market', kn: 'ML-ಹೊಂದಾಣಿಕೆ NDV · ಮಾರುಕಟ್ಟೆ' },
  'ticker.vsParametric': { en: 'vs parametric', kn: 'ಪ್ಯಾರಾಮೆಟ್ರಿಕ್‌ಗೆ ಹೋಲಿಸಿ' },
  'zone.bear': { en: 'Bear', kn: 'ಬೇರ್' },
  'zone.base': { en: 'Base', kn: 'ಬೇಸ್' },
  'zone.bull': { en: 'Bull', kn: 'ಬುಲ್' },

  // --- protocol ---
  'protocol.title': { en: 'The protocol.', kn: 'ಪ್ರಕ್ರಿಯೆ.' },
  'protocol.step1Title': { en: 'Introduction', kn: 'ಪರಿಚಯ' },
  'protocol.step1Body': {
    en: 'Referred by an existing principal. KYC is completed in person, at the desk — never online.',
    kn: 'ಈಗಿರುವ ಪ್ರಧಾನರಿಂದ ಶಿಫಾರಸು. ಕೆವೈಸಿ ಡೆಸ್ಕ್‌ನಲ್ಲಿ ಖುದ್ದಾಗಿ ಪೂರ್ಣಗೊಳ್ಳುತ್ತದೆ — ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಎಂದಿಗೂ ಇಲ್ಲ.',
  },
  'protocol.step2Title': { en: 'Verification', kn: 'ಪರಿಶೀಲನೆ' },
  'protocol.step2Body': {
    en: 'The desk verifies identity, references, and standing — once, in person. There is nothing further to sign.',
    kn: 'ಡೆಸ್ಕ್ ಗುರುತು, ಉಲ್ಲೇಖಗಳು, ಮತ್ತು ಸ್ಥಾನಮಾನವನ್ನು ಒಮ್ಮೆ, ಖುದ್ದಾಗಿ ಪರಿಶೀಲಿಸುತ್ತದೆ. ಮತ್ತೆ ಸಹಿ ಮಾಡುವ ಅಗತ್ಯವಿಲ್ಲ.',
  },
  'protocol.step3Title': { en: 'Full access', kn: 'ಪೂರ್ಣ ಪ್ರವೇಶ' },
  'protocol.step3Body': {
    en: 'Credentials issued. Every parcel opens in full — exact location, ownership, the document vault, the deal room, the studio.',
    kn: 'ಪ್ರಮಾಣಪತ್ರ ವಿತರಣೆಯಾಗುತ್ತದೆ. ಪ್ರತಿ ಭೂಖಂಡವೂ ಪೂರ್ಣವಾಗಿ ತೆರೆದುಕೊಳ್ಳುತ್ತದೆ — ನಿಖರ ಸ್ಥಳ, ಒಡೆತನ, ದಾಖಲೆ ಕೋಶ, ಡೀಲ್ ರೂಮ್, ಸ್ಟುಡಿಯೋ.',
  },
  'protocol.caption': { en: 'No sign-up · No OTP · No public listings', kn: 'ನೋಂದಣಿ ಇಲ್ಲ · OTP ಇಲ್ಲ · ಸಾರ್ವಜನಿಕ ಪಟ್ಟಿ ಇಲ್ಲ' },

  // --- footer ---
  'footer.line1': { en: 'A PRIVATE DEAL PORTAL, NOT A LISTING SERVICE.', kn: 'ಇದೊಂದು ಖಾಸಗಿ ವ್ಯವಹಾರ ವೇದಿಕೆ, ಪಟ್ಟಿ ಸೇವೆ ಅಲ್ಲ.' },
  'footer.line2': { en: 'ALL PARCELS PHYSICALLY INSPECTED.', kn: 'ಎಲ್ಲಾ ಭೂಖಂಡಗಳನ್ನೂ ಖುದ್ದು ಪರಿಶೀಲಿಸಲಾಗಿದೆ.' },
  'footer.copyright': { en: 'BENGALURU · © MMXXVI', kn: 'ಬೆಂಗಳೂರು · © MMXXVI' },

  // --- language toggle itself ---
  'lang.en': { en: 'EN', kn: 'EN' },
  'lang.kn': { en: 'KN', kn: 'ಕನ್ನಡ' },

  // --- roles (shared: AppShell, Login demo buttons, admin forms) ---
  'role.builder': { en: 'Builder', kn: 'ಬಿಲ್ಡರ್' },
  'role.landowner': { en: 'Land Owner', kn: 'ಭೂ ಮಾಲೀಕ' },
  'role.investor': { en: 'Investor', kn: 'ಹೂಡಿಕೆದಾರ' },
  'role.admin': { en: 'Admin', kn: 'ಅಡ್ಮಿನ್' },
  'role.deskShort': { en: 'Desk', kn: 'ಡೆಸ್ಕ್' },

  // --- app shell (persistent chrome on every authenticated screen) ---
  'appshell.signOut': { en: 'Sign out', kn: 'ಸೈನ್ ಔಟ್' },

  // --- login ---
  'login.leftEyebrow': { en: 'BY INVITATION ONLY · 20–200 PRINCIPALS · BENGALURU', kn: 'ಆಹ್ವಾನದ ಮೇರೆಗೆ ಮಾತ್ರ · 20–200 ಪ್ರಧಾನರು · ಬೆಂಗಳೂರು' },
  'login.leftHeadline1': { en: 'The market you were', kn: 'ನೀವು ಎಂದಿಗೂ ನೋಡಬಾರದೆಂದಿದ್ದ' },
  'login.leftHeadline2': { en: 'never meant to see.', kn: 'ಮಾರುಕಟ್ಟೆ.' },
  'login.headline': { en: 'State your name.', kn: 'ನಿಮ್ಮ ಹೆಸರು ತಿಳಿಸಿ.' },
  'login.subhead': { en: 'Credentials are issued by the desk after in-person KYC.', kn: 'ಖುದ್ದು ಕೆವೈಸಿ ನಂತರ ಡೆಸ್ಕ್‌ನಿಂದ ಪ್ರಮಾಣಪತ್ರ ವಿತರಿಸಲಾಗುತ್ತದೆ.' },
  'login.username': { en: 'Username', kn: 'ಬಳಕೆದಾರ ಹೆಸರು' },
  'login.password': { en: 'Password', kn: 'ಪಾಸ್‌ವರ್ಡ್' },
  'login.verifying': { en: 'Verifying…', kn: 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…' },
  'login.enter': { en: 'Enter', kn: 'ಪ್ರವೇಶಿಸಿ' },
  'login.noSignup': { en: 'NO SIGN-UP · NO OTP · NO ONLINE RESET', kn: 'ನೋಂದಣಿ ಇಲ್ಲ · OTP ಇಲ್ಲ · ಆನ್‌ಲೈನ್ ರೀಸೆಟ್ ಇಲ್ಲ' },
  'login.demoAccess': { en: 'Demo access — password "demo"', kn: 'ಡೆಮೊ ಪ್ರವೇಶ — ಪಾಸ್‌ವರ್ಡ್ "demo"' },
  'login.return': { en: 'Return', kn: 'ಹಿಂತಿರುಗಿ' },
  'login.errorServer': { en: 'Could not reach the advisory server. Please try again.', kn: 'ಅಡ್ವೈಸರಿ ಸರ್ವರ್ ತಲುಪಲಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.' },
  'login.errorCredentials': { en: 'Credentials not recognised. Access is by admin-issued login only.', kn: 'ಪ್ರಮಾಣಪತ್ರಗಳು ಗುರುತಿಸಲ್ಪಡಲಿಲ್ಲ. ಪ್ರವೇಶ ಅಡ್ಮಿನ್-ವಿತರಿತ ಲಾಗಿನ್‌ನಿಂದ ಮಾತ್ರ.' },

  // --- shared nav / domain enums ---
  'nav.discovery': { en: 'Discovery', kn: 'ಅನ್ವೇಷಣೆ' },
  'vertical.jointDevelopment': { en: 'Joint Development', kn: 'ಜಂಟಿ ಅಭಿವೃದ್ಧಿ' },
  'vertical.warehouse': { en: 'Warehouse', kn: 'ಗೋದಾಮು' },
  'vertical.bigLand': { en: 'Big Land', kn: 'ವಿಶಾಲ ಭೂಮಿ' },
  'status.draft': { en: 'Draft', kn: 'ಕರಡು' },
  'status.documentsUploaded': { en: 'Documents Uploaded', kn: 'ದಾಖಲೆಗಳು ಅಪ್‌ಲೋಡ್ ಆಗಿವೆ' },
  'status.underReview': { en: 'Under Admin Review', kn: 'ಆಡಳಿತ ಪರಿಶೀಲನೆಯಲ್ಲಿ' },
  'status.verified': { en: 'Verified', kn: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ' },
  'status.live': { en: 'Live', kn: 'ಲೈವ್' },
  'status.underOffer': { en: 'Under Offer', kn: 'ಆಫರ್‌ನಲ್ಲಿ' },
  'status.closed': { en: 'Closed', kn: 'ಮುಚ್ಚಲಾಗಿದೆ' },
  'dealStage.newLead': { en: 'New Lead', kn: 'ಹೊಸ ಲೀಡ್' },
  'dealStage.engaged': { en: 'Engaged', kn: 'ತೊಡಗಿಸಿಕೊಂಡಿದೆ' },
  'dealStage.siteVisit': { en: 'Site Visit', kn: 'ಸ್ಥಳ ಭೇಟಿ' },
  'dealStage.termSheet': { en: 'Term Sheet', kn: 'ಟರ್ಮ್ ಶೀಟ್' },

  // --- builder dashboard ---
  'builder.headline': { en: 'Curated for you.', kn: 'ನಿಮಗಾಗಿ ಆಯ್ದದ್ದು.' },
  'builder.body': {
    en: 'Parcels chosen by your relationship manager — not an algorithm. Every parcel here is verified on the ground, and every detail opens in full — membership is the only gate.',
    kn: 'ನಿಮ್ಮ ಸಂಬಂಧ ವ್ಯವಸ್ಥಾಪಕರು ಆಯ್ಕೆ ಮಾಡಿದ ಭೂಖಂಡಗಳು — ಅಲ್ಗಾರಿದಮ್ ಅಲ್ಲ. ಇಲ್ಲಿರುವ ಪ್ರತಿ ಭೂಖಂಡವೂ ಸ್ಥಳದಲ್ಲೇ ಪರಿಶೀಲಿಸಲ್ಪಟ್ಟಿದೆ, ಪ್ರತಿ ವಿವರವೂ ಪೂರ್ಣವಾಗಿ ತೆರೆದುಕೊಳ್ಳುತ್ತದೆ — ಸದಸ್ಯತ್ವವೊಂದೇ ದ್ವಾರ.',
  },
  'builder.emptyBook': { en: 'The desk is preparing your book — check back shortly.', kn: 'ಡೆಸ್ಕ್ ನಿಮ್ಮ ಪಟ್ಟಿಯನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತಿದೆ — ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಪರಿಶೀಲಿಸಿ.' },

  // --- listing card ---
  'listingCard.fullAccess': { en: 'Full access', kn: 'ಪೂರ್ಣ ಪ್ರವೇಶ' },
  'listingCard.guidance': { en: 'Guidance', kn: 'ಮಾರ್ಗದರ್ಶನ' },

  // --- parcel map ---
  'map.exactLocation': { en: 'Exact location', kn: 'ನಿಖರ ಸ್ಥಳ' },
  'map.approximateArea': { en: 'Approximate area', kn: 'ಅಂದಾಜು ಪ್ರದೇಶ' },

  // --- listing detail ---
  'listing.retrieving': { en: 'Retrieving parcel…', kn: 'ಭೂಖಂಡ ಪಡೆಯಲಾಗುತ್ತಿದೆ…' },
  'listing.notFound': { en: 'Parcel not found', kn: 'ಭೂಖಂಡ ಸಿಗಲಿಲ್ಲ' },
  'listing.backToDiscovery': { en: 'Back to discovery', kn: 'ಅನ್ವೇಷಣೆಗೆ ಹಿಂತಿರುಗಿ' },
  'listing.verifiedSeal': { en: '· PHYSICALLY VERIFIED · TERRACREST ', kn: '· ಖುದ್ದು ಪರಿಶೀಲಿಸಲಾಗಿದೆ · TERRACREST ' },
  'listing.fullDossier': { en: 'Full dossier', kn: 'ಪೂರ್ಣ ದಾಖಲೆ' },
  'listing.exactLocation': { en: 'Exact location', kn: 'ನಿಖರ ಸ್ಥಳ' },
  'listing.gps': { en: 'GPS', kn: 'GPS' },
  'listing.ownerOfRecord': { en: 'Owner of record', kn: 'ದಾಖಲೆಯಲ್ಲಿನ ಮಾಲೀಕ' },
  'listing.surveyNumbers': { en: 'Survey numbers', kn: 'ಸರ್ವೆ ನಂಬರ್‌ಗಳು' },
  'listing.contactHistory': { en: 'Contact history', kn: 'ಸಂಪರ್ಕ ಇತಿಹಾಸ' },
  'listing.documentVault': { en: 'Document vault', kn: 'ದಾಖಲೆ ಕೋಶ' },
  'listing.watermarkNotice': { en: 'Every view and download is watermarked and logged.', kn: 'ಪ್ರತಿ ವೀಕ್ಷಣೆ ಮತ್ತು ಡೌನ್‌ಲೋಡ್ ವಾಟರ್‌ಮಾರ್ಕ್ ಆಗಿ ದಾಖಲಾಗುತ್ತದೆ.' },
  'listing.openStudio': { en: 'Open Feasibility Studio', kn: 'ಕಾರ್ಯಸಾಧ್ಯತಾ ಸ್ಟುಡಿಯೋ ತೆರೆಯಿರಿ' },
  'listing.riskScorecard': { en: 'Risk Scorecard', kn: 'ರಿಸ್ಕ್ ಸ್ಕೋರ್‌ಕಾರ್ಡ್' },
  'listing.riskDesc': { en: 'Transparent and rules-based — every point is an auditable factor, not a black box.', kn: 'ಪಾರದರ್ಶಕ ಮತ್ತು ನಿಯಮ-ಆಧಾರಿತ — ಪ್ರತಿ ಅಂಕವೂ ಪರಿಶೀಲಿಸಬಹುದಾದ ಅಂಶ, ಕಪ್ಪು ಪೆಟ್ಟಿಗೆ ಅಲ್ಲ.' },
  'listing.dealRoom': { en: 'Deal Room', kn: 'ಡೀಲ್ ರೂಮ್' },
  'listing.dealRoomTag': { en: 'logged · admin-visible', kn: 'ದಾಖಲಾಗಿದೆ · ಅಡ್ಮಿನ್‌ಗೆ ಗೋಚರ' },
  'listing.dealRoomDesc': {
    en: 'Correspondence with the counterparty — not real-time. Every message is logged; the platform stays the principal.',
    kn: 'ಪ್ರತಿಪಕ್ಷದೊಂದಿಗಿನ ಪತ್ರವ್ಯವಹಾರ — ನೈಜ ಸಮಯದಲ್ಲಿ ಅಲ್ಲ. ಪ್ರತಿ ಸಂದೇಶವೂ ದಾಖಲಾಗುತ್ತದೆ; ವೇದಿಕೆಯೇ ಪ್ರಧಾನವಾಗಿ ಉಳಿಯುತ್ತದೆ.',
  },
  'listing.noMessages': { en: 'No messages yet — start the conversation below.', kn: 'ಇನ್ನೂ ಸಂದೇಶಗಳಿಲ್ಲ — ಕೆಳಗೆ ಸಂಭಾಷಣೆ ಆರಂಭಿಸಿ.' },
  'listing.writeMessage': { en: 'Write a message…', kn: 'ಸಂದೇಶ ಬರೆಯಿರಿ…' },
  'listing.send': { en: 'Send', kn: 'ಕಳುಹಿಸಿ' },
  'listing.vaultView': { en: 'View', kn: 'ವೀಕ್ಷಿಸಿ' },
  'listing.developmentPotential': { en: 'Development potential', kn: 'ಅಭಿವೃದ್ಧಿ ಸಾಮರ್ಥ್ಯ' },
  'listing.comparableSales': { en: 'Comparable sales — admin-maintained', kn: 'ತುಲನಾತ್ಮಕ ಮಾರಾಟಗಳು — ಅಡ್ಮಿನ್ ನಿರ್ವಹಿಸಿದ' },

  'vault.titleDeed': { en: 'Title deed', kn: 'ಒಡೆತನ ಪತ್ರ' },
  'vault.encumbrance': { en: 'Encumbrance certificate', kn: 'ಋಣಭಾರ ಪ್ರಮಾಣಪತ್ರ' },
  'vault.survey': { en: 'Boundary survey', kn: 'ಗಡಿ ಸರ್ವೆ' },
  'vault.tax': { en: 'Tax receipts', kn: 'ತೆರಿಗೆ ರಶೀದಿಗಳು' },

  'spec.approvedFsi': { en: 'Approved FSI', kn: 'ಅನುಮೋದಿತ FSI' },
  'spec.approvals': { en: 'Approvals', kn: 'ಅನುಮೋದನೆಗಳು' },
  'spec.roadWidth': { en: 'Road width', kn: 'ರಸ್ತೆ ಅಗಲ' },
  'spec.suggestedJdModel': { en: 'Suggested JD model', kn: 'ಸೂಚಿತ JD ಮಾದರಿ' },
  'spec.timeline': { en: 'Timeline', kn: 'ಕಾಲಮಿತಿ' },
  'spec.clearHeight': { en: 'Clear height', kn: 'ಕ್ಲಿಯರ್ ಎತ್ತರ' },
  'spec.dockDoors': { en: 'Dock doors', kn: 'ಡಾಕ್ ಬಾಗಿಲುಗಳು' },
  'spec.power': { en: 'Power', kn: 'ವಿದ್ಯುತ್' },
  'spec.floorLoad': { en: 'Floor load', kn: 'ಫ್ಲೋರ್ ಲೋಡ್' },
  'spec.leaseType': { en: 'Lease type', kn: 'ಲೀಸ್ ಪ್ರಕಾರ' },
  'spec.soil': { en: 'Soil', kn: 'ಮಣ್ಣು' },
  'spec.waterTable': { en: 'Water table', kn: 'ಅಂತರ್ಜಲ ಮಟ್ಟ' },
  'spec.disputes': { en: 'Disputes', kn: 'ವಿವಾದಗಳು' },
  'spec.horizon': { en: 'Horizon', kn: 'ಕಾಲಾವಧಿ' },
  'spec.appreciation': { en: 'Appreciation', kn: 'ಮೌಲ್ಯವೃದ್ಧಿ' },

  'comps.project': { en: 'Project', kn: 'ಪ್ರಾಜೆಕ್ಟ್' },
  'comps.distance': { en: 'Distance', kn: 'ದೂರ' },
  'comps.rate': { en: 'Rate', kn: 'ದರ' },
  'comps.year': { en: 'Year', kn: 'ವರ್ಷ' },

  // --- owner dashboard ---
  'owner.loadingDesk': { en: 'Loading your desk…', kn: 'ನಿಮ್ಮ ಡೆಸ್ಕ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ…' },
  'owner.noListings': { en: 'No live listings yet', kn: 'ಇನ್ನೂ ಲೈವ್ ಪಟ್ಟಿಗಳಿಲ್ಲ' },
  'owner.noListingsBody': { en: 'Your relationship manager is preparing your parcel.', kn: 'ನಿಮ್ಮ ಸಂಬಂಧ ವ್ಯವಸ್ಥಾಪಕರು ನಿಮ್ಮ ಭೂಖಂಡವನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತಿದ್ದಾರೆ.' },
  'owner.yourProperty': { en: 'Your property', kn: 'ನಿಮ್ಮ ಆಸ್ತಿ' },
  'owner.whoWatching': { en: 'Who is watching', kn: 'ಯಾರು ಗಮನಿಸುತ್ತಿದ್ದಾರೆ' },
  'owner.whoWatchingDesc': { en: 'At your scale, engagement is named and timestamped — never an anonymous count.', kn: 'ನಿಮ್ಮ ಮಟ್ಟದಲ್ಲಿ, ತೊಡಗಿಸಿಕೊಳ್ಳುವಿಕೆ ಹೆಸರು ಮತ್ತು ಸಮಯದೊಂದಿಗೆ ದಾಖಲಾಗುತ್ತದೆ — ಅನಾಮಧೇಯ ಎಣಿಕೆ ಎಂದಿಗೂ ಅಲ್ಲ.' },
  'owner.totalViews': { en: 'Total views', kn: 'ಒಟ್ಟು ವೀಕ್ಷಣೆಗಳು' },
  'owner.shortlistAdds': { en: 'Shortlist adds', kn: 'ಶಾರ್ಟ್‌ಲಿಸ್ಟ್ ಸೇರ್ಪಡೆಗಳು' },
  'owner.siteVisits': { en: 'Site visits', kn: 'ಸ್ಥಳ ಭೇಟಿಗಳು' },
  'owner.expressionsInterest': { en: 'Expressions of interest', kn: 'ಆಸಕ್ತಿಯ ಅಭಿವ್ಯಕ್ತಿಗಳು' },
  'owner.underDiscussion': { en: 'Under exclusive discussion', kn: 'ವಿಶೇಷ ಚರ್ಚೆಯಲ್ಲಿ' },
  'owner.offersDesc': { en: 'Only verified builder members may table terms. You choose — your RM negotiates.', kn: 'ಪರಿಶೀಲಿತ ಬಿಲ್ಡರ್ ಸದಸ್ಯರು ಮಾತ್ರ ಷರತ್ತುಗಳನ್ನು ಮಂಡಿಸಬಹುದು. ನೀವು ಆಯ್ಕೆ ಮಾಡುತ್ತೀರಿ — ನಿಮ್ಮ RM ಮಾತುಕತೆ ನಡೆಸುತ್ತಾರೆ.' },
  'owner.colBuilder': { en: 'Builder', kn: 'ಬಿಲ್ಡರ್' },
  'owner.colType': { en: 'Type', kn: 'ಪ್ರಕಾರ' },
  'owner.colQuote': { en: 'Quote', kn: 'ಕೋಟ್' },
  'owner.colTerms': { en: 'Terms', kn: 'ಷರತ್ತುಗಳು' },
  'owner.colStatus': { en: 'Status', kn: 'ಸ್ಥಿತಿ' },
  'owner.choose': { en: 'Choose', kn: 'ಆಯ್ಕೆಮಾಡಿ' },
  'owner.leave': { en: 'Leave', kn: 'ಬಿಡಿ' },
  'owner.confirm': { en: 'Confirm', kn: 'ದೃಢೀಕರಿಸಿ' },
  'owner.selectPreferred': { en: 'Select preferred party', kn: 'ಆದ್ಯತೆಯ ಪಕ್ಷವನ್ನು ಆಯ್ಕೆಮಾಡಿ' },
  'owner.selectPreferredBody': {
    en: 'You are selecting {builder} as the preferred party. Your relationship manager will initiate formal negotiations. Your commission is protected under your listing agreement.',
    kn: 'ನೀವು {builder} ಅನ್ನು ಆದ್ಯತೆಯ ಪಕ್ಷವಾಗಿ ಆಯ್ಕೆಮಾಡುತ್ತಿದ್ದೀರಿ. ನಿಮ್ಮ ಸಂಬಂಧ ವ್ಯವಸ್ಥಾಪಕರು ಔಪಚಾರಿಕ ಮಾತುಕತೆ ಆರಂಭಿಸುತ್ತಾರೆ. ನಿಮ್ಮ ಕಮಿಷನ್ ನಿಮ್ಮ ಪಟ್ಟಿ ಒಪ್ಪಂದದ ಅಡಿಯಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿದೆ.',
  },
  'owner.confirmSelection': { en: 'Confirm selection', kn: 'ಆಯ್ಕೆ ದೃಢೀಕರಿಸಿ' },
  'owner.cancel': { en: 'Cancel', kn: 'ರದ್ದುಮಾಡಿ' },
  'owner.preferred': { en: 'Preferred', kn: 'ಆದ್ಯತೆ' },
  'owner.declined': { en: 'Declined', kn: 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ' },
  'owner.pending': { en: 'Pending', kn: 'ಬಾಕಿ' },
  'owner.decline': { en: 'Decline', kn: 'ತಿರಸ್ಕರಿಸಿ' },
  'owner.passOn': { en: 'Pass on {builder}', kn: '{builder} ಅನ್ನು ಬಿಟ್ಟುಬಿಡಿ' },
  'owner.declineBody': {
    en: 'Your reason stays private — the builder receives an admin-curated message and your RM offers alternatives.',
    kn: 'ನಿಮ್ಮ ಕಾರಣ ಖಾಸಗಿಯಾಗಿ ಉಳಿಯುತ್ತದೆ — ಬಿಲ್ಡರ್‌ಗೆ ಅಡ್ಮಿನ್-ಸಿದ್ಧಪಡಿಸಿದ ಸಂದೇಶ ತಲುಪುತ್ತದೆ ಮತ್ತು ನಿಮ್ಮ RM ಪರ್ಯಾಯಗಳನ್ನು ನೀಡುತ್ತಾರೆ.',
  },
  'owner.confirmDecline': { en: 'Confirm decline', kn: 'ತಿರಸ್ಕಾರ ದೃಢೀಕರಿಸಿ' },
  'role.ownerShort': { en: 'Owner', kn: 'ಮಾಲೀಕ' },

  'pipeline.documents': { en: 'Documents', kn: 'ದಾಖಲೆಗಳು' },
  'pipeline.adminReview': { en: 'Admin review', kn: 'ಅಡ್ಮಿನ್ ಪರಿಶೀಲನೆ' },
  'pipeline.verified': { en: 'Verified', kn: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ' },
  'pipeline.live': { en: 'Live', kn: 'ಲೈವ್' },
  'pipeline.inNegotiation': { en: 'In negotiation', kn: 'ಮಾತುಕತೆಯಲ್ಲಿ' },
  'pipeline.closed': { en: 'Closed', kn: 'ಮುಚ್ಚಲಾಗಿದೆ' },

  'leaveReason.priceLow': { en: 'Price too low', kn: 'ಬೆಲೆ ತುಂಬಾ ಕಡಿಮೆ' },
  'leaveReason.termsUnsuitable': { en: 'Terms unsuitable', kn: 'ಷರತ್ತುಗಳು ಸೂಕ್ತವಲ್ಲ' },
  'leaveReason.profileMismatch': { en: 'Builder profile mismatch', kn: 'ಬಿಲ್ಡರ್ ಪ್ರೊಫೈಲ್ ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ' },
  'leaveReason.other': { en: 'Other', kn: 'ಇತರೆ' },

  // --- investor dashboard ---
  'investor.eyebrow': { en: 'Big Land', kn: 'ವಿಶಾಲ ಭೂಮಿ' },
  'investor.headline': { en: 'Land, held for the long arc.', kn: 'ದೀರ್ಘಕಾಲಕ್ಕಾಗಿ ಇಟ್ಟುಕೊಂಡ ಭೂಮಿ.' },
  'investor.body': {
    en: 'Verified, contiguous parcels for patient capital — sized by investment, holding period and admin-assessed appreciation.',
    kn: 'ತಾಳ್ಮೆಯ ಬಂಡವಾಳಕ್ಕಾಗಿ ಪರಿಶೀಲಿತ, ಸಂಲಗ್ನ ಭೂಖಂಡಗಳು — ಹೂಡಿಕೆ, ಹಿಡುವಳಿ ಅವಧಿ ಮತ್ತು ಅಡ್ಮಿನ್-ಮೌಲ್ಯಮಾಪಿತ ಮೌಲ್ಯವೃದ್ಧಿಯ ಆಧಾರದಲ್ಲಿ ಗಾತ್ರ ನಿಗದಿ.',
  },
  'investor.invested': { en: 'Invested', kn: 'ಹೂಡಿಕೆ ಮಾಡಲಾಗಿದೆ' },
  'investor.currentValue': { en: 'Current value', kn: 'ಪ್ರಸ್ತುತ ಮೌಲ್ಯ' },
  'investor.unrealisedGain': { en: 'Unrealised gain', kn: 'ಸಾಧಿಸದ ಲಾಭ' },
  'investor.yourPortfolio': { en: 'Your portfolio', kn: 'ನಿಮ್ಮ ಪೋರ್ಟ್‌ಫೋಲಿಯೋ' },
  'investor.colParcel': { en: 'Parcel', kn: 'ಭೂಖಂಡ' },
  'investor.colAcquired': { en: 'Acquired', kn: 'ಸ್ವಾಧೀನಪಡಿಸಿಕೊಂಡ ವರ್ಷ' },
  'investor.colInvested': { en: 'Invested', kn: 'ಹೂಡಿಕೆ' },
  'investor.colCurrent': { en: 'Current', kn: 'ಪ್ರಸ್ತುತ' },
  'investor.colAdminNote': { en: 'Admin note', kn: 'ಅಡ್ಮಿನ್ ಟಿಪ್ಪಣಿ' },
  'investor.openOpportunities': { en: 'Open opportunities', kn: 'ಮುಕ್ತ ಅವಕಾಶಗಳು' },
  'investor.investment': { en: 'Investment', kn: 'ಹೂಡಿಕೆ' },
  'investor.horizon': { en: 'Horizon', kn: 'ಕಾಲಾವಧಿ' },
  'investor.area': { en: 'Area', kn: 'ವಿಸ್ತೀರ್ಣ' },

  // --- Studio ---
  'studio.loadingParcel': { en: 'Loading parcel…', kn: 'ಭೂಖಂಡ ಲೋಡ್ ಆಗುತ್ತಿದೆ…' },
  'studio.terracrest': { en: 'Terracrest', kn: 'ಟೆರಾಕ್ರೆಸ್ಟ್' },
  'studio.eyebrow': { en: 'Feasibility Studio', kn: 'ಕಾರ್ಯಸಾಧ್ಯತಾ ಸ್ಟುಡಿಯೋ' },
  'studio.architectValidated': { en: 'Architect Validated', kn: 'ವಾಸ್ತುಶಿಲ್ಪಿ ದೃಢೀಕರಿಸಿದೆ' },
  'studio.validationRequested': { en: 'Validation Requested', kn: 'ದೃಢೀಕರಣ ವಿನಂತಿಸಲಾಗಿದೆ' },
  'studio.confirmEngage': { en: 'Confirm & Engage Architect', kn: 'ದೃಢೀಕರಿಸಿ ಮತ್ತು ವಾಸ್ತುಶಿಲ್ಪಿಯನ್ನು ನಿಯೋಜಿಸಿ' },
  'studio.roadFrontage': { en: 'FT ROAD · FRONTAGE', kn: 'ಅಡಿ ರಸ್ತೆ · ಮುಂಭಾಗ' },
  'studio.builtUp': { en: 'Built-up', kn: 'ನಿರ್ಮಿತ ಪ್ರದೇಶ' },
  'studio.saleable': { en: 'Saleable', kn: 'ಮಾರಾಟಯೋಗ್ಯ' },
  'studio.units': { en: 'Units', kn: 'ಘಟಕಗಳು' },
  'studio.parking': { en: 'Parking', kn: 'ಪಾರ್ಕಿಂಗ್' },
  'studio.efficiency': { en: 'Efficiency', kn: 'ದಕ್ಷತೆ' },
  'studio.openGreen': { en: 'Open / green', kn: 'ತೆರೆದ / ಹಸಿರು' },
  'studio.designParameters': { en: 'Design Parameters', kn: 'ವಿನ್ಯಾಸ ನಿಯತಾಂಕಗಳು' },
  'studio.towers': { en: 'Towers', kn: 'ಗೋಪುರಗಳು' },
  'studio.floors': { en: 'Floors (G +)', kn: 'ಮಹಡಿಗಳು (G +)' },
  'studio.fsi': { en: 'FSI', kn: 'FSI' },
  'studio.bylawSanction': { en: 'By-law sanction', kn: 'ಬೈ-ಲಾ ಅನುಮತಿ' },
  'studio.floorPlateEfficiency': { en: 'Floor-plate efficiency', kn: 'ಫ್ಲೋರ್-ಪ್ಲೇಟ್ ದಕ್ಷತೆ' },
  'studio.avgUnitSize': { en: 'Avg unit size', kn: 'ಸರಾಸರಿ ಘಟಕ ಗಾತ್ರ' },
  'studio.marketSalePrice': { en: 'Market sale price', kn: 'ಮಾರುಕಟ್ಟೆ ಮಾರಾಟ ಬೆಲೆ' },
  'studio.anchoredComps': { en: 'Anchored to admin-verified comparables', kn: 'ಅಡ್ಮಿನ್-ಪರಿಶೀಲಿತ ತುಲನೆಗಳಿಗೆ ಆಧಾರಿತ' },
  'studio.materialSpec': { en: 'Material Specification', kn: 'ಸಾಮಗ್ರಿ ವಿಶೇಷಣ' },
  'studio.finishes': { en: 'finishes', kn: 'ಫಿನಿಶ್‌ಗಳು' },
  'studio.ndvLabel': { en: 'ML-adjusted NDV · Market', kn: 'ML-ಹೊಂದಾಣಿಕೆ NDV · ಮಾರುಕಟ್ಟೆ' },
  'studio.vsParametric': { en: 'vs parametric', kn: 'ಪ್ಯಾರಾಮೆಟ್ರಿಕ್‌ಗೆ ಹೋಲಿಸಿ' },
  'studio.modelCard': { en: 'Model card', kn: 'ಮಾದರಿ ಕಾರ್ಡ್' },
  'studio.constructionCost': { en: 'Construction Cost', kn: 'ನಿರ್ಮಾಣ ವೆಚ್ಚ' },
  'studio.builtUpSqft': { en: 'sq ft built-up', kn: 'ಚ.ಅಡಿ ನಿರ್ಮಿತ' },

  'studio.stageTwoOriginal': { en: 'Stage Two · Original Architecture', kn: 'ಹಂತ ಎರಡು · ಮೂಲ ವಾಸ್ತುಶಿಲ್ಪ' },
  'studio.engageArchitect': { en: 'Engage the empanelled architect', kn: 'ಪಟ್ಟಿಯಲ್ಲಿರುವ ವಾಸ್ತುಶಿಲ್ಪಿಯನ್ನು ನಿಯೋಜಿಸಿ' },
  'studio.engageBody': {
    en: 'Your feasibility on {id} — {units} units, {saleable} saleable, a market Net Development Value of {ndv} — is snapshotted and handed to our empanelled architect for stamped, buildable drawings validated against this model.',
    kn: '{id} ಕುರಿತ ನಿಮ್ಮ ಕಾರ್ಯಸಾಧ್ಯತೆ — {units} ಘಟಕಗಳು, {saleable} ಮಾರಾಟಯೋಗ್ಯ, ಮಾರುಕಟ್ಟೆ ನಿವ್ವಳ ಅಭಿವೃದ್ಧಿ ಮೌಲ್ಯ {ndv} — ಸ್ನ್ಯಾಪ್‌ಶಾಟ್ ಮಾಡಿ ನಮ್ಮ ಪಟ್ಟಿಯಲ್ಲಿರುವ ವಾಸ್ತುಶಿಲ್ಪಿಗೆ ಒಪ್ಪಿಸಲಾಗುತ್ತದೆ — ಈ ಮಾದರಿಗೆ ಎದುರಾಗಿ ಪರಿಶೀಲಿಸಿದ, ಮುದ್ರೆಯೊತ್ತಿದ, ನಿರ್ಮಾಣ-ಸಿದ್ಧ ರೇಖಾಚಿತ್ರಗಳಿಗಾಗಿ.',
  },
  'studio.engagementFee': { en: 'Engagement fee', kn: 'ನಿಯೋಜನಾ ಶುಲ್ಕ' },
  'studio.adjustableCommission': { en: 'Adjustable against Terracrest commission on closure.', kn: 'ಒಪ್ಪಂದ ಮುಗಿದ ಮೇಲೆ ಟೆರಾಕ್ರೆಸ್ಟ್ ಕಮಿಷನ್‌ಗೆ ಎದುರಾಗಿ ಹೊಂದಾಣಿಕೆ ಮಾಡಬಹುದು.' },
  'studio.notYet': { en: 'Not yet', kn: 'ಇನ್ನೂ ಬೇಡ' },
  'studio.commissioning': { en: 'Commissioning…', kn: 'ನಿಯೋಜಿಸಲಾಗುತ್ತಿದೆ…' },
  'studio.proceed': { en: 'Proceed', kn: 'ಮುಂದುವರಿಸಿ' },

  'studio.stageTwoProgress': { en: 'Stage Two · In Progress', kn: 'ಹಂತ ಎರಡು · ಪ್ರಗತಿಯಲ್ಲಿ' },
  'studio.validationCommissioned': { en: 'Validation commissioned', kn: 'ದೃಢೀಕರಣ ನಿಯೋಜಿಸಲಾಗಿದೆ' },
  'studio.validationBody': {
    en: 'Your model on {id} is with the empanelled architect. They return stamped drawings and an independent Net Development Value — typically within three working days — which will appear here alongside your ML estimate.',
    kn: '{id} ಕುರಿತ ನಿಮ್ಮ ಮಾದರಿ ಪಟ್ಟಿಯಲ್ಲಿರುವ ವಾಸ್ತುಶಿಲ್ಪಿಯ ಬಳಿ ಇದೆ. ಅವರು ಮುದ್ರೆಯೊತ್ತಿದ ರೇಖಾಚಿತ್ರಗಳು ಮತ್ತು ಸ್ವತಂತ್ರ ನಿವ್ವಳ ಅಭಿವೃದ್ಧಿ ಮೌಲ್ಯವನ್ನು — ಸಾಮಾನ್ಯವಾಗಿ ಮೂರು ಕೆಲಸದ ದಿನಗಳಲ್ಲಿ — ಹಿಂದಿರುಗಿಸುತ್ತಾರೆ, ಅದು ನಿಮ್ಮ ಮಾದರಿ ಅಂದಾಜಿನ ಪಕ್ಕದಲ್ಲಿ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.',
  },
  'studio.commissioned': { en: 'Commissioned', kn: 'ನಿಯೋಜಿಸಲಾಗಿದೆ' },
  'studio.mlEstimateMarket': { en: 'ML estimate (Market)', kn: 'ಮಾದರಿ ಅಂದಾಜು (ಮಾರುಕಟ್ಟೆ)' },
  'studio.status': { en: 'Status', kn: 'ಸ್ಥಿತಿ' },
  'studio.awaitingArchitect': { en: 'Awaiting architect', kn: 'ವಾಸ್ತುಶಿಲ್ಪಿಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ' },
  'studio.close': { en: 'Close', kn: 'ಮುಚ್ಚಿ' },

  'studio.stageTwoValidated': { en: 'Stage Two · Validated', kn: 'ಹಂತ ಎರಡು · ದೃಢೀಕರಿಸಲಾಗಿದೆ' },
  'studio.architectValidatedFeasibility': { en: 'Architect-validated feasibility', kn: 'ವಾಸ್ತುಶಿಲ್ಪಿ-ದೃಢೀಕರಿಸಿದ ಕಾರ್ಯಸಾಧ್ಯತೆ' },
  'studio.studioAtCommission': { en: 'Studio · at commission', kn: 'ಸ್ಟುಡಿಯೋ · ನಿಯೋಜನೆಯಂದು' },
  'studio.architectValidatedLabel': { en: 'Architect · Validated', kn: 'ವಾಸ್ತುಶಿಲ್ಪಿ · ದೃಢೀಕರಿಸಲಾಗಿದೆ' },
  'studio.varianceToModel': { en: 'Variance to model', kn: 'ಮಾದರಿಗೆ ವ್ಯತ್ಯಾಸ' },
  'studio.architectsNote': { en: "Architect's note", kn: 'ವಾಸ್ತುಶಿಲ್ಪಿಯ ಟಿಪ್ಪಣಿ' },
  'studio.deliveredNote': { en: 'Delivered {date} · stamped drawings issued to your Deal Room.', kn: '{date} ರಂದು ವಿತರಿಸಲಾಗಿದೆ · ಮುದ್ರೆಯೊತ್ತಿದ ರೇಖಾಚಿತ್ರಗಳು ನಿಮ್ಮ ಡೀಲ್ ರೂಮ್‌ಗೆ ತಲುಪಿವೆ.' },

  'studio.loadingModel': { en: 'Loading the model…', kn: 'ಮಾದರಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ…' },

  // --- model card (shared: Studio modal + admin Model tab) ---
  'modelCard.title': { en: 'Valuation Model', kn: 'ಮೌಲ್ಯಮಾಪನ ಮಾದರಿ' },
  'modelCard.retrain': { en: 'Retrain', kn: 'ಮರುತರಬೇತಿ' },
  'modelCard.retraining': { en: 'Retraining…', kn: 'ಮರುತರಬೇತಿ ನೀಡಲಾಗುತ್ತಿದೆ…' },
  'modelCard.r2Holdout': { en: 'R² (holdout)', kn: 'R² (ಹೋಲ್ಡ್‌ಔಟ್)' },
  'modelCard.meanError': { en: 'Mean error', kn: 'ಸರಾಸರಿ ದೋಷ' },
  'modelCard.corpus': { en: 'Corpus', kn: 'ದತ್ತಾಂಶ ಸಂಗ್ರಹ' },
  'modelCard.realSynth': { en: 'real · {n} synth', kn: 'ನಿಜ · {n} ಕೃತಕ' },
  'modelCard.whatDrivesValue': { en: 'What the model learned drives value', kn: 'ಮಾದರಿ ಕಲಿತದ್ದು ಮೌಲ್ಯವನ್ನು ಹೇಗೆ ಪ್ರೇರೇಪಿಸುತ್ತದೆ' },
  'modelCard.target': { en: 'Target', kn: 'ಗುರಿ' },
  'modelCard.trained': { en: 'trained', kn: 'ತರಬೇತಿ ನೀಡಲಾಗಿದೆ' },

  // --- admin desk ---
  'admin.tabListings': { en: 'Listings', kn: 'ಪಟ್ಟಿಗಳು' },
  'admin.tabNewParcel': { en: 'New Parcel', kn: 'ಹೊಸ ಭೂಖಂಡ' },
  'admin.tabAccounts': { en: 'Accounts', kn: 'ಖಾತೆಗಳು' },
  'admin.tabPipeline': { en: 'Pipeline', kn: 'ಪೈಪ್‌ಲೈನ್' },
  'admin.tabPrices': { en: 'Prices', kn: 'ಬೆಲೆಗಳು' },
  'admin.tabArchitect': { en: 'Architect', kn: 'ವಾಸ್ತುಶಿಲ್ಪಿ' },
  'admin.tabModel': { en: 'Model', kn: 'ಮಾದರಿ' },
  'admin.tabActivity': { en: 'Activity', kn: 'ಚಟುವಟಿಕೆ' },

  'admin.eyebrow': { en: 'Operations Centre', kn: 'ಕಾರ್ಯಾಚರಣೆ ಕೇಂದ್ರ' },
  'admin.headline': { en: 'The desk.', kn: 'ಡೆಸ್ಕ್.' },
  'admin.body': {
    en: 'Create accounts after offline KYC, verify parcels before they go live, and manage the membership that opens them.',
    kn: 'ಆಫ್‌ಲೈನ್ ಕೆವೈಸಿ ನಂತರ ಖಾತೆಗಳನ್ನು ರಚಿಸಿ, ಲೈವ್ ಆಗುವ ಮೊದಲು ಭೂಖಂಡಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, ಮತ್ತು ಅವುಗಳನ್ನು ತೆರೆಯುವ ಸದಸ್ಯತ್ವವನ್ನು ನಿರ್ವಹಿಸಿ.',
  },
  'admin.loadingDesk': { en: 'Loading the desk…', kn: 'ಡೆಸ್ಕ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ…' },

  'admin.colParcel': { en: 'Parcel', kn: 'ಭೂಖಂಡ' },
  'admin.colVertical': { en: 'Vertical', kn: 'ವರ್ಟಿಕಲ್' },
  'admin.colLocality': { en: 'Locality', kn: 'ಪ್ರದೇಶ' },
  'admin.colStatus': { en: 'Status', kn: 'ಸ್ಥಿತಿ' },

  'admin.colMember': { en: 'Member', kn: 'ಸದಸ್ಯ' },
  'admin.colRole': { en: 'Role', kn: 'ಪಾತ್ರ' },
  'admin.colKyc': { en: 'KYC', kn: 'ಕೆವೈಸಿ' },
  'admin.colActions': { en: 'Actions', kn: 'ಕ್ರಿಯೆಗಳು' },
  'admin.verified': { en: 'Verified', kn: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ' },
  'admin.pending': { en: 'Pending', kn: 'ಬಾಕಿ' },
  'admin.resetPw': { en: 'Reset PW', kn: 'ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸಿ' },
  'admin.kyc': { en: 'KYC', kn: 'ಕೆವೈಸಿ' },
  'admin.activate': { en: 'Activate', kn: 'ಸಕ್ರಿಯಗೊಳಿಸಿ' },
  'admin.deactivate': { en: 'Deactivate', kn: 'ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಿ' },
  'admin.createAccount': { en: 'Create account', kn: 'ಖಾತೆ ರಚಿಸಿ' },
  'admin.createAccountDesc': { en: 'After offline KYC. A temporary password is issued; the member changes it on first login.', kn: 'ಆಫ್‌ಲೈನ್ ಕೆವೈಸಿ ನಂತರ. ತಾತ್ಕಾಲಿಕ ಪಾಸ್‌ವರ್ಡ್ ನೀಡಲಾಗುತ್ತದೆ; ಮೊದಲ ಲಾಗಿನ್‌ನಲ್ಲಿ ಸದಸ್ಯರು ಅದನ್ನು ಬದಲಾಯಿಸುತ್ತಾರೆ.' },
  'admin.username': { en: 'Username', kn: 'ಬಳಕೆದಾರ ಹೆಸರು' },
  'admin.displayName': { en: 'Display name', kn: 'ಪ್ರದರ್ಶನ ಹೆಸರು' },
  'admin.role': { en: 'Role', kn: 'ಪಾತ್ರ' },
  'admin.officeOptional': { en: 'Office (optional)', kn: 'ಕಚೇರಿ (ಐಚ್ಛಿಕ)' },
  'admin.creating': { en: 'Creating…', kn: 'ರಚಿಸಲಾಗುತ್ತಿದೆ…' },

  'admin.newParcelBasics': { en: 'Basics', kn: 'ಮೂಲಭೂತ ವಿವರಗಳು' },
  'admin.parcelId': { en: 'Parcel ID', kn: 'ಭೂಖಂಡ ID' },
  'admin.vertical': { en: 'Vertical', kn: 'ವರ್ಟಿಕಲ್' },
  'admin.owner': { en: 'Owner', kn: 'ಮಾಲೀಕ' },
  'admin.headlineField': { en: 'Headline', kn: 'ಶೀರ್ಷಿಕೆ' },
  'admin.localityMasked': { en: 'Locality (masked)', kn: 'ಪ್ರದೇಶ (ಮರೆಮಾಡಲಾಗಿದೆ)' },
  'admin.areaLabel': { en: 'Area label', kn: 'ಪ್ರದೇಶ ಲೇಬಲ್' },
  'admin.landArea': { en: 'Land area (sq ft)', kn: 'ಭೂ ವಿಸ್ತೀರ್ಣ (ಚ.ಅಡಿ)' },
  'admin.zoning': { en: 'Zoning', kn: 'ವಲಯೀಕರಣ' },
  'admin.guidanceLow': { en: 'Guidance low (₹ Cr)', kn: 'ಮಾರ್ಗದರ್ಶನ ಕನಿಷ್ಠ (₹ ಕೋಟಿ)' },
  'admin.guidanceHigh': { en: 'Guidance high (₹ Cr)', kn: 'ಮಾರ್ಗದರ್ಶನ ಗರಿಷ್ಠ (₹ ಕೋಟಿ)' },
  'admin.localityNote': { en: 'Locality note (admin assessment)', kn: 'ಪ್ರದೇಶ ಟಿಪ್ಪಣಿ (ಅಡ್ಮಿನ್ ಮೌಲ್ಯಮಾಪನ)' },
  'admin.publicMapSection': { en: 'Public map — coarse area view', kn: 'ಸಾರ್ವಜನಿಕ ನಕ್ಷೆ — ಸ್ಥೂಲ ಪ್ರದೇಶ ನೋಟ' },
  'admin.areaLat': { en: 'Area latitude', kn: 'ಪ್ರದೇಶ ಅಕ್ಷಾಂಶ' },
  'admin.areaLng': { en: 'Area longitude', kn: 'ಪ್ರದೇಶ ರೇಖಾಂಶ' },
  'admin.radiusKm': { en: 'Radius (km)', kn: 'ತ್ರಿಜ್ಯ (ಕಿ.ಮೀ)' },
  'admin.fullDetailSection': { en: 'Full detail — visible to any member', kn: 'ಪೂರ್ಣ ವಿವರ — ಯಾವುದೇ ಸದಸ್ಯರಿಗೆ ಗೋಚರ' },
  'admin.exactAddress': { en: 'Exact address', kn: 'ನಿಖರ ವಿಳಾಸ' },
  'admin.ownerOfRecord': { en: 'Owner of record', kn: 'ದಾಖಲೆಯಲ್ಲಿನ ಮಾಲೀಕ' },
  'admin.surveyNos': { en: 'Survey nos (comma-sep)', kn: 'ಸರ್ವೆ ನಂಬರ್‌ಗಳು (ಅಲ್ಪವಿರಾಮ-ಬೇರ್ಪಡಿಸಿದ)' },
  'admin.contact': { en: 'Contact', kn: 'ಸಂಪರ್ಕ' },
  'admin.exactLat': { en: 'Exact latitude', kn: 'ನಿಖರ ಅಕ್ಷಾಂಶ' },
  'admin.exactLng': { en: 'Exact longitude', kn: 'ನಿಖರ ರೇಖಾಂಶ' },
  'admin.feasibilitySection': { en: 'Feasibility — drives the Studio', kn: 'ಕಾರ್ಯಸಾಧ್ಯತೆ — ಸ್ಟುಡಿಯೋವನ್ನು ಚಾಲನೆ ಮಾಡುತ್ತದೆ' },
  'admin.plotArea': { en: 'Plot area (sq ft)', kn: 'ಪ್ಲಾಟ್ ವಿಸ್ತೀರ್ಣ (ಚ.ಅಡಿ)' },
  'admin.floorsField': { en: 'Floors (G+)', kn: 'ಮಹಡಿಗಳು (G+)' },
  'admin.towersField': { en: 'Towers', kn: 'ಗೋಪುರಗಳು' },
  'admin.avgUnit': { en: 'Avg unit (sq ft)', kn: 'ಸರಾಸರಿ ಘಟಕ (ಚ.ಅಡಿ)' },
  'admin.salePrice': { en: 'Sale price (₹/sq ft)', kn: 'ಮಾರಾಟ ಬೆಲೆ (₹/ಚ.ಅಡಿ)' },
  'admin.createParcel': { en: 'Create parcel', kn: 'ಭೂಖಂಡ ರಚಿಸಿ' },

  'admin.pipelineEstCommission': { en: 'est.', kn: 'ಅಂದಾಜು' },

  'admin.awaitingDesk': { en: 'Awaiting the desk', kn: 'ಡೆಸ್ಕ್‌ಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ' },
  'admin.recordArchitectDesc': {
    en: "Record the empanelled architect's stamped, validated figure. It lands back in the builder's Studio beside the ML estimate.",
    kn: 'ಪಟ್ಟಿಯಲ್ಲಿರುವ ವಾಸ್ತುಶಿಲ್ಪಿಯ ಮುದ್ರೆಯೊತ್ತಿದ, ದೃಢೀಕರಿಸಿದ ಅಂಕಿಯನ್ನು ದಾಖಲಿಸಿ. ಅದು ಬಿಲ್ಡರ್‌ನ ಸ್ಟುಡಿಯೋದಲ್ಲಿ ಮಾದರಿ ಅಂದಾಜಿನ ಪಕ್ಕದಲ್ಲಿ ಮರಳಿ ಬರುತ್ತದೆ.',
  },
  'admin.nothingAwaiting': { en: 'Nothing awaiting delivery.', kn: 'ವಿತರಣೆಗೆ ಬಾಕಿ ಇಲ್ಲ.' },
  'admin.delivered': { en: 'Delivered', kn: 'ವಿತರಿಸಲಾಗಿದೆ' },
  'admin.noArchitectEngagements': { en: 'No architect engagements yet.', kn: 'ಇನ್ನೂ ವಾಸ್ತುಶಿಲ್ಪಿ ನಿಯೋಜನೆಗಳಿಲ್ಲ.' },
  'admin.studioEstimate': { en: 'Studio estimate', kn: 'ಸ್ಟುಡಿಯೋ ಅಂದಾಜು' },
  'admin.units': { en: 'units', kn: 'ಘಟಕಗಳು' },
  'admin.commissioned': { en: 'commissioned', kn: 'ನಿಯೋಜಿಸಲಾಗಿದೆ' },
  'admin.architectNameField': { en: 'Architect (name · CoA reg)', kn: 'ವಾಸ್ತುಶಿಲ್ಪಿ (ಹೆಸರು · CoA ನೋಂದಣಿ)' },
  'admin.validatedGdv': { en: 'Validated GDV (₹ Cr)', kn: 'ದೃಢೀಕರಿಸಿದ GDV (₹ ಕೋಟಿ)' },
  'admin.architectsNoteField': { en: "Architect's note", kn: 'ವಾಸ್ತುಶಿಲ್ಪಿಯ ಟಿಪ್ಪಣಿ' },
  'admin.recording': { en: 'Recording…', kn: 'ದಾಖಲಿಸಲಾಗುತ್ತಿದೆ…' },
  'admin.deliverValidation': { en: 'Deliver validation', kn: 'ದೃಢೀಕರಣ ವಿತರಿಸಿ' },
  'admin.studioShort': { en: 'Studio', kn: 'ಸ್ಟುಡಿಯೋ' },
  'admin.architectShort': { en: 'Architect', kn: 'ವಾಸ್ತುಶಿಲ್ಪಿ' },

  'admin.modelDesc': {
    en: 'The valuation model behind the Studio. Every architect delivery is a labelled example — retrain to fold the latest deliveries into the corpus and watch the numbers move.',
    kn: 'ಸ್ಟುಡಿಯೋ ಹಿಂದಿನ ಮೌಲ್ಯಮಾಪನ ಮಾದರಿ. ಪ್ರತಿ ವಾಸ್ತುಶಿಲ್ಪಿ ವಿತರಣೆಯೂ ಲೇಬಲ್ ಮಾಡಲಾದ ಉದಾಹರಣೆ — ಇತ್ತೀಚಿನ ವಿತರಣೆಗಳನ್ನು ದತ್ತಾಂಶ ಸಂಗ್ರಹಕ್ಕೆ ಸೇರಿಸಲು ಮರುತರಬೇತಿ ನೀಡಿ ಮತ್ತು ಸಂಖ್ಯೆಗಳು ಬದಲಾಗುವುದನ್ನು ನೋಡಿ.',
  },
  'admin.loadingModel': { en: 'Loading the model…', kn: 'ಮಾದರಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ…' },

  'admin.activityDesc': {
    en: 'Append-only audit trail. Every sign-in, membership grant, document view and Deal Room message is recorded here — nothing on this feed is editable.',
    kn: 'ಸೇರಿಸಲು ಮಾತ್ರ ಸಾಧ್ಯವಾದ ಲೆಕ್ಕಪರಿಶೋಧನಾ ದಾಖಲೆ. ಪ್ರತಿ ಸೈನ್-ಇನ್, ಸದಸ್ಯತ್ವ ವಿತರಣೆ, ದಾಖಲೆ ವೀಕ್ಷಣೆ ಮತ್ತು ಡೀಲ್ ರೂಮ್ ಸಂದೇಶ ಇಲ್ಲಿ ದಾಖಲಾಗುತ್ತದೆ — ಈ ಫೀಡ್‌ನಲ್ಲಿ ಯಾವುದನ್ನೂ ಸಂಪಾದಿಸಲಾಗುವುದಿಲ್ಲ.',
  },
  'admin.noActivity': { en: 'No activity recorded yet.', kn: 'ಇನ್ನೂ ಚಟುವಟಿಕೆ ದಾಖಲಾಗಿಲ್ಲ.' },
  'activity.login': { en: 'Login', kn: 'ಲಾಗಿನ್' },
  'activity.access': { en: 'Access', kn: 'ಪ್ರವೇಶ' },
  'activity.dealRoom': { en: 'Deal Room', kn: 'ಡೀಲ್ ರೂಮ್' },
  'activity.newParcel': { en: 'New Parcel', kn: 'ಹೊಸ ಭೂಖಂಡ' },
  'activity.status': { en: 'Status', kn: 'ಸ್ಥಿತಿ' },
  'activity.document': { en: 'Document', kn: 'ದಾಖಲೆ' },
  'activity.architect': { en: 'Architect', kn: 'ವಾಸ್ತುಶಿಲ್ಪಿ' },

  'admin.pricesDesc': { en: "Monthly Bangalore rates. The Studio reads these live — change one and every builder's GDV recomputes.", kn: 'ಮಾಸಿಕ ಬೆಂಗಳೂರು ದರಗಳು. ಸ್ಟುಡಿಯೋ ಇವುಗಳನ್ನು ನೇರವಾಗಿ ಓದುತ್ತದೆ — ಒಂದನ್ನು ಬದಲಾಯಿಸಿ ಮತ್ತು ಪ್ರತಿ ಬಿಲ್ಡರ್‌ನ GDV ಮರುಲೆಕ್ಕಾಚಾರವಾಗುತ್ತದೆ.' },
  'admin.baseBuild': { en: 'Base build ₹/sq ft (structure + MEP)', kn: 'ಮೂಲ ನಿರ್ಮಾಣ ₹/ಚ.ಅಡಿ (ರಚನೆ + MEP)' },
  'admin.finishRate': { en: 'Finish · ₹/sq ft', kn: 'ಫಿನಿಶ್ · ₹/ಚ.ಅಡಿ' },
  'admin.loadingRates': { en: 'Loading rates…', kn: 'ದರಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ…' },
  'admin.saving': { en: 'Saving…', kn: 'ಉಳಿಸಲಾಗುತ್ತಿದೆ…' },
  'admin.saveRates': { en: 'Save rates', kn: 'ದರಗಳನ್ನು ಉಳಿಸಿ' },
  'admin.ratesSaved': { en: 'Rates saved — the Feasibility Studio now prices against these.', kn: 'ದರಗಳನ್ನು ಉಳಿಸಲಾಗಿದೆ — ಕಾರ್ಯಸಾಧ್ಯತಾ ಸ್ಟುಡಿಯೋ ಈಗ ಇವುಗಳ ಆಧಾರದಲ್ಲಿ ಬೆಲೆ ನಿಗದಿಪಡಿಸುತ್ತದೆ.' },

  'rate.flooring': { en: 'Flooring', kn: 'ನೆಲಹಾಸು' },
  'rate.sanitary': { en: 'Sanitaryware', kn: 'ಸ್ಯಾನಿಟರಿವೇರ್' },
  'rate.kitchen': { en: 'Kitchen', kn: 'ಅಡುಗೆಮನೆ' },
  'rate.windows': { en: 'Windows', kn: 'ಕಿಟಕಿಗಳು' },
  'rate.lift': { en: 'Lifts', kn: 'ಲಿಫ್ಟ್‌ಗಳು' },
  'rate.facade': { en: 'Façade', kn: 'ಮುಂಭಾಗ' },
  'tier.budget': { en: 'budget', kn: 'ಬಜೆಟ್' },
  'tier.mid': { en: 'mid', kn: 'ಮಧ್ಯಮ' },
  'tier.premium': { en: 'premium', kn: 'ಪ್ರೀಮಿಯಂ' },
  'tier.luxury': { en: 'luxury', kn: 'ಐಷಾರಾಮಿ' },

  // --- studio materials catalogue ---
  'material.flooring': { en: 'Flooring', kn: 'ನೆಲಹಾಸು' },
  'material.sanitary': { en: 'Sanitaryware & CP', kn: 'ಸ್ಯಾನಿಟರಿವೇರ್ ಮತ್ತು CP' },
  'material.kitchen': { en: 'Kitchen', kn: 'ಅಡುಗೆಮನೆ' },
  'material.windows': { en: 'Windows & Glazing', kn: 'ಕಿಟಕಿಗಳು ಮತ್ತು ಗ್ಲೇಜಿಂಗ್' },
  'material.lift': { en: 'Lifts', kn: 'ಲಿಫ್ಟ್‌ಗಳು' },
  'material.facade': { en: 'Façade & External', kn: 'ಮುಂಭಾಗ ಮತ್ತು ಬಾಹ್ಯ' },

  // --- small unit suffixes reused across listing detail cards ---
  'unit.ftFrontage': { en: 'ft frontage', kn: 'ಅಡಿ ಮುಂಭಾಗ' },
  'unit.months': { en: 'months', kn: 'ತಿಂಗಳುಗಳು' },
  'unit.threePhase': { en: '3-phase', kn: '3-ಫೇಸ್' },
  'unit.years': { en: 'years', kn: 'ವರ್ಷಗಳು' },
  'unit.yrs': { en: 'yrs', kn: 'ವರ್ಷಗಳು' },

  // --- misc a11y labels ---
  'a11y.verifiedByTerracrest': { en: 'Verified by Terracrest', kn: 'ಟೆರಾಕ್ರೆಸ್ಟ್‌ನಿಂದ ಪರಿಶೀಲಿಸಲಾಗಿದೆ' },
  'a11y.axonometricDrawing': { en: 'Axonometric survey drawing of a verified parcel', kn: 'ಪರಿಶೀಲಿಸಲಾದ ಭೂಖಂಡದ ಆಕ್ಸೊನೊಮೆಟ್ರಿಕ್ ಸರ್ವೆ ರೇಖಾಚಿತ್ರ' },
  'a11y.massingSchematic': { en: 'Live parcel massing schematic', kn: 'ಲೈವ್ ಭೂಖಂಡ ಮಾಸಿಂಗ್ ಸ್ಕೀಮ್ಯಾಟಿಕ್' },

  // --- Kannada document scanner (OCR) ---
  'ocr.title': { en: 'Kannada Document Scanner', kn: 'ಕನ್ನಡ ದಾಖಲೆ ಸ್ಕ್ಯಾನರ್' },
  'ocr.hint': { en: 'Upload a scan or photo of a land record — title deed, EC, katha, tax receipt — to pull out its Kannada and English text.', kn: 'ಭೂ ದಾಖಲೆಯ ಸ್ಕ್ಯಾನ್ ಅಥವಾ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ — ಕ್ರಯಪತ್ರ, EC, ಖಾತಾ, ತೆರಿಗೆ ರಸೀದಿ — ಅದರ ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್ ಪಠ್ಯವನ್ನು ಹೊರತೆಗೆಯಲು.' },
  'ocr.upload': { en: 'Upload & scan', kn: 'ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ' },
  'ocr.scanning': { en: 'Scanning…', kn: 'ಸ್ಕ್ಯಾನ್ ಆಗುತ್ತಿದೆ…' },
  'ocr.extracted': { en: 'Extracted text', kn: 'ಹೊರತೆಗೆದ ಪಠ್ಯ' },
  'ocr.confidence': { en: 'confidence', kn: 'ವಿಶ್ವಾಸ' },
  'ocr.noText': { en: 'No text found in that image. Try a clearer scan.', kn: 'ಆ ಚಿತ್ರದಲ್ಲಿ ಪಠ್ಯ ಸಿಗಲಿಲ್ಲ. ಸ್ಪಷ್ಟವಾದ ಸ್ಕ್ಯಾನ್ ಪ್ರಯತ್ನಿಸಿ.' },
  'ocr.failed': { en: 'Could not scan that image. Try a clearer photo.', kn: 'ಆ ಚಿತ್ರವನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಲಾಗಲಿಲ್ಲ. ಸ್ಪಷ್ಟವಾದ ಫೋಟೋ ಪ್ರಯತ್ನಿಸಿ.' },
  'ocr.tooLarge': { en: 'Image too large — 8 MB maximum.', kn: 'ಚಿತ್ರ ತುಂಬಾ ದೊಡ್ಡದು — ಗರಿಷ್ಠ 8 MB.' },
  'ocr.unavailable': { en: 'The scanner is offline right now. Please try again shortly.', kn: 'ಸ್ಕ್ಯಾನರ್ ಈಗ ಆಫ್‌ಲೈನ್ ಆಗಿದೆ. ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಪ್ರಯತ್ನಿಸಿ.' },
  'ocr.demoOnly': { en: 'The scanner runs on the live server — connect the backend to use it.', kn: 'ಸ್ಕ್ಯಾನರ್ ಲೈವ್ ಸರ್ವರ್‌ನಲ್ಲಿ ಚಲಿಸುತ್ತದೆ — ಬಳಸಲು ಬ್ಯಾಕೆಂಡ್ ಸಂಪರ್ಕಿಸಿ.' },

  'admin.tempPasswordFor': { en: 'Temporary password for {username}: {password}', kn: '{username} ಗಾಗಿ ತಾತ್ಕಾಲಿಕ ಪಾಸ್‌ವರ್ಡ್: {password}' },
  'admin.reactivated': { en: 'reactivated', kn: 'ಮರುಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ' },
  'admin.deactivatedWord': { en: 'deactivated', kn: 'ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ' },
  'admin.memberStatusChanged': { en: '{username} {status}.', kn: '{username} {status}.' },
  'admin.accountCreated': { en: 'Account "{username}" created with a temporary password.', kn: '"{username}" ಖಾತೆಯನ್ನು ತಾತ್ಕಾಲಿಕ ಪಾಸ್‌ವರ್ಡ್‌ನೊಂದಿಗೆ ರಚಿಸಲಾಗಿದೆ.' },
  'admin.createFailed': { en: 'Could not create — the username may already exist.', kn: 'ರಚಿಸಲಾಗಲಿಲ್ಲ — ಬಳಕೆದಾರ ಹೆಸರು ಈಗಾಗಲೇ ಇರಬಹುದು.' },
  'admin.parcelCreated': { en: 'Parcel {id} created (Verified). Publish it to Live from the Listings tab.', kn: 'ಭೂಖಂಡ {id} ರಚಿಸಲಾಗಿದೆ (ಪರಿಶೀಲಿಸಲಾಗಿದೆ). ಲಿಸ್ಟಿಂಗ್ಸ್ ಟ್ಯಾಬ್‌ನಿಂದ ಅದನ್ನು ಲೈವ್‌ಗೆ ಪ್ರಕಟಿಸಿ.' },
  'admin.parcelCreateFailed': { en: 'Could not create — check the ID is unique and the numeric fields are filled.', kn: 'ರಚಿಸಲಾಗಲಿಲ್ಲ — ID ಅನನ್ಯವಾಗಿದೆಯೇ ಮತ್ತು ಸಂಖ್ಯಾ ಕ್ಷೇತ್ರಗಳು ಭರ್ತಿಯಾಗಿವೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.' },
  'admin.rmPrefix': { en: 'RM', kn: 'ಆರ್‌ಎಂ' },
}

/** Domain-enum → translation-key maps, so a raw backend value (e.g. Listing.status)
 *  can be rendered via t(STATUS_KEY[status]) instead of a hardcoded label. */
export const VERTICAL_KEY: Record<string, string> = {
  'joint-development': 'vertical.jointDevelopment',
  warehouse: 'vertical.warehouse',
  'big-land': 'vertical.bigLand',
}

export const STATUS_KEY: Record<string, string> = {
  draft: 'status.draft',
  'documents-uploaded': 'status.documentsUploaded',
  'under-review': 'status.underReview',
  verified: 'status.verified',
  live: 'status.live',
  'under-offer': 'status.underOffer',
  closed: 'status.closed',
}

export const DEAL_STAGE_KEY: Record<string, string> = {
  'new-lead': 'dealStage.newLead',
  engaged: 'dealStage.engaged',
  'site-visit': 'dealStage.siteVisit',
  'term-sheet': 'dealStage.termSheet',
  closed: 'status.closed',
}

export const MATERIAL_CATEGORY_KEY: Record<string, string> = {
  flooring: 'material.flooring',
  sanitary: 'material.sanitary',
  kitchen: 'material.kitchen',
  windows: 'material.windows',
  lift: 'material.lift',
  facade: 'material.facade',
}
