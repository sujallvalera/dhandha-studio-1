/**
 * Ecommerce Compliance Rules
 * ----------------------------
 * Per-platform rules that the ruleEngine enforces automatically.
 *
 * When a user selects an ecommerce mode, these rules override conflicting
 * user config to guarantee platform-compliant outputs.
 *
 * Rule properties:
 *   requiredAspectRatio   — forced aspect ratio (overrides user choice)
 *   requiredBackground    — forced background type and option
 *   maxTextOverlays       — 0 = no text allowed on image
 *   allowLogo             — whether brand logo placement is permitted
 *   allowWatermark        — whether watermark is allowed
 *   minResolution         — minimum resolution tier enforced
 *   allowedFrames         — whitelist of allowed frame types (null = all)
 *   guidelines            — human-readable compliance notes for prompt compiler
 */

export const ECOMMERCE_RULES = Object.freeze({

  amazon: {
    requiredAspectRatio: '1:1',
    requiredBackground: { type: 'studio', option: 'solid', color: '#FFFFFF' },
    maxTextOverlays: 0,
    allowLogo: false,
    allowWatermark: false,
    minResolution: '2K',
    allowedFrames: null,
    guidelines: [
      'Pure white background (#FFFFFF) required',
      'Product must occupy at least 85% of the frame',
      'No text, logos, watermarks, or borders on the main image',
      'No mannequins or hangers visible',
      'Image must be square (1:1)',
      'Minimum 1000×1000 pixels, recommended 2048×2048',
    ],
  },

  flipkart: {
    requiredAspectRatio: '3:4',
    requiredBackground: { type: 'studio', option: 'solid', color: '#FFFFFF' },
    maxTextOverlays: 0,
    allowLogo: false,
    allowWatermark: false,
    minResolution: '2K',
    allowedFrames: null,
    guidelines: [
      'White or light neutral background preferred',
      'Product-centric composition',
      'No promotional text or stickers',
      'High clarity and sharpness required',
      'Aspect ratio 3:4 recommended for best display',
    ],
  },

  myntra: {
    requiredAspectRatio: '3:4',
    requiredBackground: { type: 'studio', option: 'solid', color: '#F5F5F5' },
    maxTextOverlays: 0,
    allowLogo: false,
    allowWatermark: false,
    minResolution: '2K',
    allowedFrames: ['front_back_same'],
    guidelines: [
      'Light grey (#F5F5F5) or white background',
      'Model must be visible from head to toe for full-body shots',
      'No accessories that obscure the product',
      'Clean, minimal aesthetic required',
      'Front and back views recommended',
    ],
  },

  meesho: {
    requiredAspectRatio: '1:1',
    requiredBackground: { type: 'studio', option: 'solid', color: '#FFFFFF' },
    maxTextOverlays: 1,
    allowLogo: true,
    allowWatermark: true,
    minResolution: '2K',
    allowedFrames: null,
    guidelines: [
      'White background preferred',
      'Product must be clearly visible',
      'Minimal text overlay allowed (1 max)',
      'Brand logo permitted',
      'Square format (1:1) for catalog display',
    ],
  },
});

/**
 * Check if a given mode is a valid ecommerce platform.
 * @param {string} mode
 * @returns {boolean}
 */
export const isValidEcommerceMode = (mode) => {
  return mode in ECOMMERCE_RULES;
};

/**
 * Get rules for a specific ecommerce platform.
 * @param {string} mode
 * @returns {object|null}
 */
export const getRulesForPlatform = (mode) => {
  return ECOMMERCE_RULES[mode] || null;
};

export default ECOMMERCE_RULES;
