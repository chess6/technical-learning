export interface PresentationPoint {
  x: number;
  y: number;
}

export function splitScreenOrigins(
  safeWidth: number,
  gap: number,
): { left: PresentationPoint; right: PresentationPoint } {
  const halfWidth = (safeWidth - gap) / 2;
  const offset = (halfWidth + gap) / 2;
  return {
    left: { x: -offset, y: 0 },
    right: { x: offset, y: 0 },
  };
}

export function ledgerGeometry(
  rowCount: number,
  rowHeight: number,
): { height: number; rowY: number[] } {
  const height = rowCount * rowHeight + 24;
  return {
    height,
    rowY: Array.from(
      { length: rowCount },
      (_, index) => -height / 2 + 20 + index * rowHeight,
    ),
  };
}
