export const formatPower = (p) => {
  if (!p) return '0  Gh/s'
  if (p >= 1000000000) return (p / 1000000000).toFixed(3) + '  Eh/s'
  if (p >= 1000000) return (p / 1000000).toFixed(3) + '  Ph/s'
  if (p >= 1000) return (p / 1000).toFixed(3) + '  Th/s'
  return parseFloat(p).toFixed(3) + '  Gh/s'
}

export const formatBonus = (b) => {
  if (b === undefined || b === null) return '0.00'
  const val = parseFloat(b)
  return isNaN(val) ? '0.00' : val.toFixed(2)
}
