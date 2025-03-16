/**
 * Utility functions for layout calculations
 */

/**
 * Gets the canvas width based on size setting
 * @param {string} size - Size setting (normal, expanded, collapsed)
 * @returns {number} - Width percentage
 */
export const getCanvasWidth = (size) => {
  switch (size) {
    case "expanded": return 60;
    case "collapsed": return 30;
    default: return 45;
  }
};

/**
 * Gets the chat width based on canvas size
 * @param {string} canvasSize - The canvas size setting
 * @returns {number} - Width percentage
 */
export const getChatWidth = (canvasSize) => {
  return 100 - getCanvasWidth(canvasSize);
};
