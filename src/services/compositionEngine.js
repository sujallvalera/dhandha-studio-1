/**
 * Composition Engine
 * -------------------
 * Handles post-generation composition tasks:
 *   - Frame layouts (front+back, bubble closeups, collages, borders)
 *   - Text overlay positioning
 *   - Logo placement calculations
 *
 * This engine produces composition directives that are embedded into
 * the prompt object AND can be applied post-generation via image processing.
 */

/**
 * Frame layout definitions.
 * Each frame type defines how the final image should be composed.
 */
const FRAME_LAYOUTS = Object.freeze({

  front_back_same: {
    id: 'front_back_same',
    label: 'Front & Back Same Photo',
    panels: 2,
    layout: 'horizontal_split',
    description: 'Split image showing front view on left, back view on right',
    panelConfig: [
      { position: 'left', widthRatio: 0.5, variant: 'front' },
      { position: 'right', widthRatio: 0.5, variant: 'back' },
    ],
  },

  bubble_closeup_2: {
    id: 'bubble_closeup_2',
    label: '2 Bubble Closeup',
    panels: 3,
    layout: 'main_with_bubbles',
    description: 'Main product image with 2 circular closeup bubbles',
    bubbles: [
      { position: 'top_right', sizeRatio: 0.25, focus: 'detail_1' },
      { position: 'bottom_right', sizeRatio: 0.25, focus: 'detail_2' },
    ],
  },

  bubble_closeup_3: {
    id: 'bubble_closeup_3',
    label: '3 Bubble Closeup',
    panels: 4,
    layout: 'main_with_bubbles',
    description: 'Main product image with 3 circular closeup bubbles',
    bubbles: [
      { position: 'top_right', sizeRatio: 0.22, focus: 'detail_1' },
      { position: 'center_right', sizeRatio: 0.22, focus: 'detail_2' },
      { position: 'bottom_right', sizeRatio: 0.22, focus: 'detail_3' },
    ],
  },

  collage_3: {
    id: 'collage_3',
    label: '3 Image Collage',
    panels: 3,
    layout: 'grid_collage',
    description: '3-panel collage with one large panel and two smaller ones',
    panelConfig: [
      { position: 'left', widthRatio: 0.5, heightRatio: 1.0, variant: 'main' },
      { position: 'top_right', widthRatio: 0.5, heightRatio: 0.5, variant: 'detail_1' },
      { position: 'bottom_right', widthRatio: 0.5, heightRatio: 0.5, variant: 'detail_2' },
    ],
  },

  border_style_1: {
    id: 'border_style_1',
    label: 'Border Style 1',
    panels: 1,
    layout: 'bordered',
    description: 'Product image with elegant thin border frame',
    border: { width: 20, color: '#FFFFFF', style: 'solid', radius: 0 },
  },

  border_style_2: {
    id: 'border_style_2',
    label: 'Border Style 2',
    panels: 1,
    layout: 'bordered',
    description: 'Product image with modern rounded border frame',
    border: { width: 30, color: '#F0F0F0', style: 'solid', radius: 16 },
  },

  border_style_3: {
    id: 'border_style_3',
    label: 'Border Style 3',
    panels: 1,
    layout: 'bordered',
    description: 'Product image with decorative double-line border',
    border: { width: 40, color: '#E0E0E0', style: 'double', radius: 8 },
  },
});

/**
 * Get the composition layout for a frame type.
 *
 * @param {string} frameType
 * @returns {object|null}
 */
export const getFrameLayout = (frameType) => {
  return FRAME_LAYOUTS[frameType] || null;
};

/**
 * Calculate text overlay positioning based on image dimensions.
 *
 * @param {object} params
 * @param {object} params.text       Text config from normalizedConfig
 * @param {number} params.width      Image width
 * @param {number} params.height     Image height
 * @returns {object}  Positioning directive
 */
export const calculateTextPosition = ({ text, width, height }) => {
  if (!text || !text.content) return null;

  // Default: bottom-center with padding
  const padding = Math.round(width * 0.05);

  return {
    content: text.content,
    x: Math.round(width / 2),
    y: height - padding - Math.round(text.fontSize * 1.5),
    maxWidth: width - (padding * 2),
    fontSize: text.fontSize,
    fontStyle: text.fontStyle,
    color: text.color,
    bold: text.bold,
    italic: text.italic,
    underline: text.underline,
    align: 'center',
    bubbleStyle: text.bubbleStyle,
    bubblePadding: text.bubbleStyle !== 'none' ? Math.round(text.fontSize * 0.8) : 0,
  };
};

/**
 * Calculate logo placement coordinates.
 *
 * @param {object} params
 * @param {string} params.placement   'top_left' | 'top_right' | 'bottom_left' | 'bottom_right'
 * @param {number} params.width       Image width
 * @param {number} params.height      Image height
 * @param {number} [params.logoSize]  Logo size as fraction of image width (default: 0.12)
 * @returns {object}  Positioning directive
 */
export const calculateLogoPosition = ({ placement, width, height, logoSize = 0.12 }) => {
  const size = Math.round(width * logoSize);
  const margin = Math.round(width * 0.03);

  const positions = {
    top_left:     { x: margin, y: margin },
    top_right:    { x: width - size - margin, y: margin },
    bottom_left:  { x: margin, y: height - size - margin },
    bottom_right: { x: width - size - margin, y: height - size - margin },
  };

  const pos = positions[placement] || positions.bottom_right;

  return {
    ...pos,
    width: size,
    height: size,
    placement,
  };
};

/**
 * Build full composition directive from config and dimensions.
 *
 * @param {object} params
 * @param {object} params.normalizedConfig
 * @param {number} params.width
 * @param {number} params.height
 * @returns {object}
 */
export const buildCompositionDirective = ({ normalizedConfig, width, height }) => {
  const directive = {
    frame: null,
    text: null,
    logo: null,
  };

  // Frame
  if (normalizedConfig.frameType) {
    directive.frame = getFrameLayout(normalizedConfig.frameType);
  }

  // Text
  if (normalizedConfig.text && normalizedConfig.text.content) {
    directive.text = calculateTextPosition({
      text: normalizedConfig.text,
      width,
      height,
    });
  }

  // Logo
  if (normalizedConfig.logoPlacement && normalizedConfig.logoUrl) {
    directive.logo = calculateLogoPosition({
      placement: normalizedConfig.logoPlacement,
      width,
      height,
    });
    directive.logo.url = normalizedConfig.logoUrl;
  }

  return directive;
};

export default { getFrameLayout, calculateTextPosition, calculateLogoPosition, buildCompositionDirective };
