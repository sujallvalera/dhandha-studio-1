/**
 * Product Categories
 * -------------------
 * Complete catalog of supported product categories for AI photoshoot generation.
 *
 * Categories are structured hierarchically:
 *   category → subcategories (optional) → requiresAge (for kids)
 */

export const CATEGORIES = Object.freeze({

  // ─── Apparel ─────────────────────────────────────────────────
  MEN: {
    id: 'men',
    label: 'Men',
    subcategories: ['casual', 'formal', 'ethnic', 'sportswear', 'innerwear', 'winterwear'],
    requiresAge: false,
  },
  WOMEN: {
    id: 'women',
    label: 'Women',
    subcategories: ['casual', 'formal', 'ethnic', 'sportswear', 'innerwear', 'winterwear', 'saree', 'lehenga'],
    requiresAge: false,
  },
  KIDS_BOYS: {
    id: 'kids_boys',
    label: 'Kids — Boys',
    subcategories: ['casual', 'formal', 'ethnic', 'sportswear'],
    requiresAge: true,
    ageRange: { min: 2, max: 16 },
  },
  KIDS_GIRLS: {
    id: 'kids_girls',
    label: 'Kids — Girls',
    subcategories: ['casual', 'formal', 'ethnic', 'sportswear'],
    requiresAge: true,
    ageRange: { min: 2, max: 16 },
  },

  // ─── Footwear ────────────────────────────────────────────────
  FOOTWEAR_MEN: {
    id: 'footwear_men',
    label: 'Footwear — Men',
    subcategories: ['casual', 'formal', 'sports', 'ethnic', 'sandals'],
    requiresAge: false,
  },
  FOOTWEAR_WOMEN: {
    id: 'footwear_women',
    label: 'Footwear — Women',
    subcategories: ['casual', 'formal', 'sports', 'ethnic', 'heels', 'sandals'],
    requiresAge: false,
  },
  FOOTWEAR_KIDS: {
    id: 'footwear_kids',
    label: 'Footwear — Kids',
    subcategories: ['casual', 'sports', 'sandals'],
    requiresAge: true,
    ageRange: { min: 2, max: 16 },
  },

  // ─── Accessories ─────────────────────────────────────────────
  JEWELLERY: {
    id: 'jewellery',
    label: 'Jewellery',
    subcategories: ['necklace', 'earrings', 'bracelet', 'ring', 'bangle', 'anklet', 'pendant', 'chain'],
    requiresAge: false,
  },
  BAGS: {
    id: 'bags',
    label: 'Bags & Purses',
    subcategories: ['handbag', 'clutch', 'backpack', 'tote', 'sling', 'wallet', 'laptop_bag'],
    requiresAge: false,
  },

  // ─── Home Textiles ───────────────────────────────────────────
  TOWEL: {
    id: 'towel',
    label: 'Towel',
    subcategories: ['bath', 'hand', 'beach', 'kitchen'],
    requiresAge: false,
  },
  BEDSHEET: {
    id: 'bedsheet',
    label: 'Bedsheet',
    subcategories: ['single', 'double', 'king', 'queen'],
    requiresAge: false,
  },
  DOORMATS: {
    id: 'doormats',
    label: 'Doormats',
    subcategories: ['rubber', 'coir', 'cotton', 'printed'],
    requiresAge: false,
  },
  CURTAINS: {
    id: 'curtains',
    label: 'Curtains & Drapes',
    subcategories: ['sheer', 'blackout', 'printed', 'embroidered'],
    requiresAge: false,
  },
  DUVETS: {
    id: 'duvets',
    label: 'Duvets & Covers',
    subcategories: ['single', 'double', 'king', 'queen', 'comforter'],
    requiresAge: false,
  },
});

/**
 * Flat lookup map — category ID → category object.
 */
export const CATEGORY_MAP = Object.freeze(
  Object.fromEntries(
    Object.values(CATEGORIES).map((cat) => [cat.id, cat])
  )
);

/**
 * All valid category IDs as a Set for fast validation.
 */
export const VALID_CATEGORY_IDS = Object.freeze(
  new Set(Object.values(CATEGORIES).map((cat) => cat.id))
);

export default CATEGORIES;
