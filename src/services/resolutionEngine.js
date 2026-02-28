/**
 * Resolution Engine
 * ------------------
 * Maps resolution labels to pixel base values and provides
 * resolution-aware utilities.
 *
 * Works in tandem with aspectRatioEngine to produce final dimensions.
 */

/**
 * Resolution definitions.
 * basePx = the larger dimension for a 1:1 image at this resolution.
 */
export const RESOLUTION_MAP = Object.freeze({
  '2K': {
    label: '2K',
    basePx: 2048,
    maxPx: 2048,
    description: 'Standard quality — 2048×2048 at 1:1',
  },
  '4K': {
    label: '4K',
    basePx: 4096,
    maxPx: 4096,
    description: 'Ultra-high quality — 4096×4096 at 1:1',
  },
});

/**
 * Get resolution metadata by label.
 * @param {string} label  '2K' or '4K'
 * @returns {{ label: string, basePx: number, maxPx: number, description: string }|null}
 */
export const getResolution = (label) => {
  return RESOLUTION_MAP[label] || null;
};

/**
 * Validate a resolution label.
 * @param {string} label
 * @returns {boolean}
 */
export const isValidResolution = (label) => {
  return label in RESOLUTION_MAP;
};

/**
 * Get the base pixel value for a resolution.
 * @param {string} label  '2K' or '4K'
 * @returns {number}
 */
export const getBasePx = (label) => {
  const res = RESOLUTION_MAP[label];
  if (!res) throw new Error(`Unknown resolution: ${label}`);
  return res.basePx;
};

/**
 * Calculate estimated file size (rough) based on resolution.
 * Assumes ~3 bytes per pixel for JPEG at moderate quality.
 * @param {number} width
 * @param {number} height
 * @returns {{ estimatedMB: number }}
 */
export const estimateFileSize = (width, height) => {
  const bytesPerPixel = 3;
  const totalBytes = width * height * bytesPerPixel;
  return {
    estimatedMB: Math.round((totalBytes / (1024 * 1024)) * 10) / 10,
  };
};

export default { getResolution, isValidResolution, getBasePx, estimateFileSize };
