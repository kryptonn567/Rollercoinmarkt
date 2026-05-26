export const getPercent = (val, total) => {
  return Math.max(0, Math.min(100, (val / total) * 100))
}
