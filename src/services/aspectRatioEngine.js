/**
 * Aspect Ratio Engine
 * ---------------------
 * Calculates final pixel dimensions from an aspect ratio + resolution combo.
 *
 * Supported ratios: 1:1, 4:5, 3:4, 9:16, 16:9, custom
 * Supported resolutions: 2K (base 2048), 4K (base 4096)
 */

/**
 * Base pixel dimension for each resolution tier.
 * The "base" is the larger dimension; the shorter dimension is
 * calculated from the aspect ratio.
 */
const RESOLUTION_BASE = Object.freeze({
  '2K': 2048,
  '4K': 4096,
});

/**
 * Aspect ratio multipliers (width:height).
 * Stored as [widthRatio, heightRatio].
 */
const RATIO_MAP = Object.freeze({
  '1:1':  [1, 1],
  '4:5':  [4, 5],
  '3:4':  [3, 4],
  '9:16': [9, 16],
  '16:9': [16, 9],
});

/**
 * Calculate final pixel dimensions.
 *
 * Strategy:
 *   - The base pixel value maps to the LARGER side.
 *   - The smaller side is computed proportionally.
 *   - Both dimensions are rounded to the nearest multiple of 8
 *     (common requirement for image generation models).
 *
 * @param {object} params
 * @param {string} params.aspectRatio   One of ASPECT_RATIOS (e.g. '4:5')
 * @param {string} params.resolution    '2K' or '4K'
 * @param {number} [params.customWidth]  Required if aspectRatio === 'custom'
 * @param {number} [params.customHeight] Required if aspectRatio === 'custom'
 * @returns {{ width: number, height: number, aspectRatio: string, resolution: string }}
 */
export const calculateDimensions = ({ aspectRatio, resolution, customWidth, customHeight }) => {
  // Custom dimensions — pass through (already validated by configValidator)
  if (aspectRatio === 'custom') {
    return {
      width: roundTo8(customWidth),
      height: roundTo8(customHeight),
      aspectRatio: 'custom',
      resolution,
    };
  }

  const base = RESOLUTION_BASE[resolution];
  if (!base) {
    throw new Error(`Unsupported resolution: ${resolution}`);
  }

  const ratio = RATIO_MAP[aspectRatio];
  if (!ratio) {
    throw new Error(`Unsupported aspect ratio: ${aspectRatio}`);
  }

  const [wRatio, hRatio] = ratio;
  let width, height;

  if (wRatio >= hRatio) {
    // Landscape or square — width is the base
    width = base;
    height = Math.round(base * (hRatio / wRatio));
  } else {
    // Portrait — height is the base
    height = base;
    width = Math.round(base * (wRatio / hRatio));
  }

  return {
    width: roundTo8(width),
    height: roundTo8(height),
    aspectRatio,
    resolution,
  };
};

/**
 * Round a number to the nearest multiple of 8.
 * @param {number} n
 * @returns {number}
 */
const roundTo8 = (n) => Math.round(n / 8) * 8;

export default { calculateDimensions };
