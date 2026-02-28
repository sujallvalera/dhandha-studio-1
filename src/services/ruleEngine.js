/**
 * Rule Engine
 * ------------
 * Enforces ecommerce platform compliance rules on a normalized config.
 *
 * When an ecommerceMode is set (amazon, flipkart, myntra, meesho),
 * this engine overrides conflicting user selections to guarantee
 * platform-compliant outputs. Overrides are logged for auditability.
 */

import { ECOMMERCE_RULES } from '../constants/ecommerceRules.js';

/**
 * Apply ecommerce compliance rules to a normalized config.
 *
 * @param {object} normalizedConfig  Output of configValidator.validateConfig()
 * @returns {{ config: object, overrides: Array<{ field: string, from: *, to: *, reason: string }>, guidelines: string[] }}
 */
export const applyRules = (normalizedConfig) => {
  const config = { ...normalizedConfig };
  const overrides = [];
  let guidelines = [];

  const mode = config.ecommerceMode;

  if (!mode || !ECOMMERCE_RULES[mode]) {
    return { config, overrides, guidelines };
  }

  const rules = ECOMMERCE_RULES[mode];
  guidelines = [...rules.guidelines];

  // ── Aspect Ratio Override ────────────────────────────────────
  if (rules.requiredAspectRatio && config.aspectRatio !== rules.requiredAspectRatio) {
    overrides.push({
      field: 'aspectRatio',
      from: config.aspectRatio,
      to: rules.requiredAspectRatio,
      reason: `${mode} requires ${rules.requiredAspectRatio} aspect ratio`,
    });
    config.aspectRatio = rules.requiredAspectRatio;
  }

  // ── Background Override ──────────────────────────────────────
  if (rules.requiredBackground) {
    const currentBg = config.background || {};
    const requiredBg = rules.requiredBackground;

    if (currentBg.type !== requiredBg.type || currentBg.option !== requiredBg.option) {
      overrides.push({
        field: 'background',
        from: config.background,
        to: requiredBg,
        reason: `${mode} requires ${requiredBg.type}/${requiredBg.option} background`,
      });
      config.background = { ...requiredBg };
    }
  }

  // ── Text Overlay Restriction ─────────────────────────────────
  if (rules.maxTextOverlays === 0 && config.text && config.text.content) {
    overrides.push({
      field: 'text',
      from: config.text,
      to: null,
      reason: `${mode} does not allow text overlays on images`,
    });
    config.text = null;
  }

  // ── Logo Restriction ─────────────────────────────────────────
  if (!rules.allowLogo && (config.logoPlacement || config.logoUrl)) {
    overrides.push({
      field: 'logo',
      from: { placement: config.logoPlacement, url: config.logoUrl },
      to: null,
      reason: `${mode} does not allow logo placement`,
    });
    config.logoPlacement = null;
    config.logoUrl = null;
  }

  // ── Watermark Restriction ────────────────────────────────────
  if (!rules.allowWatermark && config.watermark) {
    overrides.push({
      field: 'watermark',
      from: true,
      to: false,
      reason: `${mode} does not allow watermarks`,
    });
    config.watermark = false;
  }

  // ── Frame Restriction ────────────────────────────────────────
  if (rules.allowedFrames && config.frameType) {
    if (!rules.allowedFrames.includes(config.frameType)) {
      overrides.push({
        field: 'frameType',
        from: config.frameType,
        to: null,
        reason: `${mode} does not allow frame type "${config.frameType}". Allowed: ${rules.allowedFrames.join(', ')}`,
      });
      config.frameType = null;
    }
  }

  // ── Min Resolution Enforcement ───────────────────────────────
  const resolutionRank = { '2K': 1, '4K': 2 };
  const minRank = resolutionRank[rules.minResolution] || 1;
  const currentRank = resolutionRank[config.resolution] || 1;

  if (currentRank < minRank) {
    overrides.push({
      field: 'resolution',
      from: config.resolution,
      to: rules.minResolution,
      reason: `${mode} requires at least ${rules.minResolution} resolution`,
    });
    config.resolution = rules.minResolution;
  }

  return { config, overrides, guidelines };
};

export default { applyRules };
