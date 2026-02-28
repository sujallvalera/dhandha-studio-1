/**
 * Feature Catalog
 * ----------------
 * Exhaustive enums of every configurable feature in the AI Photoshoot Platform.
 * Used by configValidator.js and promptCompiler.js for validation and prompt assembly.
 */

// ─── Poses ─────────────────────────────────────────────────────
export const POSES = Object.freeze([
  'standing',
  'sitting',
  'walking',
  'over_neck',
  'aesthetic',
  'twirl',
  'closeup',
]);

// ─── Model Ethnicity ───────────────────────────────────────────
export const MODEL_ETHNICITIES = Object.freeze([
  'indian',
  'headless',
  'ghost_model_3d',
  'international',
  'african',
  'asian',
]);

// ─── Festival Themes ───────────────────────────────────────────
export const FESTIVAL_THEMES = Object.freeze([
  'summer',
  'winter',
  'rainy',
  'diwali',
  'holi',
  'navaratri',
  'eid',
  'christmas',
  'onam',
  'pongal',
  'paryushan',
  'uttarayan',
]);

// ─── Variant Shots ─────────────────────────────────────────────
export const VARIANT_SHOTS = Object.freeze([
  'front',
  'front_back',
  'front_back_side',
  'back',
  'back_side',
]);

// ─── Background Types ──────────────────────────────────────────
export const BACKGROUND_TYPES = Object.freeze({
  STUDIO: {
    id: 'studio',
    options: ['solid', 'textured'],
  },
  AI_OUTDOOR: {
    id: 'ai_outdoor',
    options: ['heritage', 'nature', 'urban'],
  },
  AI_INDOOR: {
    id: 'ai_indoor',
    options: ['heritage', 'modern'],
  },
});

export const VALID_BACKGROUND_IDS = Object.freeze(
  new Set(Object.values(BACKGROUND_TYPES).map((b) => b.id))
);

// ─── Color Filters ─────────────────────────────────────────────
export const COLOR_FILTERS = Object.freeze([
  'normal',
  'black',
  'clarendon',
  'juno',
  'valencia',
  'tokyo',
  'sepia',
  'nordic',
]);

// ─── Frame Types (Photoshoot Frames) ───────────────────────────
export const FRAME_TYPES = Object.freeze([
  'front_back_same',
  'bubble_closeup_2',
  'bubble_closeup_3',
  'collage_3',
  'border_style_1',
  'border_style_2',
  'border_style_3',
]);

// ─── Text Styles ───────────────────────────────────────────────
export const TEXT_FONT_STYLES = Object.freeze([
  'serif',
  'sans_serif',
  'script',
  'monospace',
  'decorative',
]);

export const TEXT_BUBBLE_STYLES = Object.freeze([
  'none',
  'rounded',
  'sharp',
  'cloud',
  'banner',
]);

// ─── Logo Placement ────────────────────────────────────────────
export const LOGO_PLACEMENTS = Object.freeze([
  'top_left',
  'top_right',
  'bottom_left',
  'bottom_right',
]);

// ─── Ecommerce Modes ───────────────────────────────────────────
export const ECOMMERCE_MODES = Object.freeze([
  'amazon',
  'flipkart',
  'myntra',
  'meesho',
]);

// ─── Aspect Ratios ─────────────────────────────────────────────
export const ASPECT_RATIOS = Object.freeze([
  '1:1',
  '4:5',
  '3:4',
  '9:16',
  '16:9',
  'custom',
]);

// ─── Resolutions ───────────────────────────────────────────────
export const RESOLUTIONS = Object.freeze([
  '2K',
  '4K',
]);

// ─── Multipose (Single Image) ──────────────────────────────────
export const MULTIPOSE_OPTIONS = Object.freeze([
  'standing',
  'side',
  'sitting',
  'back',
]);

// ─── Aggregate export for validation ───────────────────────────
export const FEATURE_CATALOG = Object.freeze({
  poses: POSES,
  modelEthnicities: MODEL_ETHNICITIES,
  festivalThemes: FESTIVAL_THEMES,
  variantShots: VARIANT_SHOTS,
  backgroundTypes: BACKGROUND_TYPES,
  colorFilters: COLOR_FILTERS,
  frameTypes: FRAME_TYPES,
  textFontStyles: TEXT_FONT_STYLES,
  textBubbleStyles: TEXT_BUBBLE_STYLES,
  logoPlacements: LOGO_PLACEMENTS,
  ecommerceModes: ECOMMERCE_MODES,
  aspectRatios: ASPECT_RATIOS,
  resolutions: RESOLUTIONS,
  multiposeOptions: MULTIPOSE_OPTIONS,
});

export default FEATURE_CATALOG;
