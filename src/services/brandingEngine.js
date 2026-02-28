/**
 * Branding Engine
 * ----------------
 * Manages brand-level configuration for the photoshoot platform:
 *   - Fixed watermark (non-editable by users)
 *   - Logo placement configuration
 *   - Brand identity rules for prompt compilation
 */

/**
 * Platform watermark configuration.
 * This watermark is ALWAYS applied (unless overridden by ecommerce rules)
 * and cannot be edited by users.
 */
const PLATFORM_WATERMARK = Object.freeze({
  text: 'Dhandha Studio',
  opacity: 0.15,
  fontSize: 14,
  color: '#FFFFFF',
  position: 'bottom_right',
  rotation: -30,
});

/**
 * Get the branding configuration for prompt compilation.
 *
 * @param {object} params
 * @param {boolean} params.watermark     Whether watermark should be applied
 * @param {string}  [params.logoUrl]     URL of the brand logo
 * @param {string}  [params.logoPlacement]  Placement position
 * @returns {object}
 */
export const getBrandingConfig = ({ watermark, logoUrl, logoPlacement }) => {
  const config = {
    watermark: null,
    logo: null,
    platformBranding: {
      name: 'Dhandha Studio',
      tagline: 'AI-Powered Product Photography',
    },
  };

  // Watermark — apply platform watermark if enabled
  if (watermark !== false) {
    config.watermark = { ...PLATFORM_WATERMARK };
  }

  // Logo — user's brand logo
  if (logoUrl && logoPlacement) {
    config.logo = {
      url: logoUrl,
      placement: logoPlacement,
    };
  }

  return config;
};

/**
 * Get prompt-level branding rules that the KIE engine should respect.
 * These are high-level directives embedded in the master prompt.
 *
 * @returns {string[]}
 */
export const getBrandingRules = () => {
  return [
    'Maintain professional studio-quality output',
    'Ensure consistent color accuracy across all generated images',
    'Apply clean, distraction-free composition',
    'Prioritize product visibility and clarity',
    'Use photography-grade lighting simulation',
  ];
};

export default { getBrandingConfig, getBrandingRules };
