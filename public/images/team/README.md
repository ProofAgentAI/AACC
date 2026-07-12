# Team photos

Headshots for the leadership org chart on the About page (`/en/about`).

## Adding a new leader or team member

1. **Photo** — drop a square headshot in this folder, at least 400x400px,
   named after the person: `first-last.png` (or `.jpg`).
   Example: `public/images/team/amina-cherif.png`
2. **Profile & bio** — the org chart content lives in the dictionaries:
   - `lib/content/en.ts` -> `about.leadership` (English)
   - `lib/content/ar.ts` -> `about.leadership` (Arabic)

   To fill a seat, replace the role string in the matching tier with a person
   entry following the president's shape (name, role, photo, bio paragraphs,
   recognition, links) and extend `components/LeadershipOrgChart.tsx` to render
   filled seats with photo + Read Bio, exactly like the president card.

   The simplest path: ask Claude to "add <name> as <role> with this photo and
   bio" — the structure is already provisioned for it.

Current photos:

- `fouad-bousetouane.png` — Dr. Fouad Bousetouane, President & Founder
