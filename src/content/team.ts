export type TeamRole = "ceo" | "devLead" | "bdLead" | "dev" | "bd";

export interface TeamMember {
  slug: string;
  name: { ko: string; en: string };
  role: TeamRole;
  education: { ko: string; en: string };
  links?: { linkedin?: string; email?: string };
}

// Drop a square photo at /public/team/{slug}.jpg to populate the card.
// Names are placeholders — replace with real ones at any time.
export const team: TeamMember[] = [
  {
    slug: "ceo",
    name: { ko: "이름 미공개", en: "TBA" },
    role: "ceo",
    education: { ko: "HKUST", en: "HKUST" },
    links: { email: "veloxai.official@gmail.com" },
  },
  {
    slug: "dev-lead",
    name: { ko: "이름 미공개", en: "TBA" },
    role: "devLead",
    education: { ko: "HKUST", en: "HKUST" },
  },
  {
    slug: "bd-lead",
    name: { ko: "이름 미공개", en: "TBA" },
    role: "bdLead",
    education: { ko: "HKUST", en: "HKUST" },
  },
  {
    slug: "dev-1",
    name: { ko: "이름 미공개", en: "TBA" },
    role: "dev",
    education: { ko: "HKUST", en: "HKUST" },
  },
  {
    slug: "bd-1",
    name: { ko: "이름 미공개", en: "TBA" },
    role: "bd",
    education: { ko: "HKUST", en: "HKUST" },
  },
];
