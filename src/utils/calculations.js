/**
 * Construction Calculation Utilities for Abu Jawad ERP
 */

export const calculations = {
  /**
   * Calculate number of blocks for a wall
   * @param {number} area - Wall area in m2
   * @param {number} blockWidth - Block width in cm (default 20)
   * @param {number} blockHeight - Block height in cm (default 20)
   * @returns {number} Estimated block count
   */
  calculateBlocks: (area, blockWidth = 20, blockHeight = 20) => {
    const blockArea = (blockWidth / 100) * (blockHeight / 100);
    return Math.ceil(area / blockArea);
  },

  /**
   * Calculate concrete volume
   * @param {number} length - Length in meters
   * @param {number} width - Width in meters
   * @param {number} depth - Depth/Height in meters
   * @returns {number} Volume in m3
   */
  calculateConcreteVolume: (length, width, depth) => {
    return length * width * depth;
  },

  /**
   * Calculate cement bags for concrete (standard mix 350kg/m3)
   * @param {number} volume - Concrete volume in m3
   * @returns {number} Bags (50kg each)
   */
  calculateCementBags: (volume) => {
    return Math.ceil((volume * 350) / 50);
  },

  /**
   * Calculate total cost including waste
   * @param {number} quantity - Pure quantity
   * @param {number} unitPrice - Price per unit
   * @param {number} wastePercentage - Waste percentage (e.g., 5 for 5%)
   * @returns {number} Total cost
   */
  calculateTotalCost: (quantity, unitPrice, wastePercentage = 0) => {
    const totalQty = quantity * (1 + wastePercentage / 100);
    return totalQty * unitPrice;
  }
};
