/** Header nav. The calculator's contact link uses CONTACT_NAV_LABEL so the word stays the same. */
export const CONTACT_NAV_LABEL = "Contact";

export const NAV_LINKS = [
  { href: "/trunk-line", label: "Trunk line" },
  { href: "/#receptionist", label: "AI receptionist" },
  { href: "/shop-line", label: "Demo" },
  { href: "/work", label: "Work" },
  { href: "/tips", label: "Tips" },
  { href: "/#faq", label: "FAQ" },
  { href: "/contact", label: CONTACT_NAV_LABEL },
] as const;
