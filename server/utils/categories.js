export const CATEGORIES = ["Hair", "Barber", "Nails", "Makeup", "Lashes & Brows", "Skincare", "Spa & Wellness", "Bridal", "Laser", "Tattoo & Piercing", "Teeth Whitening", "Waxing"];

export const MAX_CATEGORIES = 3;

// Reads body.categories (or the old single body.category), keeps only
// allowed names, removes duplicates, and caps the list at MAX_CATEGORIES.
// Returns null when the request didn't mention categories at all.
export const normalizeCategories = (body) => {
  const raw = Array.isArray(body.categories)
    ? body.categories
    : body.category
    ? [body.category]
    : null;

  if (!raw) return null;

  const lookup = new Map(CATEGORIES.map((c) => [c.toLowerCase(), c]));

  return [
    ...new Set(
      raw
        .map((c) => lookup.get(String(c).trim().toLowerCase()))
        .filter(Boolean)
    ),
  ].slice(0, MAX_CATEGORIES);
};
