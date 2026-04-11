/**
 * Construction Calculation Utilities for Abu Jawad ERP
 * Standard engineering formulas for quantity surveying
 */

export const calculations = {
  /**
   * Calculate number of blocks for a wall
   * Standard block dimensions are 20x20x40 cm
   */
  calculateBlocks: (length, height, blockThickness = 20) => {
    const area = length * height;
    // Standard block facing area is 0.2m * 0.4m = 0.08 m2
    const blockArea = 0.08;
    const count = area / blockArea;
    return {
      count: Math.ceil(count),
      cementBags: Math.ceil(count * 0.015), // Approx 1.5 bags per 100 blocks
      sandM3: count * 0.001 // Approx 0.1m3 sand per 100 blocks
    };
  },

  /**
   * Calculate Concrete for Slabs/Footings
   */
  calculateConcrete: (length, width, thickness) => {
    const volume = length * width * thickness;
    return {
      volume: volume.toFixed(2),
      cementBags: Math.ceil(volume * 7), // 7 bags per m3 for standard 350 mix
      sandM3: (volume * 0.4).toFixed(2),
      gravelM3: (volume * 0.8).toFixed(2),
      waterLiters: Math.ceil(volume * 175)
    };
  },

  /**
   * Calculate Plastering (اللياسة)
   */
  calculatePlaster: (length, height, thicknessCm = 2) => {
    const area = length * height;
    const volume = area * (thicknessCm / 100);
    return {
      area: area.toFixed(2),
      cementBags: Math.ceil(area * 0.25), // Approx 1 bag per 4m2
      sandM3: (area * 0.02).toFixed(2)
    };
  },

  /**
   * Calculate Floor Tiles (البلاط)
   */
  calculateTiles: (length, width, tileLengthCm, tileWidthCm) => {
    const area = length * width;
    const tileArea = (tileLengthCm / 100) * (tileWidthCm / 100);
    const count = area / tileArea;
    return {
      area: area.toFixed(2),
      count: Math.ceil(count),
      boxes: Math.ceil(count / 10), // Assuming 10 tiles per box
      cementBags: Math.ceil(area * 0.15), // Installation mortar
      sandM3: (area * 0.03).toFixed(2)
    };
  },

  /**
   * Calculate Paint (الدهانات)
   */
  calculatePaint: (area, coats = 2) => {
    // Standard coverage: 1 liter covers ~10m2 per coat
    const totalLitres = (area * coats) / 10;
    const gallons = totalLitres / 3.75; // 1 US Gallon = 3.75 Liters
    return {
      litres: Math.ceil(totalLitres),
      gallons: Math.ceil(gallons),
      drums: Math.ceil(totalLitres / 18) // 1 Drum = 18 Liters
    };
  },

  /**
   * Steel Reinforcement (الحديد)
   * Weight = (Diameter^2 / 162) * Length
   */
  calculateSteelWeight: (diameterMm, totalLengthM) => {
    const weightPerM = (Math.pow(diameterMm, 2) / 162);
    return (weightPerM * totalLengthM).toFixed(2);
  },

  /**
   * General Waste Calculation
   */
  withWaste: (quantity, percentage = 5) => {
    return Math.ceil(quantity * (1 + percentage / 100));
  }
};
